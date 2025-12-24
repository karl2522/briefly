"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { updateStudyStreak } from "@/lib/streak"
import { ArrowLeft, ArrowLeft as ArrowLeftIcon, ArrowRight, BookOpen, Brain, Calendar, GraduationCap, ListOrdered, RotateCcw, Shuffle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
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

export default function StudyModePage() {
    const router = useRouter()
    const params = useParams()
    const setId = params.id as string
    const [set, setSet] = useState<FlashcardSet | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [studyCards, setStudyCards] = useState<Flashcard[]>([])
    const [sortMode, setSortMode] = useState<"original" | "random">("original")

    useEffect(() => {
        const loadFlashcardSet = async () => {
            setIsLoading(true)
            try {
                const response = await apiClient.getFlashcardSet(setId)
                if (response.success && response.data) {
                    const flashcardSet: FlashcardSet = {
                        id: response.data.id,
                        topic: response.data.topic,
                        flashcards: response.data.flashcards || [],
                        createdAt: response.data.createdAt,
                    }
                    setSet(flashcardSet)
                    setStudyCards([...flashcardSet.flashcards])
                    // count entering study mode as a study session
                    updateStudyStreak()
                } else {
                    console.error("Failed to load flashcard set:", response.error)
                }
            } catch (err) {
                console.error("Error loading flashcard set:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadFlashcardSet()
    }, [setId])

    const shuffleCards = () => {
        if (set) {
            const shuffled = [...set.flashcards].sort(() => Math.random() - 0.5)
            setStudyCards(shuffled)
            setCurrentIndex(0)
            setIsFlipped(false)
            setSortMode("random")
        }
    }

    const resetToOriginal = () => {
        if (set) {
            setStudyCards([...set.flashcards])
            setCurrentIndex(0)
            setIsFlipped(false)
            setSortMode("original")
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setIsFlipped(false)
        }
    }

    const handleNext = () => {
        if (studyCards.length > 0 && currentIndex < studyCards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
        }
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const formatDate = (dateString: string, short: boolean = false) => {
        const date = new Date(dateString)
        if (short) {
            // Short format for mobile: "Dec 22, 2025"
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            })
        }
        // Full format for desktop
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
    }

    if (isLoading) {
        return (
            <DashboardLayout title="Loading...">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Brain className="size-12 text-primary mx-auto mb-4 animate-pulse" />
                        <p className="text-muted-foreground">Loading study mode...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!set || studyCards.length === 0) {
        return (
            <DashboardLayout title="Flashcard Set Not Found">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                        <Brain className="size-8 text-destructive" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Flashcard set not found</h3>
                    <p className="text-sm text-muted-foreground mb-4">The flashcard set you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push("/dashboard/flashcards")} variant="outline">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Flashcards
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    const currentCard = studyCards[currentIndex]

    return (
        <DashboardLayout title={`Study: ${set.topic}`}>
            <div className="mb-6">
                <Button
                    onClick={() => router.push(`/dashboard/flashcards/${setId}`)}
                    variant="ghost"
                    size="sm"
                    className="mb-4 gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back to Set
                </Button>

                {/* Header Section - Desktop: Original layout, Mobile: Stacked */}
                <div className="mb-4">
                    {/* Mobile: Stacked Layout */}
                    <div className="md:hidden space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <GraduationCap className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-foreground">Study Mode</h2>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="size-4 shrink-0" />
                                    <span>{set.flashcards.length} flashcards</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-4 shrink-0" />
                                    <span>{formatDate(set.createdAt, true)}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={resetToOriginal}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 flex-1"
                                    disabled={sortMode === "original"}
                                >
                                    <ListOrdered className="size-4" />
                                    <span className="hidden xs:inline">Original Order</span>
                                    <span className="xs:hidden">Original</span>
                                </Button>
                                <Button
                                    onClick={shuffleCards}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 flex-1"
                                    disabled={sortMode === "random"}
                                >
                                    <Shuffle className="size-4" />
                                    Shuffle
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: Original Side-by-Side Layout */}
                    <div className="hidden md:flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <GraduationCap className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Study Mode</h2>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="size-4" />
                                        {set.flashcards.length} flashcards
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-4" />
                                        {formatDate(set.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={resetToOriginal}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={sortMode === "original"}
                            >
                                <ListOrdered className="size-4" />
                                Original Order
                            </Button>
                            <Button
                                onClick={shuffleCards}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={sortMode === "random"}
                            >
                                <Shuffle className="size-4" />
                                Shuffle
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar - Responsive */}
            <div className="mb-6">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-2">
                    <span className="text-xs md:text-sm font-medium text-foreground">
                        Card {currentIndex + 1} of {studyCards.length}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground">
                        {Math.round(((currentIndex + 1) / studyCards.length) * 100)}% complete
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / studyCards.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Flashcard - Responsive Height */}
            <div className="flex items-center justify-center min-h-[400px] md:min-h-[500px] mb-6">
                <div
                    onClick={handleFlip}
                    className="relative w-full max-w-2xl h-[400px] md:h-[500px] cursor-pointer"
                    style={{ perspective: "1000px" }}
                >
                    <div
                        className="relative w-full h-full transition-transform duration-700 ease-in-out"
                        style={{
                            transformStyle: "preserve-3d",
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                    >
                        {/* Front Side (Question) */}
                        <div
                            className="absolute inset-0 w-full h-full rounded-lg border-2 border-primary/30 bg-card shadow-xl flex items-center justify-center p-4 md:p-8 hover:border-primary/50 transition-colors"
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                            }}
                        >
                            <div className="text-center w-full">
                                <div className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                                    Question {currentIndex + 1}
                                </div>
                                <p className="text-lg md:text-2xl font-semibold text-foreground leading-relaxed break-words px-2">
                                    {currentCard.question}
                                </p>
                                <div className="mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <RotateCcw className="size-3 md:size-4" />
                                    <span className="hidden xs:inline md:inline">Click to reveal answer</span>
                                    <span className="xs:hidden md:hidden">Tap to reveal</span>
                                </div>
                            </div>
                        </div>

                        {/* Back Side (Answer) */}
                        <div
                            className="absolute inset-0 w-full h-full rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl flex items-center justify-center p-4 md:p-8 hover:border-primary/50 transition-colors"
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                            }}
                        >
                            <div className="text-center w-full">
                                <div className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                                    Answer
                                </div>
                                <p className="text-base md:text-xl text-foreground leading-relaxed break-words px-2">
                                    {currentCard.answer}
                                </p>
                                <div className="mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <RotateCcw className="size-3 md:size-4" />
                                    <span className="hidden xs:inline md:inline">Click to see question</span>
                                    <span className="xs:hidden md:hidden">Tap to see question</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Controls - Desktop: Original, Mobile: Responsive */}
            <div className="space-y-4">
                {/* Mobile: Responsive Layout */}
                <div className="md:hidden space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            variant="outline"
                            size="lg"
                            className="gap-2 flex-1 min-w-0"
                        >
                            <ArrowLeftIcon className="size-4 shrink-0" />
                            <span className="hidden xs:inline">Previous</span>
                            <span className="xs:hidden">Prev</span>
                        </Button>

                        <Button
                            onClick={handleFlip}
                            variant="default"
                            size="lg"
                            className="gap-2 min-w-[140px] flex-1"
                        >
                            <RotateCcw className="size-4 shrink-0" />
                            <span className="text-sm">
                                {isFlipped ? (
                                    <>
                                        <span className="hidden xs:inline">Show Question</span>
                                        <span className="xs:hidden">Question</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden xs:inline">Show Answer</span>
                                        <span className="xs:hidden">Answer</span>
                                    </>
                                )}
                            </span>
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={currentIndex === studyCards.length - 1}
                            variant="outline"
                            size="lg"
                            className="gap-2 flex-1 min-w-0"
                        >
                            <span className="hidden xs:inline">Next</span>
                            <span className="xs:hidden">Next</span>
                            <ArrowRight className="size-4 shrink-0" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <div className="text-xs text-muted-foreground">
                            Card {currentIndex + 1} of {studyCards.length}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                            <span className="text-xs font-medium text-foreground">
                                {currentIndex + 1} / {studyCards.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Desktop: Original Layout */}
                <div className="hidden md:flex items-center justify-center gap-4">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        <ArrowLeftIcon className="size-5" />
                        Previous
                    </Button>

                    <Button
                        onClick={handleFlip}
                        variant="default"
                        size="lg"
                        className="gap-2 min-w-[160px]"
                    >
                        <RotateCcw className="size-5" />
                        {isFlipped ? "Show Question" : "Show Answer"}
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={currentIndex === studyCards.length - 1}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        Next
                        <ArrowRight className="size-5" />
                    </Button>
                </div>

                {/* Desktop: Card Counter */}
                <div className="hidden md:block mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                        <span className="text-sm font-medium text-foreground">
                            {currentIndex + 1} / {studyCards.length}
                        </span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}





