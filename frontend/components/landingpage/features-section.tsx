"use client"

import { Brain, Shield, Users, Zap } from "lucide-react"
import { ScrollAnimatedSection } from "./scroll-animated-section"

const features = [
    {
        icon: Brain,
        title: "AI-Powered Intelligence",
        description:
            "Advanced AI models understand context and generate accurate, relevant study materials tailored to your needs.",
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Generate flashcards and summaries in seconds. Spend less time preparing and more time learning.",
    },
    {
        icon: Shield,
        title: "Privacy First",
        description:
            "Your data stays private. We never share your study materials or personal information with third parties.",
    },
    {
        icon: Users,
        title: "Built for Students",
        description: "Designed by students, for students. Every feature is crafted to enhance your learning experience.",
    },
]

export function FeaturesSection() {
    return (
        <section id="features" className="flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                <ScrollAnimatedSection direction="up" className="mb-16 text-center">
                    <h2 className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        Everything You Need to <span className="text-primary">Excel</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
                        Powerful features designed to accelerate your learning journey and help you achieve academic success.
                    </p>
                </ScrollAnimatedSection>

                <div className="grid auto-rows-fr gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <ScrollAnimatedSection key={index} direction="up" delay={index * 100} className="h-full">
                            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-card-foreground">{feature.title}</h3>
                                <p className="flex-1 text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        </ScrollAnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    )
}
