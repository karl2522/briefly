"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { BookOpen, Calendar, ChevronRight, FileText, Loader2, Sparkles, Target, Upload, X } from "lucide-react"
import mammoth from "mammoth"
import { useRouter } from "next/navigation"
import * as pdfjsLib from "pdfjs-dist"
import { useEffect, useRef, useState } from "react"

// Set PDF.js worker - configured dynamically in extraction function to handle CDN fallbacks
if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = ""
}

interface QuizQuestion {
    question: string
    options: string[]
    correctAnswer: number
}

interface QuizSet {
    id: string
    topic: string
    quiz: QuizQuestion[]
    numberOfQuestions: number
    difficulty: "easy" | "medium" | "hard"
    createdAt: string
}

const STORAGE_KEY = "briefly_quiz_sets"

export default function QuizPage() {
    const router = useRouter()
    const [content, setContent] = useState("")
    const [topic, setTopic] = useState("")
    const [numberOfQuestions, setNumberOfQuestions] = useState(5)
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isProcessingFile, setIsProcessingFile] = useState(false)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const [savedQuizzes, setSavedQuizzes] = useState<QuizSet[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load saved quizzes on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) {
                    setSavedQuizzes(parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                }
            } catch (err) {
                console.error("Failed to load saved quizzes:", err)
            }
        }
    }, [])

    const extractTextFromPDF = async (file: File): Promise<string> => {
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
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.extractRawText({ arrayBuffer })
            
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
                setContent(extractedText)
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

    const handleGenerate = async () => {
        if (!content.trim()) {
            setError("Please enter some content to generate a quiz")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await apiClient.generateQuiz(content, numberOfQuestions, difficulty)
            if (response.success && response.data) {
                const generatedQuiz = response.data.quiz
                // Store in sessionStorage for preview page
                sessionStorage.setItem("preview_quiz", JSON.stringify(generatedQuiz))
                sessionStorage.setItem("preview_quiz_content", content)
                sessionStorage.setItem("preview_quiz_topic", topic || "")
                sessionStorage.setItem("preview_quiz_numberOfQuestions", numberOfQuestions.toString())
                sessionStorage.setItem("preview_quiz_difficulty", difficulty)
                // Redirect to preview page
                router.push(`/dashboard/quiz/preview?quiz=${encodeURIComponent(JSON.stringify(generatedQuiz))}&topic=${encodeURIComponent(topic || "")}&numberOfQuestions=${numberOfQuestions}&difficulty=${difficulty}`)
            } else {
                setError(response.error || "Failed to generate quiz")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
            console.error("Quiz generation error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewQuiz = (quizId: string) => {
        router.push(`/dashboard/quiz/${quizId}`)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    return (
        <DashboardLayout title="Quiz Generator">
            <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Target className="size-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Quiz Generator</h2>
                </div>
                <p className="text-muted-foreground">Test your knowledge with AI-generated quiz questions</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                    {/* Input Form */}
                    <Card className="flex flex-col h-[650px]">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle>Create Quiz</CardTitle>
                            <CardDescription>Enter your content below</CardDescription>
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
                                            className={`flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-colors cursor-pointer ${
                                                isProcessingFile
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

                            <div className="grid gap-4 sm:grid-cols-2 flex-shrink-0">
                                <div>
                                    <label htmlFor="questions" className="mb-2 block text-sm font-medium text-foreground">
                                        Number of Questions
                                    </label>
                                    <input
                                        id="questions"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={numberOfQuestions}
                                        onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 5)}
                                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="difficulty" className="mb-2 block text-sm font-medium text-foreground">
                                        Difficulty
                                    </label>
                                    <select
                                        id="difficulty"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0">
                                <label htmlFor="content" className="mb-2 block text-sm font-medium text-foreground">
                                    Content <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste your notes, textbook content, or course materials here. The AI will generate quiz questions from this content..."
                                    className="w-full h-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                                <p className="mt-1 text-xs text-muted-foreground flex-shrink-0">{content.length} characters</p>
                            </div>

                            {error && (
                                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex-shrink-0">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || !content.trim()}
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
                                        Generate Quiz
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Saved Quizzes List */}
                    <Card className="flex flex-col h-[650px]">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle>Saved Quizzes</CardTitle>
                            <CardDescription>Your saved quiz collections</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Loader2 className="mb-4 size-8 animate-spin text-primary" />
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">Generating quiz...</h3>
                                        <p className="text-sm text-muted-foreground">Please wait while we create your quiz</p>
                                    </div>
                                ) : savedQuizzes.length > 0 ? (
                                    savedQuizzes.map((quizSet) => (
                                        <button
                                            key={quizSet.id}
                                            onClick={() => handleViewQuiz(quizSet.id)}
                                            className="w-full text-left rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all p-4 group cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Target className="size-4 text-primary flex-shrink-0" />
                                                        <h3 className="font-semibold text-foreground break-words group-hover:text-primary transition-colors">{quizSet.topic}</h3>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <BookOpen className="size-3 shrink-0" />
                                                            <span>{quizSet.quiz.length} questions</span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="size-3 shrink-0" />
                                                            <span>{formatDate(quizSet.createdAt)}</span>
                                                        </span>
                                                        <span className="capitalize">{quizSet.difficulty}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                            <Target className="size-8 text-primary" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">No saved quizzes yet</h3>
                                        <p className="text-sm text-muted-foreground">Generate quizzes and save them to see them here</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
        </DashboardLayout>
    )
}

