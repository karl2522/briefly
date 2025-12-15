"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    BookOpen,
    Brain,
    Clock,
    Coffee,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Menu,
    Settings,
    Sparkles,
    Target,
    TrendingUp,
    User,
    X,
} from "lucide-react"
import { useState } from "react"

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    "w-64",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                            <Sparkles className="size-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold text-sidebar-foreground">Briefly</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        <NavItem icon={<LayoutDashboard className="size-5" />} label="Dashboard" active />
                        <NavItem icon={<Brain className="size-5" />} label="Flashcards" />
                        <NavItem icon={<FileText className="size-5" />} label="Summarizer" />
                        <NavItem icon={<BookOpen className="size-5" />} label="Study Guides" />
                        <NavItem icon={<Target className="size-5" />} label="Quiz Generator" />

                        <div className="pt-4">
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                                Settings
                            </p>
                            <NavItem icon={<User className="size-5" />} label="Profile" />
                            <NavItem icon={<Settings className="size-5" />} label="Preferences" />
                            <NavItem icon={<HelpCircle className="size-5" />} label="Help & Support" />
                        </div>
                    </nav>

                    <div className="space-y-3 p-4">
                        <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/60 p-4 text-sidebar-accent-foreground shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
                                    <Coffee className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Fuel Briefly</p>
                                    <p className="text-xs text-sidebar-foreground/70">Buy us a coffee</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Donate
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-sidebar-border/80 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                                JR
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-sidebar-foreground">Jason Ranti</p>
                                <p className="text-xs text-sidebar-foreground/70">Student</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "ml-64" : "ml-0")}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground">
                        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>

                    <div className="flex-1">
                        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                    </div>

                    <Button variant="default" size="sm" className="gap-2">
                        <Sparkles className="size-4" />
                        <span className="hidden sm:inline">New Study Session</span>
                    </Button>
                </header>

                {/* Dashboard Content */}
                <main className="p-4 md:p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Student!</h2>
                        <p className="text-muted-foreground">{"Here's what you've been working on"}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Study Streak"
                            value="12 days"
                            icon={<TrendingUp className="size-4 text-primary" />}
                            change="+3 from last week"
                        />
                        <StatCard
                            title="Total Flashcards"
                            value="248"
                            icon={<Brain className="size-4 text-primary" />}
                            change="+28 this week"
                        />
                        <StatCard
                            title="Study Time"
                            value="18.5 hrs"
                            icon={<Clock className="size-4 text-primary" />}
                            change="This week"
                        />
                        <StatCard
                            title="Quiz Score"
                            value="87%"
                            icon={<Target className="size-4 text-primary" />}
                            change="Average"
                        />
                    </div>

                    {/* Content Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Recent Activity */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your latest study sessions and progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <ActivityItem
                                        title="Biology Chapter 5 Flashcards"
                                        description="Completed 24 cards"
                                        time="2 hours ago"
                                        color="bg-primary"
                                    />
                                    <ActivityItem
                                        title="History Essay Summary"
                                        description="Generated study guide"
                                        time="5 hours ago"
                                        color="bg-chart-2"
                                    />
                                    <ActivityItem
                                        title="Math Practice Quiz"
                                        description="Score: 92%"
                                        time="Yesterday"
                                        color="bg-chart-3"
                                    />
                                    <ActivityItem
                                        title="Chemistry Notes"
                                        description="Created 18 flashcards"
                                        time="2 days ago"
                                        color="bg-chart-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Start studying in seconds</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <QuickActionButton icon={<Brain />} label="Create Flashcards" />
                                <QuickActionButton icon={<FileText />} label="Summarize Text" />
                                <QuickActionButton icon={<BookOpen />} label="Generate Study Guide" />
                                <QuickActionButton icon={<Target />} label="Take a Quiz" />
                            </CardContent>
                        </Card>

                        {/* Study Sets */}
                            <Card className="md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Your Study Sets</CardTitle>
                                <CardDescription>Continue where you left off</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <StudySetCard title="Biology Midterm" cards={48} progress={75} color="bg-primary" />
                                    <StudySetCard title="World History" cards={64} progress={45} color="bg-chart-2" />
                                    <StudySetCard title="Calculus II" cards={32} progress={90} color="bg-chart-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <button
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
        >
            {icon}
            <span>{label}</span>
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

function QuickActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <Button variant="outline" className="w-full justify-start gap-3 text-foreground bg-transparent" size="lg">
            {icon}
            <span>{label}</span>
        </Button>
    )
}

function StudySetCard({
                          title,
                          cards,
                          progress,
                          color,
                      }: {
    title: string
    cards: number
    progress: number
    color: string
}) {
    return (
        <Card className="cursor-pointer transition-colors hover:border-primary/50">
            <CardContent className="flex flex-col gap-3 p-6">
                <div className={cn("mb-2 flex size-12 items-center justify-center rounded-xl shadow-sm", color)}>
                    <BookOpen className="size-6 text-white" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{cards} cards</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className={cn("h-full rounded-full", color)} style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

