import { Footer } from "@/components/landingpage/footer"
import { Header } from "@/components/landingpage/header"
import { Brain, Heart, Shield, Target, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary/10 mb-6">
                            <Brain className="size-10 text-primary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                            About <span className="text-primary">Briefly</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Empowering students worldwide with AI-powered study tools that make learning faster, easier, and more effective.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Mission</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                We believe that every student deserves access to powerful learning tools, regardless of their financial situation. That's why Briefly is and always will be completely free.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <Target className="size-8 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Accessible Learning</h3>
                                <p className="text-muted-foreground">
                                    Breaking down barriers to quality education by providing free, powerful AI tools to students everywhere.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <Zap className="size-8 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Efficiency First</h3>
                                <p className="text-muted-foreground">
                                    Helping students learn more effectively by automating time-consuming tasks like creating flashcards and summaries.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <Heart className="size-8 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Student-Focused</h3>
                                <p className="text-muted-foreground">
                                    Built by students, for students. Every feature is designed with your learning journey in mind.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What We Offer Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What We Offer</h2>
                            <p className="text-lg text-muted-foreground">
                                A comprehensive suite of AI-powered study tools designed to enhance your learning experience.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Brain className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">AI Flashcards</h3>
                                        <p className="text-muted-foreground">
                                            Transform any text into interactive flashcards instantly. Perfect for memorization and quick review sessions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Zap className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">Smart Summarizer</h3>
                                        <p className="text-muted-foreground">
                                            Condense lengthy articles, papers, and textbooks into clear, concise summaries that capture all key points.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Users className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">Study Guide Generator</h3>
                                        <p className="text-muted-foreground">
                                            Create comprehensive study guides from your course materials with organized sections and key concepts.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Target className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">Quiz Creator</h3>
                                        <p className="text-muted-foreground">
                                            Generate practice quizzes to test your knowledge and identify areas that need more attention.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Values</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <Shield className="size-8 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Privacy First</h3>
                                <p className="text-muted-foreground">
                                    Your data stays private. We never share your study materials or personal information with third parties. Your learning journey is yours alone.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl border border-border bg-card">
                                <Heart className="size-8 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Free Forever</h3>
                                <p className="text-muted-foreground">
                                    Education should be accessible to everyone. Briefly will always be free, with no hidden costs, premium tiers, or paywalls.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl border border-border bg-card">
                                <Zap className="size-8 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Innovation</h3>
                                <p className="text-muted-foreground">
                                    We continuously improve our tools using the latest AI technology to provide you with the best possible learning experience.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl border border-border bg-card">
                                <Users className="size-8 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Community</h3>
                                <p className="text-muted-foreground">
                                    Built for students, by students. We listen to your feedback and continuously evolve based on your needs.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center p-8 sm:p-12 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                Ready to Transform Your Learning?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Join thousands of students who are already using Briefly to study smarter, not harder.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/sign-up">
                                    <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                                        Get Started Free
                                    </button>
                                </Link>
                                <Link href="/sign-in">
                                    <button className="px-6 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-accent/10 transition-colors">
                                        Sign In
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}




