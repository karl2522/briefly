"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudyStreak } from "@/lib/streak"
import { cn } from "@/lib/utils"
import { BookOpen, Brain, Clock, FileText, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

type Flashcard = { question: string; answer: string }
type FlashcardSet = { id: string; topic: string; flashcards: Flashcard[]; createdAt: string }
type QuizQuestion = { question: string; options: string[]; correctAnswer: number }
type QuizSet = { id: string; topic: string; quiz: QuizQuestion[]; numberOfQuestions: number; difficulty: string; createdAt: string }

const FLASHCARD_KEY = "briefly_flashcard_sets"
const QUIZ_KEY = "briefly_quiz_sets"

export default function Dashboard() {
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
    const [quizSets, setQuizSets] = useState<QuizSet[]>([])
    const [streak, setStreak] = useState(0)
    useEffect(() => {
        const loadData = () => {
            try {
                const fcRaw = localStorage.getItem(FLASHCARD_KEY)
                if (fcRaw) {
                    const parsed = JSON.parse(fcRaw)
                    if (Array.isArray(parsed)) {
                        setFlashcardSets(parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                    }
                }
                const qRaw = localStorage.getItem(QUIZ_KEY)
                if (qRaw) {
                    const parsed = JSON.parse(qRaw)
                    if (Array.isArray(parsed)) {
                        setQuizSets(parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err)
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
        const activities: { title: string; description: string; createdAt: string; color: string }[] = []
        flashcardSets.slice(0, 3).forEach((set, idx) => {
            activities.push({
                title: set.topic || "Flashcard Set",
                description: `${set.flashcards.length} cards`,
                createdAt: set.createdAt,
                color: ["bg-primary", "bg-chart-2", "bg-chart-3"][idx % 3],
            })
        })
        quizSets.slice(0, 3).forEach((quiz, idx) => {
            activities.push({
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
                title: item.title,
                description: item.description,
                time: formatRelative(item.createdAt),
                color: item.color,
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
                                    <ActivityItem
                                        key={idx}
                                        title={item.title}
                                        description={item.description}
                                        time={item.time}
                                        color={item.color}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Start studying in seconds</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <QuickActionButton icon={<Brain />} label="Create Flashcards" href="/dashboard/flashcards" />
                        <QuickActionButton icon={<FileText />} label="Summarize Text" href="/dashboard/summarizer" />
                        <QuickActionButton icon={<BookOpen />} label="Generate Study Guide" href="/dashboard/study-guide" />
                        <QuickActionButton icon={<Target />} label="Take a Quiz" href="/dashboard/quiz" />
                    </CardContent>
                </Card>

                {/* Study Sets - flashcards */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Your Study Sets</CardTitle>
                        <CardDescription>Flashcard sets you've saved</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {studySets.length === 0 ? (
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

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href?: string; active?: boolean }) {
    const content = (
        <>
            {icon}
            <span>{label}</span>
        </>
    )

    const className = cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
        active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    )

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        )
    }

    return (
        <button className={className}>
            {content}
        </button>
    )
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
        <div className="flex items-start gap-4">
            <div className={cn("mt-1 size-2 rounded-full", color)} />
            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <span className="text-xs text-muted-foreground">{time}</span>
        </div>
    )
}

function QuickActionButton({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
    const content = (
        <div className="flex w-full items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
            <span className="font-medium text-foreground">{label}</span>
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="block">
                <Button variant="outline" className="w-full justify-start gap-3 text-foreground bg-transparent hover:bg-muted/70 transition-colors" size="lg">
                    {content}
                </Button>
            </Link>
        )
    }

    return (
        <Button variant="outline" className="w-full justify-start gap-3 text-foreground bg-transparent hover:bg-muted/70 transition-colors" size="lg">
            {content}
        </Button>
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




