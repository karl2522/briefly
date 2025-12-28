"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowLeft, Check, Edit2, GraduationCap, GripVertical, Loader2, Save, Target, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

interface QuizQuestion {
    question: string
    options: string[]
    correctAnswer: number
}

interface SortableQuizQuestionProps {
    question: QuizQuestion
    index: number
    isEditing: boolean
    onEdit: () => void
    onSave: (question: string, options: string[], correctAnswer: number) => void
    onCancel: () => void
    editedQuestion: string
    editedOptions: string[]
    editedCorrectAnswer: number
    setEditedQuestion: (value: string) => void
    setEditedOptions: (value: string[]) => void
    setEditedCorrectAnswer: (value: number) => void
}

function SortableQuizQuestion({
    question,
    index,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    editedQuestion,
    editedOptions,
    editedCorrectAnswer,
    setEditedQuestion,
    setEditedOptions,
    setEditedCorrectAnswer,
}: SortableQuizQuestionProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `quiz-${index}`,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleOptionChange = (optionIndex: number, value: string) => {
        const newOptions = [...editedOptions]
        newOptions[optionIndex] = value
        setEditedOptions(newOptions)
    }

    const handleAddOption = () => {
        setEditedOptions([...editedOptions, ""])
    }

    const handleRemoveOption = (optionIndex: number) => {
        if (editedOptions.length <= 2) return // Keep at least 2 options
        const newOptions = editedOptions.filter((_, i) => i !== optionIndex)
        setEditedOptions(newOptions)
        // Adjust correct answer if needed
        if (editedCorrectAnswer >= newOptions.length) {
            setEditedCorrectAnswer(newOptions.length - 1)
        } else if (editedCorrectAnswer > optionIndex) {
            setEditedCorrectAnswer(editedCorrectAnswer - 1)
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-4">
                    {/* Drag Handle */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                            {...attributes}
                            {...listeners}
                            className="p-1.5 rounded-md hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Drag to reorder"
                        >
                            <GripVertical className="size-4" />
                        </button>
                        {!isEditing && (
                            <button
                                onClick={onEdit}
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Edit question"
                            >
                                <Edit2 className="size-4" />
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                    Question {index + 1}
                                </div>
                                <textarea
                                    value={editedQuestion}
                                    onChange={(e) => setEditedQuestion(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px] pr-16"
                                    placeholder="Enter question..."
                                    autoFocus
                                />
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Options
                                </div>
                                <div className="space-y-2">
                                    {editedOptions.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`correct-${index}`}
                                                checked={editedCorrectAnswer === optionIndex}
                                                onChange={() => setEditedCorrectAnswer(optionIndex)}
                                                className="size-4 text-primary"
                                            />
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                            />
                                            {editedOptions.length > 2 && (
                                                <button
                                                    onClick={() => handleRemoveOption(optionIndex)}
                                                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                    aria-label="Remove option"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        onClick={handleAddOption}
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        disabled={editedOptions.length >= 6}
                                    >
                                        + Add Option
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button onClick={onCancel} variant="outline" size="sm">
                                    <X className="size-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => onSave(editedQuestion, editedOptions, editedCorrectAnswer)}
                                    size="sm"
                                    disabled={!editedQuestion.trim() || editedOptions.some(opt => !opt.trim()) || editedOptions.length < 2}
                                >
                                    <Save className="size-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                    Question {index + 1}
                                </div>
                                <p className="text-base font-medium text-foreground leading-relaxed pr-16">
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
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function QuizPreviewContent() {
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

    // Editing State
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editedQuestion, setEditedQuestion] = useState("")
    const [editedOptions, setEditedOptions] = useState<string[]>([])
    const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(0)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

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

        // Check if quizSetId exists (already saved from generation)
        const quizSetId = sessionStorage.getItem("preview_quizSetId")
        if (quizSetId) {
            setIsSaved(true)
            setSavedQuizId(quizSetId)
        }
    }, [searchParams])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = parseInt(active.id.toString().replace("quiz-", ""))
            const newIndex = parseInt(over.id.toString().replace("quiz-", ""))

            const newQuiz = arrayMove(quiz, oldIndex, newIndex)
            setQuiz(newQuiz)
            sessionStorage.setItem("preview_quiz", JSON.stringify(newQuiz))
        }
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setEditedQuestion(quiz[index].question)
        setEditedOptions([...quiz[index].options])
        setEditedCorrectAnswer(quiz[index].correctAnswer)
    }

    const handleSaveQuestion = (index: number, question: string, options: string[], correctAnswer: number) => {
        if (question.trim() && options.every(opt => opt.trim()) && options.length >= 2) {
            const newQuiz = [...quiz]
            newQuiz[index] = {
                question: question.trim(),
                options: options.map(opt => opt.trim()),
                correctAnswer,
            }
            setQuiz(newQuiz)
            sessionStorage.setItem("preview_quiz", JSON.stringify(newQuiz))

            setEditingIndex(null)
            setEditedQuestion("")
            setEditedOptions([])
            setEditedCorrectAnswer(0)
        }
    }

    const handleCancel = () => {
        setEditingIndex(null)
        setEditedQuestion("")
        setEditedOptions([])
        setEditedCorrectAnswer(0)
    }

    const handleSave = async () => {
        if (quiz.length === 0) {
            return
        }

        setIsSaving(true)

        try {
            // Check if already saved (from generation)
            if (isSaved && savedQuizId) {
                return
            }

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

            // Create new quiz set via API
            const response = await apiClient.createQuizSet({
                topic: generateTitle(),
                numberOfQuestions,
                difficulty,
                questions: quiz,
            })

            if (response.success && response.data) {
                setSavedQuizId(response.data.id)
            } else {
                console.error("Failed to save quiz set:", response.error)
                setIsSaving(false)
                return
            }

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
            sessionStorage.removeItem("preview_quizSetId")

            // We stay on page but update UI to show "Study Mode"
        } catch (err) {
            console.error("Failed to save quiz:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleStudyMode = () => {
        if (savedQuizId) {
            router.push(`/dashboard/quiz/${savedQuizId}`)
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
                                {!isSaved && (
                                    <span className="text-xs text-muted-foreground animate-pulse border-l border-border pl-4">
                                        Preview - You can edit before saving
                                    </span>
                                )}
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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={quiz.map((_, index) => `quiz-${index}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {quiz.map((question, index) => (
                            <SortableQuizQuestion
                                key={`quiz-${index}`}
                                question={question}
                                index={index}
                                isEditing={editingIndex === index}
                                onEdit={() => handleEdit(index)}
                                onSave={(question, options, correctAnswer) => handleSaveQuestion(index, question, options, correctAnswer)}
                                onCancel={handleCancel}
                                editedQuestion={editedQuestion}
                                editedOptions={editedOptions}
                                editedCorrectAnswer={editedCorrectAnswer}
                                setEditedQuestion={setEditedQuestion}
                                setEditedOptions={setEditedOptions}
                                setEditedCorrectAnswer={setEditedCorrectAnswer}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </DashboardLayout>
    )
}

export default function QuizPreviewPage() {
    return (
        <Suspense
            fallback={
                <DashboardLayout title="Preview">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Loader2 className="size-8 animate-spin text-primary mb-4" />
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Loading preview...</h3>
                        <p className="text-sm text-muted-foreground">Please wait.</p>
                    </div>
                </DashboardLayout>
            }
        >
            <QuizPreviewContent />
        </Suspense>
    )
}
