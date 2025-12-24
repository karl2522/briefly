"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Sparkles, Zap, Users, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollAnimatedSection } from "./scroll-animated-section"

export function CTASection() {
    const router = useRouter()

    const handleGetStarted = () => {
        router.push("/sign-up")
    }

    const benefits = [
        { icon: CheckCircle2, text: "Always Free", color: "text-green-500" },
        { icon: CheckCircle2, text: "No Credit Card", color: "text-green-500" },
        { icon: CheckCircle2, text: "Unlimited Use", color: "text-green-500" },
    ]

    const stats = [
        { icon: Users, value: "10K+", label: "Active Students" },
        { icon: Zap, value: "1M+", label: "Study Materials Created" },
        { icon: TrendingUp, value: "95%", label: "Success Rate" },
    ]

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 px-4 py-20 sm:px-6 lg:px-8">
            {/* Background texture and decorations */}
            <div className="absolute inset-0 -z-10">
                {/* Animated blur circles */}
                <div className="absolute -right-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-96 w-96 animate-pulse rounded-full bg-accent/10 blur-3xl animation-delay-1000" />
                <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/5 blur-3xl animation-delay-2000" />
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
            </div>

            <div className="container mx-auto max-w-6xl">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                    {/* Left Column - Main CTA */}
                    <ScrollAnimatedSection direction="right" className="space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                            <Sparkles className="h-4 w-4" />
                            <span>Join Thousands of Students</span>
                        </div>

                        <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                            Ready to Transform Your Learning?
                        </h2>

                        <p className="text-pretty text-lg text-muted-foreground md:text-xl">
                            Join thousands of students who are studying smarter with Briefly. Start using our AI-powered tools
                            today—completely free, no credit card required.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button
                                size="lg"
                                onClick={handleGetStarted}
                                className="group h-14 bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 cursor-pointer"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
                                    <span className="text-sm font-medium text-muted-foreground">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollAnimatedSection>

                    {/* Right Column - Stats & Features */}
                    <ScrollAnimatedSection direction="left" delay={200} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-6">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg"
                                >
                                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-6 backdrop-blur-sm">
                            <div className="mb-2 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold text-foreground">Why Choose Briefly?</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Experience the power of AI-driven learning tools designed specifically for students. 
                                Boost your productivity, improve retention, and ace your exams with our comprehensive suite of study aids.
                            </p>
                        </div>
                    </ScrollAnimatedSection>
                </div>
            </div>
        </section>
    )
}
