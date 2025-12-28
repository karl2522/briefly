"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { getStudyStreak } from "@/lib/streak"
import { cn } from "@/lib/utils"
import { BookOpen, Brain, ChevronRight, Clock, Folder, Loader2, Plus, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

type Flashcard = { question: string; answer: string }
type FlashcardSet = { id: string; topic: string; flashcards: Flashcard[]; createdAt: string }
type QuizQuestion = { question: string; options: string[]; correctAnswer: number }
type QuizSet = { id: string; topic: string; quiz: QuizQuestion[]; numberOfQuestions: number; difficulty: string; createdAt: string }
type FolderType = { id: string; name: string; color: string; flashcardCount?: number; quizCount?: number }

export default function Dashboard() {
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
    const [quizSets, setQuizSets] = useState<QuizSet[]>([])
    const [folders, setFolders] = useState<FolderType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                // Load flashcard sets from API
                const flashcardResponse = await apiClient.getFlashcardSets()
                if (flashcardResponse.success && flashcardResponse.data) {
                    const sets: FlashcardSet[] = flashcardResponse.data.map((set: any) => ({
                        id: set.id,
                        topic: set.topic,
                        flashcards: set.flashcards || [],
                        createdAt: set.createdAt,
                    }))
                    setFlashcardSets(sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                }

                // Load quiz sets from API
                const quizResponse = await apiClient.getQuizSets()
                if (quizResponse.success && quizResponse.data) {
                    const quizzes: QuizSet[] = quizResponse.data.map((set: any) => ({
                        id: set.id,
                        topic: set.topic,
                        quiz: set.questions || [],
                        numberOfQuestions: set.numberOfQuestions,
                        difficulty: set.difficulty,
                        createdAt: set.createdAt,
                    }))
                    setQuizSets(quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                }

                // Load folders
                const foldersResponse = await apiClient.getFolders()
                if (foldersResponse.success && foldersResponse.data) {
                    setFolders(foldersResponse.data)
                }

            } catch (err) {
                console.error("Failed to load dashboard data:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
        setStreak(getStudyStreak())
    }, [])

    const totals = useMemo(() => {
        const totalFlashcards = flashcardSets.reduce((sum, set) => sum + set.flashcards.length, 0)
        const totalQuizzes = quizSets.length
        const totalQuestions = quizSets.reduce((sum, q) => sum + q.quiz.length, 0)
        return { totalFlashcards, totalQuizzes, totalQuestions }
    }, [flashcardSets, quizSets])

    const recentActivity = useMemo(() => {
        const activities: { id: string; type: 'flashcard' | 'quiz'; title: string; description: string; createdAt: string; color: string }[] = []
        flashcardSets.slice(0, 3).forEach((set, idx) => {
            activities.push({
                id: set.id,
                type: 'flashcard',
                title: set.topic || "Flashcard Set",
                description: `${set.flashcards.length} cards`,
                createdAt: set.createdAt,
                color: ["bg-primary", "bg-chart-2", "bg-chart-3"][idx % 3],
            })
        })
        quizSets.slice(0, 3).forEach((quiz, idx) => {
            activities.push({
                id: quiz.id,
                type: 'quiz',
                title: quiz.topic || "Quiz",
                description: `${quiz.quiz.length} questions`,
                createdAt: quiz.createdAt,
                color: ["bg-chart-4", "bg-chart-5", "bg-chart-6"][idx % 3],
            })
        })
        // Sort newest first, then map to display shape with formatted time
        return activities
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((item) => ({
                ...item,
                time: formatRelative(item.createdAt),
                link: item.type === 'flashcard' ? `/dashboard/flashcards/${item.id}` : `/dashboard/quiz/${item.id}`
            }))
    }, [flashcardSets, quizSets])

    const studySets = flashcardSets.slice(0, 6)

    return (
        <DashboardLayout title="Dashboard">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back!</h2>
                <p className="text-muted-foreground">Here's your latest progress and study sets.</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Study Streak"
                    value={`${streak} day${streak === 1 ? "" : "s"}`}
                    icon={<TrendingUp className="size-4 text-primary" />}
                    change={streak > 0 ? "Current streak" : "Start a session today"}
                />
                <StatCard
                    title="Flashcards"
                    value={totals.totalFlashcards.toString()}
                    icon={<Brain className="size-4 text-primary" />}
                    change={`${flashcardSets.length} sets`}
                />
                <StatCard
                    title="Quiz Questions"
                    value={totals.totalQuestions.toString()}
                    icon={<Target className="size-4 text-primary" />}
                    change={`${totals.totalQuizzes} quizzes`}
                />
                <StatCard
                    title="Recent Activity"
                    value={recentActivity.length > 0 ? "Active" : "No data"}
                    icon={<Clock className="size-4 text-primary" />}
                    change={recentActivity[0]?.time || "—"}
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest flashcards and quizzes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No recent activity yet. Generate a set to get started.</div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.slice(0, 6).map((item, idx) => (
                                    <Link key={`${item.type}-${item.id}`} href={item.link} className="block group">
                                        <ActivityItem
                                            title={item.title}
                                            description={item.description}
                                            time={item.time}
                                            color={item.color}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Your Folders - Replacing Quick Actions */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Your Folders</CardTitle>
                            <Link href="/dashboard/flashcards">
                                <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-primary">
                                    <Plus className="size-4" />
                                </Button>
                            </Link>
                        </div>
                        <CardDescription>Organize your study sets</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="size-6 animate-spin text-primary" />
                            </div>
                        ) : folders.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-3 py-6 text-center text-muted-foreground">
                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <Folder className="size-6 opacity-50" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">No folders yet</p>
                                    <p className="text-xs">Create your first folder to organize your sets.</p>
                                </div>
                                <Link href="/dashboard/flashcards" className="w-full">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Create Folder
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {folders.slice(0, 5).map((folder) => (
                                    <Link key={folder.id} href={`/dashboard/flashcards?folderId=${folder.id}`} className="block">
                                        <div className="flex items-center justify-between rounded-lg border border-transparent p-2 transition-all hover:bg-muted/50 hover:border-border/50 group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Folder className="size-4 text-primary fill-primary/20" style={{ color: folder.color }} />
                                                <span className="text-sm font-medium text-foreground">{folder.name}</span>
                                            </div>
                                            <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    </Link>
                                ))}
                                {folders.length > 5 && (
                                    <Link href="/dashboard/flashcards" className="block text-center text-xs text-muted-foreground hover:text-primary pt-2">
                                        View all {folders.length} folders
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Study Sets - flashcards */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Your Study Sets</CardTitle>
                        <CardDescription>Flashcard sets you've saved</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="size-6 animate-spin text-primary" />
                            </div>
                        ) : studySets.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No saved flashcard sets yet. Generate flashcards to see them here.</div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {studySets.map((set) => (
                                    <Link key={set.id} href={`/dashboard/flashcards/${set.id}`}>
                                        <StudySetCard
                                            title={set.topic || "Untitled Set"}
                                            cards={set.flashcards.length}
                                            createdAt={set.createdAt}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

function formatRelative(dateString: string) {
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
}

function StatCard({
    title,
    value,
    icon,
    change,
}: {
    title: string
    value: string
    icon: React.ReactNode
    change: string
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground">{change}</p>
            </CardContent>
        </Card>
    )
}

function ActivityItem({
    title,
    description,
    time,
    color,
}: {
    title: string
    description: string
    time: string
    color: string
}) {
    return (
        <div className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50">
            <div className={cn("size-2 flex-shrink-0 rounded-full", color)} />
            <div className="flex-1 space-y-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{title}</p>
                <p className="text-xs text-muted-foreground truncate">{description}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
            <ChevronRight className="size-4 text-muted-foreground opacity-50" />
        </div>
    )
}

function StudySetCard({
    title,
    cards,
    createdAt,
}: {
    title: string
    cards: number
    createdAt: string
}) {
    return (
        <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm">
            <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-6" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground line-clamp-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{cards} cards</p>
                <p className="text-xs text-muted-foreground">Saved {formatRelative(createdAt)}</p>
            </CardContent>
        </Card>
    )
}









