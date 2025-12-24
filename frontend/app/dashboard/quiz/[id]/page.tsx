"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { updateStudyStreak } from "@/lib/streak"
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
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Edit2, GraduationCap, GripVertical, Save, Target, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
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

export default function QuizDetailPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = params.id as string
    const [quizSet, setQuizSet] = useState<QuizSet | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editedQuestion, setEditedQuestion] = useState("")
    const [editedOptions, setEditedOptions] = useState<string[]>([])
    const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(0)
    const [isStudyMode, setIsStudyMode] = useState(false)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
    const [showResults, setShowResults] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        const loadQuizSet = async () => {
            setIsLoading(true)
            try {
                const response = await apiClient.getQuizSet(quizId)
                if (response.success && response.data) {
                    const quiz: QuizSet = {
                        id: response.data.id,
                        topic: response.data.topic,
                        quiz: response.data.questions || [],
                        numberOfQuestions: response.data.numberOfQuestions,
                        difficulty: response.data.difficulty,
                        createdAt: response.data.createdAt,
                    }
                    setQuizSet(quiz)
                } else {
                    console.error("Failed to load quiz set:", response.error)
                }
            } catch (err) {
                console.error("Error loading quiz set:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadQuizSet()
    }, [quizId])

    const saveQuizToAPI = async (updatedQuiz: QuizSet) => {
        try {
            const response = await apiClient.updateQuizSet(quizId, {
                topic: updatedQuiz.topic,
                numberOfQuestions: updatedQuiz.numberOfQuestions,
                difficulty: updatedQuiz.difficulty,
                questions: updatedQuiz.quiz,
            })
            if (!response.success) {
                console.error("Failed to save quiz set:", response.error)
            }
        } catch (err) {
            console.error("Error saving quiz set:", err)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id && quizSet) {
            const oldIndex = parseInt(active.id.toString().replace("quiz-", ""))
            const newIndex = parseInt(over.id.toString().replace("quiz-", ""))

            const newQuiz = arrayMove(quizSet.quiz, oldIndex, newIndex)
            const updatedQuiz = { ...quizSet, quiz: newQuiz }
            setQuizSet(updatedQuiz)
            await saveQuizToAPI(updatedQuiz)
        }
    }

    const handleEdit = (index: number) => {
        if (quizSet) {
            setEditingIndex(index)
            setEditedQuestion(quizSet.quiz[index].question)
            setEditedOptions([...quizSet.quiz[index].options])
            setEditedCorrectAnswer(quizSet.quiz[index].correctAnswer)
        }
    }

    const handleSave = async (index: number, question: string, options: string[], correctAnswer: number) => {
        if (quizSet && question.trim() && options.every(opt => opt.trim()) && options.length >= 2) {
            const newQuiz = [...quizSet.quiz]
            newQuiz[index] = {
                question: question.trim(),
                options: options.map(opt => opt.trim()),
                correctAnswer,
            }
            const updatedQuiz = { ...quizSet, quiz: newQuiz }
            setQuizSet(updatedQuiz)
            await saveQuizToAPI(updatedQuiz)
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

    const handleStartStudyMode = () => {
        setIsStudyMode(true)
        setSelectedAnswers({})
        setShowResults(false)
        setEditingIndex(null) // Exit edit mode if active
        setCurrentIndex(0)
        updateStudyStreak()
    }

    const handleExitStudyMode = () => {
        setIsStudyMode(false)
        setSelectedAnswers({})
        setShowResults(false)
        setCurrentIndex(0)
    }

    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
        if (showResults) return
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex,
        }))
    }

    const handleSubmit = () => {
        setShowResults(true)
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleNext = () => {
        if (quizSet && currentIndex < quizSet.quiz.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const calculateScore = () => {
        if (!quizSet) return { correct: 0, total: 0, percentage: 0 }
        let correct = 0
        quizSet.quiz.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correct++
            }
        })
        return { correct, total: quizSet.quiz.length, percentage: Math.round((correct / quizSet.quiz.length) * 100) }
    }

    const score = showResults ? calculateScore() : null


    if (isLoading) {
        return (
            <DashboardLayout title="Loading...">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Target className="size-12 text-primary mx-auto mb-4 animate-pulse" />
                        <p className="text-muted-foreground">Loading quiz...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!quizSet) {
        return (
            <DashboardLayout title="Quiz Not Found">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                        <Target className="size-8 text-destructive" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Quiz not found</h3>
                    <p className="text-sm text-muted-foreground mb-4">The quiz you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push("/dashboard/quiz")} variant="outline">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Quizzes
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title={quizSet.topic}>
            <div className="mb-6">
                <Button
                    onClick={() => router.push("/dashboard/quiz")}
                    variant="ghost"
                    size="sm"
                    className="mb-4 gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back to Quizzes
                </Button>
                
                {/* Header Section - Responsive Layout */}
                <div className="mb-4 space-y-4">
                    {/* Title and Icon Row */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Target className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl break-words">{quizSet.topic}</h2>
                            </div>
                        </div>
                        {/* Study Mode Button - Always visible when quiz is saved */}
                        <Button
                            onClick={isStudyMode ? handleExitStudyMode : handleStartStudyMode}
                            className="gap-2 shrink-0"
                            variant={isStudyMode ? "outline" : "default"}
                        >
                            <GraduationCap className="size-4" />
                            {isStudyMode ? "Exit Study Mode" : "Study Mode"}
                        </Button>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <BookOpen className="size-4 shrink-0" />
                            <span>{quizSet.quiz.length} questions</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="size-4 shrink-0" />
                            <span className="hidden sm:inline">{new Date(quizSet.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                            <span className="sm:hidden">{new Date(quizSet.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </span>
                        <span className="capitalize">{quizSet.difficulty}</span>
                    </div>
                </div>
            </div>

            {isStudyMode ? (
                <>
                    {/* Study Mode - Single Question Flow */}
                    <div className="mb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="text-sm font-medium text-foreground">
                                Question {currentIndex + 1} of {quizSet.quiz.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {Math.round(((currentIndex + 1) / quizSet.quiz.length) * 100)}% complete
                            </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-2">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / quizSet.quiz.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {(() => {
                        const question = quizSet.quiz[currentIndex]
                        const selectedAnswer = selectedAnswers[currentIndex]
                        const isCorrect = showResults && selectedAnswer === question.correctAnswer
                        const isIncorrect = showResults && selectedAnswer !== undefined && selectedAnswer !== question.correctAnswer

                        return (
                            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start gap-2">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {currentIndex + 1}
                                        </span>
                                        <p className="flex-1 text-base font-medium text-foreground">{question.question}</p>
                                    </div>

                                    <div className="ml-8 space-y-2">
                                        {question.options.map((option, optionIndex) => {
                                            const isSelected = selectedAnswer === optionIndex
                                            const isCorrectOption = showResults && optionIndex === question.correctAnswer

                                            return (
                                                <button
                                                    key={optionIndex}
                                                    type="button"
                                                    onClick={() => handleAnswerSelect(currentIndex, optionIndex)}
                                                    disabled={showResults}
                                                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                                                        isCorrectOption && showResults
                                                            ? "border-green-500 bg-green-50 text-green-900"
                                                            : isIncorrect && isSelected
                                                              ? "border-red-500 bg-red-50 text-red-900"
                                                              : isSelected
                                                                ? "border-primary bg-primary/10 text-primary"
                                                                : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent/10"
                                                    } ${showResults ? "cursor-default" : "cursor-pointer"}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                                        <span>{option}</span>
                                                        {showResults && isCorrectOption && (
                                                            <span className="ml-auto text-xs font-semibold text-green-600">✓ Correct</span>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })()}

                    <div className="mt-6 space-y-4">
                        {!showResults && (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <Button
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    variant="outline"
                                    className="w-full md:w-auto gap-2"
                                >
                                    <ArrowLeft className="size-4" />
                                    Previous
                                </Button>

                                {currentIndex === quizSet.quiz.length - 1 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={selectedAnswers[currentIndex] === undefined}
                                        className="w-full md:w-auto gap-2"
                                    >
                                        Submit
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        disabled={selectedAnswers[currentIndex] === undefined}
                                        className="w-full md:w-auto gap-2"
                                    >
                                        Next
                                        <ArrowRight className="size-4" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {showResults && score && (
                            <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="p-6">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-primary mb-2">{score.percentage}%</p>
                                        <p className="text-sm text-muted-foreground">
                                            You got {score.correct} out of {score.total} questions correct
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Edit Mode - Draggable and Editable */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={quizSet.quiz.map((_, index) => `quiz-${index}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {quizSet.quiz.map((question, index) => (
                                    <SortableQuizQuestion
                                        key={`quiz-${index}`}
                                        question={question}
                                        index={index}
                                        isEditing={editingIndex === index}
                                        onEdit={() => handleEdit(index)}
                                        onSave={(question, options, correctAnswer) => handleSave(index, question, options, correctAnswer)}
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
                </>
            )}
        </DashboardLayout>
    )
}






