"use client"

import { Button } from "@/components/ui/button"
import { TypingText } from "@/components/ui/text-animations/typing-text"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    const headerOffset = 80 // account for fixed header height
    const elementPosition = el.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - headerOffset

    window.scrollTo({ top: offsetPosition, behavior: "smooth" })
}

export function HeroSection() {
    const router = useRouter()

    const handleGetStarted = () => {
        router.push("/sign-up")
    }

    const handleViewDemo = () => {
        scrollToSection("how-it-works")
    }

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16 sm:px-6 lg:px-8">
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-accent/15 blur-3xl animation-delay-1000" />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/5 blur-3xl animation-delay-2000" />
            </div>

            <div className="container mx-auto max-w-6xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>100% Free AI Tools for Students</span>
                </div>

                <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                    <span className="relative inline-block">
                        <TypingText
                            text="Study Smarter with AI-Powered Tools"
                            speed={60}
                            delay={1000}
                            showCursor={true}
                            highlightText="AI-Powered"
                            highlightClassName="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
                        />
                    </span>
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg md:text-xl">
                    Transform how you learn with AI. Create flashcards, summarize content, and ace your exams with intelligent
                    study tools built for students.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                        size="lg"
                        onClick={handleGetStarted}
                        className="group h-12 bg-primary px-8 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 cursor-pointer"
                    >
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleViewDemo}
                        className="h-12 border-2 border-primary/20 bg-transparent px-8 text-base font-semibold backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                    >
                        View Demo
                    </Button>
                </div>

                <div className="mt-14 inline-flex items-center gap-2.5 rounded-full border border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-5 py-2.5 backdrop-blur-sm">
                    <span className="text-xs font-medium text-muted-foreground">Developed by</span>
                    <span className="text-sm font-bold text-primary">Jared Omen</span>
                </div>
            </div>
        </section>
    )
}
