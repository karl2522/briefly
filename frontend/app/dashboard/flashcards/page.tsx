"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { BookOpen, Brain, Calendar, ChevronRight, FileText, Loader2, Sparkles, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

// PDF.js and Mammoth are imported dynamically to avoid SSR issues with browser APIs

interface Flashcard {
    question: string
    answer: string
}

interface FlashcardSet {
    id: string
    topic: string
    flashcards: Flashcard[]
    createdAt: string
}

export default function FlashcardsPage() {
    const router = useRouter()
    const [text, setText] = useState("")
    const [topic, setTopic] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingSets, setIsLoadingSets] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [savedSets, setSavedSets] = useState<FlashcardSet[]>([])
    const [isProcessingFile, setIsProcessingFile] = useState(false)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load saved flashcard sets from API
    useEffect(() => {
        const loadFlashcardSets = async () => {
            setIsLoadingSets(true)
            try {
                const response = await apiClient.getFlashcardSets()
                if (response.success && response.data) {
                    // Transform API response to match component interface
                    const sets: FlashcardSet[] = response.data.map((set: any) => ({
                        id: set.id,
                        topic: set.topic,
                        flashcards: set.flashcards || [],
                        createdAt: set.createdAt,
                    }))
                    setSavedSets(sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                } else {
                    console.error("Failed to load flashcard sets:", response.error)
                }
            } catch (err) {
                console.error("Error loading flashcard sets:", err)
            } finally {
                setIsLoadingSets(false)
            }
        }
        loadFlashcardSets()
    }, [])


    const handleGenerate = async () => {
        if (!text.trim()) {
            setError("Please enter some text to generate flashcards")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await apiClient.generateFlashcards(text, topic || undefined)
            if (response.success && response.data) {
                const generatedFlashcards = response.data.flashcards
                const flashcardSetId = response.data.flashcardSetId

                // Store in sessionStorage for preview page
                sessionStorage.setItem("preview_flashcards", JSON.stringify(generatedFlashcards))
                sessionStorage.setItem("preview_topic", topic || "")

                // Clear any previous set ID to ensure we don't show "Study Mode" for a new unsaved generation
                sessionStorage.removeItem("preview_flashcardSetId")

                if (flashcardSetId) {
                    sessionStorage.setItem("preview_flashcardSetId", flashcardSetId)
                }

                // Refresh the sets list
                const setsResponse = await apiClient.getFlashcardSets()
                if (setsResponse.success && setsResponse.data) {
                    const sets: FlashcardSet[] = setsResponse.data.map((set: any) => ({
                        id: set.id,
                        topic: set.topic,
                        flashcards: set.flashcards || [],
                        createdAt: set.createdAt,
                    }))
                    setSavedSets(sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                }

                // Redirect to preview page
                router.push(`/dashboard/flashcards/preview?flashcards=${encodeURIComponent(JSON.stringify(generatedFlashcards))}&topic=${encodeURIComponent(topic || "")}`)
            } else {
                setError(response.error || "Failed to generate flashcards")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
            console.error("Flashcard generation error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewSet = (setId: string) => {
        router.push(`/dashboard/flashcards/${setId}`)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const extractTextFromPDF = async (file: File): Promise<string> => {
        // Dynamically import pdfjs-dist only when needed (client-side only)
        const pdfjsLib = await import("pdfjs-dist")
        const arrayBuffer = await file.arrayBuffer()

        // Try to use local worker first, then fallback to CDNs
        const workerSources = [
            "/pdf.worker.min.js", // Local worker in public folder
            `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
            `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
        ]

        let lastError: Error | null = null

        for (const workerSrc of workerSources) {
            try {
                // Set worker source
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

                const loadingTask = pdfjsLib.getDocument({
                    data: arrayBuffer,
                    verbosity: 0, // Suppress console warnings
                })

                const pdf = await loadingTask.promise
                let fullText = ""

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i)
                    const textContent = await page.getTextContent()
                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(" ")
                    fullText += pageText + "\n\n"
                }

                return fullText.trim()
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error))
                console.warn(`Worker source ${workerSrc} failed, trying next...`, error)
                // Continue to next worker source
                continue
            }
        }

        // If all workers fail, throw error
        throw new Error(`Failed to extract text from PDF: ${lastError?.message || "All worker sources failed"}. Please try another file or paste text manually.`)
    }

    const extractTextFromWord = async (file: File): Promise<string> => {
        try {
            // Dynamically import mammoth only when needed (client-side only)
            const mammoth = await import("mammoth")
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.default.extractRawText({ arrayBuffer })

            if (result.messages && result.messages.length > 0) {
                console.warn("Word document warnings:", result.messages)
            }

            return result.value
        } catch (error) {
            console.error("Word extraction error:", error)
            throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        const allowedExtensions = [".pdf", ".doc", ".docx"]

        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
        const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)

        if (!isValidType) {
            setError("Please upload a PDF or Word document (.pdf, .doc, .docx)")
            return
        }

        setIsProcessingFile(true)
        setError(null)
        setUploadedFileName(file.name)

        try {
            let extractedText = ""
            const fileName = file.name.toLowerCase()

            if (fileName.endsWith(".pdf")) {
                extractedText = await extractTextFromPDF(file)
            } else if (fileName.endsWith(".docx")) {
                extractedText = await extractTextFromWord(file)
            } else if (fileName.endsWith(".doc")) {
                // .doc files (old Word format) - mammoth only supports .docx
                setError("Old Word format (.doc) is not supported. Please convert to .docx or PDF format.")
                setIsProcessingFile(false)
                setUploadedFileName(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
                return
            } else {
                setError("Unsupported file format. Please upload a PDF or .docx file.")
                setIsProcessingFile(false)
                setUploadedFileName(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
                return
            }

            if (extractedText.trim()) {
                setText(extractedText)
                // Auto-detect topic from filename if topic is empty
                if (!topic.trim()) {
                    const topicFromFile = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                    setTopic(topicFromFile)
                }
            } else {
                setError("No text could be extracted from the file. The file might be empty or contain only images.")
                setUploadedFileName(null)
            }
        } catch (err) {
            console.error("File processing error:", err)
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
            setError(`Failed to process file: ${errorMessage}. Please try again or paste text manually.`)
            setUploadedFileName(null)
        } finally {
            setIsProcessingFile(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemoveFile = () => {
        setUploadedFileName(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <DashboardLayout title="Flashcard Generator">
            <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Brain className="size-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Flashcard Generator</h2>
                </div>
                <p className="text-muted-foreground">Transform any text into interactive flashcards for better memorization</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Form */}
                <Card className="flex flex-col h-[650px]">
                    <CardHeader className="flex-shrink-0">
                        <CardTitle>Create Flashcards</CardTitle>
                        <CardDescription>Enter your text content below</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-4 flex-1 min-h-0 overflow-hidden">
                        {/* File Upload Section */}
                        <div className="flex-shrink-0">
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Upload Document (Optional)
                            </label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                        disabled={isProcessingFile}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-colors cursor-pointer ${isProcessingFile
                                                ? "border-muted bg-muted cursor-not-allowed"
                                                : "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10"
                                            }`}
                                    >
                                        {isProcessingFile ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin text-primary" />
                                                <span className="text-muted-foreground">Processing file...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="size-4 text-primary" />
                                                <span className="text-foreground">Upload PDF or Word Document</span>
                                                <span className="text-xs text-muted-foreground">(.pdf, .doc, .docx)</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                                {uploadedFileName && (
                                    <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FileText className="size-4 text-primary flex-shrink-0" />
                                            <span className="text-sm text-foreground truncate">{uploadedFileName}</span>
                                        </div>
                                        <button
                                            onClick={handleRemoveFile}
                                            className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                            aria-label="Remove file"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <label htmlFor="topic" className="mb-2 block text-sm font-medium text-foreground">
                                Topic (Optional)
                            </label>
                            <input
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Biology, History, Math"
                                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <label htmlFor="text" className="mb-2 block text-sm font-medium text-foreground">
                                Text Content <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste or type your text here. The AI will generate questions and answers from this content..."
                                className="w-full h-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                            <p className="mt-1 text-xs text-muted-foreground flex-shrink-0">{text.length} characters</p>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex-shrink-0">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !text.trim()}
                            className="w-full gap-2 flex-shrink-0"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Generate Flashcards
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Saved Sets List */}
                <Card className="flex flex-col h-[650px]">
                    <CardHeader className="flex-shrink-0">
                        <CardTitle>Saved Flashcard Sets</CardTitle>
                        <CardDescription>Your saved flashcard collections</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                            {isLoadingSets ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Loader2 className="mb-4 size-8 animate-spin text-primary" />
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">Loading flashcard sets...</h3>
                                    <p className="text-sm text-muted-foreground">Please wait</p>
                                </div>
                            ) : savedSets.length > 0 ? (
                                savedSets.map((set) => (
                                    <button
                                        key={set.id}
                                        onClick={() => handleViewSet(set.id)}
                                        className="w-full text-left rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all p-4 group cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="size-4 text-primary flex-shrink-0" />
                                                    <h3 className="font-semibold text-foreground break-words group-hover:text-primary transition-colors">{set.topic}</h3>
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Brain className="size-3 shrink-0" />
                                                        <span>{set.flashcards.length} cards</span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="size-3 shrink-0" />
                                                        <span>{formatDate(set.createdAt)}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                        <Brain className="size-8 text-primary" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">No saved sets yet</h3>
                                    <p className="text-sm text-muted-foreground">Generate flashcards and save them to see them here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

