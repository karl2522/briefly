"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { Check, ChevronDown, Clock, Copy, FileText, History, Loader2, Plus, Sparkles, Upload, X } from "lucide-react"
import mammoth from "mammoth"
import * as pdfjsLib from "pdfjs-dist"
import { useEffect, useRef, useState } from "react"

const STORAGE_KEY = "briefly_summary_history"

interface SummaryHistory {
    id: string
    text: string
    summary: string
    length: "short" | "medium" | "long"
    originalLength: number
    summaryLength: number
    createdAt: string
}

// Set PDF.js worker - configured dynamically in extraction function to handle CDN fallbacks
if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = ""
}

export default function SummarizerPage() {
    const [text, setText] = useState("")
    const [length, setLength] = useState<"short" | "medium" | "long">("medium")
    const [summary, setSummary] = useState("")
    const [originalLength, setOriginalLength] = useState(0)
    const [summaryLength, setSummaryLength] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isProcessingFile, setIsProcessingFile] = useState(false)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)
    const [history, setHistory] = useState<SummaryHistory[]>([])
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const historyDropdownRef = useRef<HTMLDivElement>(null)

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) {
                    // Sort by date, most recent first
                    const sorted = parsed.sort((a: SummaryHistory, b: SummaryHistory) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    setHistory(sorted)
                }
            } catch (err) {
                console.error("Failed to load summary history:", err)
            }
        }
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target as Node)) {
                setIsHistoryOpen(false)
            }
        }

        if (isHistoryOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isHistoryOpen])

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
                setText(extractedText)
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

    const handleSummarize = async () => {
        if (!text.trim()) {
            setError("Please enter some text to summarize")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await apiClient.summarizeText(text, length)
            if (response.success && response.data) {
                const summaryText = response.data.summary
                const origLength = response.data.originalLength
                const summLength = response.data.summaryLength

                setSummary(summaryText)
                setOriginalLength(origLength)
                setSummaryLength(summLength)

                // Save to history
                const historyItem: SummaryHistory = {
                    id: Date.now().toString(),
                    text: text.trim(),
                    summary: summaryText,
                    length,
                    originalLength: origLength,
                    summaryLength: summLength,
                    createdAt: new Date().toISOString(),
                }

                const updatedHistory = [historyItem, ...history].slice(0, 50) // Keep last 50 items
                setHistory(updatedHistory)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
            } else {
                setError(response.error || "Failed to summarize text")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
            console.error("Summarization error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLoadHistory = (historyItem: SummaryHistory) => {
        setText(historyItem.text)
        setSummary(historyItem.summary)
        setLength(historyItem.length)
        setOriginalLength(historyItem.originalLength)
        setSummaryLength(historyItem.summaryLength)
        setUploadedFileName(null) // Clear file name when loading from history
        setIsHistoryOpen(false)
        setError(null)
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleNewSummary = () => {
        setText("")
        setSummary("")
        setLength("medium")
        setOriginalLength(0)
        setSummaryLength(0)
        setUploadedFileName(null)
        setError(null)
        setIsCopied(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        setIsHistoryOpen(false)
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const formatHistoryDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        })
    }

    return (
        <DashboardLayout title="Text Summarizer">
            <div className="mb-6">
                <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <FileText className="size-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Text Summarizer</h2>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* New Summary Button */}
                        {(text || summary) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNewSummary}
                                className="gap-2"
                            >
                                <Plus className="size-4" />
                                <span className="hidden sm:inline">New Summary</span>
                                <span className="sm:hidden">New</span>
                            </Button>
                        )}
                        
                        {/* History Dropdown */}
                        <div className="relative" ref={historyDropdownRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                className="gap-2"
                                disabled={history.length === 0}
                            >
                                <History className="size-4" />
                                <span className="hidden sm:inline">History</span>
                                {history.length > 0 && (
                                    <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                        {history.length > 99 ? "99+" : history.length}
                                    </span>
                                )}
                                <ChevronDown className={`size-4 transition-transform ${isHistoryOpen ? "rotate-180" : ""}`} />
                            </Button>

                        {/* Dropdown Menu */}
                        {isHistoryOpen && history.length > 0 && (
                            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 rounded-lg border border-border bg-card shadow-lg max-h-[500px] overflow-hidden">
                                <div className="p-2 border-b border-border bg-muted/50">
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        <History className="size-4 text-primary" />
                                        <h3 className="text-sm font-semibold text-foreground">Summary History</h3>
                                    </div>
                                </div>
                                <div className="overflow-y-auto max-h-[450px]">
                                    {history.map((item) => {
                                        // Create a title from the first sentence or first 50 characters
                                        const getTitle = (text: string): string => {
                                            // Try to get first sentence
                                            const firstSentence = text.split(/[.!?]/)[0].trim()
                                            if (firstSentence.length > 0 && firstSentence.length <= 60) {
                                                return firstSentence
                                            }
                                            // Otherwise, get first 50 characters
                                            return text.length > 50 
                                                ? text.substring(0, 50).trim() + "..." 
                                                : text.trim()
                                        }
                                        
                                        const title = getTitle(item.text)
                                        
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleLoadHistory(item)}
                                                className="w-full text-left p-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 group cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                            {title}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {formatHistoryDate(item.createdAt)}
                                                    </span>
                                                    <span className="capitalize">{item.length}</span>
                                                    <span className="text-primary">
                                                        {Math.round((1 - item.summaryLength / item.originalLength) * 100)}% reduced
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground">Condense lengthy texts into clear, concise summaries</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Form */}
                <Card className="flex flex-col h-[650px]">
                    <CardHeader className="flex-shrink-0">
                        <CardTitle>Summarize Text</CardTitle>
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
                            <label htmlFor="length" className="mb-2 block text-sm font-medium text-foreground">
                                Summary Length
                            </label>
                            <select
                                id="length"
                                value={length}
                                onChange={(e) => setLength(e.target.value as "short" | "medium" | "long")}
                                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="short">Short (2-3 sentences)</option>
                                <option value="medium">Medium (concise paragraph)</option>
                                <option value="long">Long (multiple paragraphs)</option>
                            </select>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <label htmlFor="text" className="mb-2 block text-sm font-medium text-foreground">
                                Text Content <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste or type your text here. The AI will create a summary based on your selected length..."
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
                            onClick={handleSummarize}
                            disabled={isLoading || !text.trim()}
                            className="w-full gap-2 flex-shrink-0"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Summarizing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Generate Summary
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <Card className="flex flex-col h-[650px]">
                    {summary ? (
                        <>
                            <CardHeader className="flex-shrink-0">
                                <CardTitle>Summary</CardTitle>
                                <CardDescription>
                                    {originalLength > 0 && summaryLength > 0 && (
                                        <span>
                                            Reduced from {originalLength.toLocaleString()} to {summaryLength.toLocaleString()} characters (
                                            {Math.round((1 - summaryLength / originalLength) * 100)}% reduction)
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                <div className="flex-1 overflow-y-auto pr-2 mb-4">
                                    <div className="prose prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{summary}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(summary)
                                                setIsCopied(true)
                                                // Reset after 2 seconds
                                                setTimeout(() => {
                                                    setIsCopied(false)
                                                }, 2000)
                                            } catch (err) {
                                                console.error("Failed to copy:", err)
                                            }
                                        }}
                                        className="gap-2 min-w-[120px]"
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="size-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="size-4" />
                                                Copy Summary
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <CardHeader className="flex-shrink-0">
                                <CardTitle>Summary</CardTitle>
                                <CardDescription>Generated summary will appear here</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mb-4 size-8 animate-spin text-primary" />
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">Summarizing...</h3>
                                        <p className="text-sm text-muted-foreground">Please wait while we create your summary</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                            <FileText className="size-8 text-primary" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">No summary yet</h3>
                                        <p className="text-sm text-muted-foreground">Enter your text and click summarize to generate a summary</p>
                                    </>
                                )}
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    )
}

