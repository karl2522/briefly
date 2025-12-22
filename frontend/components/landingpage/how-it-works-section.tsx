"use client"

import { Download, Sparkles, Upload } from "lucide-react"
import { ScrollAnimatedSection } from "./scroll-animated-section"

const steps = [
    {
        number: "01",
        icon: Upload,
        title: "Upload Your Content",
        description: "Paste your text, upload a document, or enter a topic you want to study.",
    },
    {
        number: "02",
        icon: Sparkles,
        title: "AI Does the Work",
        description: "Our advanced AI processes your content and generates personalized study materials.",
    },
    {
        number: "03",
        icon: Download,
        title: "Start Learning",
        description: "Get instant access to flashcards, summaries, and study guides ready to use.",
    },
]

export function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-20 sm:px-6 lg:px-8"
        >
            <div className="container mx-auto max-w-6xl">
                <ScrollAnimatedSection direction="up" className="mb-16 text-center">
                    <h2 className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        Simple, Fast, Effective
                    </h2>
                    <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
                        Get started in three easy steps and transform the way you study.
                    </p>
                </ScrollAnimatedSection>

                <div className="grid gap-8 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <ScrollAnimatedSection key={index} direction="up" delay={index * 200}>
                            <div className="relative">
                                {/* Connector line - hidden on mobile, shown on md+ */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-primary/20 md:block" />
                                )}

                                <div className="relative text-center">
                                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                                        <step.icon className="h-10 w-10" />
                                    </div>

                                    <div className="mb-2 text-5xl font-bold text-primary/20">{step.number}</div>

                                    <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>

                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        </ScrollAnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    )
}
