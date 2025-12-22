"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, GraduationCap, Loader2, Save, Target } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

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

export default function QuizPreviewPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [quiz, setQuiz] = useState<QuizQuestion[]>([])
    const [topic, setTopic] = useState("")
    const [numberOfQuestions, setNumberOfQuestions] = useState(5)
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [savedQuizId, setSavedQuizId] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        // Get quiz from URL params or sessionStorage
        const quizParam = searchParams.get("quiz")
        const topicParam = searchParams.get("topic")
        const numberOfQuestionsParam = searchParams.get("numberOfQuestions")
        const difficultyParam = searchParams.get("difficulty")

        if (quizParam) {
            try {
                const parsed = JSON.parse(decodeURIComponent(quizParam))
                if (Array.isArray(parsed)) {
                    setQuiz(parsed)
                }
            } catch (err) {
                console.error("Failed to parse quiz:", err)
            }
        } else {
            // Try sessionStorage as fallback
            const stored = sessionStorage.getItem("preview_quiz")
            if (stored) {
                try {
                    setQuiz(JSON.parse(stored))
                } catch (err) {
                    console.error("Failed to load from sessionStorage:", err)
                }
            }
        }

        if (numberOfQuestionsParam) {
            setNumberOfQuestions(parseInt(numberOfQuestionsParam) || 5)
        } else {
            const stored = sessionStorage.getItem("preview_quiz_numberOfQuestions")
            if (stored) {
                setNumberOfQuestions(parseInt(stored) || 5)
            }
        }

        if (topicParam) {
            setTopic(decodeURIComponent(topicParam))
        } else {
            const stored = sessionStorage.getItem("preview_quiz_topic")
            if (stored) {
                setTopic(stored)
            }
        }

        if (difficultyParam) {
            setDifficulty(difficultyParam as "easy" | "medium" | "hard")
        } else {
            const stored = sessionStorage.getItem("preview_quiz_difficulty")
            if (stored) {
                setDifficulty(stored as "easy" | "medium" | "hard")
            }
        }
    }, [searchParams])

    const handleSave = async () => {
        if (quiz.length === 0) {
            return
        }

        setIsSaving(true)
        
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 800))
        
        try {
            // Generate a meaningful title from topic or content
            const generateTitle = () => {
                if (topic && topic.trim()) {
                    return topic.trim()
                }
                // Extract title from first question if no topic
                if (quiz.length > 0 && quiz[0].question) {
                    const firstQuestion = quiz[0].question
                    // Get first sentence or first 50 characters
                    const firstSentence = firstQuestion.split(/[.!?]/)[0].trim()
                    if (firstSentence.length > 0 && firstSentence.length <= 60) {
                        return firstSentence
                    }
                    return firstQuestion.substring(0, 50).trim() + "..."
                }
                // Fallback
                return `Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
            }

            const newQuiz: QuizSet = {
                id: Date.now().toString(),
                topic: generateTitle(),
                quiz,
                numberOfQuestions,
                difficulty,
                createdAt: new Date().toISOString(),
            }

            const saved = localStorage.getItem(STORAGE_KEY)
            const existingQuizzes = saved ? JSON.parse(saved) : []
            const updatedQuizzes = [newQuiz, ...existingQuizzes]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuizzes))

            setSavedQuizId(newQuiz.id)
            
            // Show success state briefly
            setShowSuccess(true)
            await new Promise(resolve => setTimeout(resolve, 600))
            
            setIsSaved(true)
            setShowSuccess(false)
            
            // Clear sessionStorage
            sessionStorage.removeItem("preview_quiz")
            sessionStorage.removeItem("preview_quiz_content")
            sessionStorage.removeItem("preview_quiz_topic")
            sessionStorage.removeItem("preview_quiz_numberOfQuestions")
            sessionStorage.removeItem("preview_quiz_difficulty")
            
            // Update URL to remove query params after saving
            router.replace("/dashboard/quiz/preview")
        } catch (err) {
            console.error("Failed to save quiz:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleStudyMode = () => {
        if (savedQuizId) {
            router.push(`/dashboard/quiz/${savedQuizId}`)
        } else {
            // If somehow savedQuizId is not set, try to find it from localStorage
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    const quizzes = JSON.parse(saved)
                    // Find the most recent quiz with matching properties
                    const matchingQuiz = quizzes.find((q: QuizSet) => 
                        q.quiz.length === quiz.length &&
                        q.numberOfQuestions === numberOfQuestions &&
                        q.difficulty === difficulty &&
                        (topic ? q.topic === topic : true)
                    )
                    if (matchingQuiz) {
                        router.push(`/dashboard/quiz/${matchingQuiz.id}`)
                        return
                    }
                } catch (err) {
                    console.error("Failed to find saved quiz:", err)
                }
            }
        }
    }

    if (quiz.length === 0) {
        return (
            <DashboardLayout title="Preview">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                        <Target className="size-8 text-destructive" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">No quiz to preview</h3>
                    <p className="text-sm text-muted-foreground mb-4">Please generate a quiz first.</p>
                    <Button onClick={() => router.push("/dashboard/quiz")} variant="outline">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Generator
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Quiz Preview">
            <div className="mb-6">
                <Button
                    onClick={() => router.push("/dashboard/quiz")}
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
                            <Target className="size-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
                                {topic || "Quiz Preview"}
                            </h2>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span>{quiz.length} questions</span>
                                </span>
                                <span className="capitalize">{difficulty}</span>
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
                                    <span>Save Quiz</span>
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
                {quiz.map((question, questionIndex) => (
                    <Card key={questionIndex} className="border-primary/20 hover:border-primary/40 transition-colors">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                    Question {questionIndex + 1}
                                </div>
                                <p className="text-base font-medium text-foreground leading-relaxed">
                                    {question.question}
                                </p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Options
                                </div>
                                <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                        <div
                                            key={optionIndex}
                                            className="rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                                <span>{option}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    )
}

