"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ArrowLeft, BookOpen, Brain, Calendar, Edit2, GraduationCap, GripVertical, Save, X } from "lucide-react"
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

const STORAGE_KEY = "briefly_flashcard_sets"

interface SortableFlashcardProps {
    flashcard: Flashcard
    index: number
    isEditing: boolean
    onEdit: () => void
    onSave: (question: string, answer: string) => void
    onCancel: () => void
    editedQuestion: string
    editedAnswer: string
    setEditedQuestion: (value: string) => void
    setEditedAnswer: (value: string) => void
}

function SortableFlashcard({
    flashcard,
    index,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    editedQuestion,
    editedAnswer,
    setEditedQuestion,
    setEditedAnswer,
}: SortableFlashcardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `flashcard-${index}`,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
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
                                aria-label="Edit flashcard"
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
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px]"
                                    placeholder="Enter question..."
                                    autoFocus
                                />
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Answer
                                </div>
                                <textarea
                                    value={editedAnswer}
                                    onChange={(e) => setEditedAnswer(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[100px]"
                                    placeholder="Enter answer..."
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button onClick={onCancel} variant="outline" size="sm">
                                    <X className="size-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={() => onSave(editedQuestion, editedAnswer)} size="sm">
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
                                    {flashcard.question}
                                </p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Answer
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed pr-16">
                                    {flashcard.answer}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function FlashcardSetPage() {
    const router = useRouter()
    const params = useParams()
    const setId = params.id as string
    const [set, setSet] = useState<FlashcardSet | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editedQuestion, setEditedQuestion] = useState("")
    const [editedAnswer, setEditedAnswer] = useState("")

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) {
                    const foundSet = parsed.find((s: FlashcardSet) => s.id === setId)
                    if (foundSet) {
                        setSet(foundSet)
                    }
                }
            } catch (err) {
                console.error("Failed to load flashcard set:", err)
            }
        }
        setIsLoading(false)
    }, [setId])

    const saveSetToStorage = (updatedSet: FlashcardSet) => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) {
                    const updated = parsed.map((s: FlashcardSet) =>
                        s.id === setId ? updatedSet : s
                    )
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
                }
            } catch (err) {
                console.error("Failed to save flashcard set:", err)
            }
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id && set) {
            const oldIndex = parseInt(active.id.toString().replace("flashcard-", ""))
            const newIndex = parseInt(over.id.toString().replace("flashcard-", ""))

            const newFlashcards = arrayMove(set.flashcards, oldIndex, newIndex)
            const updatedSet = { ...set, flashcards: newFlashcards }
            setSet(updatedSet)
            saveSetToStorage(updatedSet)
        }
    }

    const handleEdit = (index: number) => {
        if (set) {
            setEditingIndex(index)
            setEditedQuestion(set.flashcards[index].question)
            setEditedAnswer(set.flashcards[index].answer)
        }
    }

    const handleSave = (index: number, question: string, answer: string) => {
        if (set && question.trim() && answer.trim()) {
            const newFlashcards = [...set.flashcards]
            newFlashcards[index] = { question: question.trim(), answer: answer.trim() }
            const updatedSet = { ...set, flashcards: newFlashcards }
            setSet(updatedSet)
            saveSetToStorage(updatedSet)
            setEditingIndex(null)
            setEditedQuestion("")
            setEditedAnswer("")
        }
    }

    const handleCancel = () => {
        setEditingIndex(null)
        setEditedQuestion("")
        setEditedAnswer("")
    }

    const formatDate = (dateString: string, short: boolean = false) => {
        const date = new Date(dateString)
        if (short) {
            // Short format for mobile: "Dec 22, 2025"
            return date.toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric", 
                year: "numeric"
            })
        }
        // Full format for desktop
        return date.toLocaleDateString("en-US", { 
            month: "long", 
            day: "numeric", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    if (isLoading) {
        return (
            <DashboardLayout title="Loading...">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Brain className="size-12 text-primary mx-auto mb-4 animate-pulse" />
                        <p className="text-muted-foreground">Loading flashcard set...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!set) {
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

    return (
        <DashboardLayout title={set.topic}>
            <div className="mb-6">
                <Button
                    onClick={() => router.push("/dashboard/flashcards")}
                    variant="ghost"
                    size="sm"
                    className="mb-4 gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back to Flashcards
                </Button>
                
                {/* Header Section - Desktop: Original layout, Mobile: Stacked */}
                <div className="mb-2">
                    {/* Mobile: Stacked Layout */}
                    <div className="md:hidden space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Brain className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-foreground break-words">{set.topic}</h2>
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
                            <Button
                                onClick={() => router.push(`/dashboard/flashcards/${setId}/study`)}
                                className="gap-2 w-full"
                            >
                                <GraduationCap className="size-4" />
                                Study Mode
                            </Button>
                        </div>
                    </div>

                    {/* Desktop: Original Side-by-Side Layout */}
                    <div className="hidden md:flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Brain className="size-5" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{set.topic}</h2>
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
                        <Button
                            onClick={() => router.push(`/dashboard/flashcards/${setId}/study`)}
                            className="gap-2"
                        >
                            <GraduationCap className="size-4" />
                            Study Mode
                        </Button>
                    </div>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={set.flashcards.map((_, index) => `flashcard-${index}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {set.flashcards.map((flashcard, index) => (
                            <SortableFlashcard
                                key={`flashcard-${index}`}
                                flashcard={flashcard}
                                index={index}
                                isEditing={editingIndex === index}
                                onEdit={() => handleEdit(index)}
                                onSave={(question, answer) => handleSave(index, question, answer)}
                                onCancel={handleCancel}
                                editedQuestion={editedQuestion}
                                editedAnswer={editedAnswer}
                                setEditedQuestion={setEditedQuestion}
                                setEditedAnswer={setEditedAnswer}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </DashboardLayout>
    )
}

