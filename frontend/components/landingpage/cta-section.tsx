"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollAnimatedSection } from "./scroll-animated-section"

export function CTASection() {
    const router = useRouter()

    const handleGetStarted = () => {
        router.push("/sign-up")
    }

    return (
        <section className="flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-12 text-center shadow-2xl sm:p-16">
                    {/* Background decoration */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

                    <div className="relative">
                        <ScrollAnimatedSection direction="fade">
                            <h2 className="mb-6 text-balance text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                                Ready to Transform Your Learning?
                            </h2>

                            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
                                Join thousands of students who are studying smarter with Briefly. Start using our AI-powered tools
                                today—completely free, no credit card required.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    onClick={handleGetStarted}
                                    className="group h-14 bg-primary px-10 text-lg font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </ScrollAnimatedSection>

                        <ScrollAnimatedSection direction="fade" delay={300} className="mt-8">
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>Always Free</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>No Credit Card</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>Unlimited Use</span>
                                </div>
                            </div>
                        </ScrollAnimatedSection>
                    </div>
                </div>
            </div>
        </section>
    )
}
