"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/api"
import { AlertCircle, BookOpen, Brain, Calendar, Check, ChevronRight, FileText, Folder, FolderPlus, Loader2, MoreVertical, Sparkles, Trash2, Upload, X } from "lucide-react"
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
    folderId?: string | null
}

interface FolderType {
    id: string
    name: string
    color: string | null
    flashcardCount: number
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
    const [setToDelete, setSetToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    // Folder state
    const [folders, setFolders] = useState<FolderType[]>([])
    const [isLoadingFolders, setIsLoadingFolders] = useState(true)
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState("")
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null)
    const [isDeletingFolder, setIsDeletingFolder] = useState(false)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

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

    // Load folders
    useEffect(() => {
        const loadFolders = async () => {
            setIsLoadingFolders(true)
            try {
                const response = await apiClient.getFolders()
                if (response.success && response.data) {
                    setFolders(response.data)
                }
            } catch (err) {
                console.error("Error loading folders:", err)
            } finally {
                setIsLoadingFolders(false)
            }
        }
        loadFolders()
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

    const handleMoveToFolder = async (setId: string, folderId: string | null) => {
        try {
            const response = await apiClient.moveFlashcardSetToFolder(setId, folderId)
            if (response.success) {
                // Update local state
                setSavedSets(prev => prev.map(set =>
                    set.id === setId ? { ...set, folderId } : set
                ))

                // Update folder counts
                setFolders(prev => prev.map(f => {
                    const set = savedSets.find(s => s.id === setId)
                    const oldFolderId = set?.folderId

                    if (f.id === folderId) {
                        return { ...f, flashcardCount: (f.flashcardCount || 0) + 1 }
                    }
                    if (f.id === oldFolderId) {
                        return { ...f, flashcardCount: Math.max(0, (f.flashcardCount || 0) - 1) }
                    }
                    return f
                }))

                showToast("Moved to folder", "success")
            } else {
                showToast("Failed to move to folder", "error")
            }
        } catch (error) {
            console.error("Error moving to folder:", error)
            showToast("An error occurred", "error")
        }
    }

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return

        try {
            const response = await apiClient.createFolder({ name: newFolderName })
            if (response.success && response.data) {
                setFolders([response.data, ...folders])
                setIsCreatingFolder(false)
                setNewFolderName("")
                showToast("Folder created successfully", "success")
            } else {
                showToast("Failed to create folder", "error")
            }
        } catch (error) {
            console.error("Error creating folder:", error)
            showToast("An error occurred while creating folder", "error")
        }
    }

    const confirmDeleteFolder = async () => {
        if (!folderToDelete) return

        setIsDeletingFolder(true)
        try {
            const response = await apiClient.deleteFolder(folderToDelete)
            if (response.success) {
                setFolders(folders.filter(f => f.id !== folderToDelete))
                if (selectedFolderId === folderToDelete) {
                    setSelectedFolderId(null)
                }
                setFolderToDelete(null)

                // Update saved sets to reflect that they are no longer in a folder
                setSavedSets(prev => prev.map(set =>
                    set.folderId === folderToDelete ? { ...set, folderId: null } : set
                ))

                showToast("Folder deleted successfully", "success")
            } else {
                showToast("Failed to delete folder", "error")
            }
        } catch (error) {
            console.error("Error deleting folder:", error)
            showToast("An error occurred while deleting folder", "error")
        } finally {
            setIsDeletingFolder(false)
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setSetToDelete(id)
    }

    const confirmDelete = async () => {
        if (!setToDelete) return

        setIsDeleting(true)
        try {
            const response = await apiClient.deleteFlashcardSet(setToDelete)
            if (response.success) {
                setSavedSets(prev => prev.filter(set => set.id !== setToDelete))
                setSetToDelete(null)
                showToast("Flashcard set deleted successfully", "success")
            } else {
                console.error("Failed to delete set:", response.error)
                showToast(response.error || "Failed to delete set", "error")
            }
        } catch (err) {
            console.error("Error deleting set:", err)
            showToast("An error occurred while deleting", "error")
        } finally {
            setIsDeleting(false)
        }
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
                <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Brain className="size-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Flashcard Generator</h2>
                    </div>
                    <Button
                        onClick={() => setIsCreatingFolder(true)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                    >
                        <FolderPlus className="size-4" />
                        Create Folder
                    </Button>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {selectedFolderId
                                        ? `Sets in ${folders.find(f => f.id === selectedFolderId)?.name}`
                                        : "Saved Flashcard Sets"
                                    }
                                </CardTitle>
                                <CardDescription>Your saved flashcard collections</CardDescription>
                            </div>
                            {selectedFolderId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFolderId(null)}
                                >
                                    View All
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                            {isLoadingSets ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Loader2 className="mb-4 size-8 animate-spin text-primary" />
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">Loading flashcard sets...</h3>
                                    <p className="text-sm text-muted-foreground">Please wait</p>
                                </div>
                            ) : savedSets.filter(set => !selectedFolderId || set.folderId === selectedFolderId).length > 0 ? (
                                savedSets
                                    .filter(set => !selectedFolderId || set.folderId === selectedFolderId)
                                    .map((set) => (
                                        <div
                                            key={set.id}
                                            onClick={() => handleViewSet(set.id)}
                                            className="w-full text-left rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all p-4 group cursor-pointer relative"
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
                                                <div className="flex items-center gap-1">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={e => e.stopPropagation()}>
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            {folders.length > 0 && (
                                                                <>
                                                                    <DropdownMenuLabel>Move to Folder</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    {set.folderId && (
                                                                        <DropdownMenuItem onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleMoveToFolder(set.id, null)
                                                                        }}>
                                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                                <X className="size-4" />
                                                                                <span>Remove from Folder</span>
                                                                            </div>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {folders.map(folder => (
                                                                        <DropdownMenuItem
                                                                            key={folder.id}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                handleMoveToFolder(set.id, folder.id)
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="size-2 rounded-full bg-primary" />
                                                                                <span className="truncate">{folder.name}</span>
                                                                                {set.folderId === folder.id && <Check className="ml-auto size-4" />}
                                                                            </div>
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                    <DropdownMenuSeparator />
                                                                </>
                                                            )}
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                onClick={(e) => handleDeleteClick(e, set.id)}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Trash2 className="size-4" />
                                                                    <span>Delete</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                        <Brain className="size-8 text-primary" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                                        {selectedFolderId ? "No sets in this folder" : "No saved sets yet"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedFolderId
                                            ? "Move sets here to organize them"
                                            : "Generate flashcards and save them to see them here"
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Folders Section */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <div>
                            <CardTitle>Folders</CardTitle>
                            <CardDescription>Organize your flashcard sets</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingFolders ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-6 animate-spin text-primary" />
                            </div>
                        ) : folders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                    <Folder className="size-8 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">No folders yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">Create folders to organize your flashcard sets</p>
                                <Button
                                    onClick={() => setIsCreatingFolder(true)}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <FolderPlus className="size-4" />
                                    Create Your First Folder
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {folders.map((folder) => (
                                    <div
                                        key={folder.id}
                                        onClick={() => setSelectedFolderId(folder.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all group ${selectedFolderId === folder.id
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <Folder
                                                className="size-5"
                                                style={{ color: folder.color || "#6366f1" }}
                                            />
                                            <span className="font-medium">{folder.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {folder.flashcardCount}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setFolderToDelete(folder.id)
                                                }}
                                                className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                                title="Delete folder"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                            Create a folder to organize your flashcards.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="mb-2 block text-sm font-medium">Folder Name</label>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="e.g., Biology, Math, History"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newFolderName.trim()) {
                                    handleCreateFolder()
                                }
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreatingFolder(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateFolder}
                            disabled={!newFolderName.trim()}
                        >
                            Create Folder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Folder</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this folder? The flashcard sets inside will be moved to "Uncategorized".
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setFolderToDelete(null)}
                            disabled={isDeletingFolder}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteFolder}
                            disabled={isDeletingFolder}
                        >
                            {isDeletingFolder ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!setToDelete} onOpenChange={(open) => !open && setSetToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Flashcard Set</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this flashcard set? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSetToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {toast && (
                <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-destructive-foreground'
                    }`}>
                    {toast.type === 'success' ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
                    {toast.message}
                </div>
            )}
        </DashboardLayout>
    )
}

