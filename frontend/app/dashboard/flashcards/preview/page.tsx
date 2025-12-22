"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowLeft,
    BookOpen,
    Brain,
    Check,
    GraduationCap,
    Loader2,
    Save
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

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

const STORAGE_KEY = "briefly_flashcard_sets"

export default function FlashcardPreviewPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [flashcards, setFlashcards] = useState<Flashcard[]>([])
    const [topic, setTopic] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [savedSetId, setSavedSetId] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        // Get flashcards and topic from URL params or sessionStorage
        const flashcardsParam = searchParams.get("flashcards")
        const topicParam = searchParams.get("topic")

        if (flashcardsParam) {
            try {
                const parsed = JSON.parse(decodeURIComponent(flashcardsParam))
                if (Array.isArray(parsed)) {
                    setFlashcards(parsed)
                }
            } catch (err) {
                console.error("Failed to parse flashcards:", err)
            }
        } else {
            // Try sessionStorage as fallback
            const stored = sessionStorage.getItem("preview_flashcards")
            const storedTopic = sessionStorage.getItem("preview_topic")
            if (stored) {
                try {
                    setFlashcards(JSON.parse(stored))
                    if (storedTopic) {
                        setTopic(storedTopic)
                    }
                } catch (err) {
                    console.error("Failed to load from sessionStorage:", err)
                }
            }
        }

        if (topicParam) {
            setTopic(decodeURIComponent(topicParam))
        }
    }, [searchParams])

    const handleSave = async () => {
        if (flashcards.length === 0) {
            return
        }

        setIsSaving(true)
        
        // Add a small delay to show loading state (simulates async operation)
        await new Promise(resolve => setTimeout(resolve, 800))
        
        try {
            const newSet: FlashcardSet = {
                id: Date.now().toString(),
                topic: topic || "Untitled",
                flashcards,
                createdAt: new Date().toISOString(),
            }

            const saved = localStorage.getItem(STORAGE_KEY)
            const existingSets = saved ? JSON.parse(saved) : []
            const updatedSets = [newSet, ...existingSets]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets))

            setSavedSetId(newSet.id)
            
            // Show success state briefly
            setShowSuccess(true)
            await new Promise(resolve => setTimeout(resolve, 600))
            
            setIsSaved(true)
            setShowSuccess(false)
            
            // Clear sessionStorage
            sessionStorage.removeItem("preview_flashcards")
            sessionStorage.removeItem("preview_topic")
            
            // Update URL to remove query params after saving
            router.replace("/dashboard/flashcards/preview")
        } catch (err) {
            console.error("Failed to save flashcards:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleStudyMode = () => {
        if (savedSetId) {
            router.push(`/dashboard/flashcards/${savedSetId}/study`)
        } else {
            // If somehow savedSetId is not set, try to find it from localStorage
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    const sets = JSON.parse(saved)
                    // Find the most recent set with matching topic and flashcards
                    const matchingSet = sets.find((s: FlashcardSet) => 
                        s.topic === (topic || "Untitled") && 
                        s.flashcards.length === flashcards.length
                    )
                    if (matchingSet) {
                        router.push(`/dashboard/flashcards/${matchingSet.id}/study`)
                        return
                    }
                } catch (err) {
                    console.error("Failed to find saved set:", err)
                }
            }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
    }

    if (flashcards.length === 0) {
        return (
            <DashboardLayout title="Preview">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                        <Brain className="size-8 text-destructive" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">No flashcards to preview</h3>
                    <p className="text-sm text-muted-foreground mb-4">Please generate flashcards first.</p>
                    <Button onClick={() => router.push("/dashboard/flashcards")} variant="outline">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Generator
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title={topic || "Preview"}>
            <div className="mb-6">
                <Button
                    onClick={() => router.push("/dashboard/flashcards")}
                    variant="ghost"
                    size="sm"
                    className="mb-4 gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back to Generator
                </Button>

                <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Brain className="size-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                                {topic || "Untitled"}
                            </h2>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="size-4" />
                                    {flashcards.length} flashcards
                                </span>
                                <span className="text-xs text-muted-foreground">Preview</span>
                            </div>
                        </div>
                    </div>
                    {!isSaved ? (
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || showSuccess}
                            className="gap-2 min-w-[120px]"
                        >
                            {showSuccess ? (
                                <>
                                    <Check className="size-4 text-green-500" />
                                    <span>Saved!</span>
                                </>
                            ) : isSaving ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span>Save Set</span>
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleStudyMode}
                            className="gap-2"
                        >
                            <GraduationCap className="size-4" />
                            Study Mode
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {flashcards.map((flashcard, index) => (
                    <Card key={index} className="border-primary/20 hover:border-primary/40 transition-colors">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                    Question {index + 1}
                                </div>
                                <p className="text-base font-medium text-foreground leading-relaxed">
                                    {flashcard.question}
                                </p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Answer
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {flashcard.answer}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    )
}

