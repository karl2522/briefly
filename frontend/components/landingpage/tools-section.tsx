"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, CreditCard, FileText, PenTool } from "lucide-react"
import { ScrollAnimatedSection } from "./scroll-animated-section"

const tools = [
    {
        icon: CreditCard,
        title: "AI Flashcards",
        description: "Transform any text into interactive flashcards instantly. Perfect for memorization and quick review.",
        gradient: "from-purple-500/10 to-indigo-500/10",
        iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
        icon: FileText,
        title: "Smart Summarizer",
        description:
            "Condense lengthy articles, papers, and textbooks into clear, concise summaries that capture key points.",
        gradient: "from-blue-500/10 to-cyan-500/10",
        iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
        icon: BookOpen,
        title: "Study Guide Generator",
        description:
            "Create comprehensive study guides from your course materials with organized sections and key concepts.",
        gradient: "from-indigo-500/10 to-purple-500/10",
        iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
        icon: PenTool,
        title: "Quiz Creator",
        description: "Generate practice quizzes to test your knowledge and identify areas that need more attention.",
        gradient: "from-violet-500/10 to-purple-500/10",
        iconColor: "text-violet-600 dark:text-violet-400",
    },
]

export function ToolsSection() {
    return (
        <section id="tools" className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                <ScrollAnimatedSection direction="up" className="mb-6 text-center sm:mb-8 lg:mb-10">
                    <h2 className="mb-2 text-balance text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
                        Powerful Learning Tools
                    </h2>
                    <p className="mx-auto max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
                        Choose from our suite of AI-powered tools designed to make studying more efficient and effective.
                    </p>
                </ScrollAnimatedSection>

                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5">
                    {tools.map((tool, index) => (
                        <ScrollAnimatedSection key={index} direction="up" delay={index * 150}>
                            <div className={`group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${tool.gradient} p-4 transition-all hover:border-primary/50 hover:shadow-lg sm:p-5`}>
                                <div
                                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm ${tool.iconColor} transition-transform group-hover:scale-110`}
                                >
                                    <tool.icon className="h-5 w-5" />
                                </div>

                                <h3 className="mb-2 text-lg font-bold text-foreground sm:text-xl">{tool.title}</h3>

                                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>

                                <Button variant="ghost" className="group/btn p-0 text-sm hover:bg-transparent">
                                    <span className="text-primary">Try it now</span>
                                    <span className="ml-1 transition-transform group-hover/btn:translate-x-1">→</span>
                                </Button>
                            </div>
                        </ScrollAnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    )
}
