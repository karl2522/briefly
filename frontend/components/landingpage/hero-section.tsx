    "use client"

    import { Button } from "@/components/ui/button"
    import { TypingText } from "@/components/ui/text-animations/typing-text"
    import { ArrowRight, BookOpen, CheckCircle2, Clock, FileText, Shield, Sparkles, TrendingUp, Users, Zap } from "lucide-react"
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

        const quickStats = [
            { icon: Users, value: "10K+", label: "Students" },
            { icon: FileText, value: "1M+", label: "Materials" },
            { icon: Clock, value: "5min", label: "Setup Time" },
        ]

    const keyFeatures = [
        { icon: Zap, text: "Lightning Fast" },
        { icon: Shield, text: "100% Private" },
        { icon: CheckCircle2, text: "Always Free" },
    ]

    const featureCards = [
        {
            icon: BookOpen,
            title: "AI Flashcards",
            description: "Transform text into flashcards instantly",
            gradient: "from-purple-500/20 to-indigo-500/20",
            iconColor: "text-purple-600 dark:text-purple-400",
        },
        {
            icon: FileText,
            title: "Smart Summarizer",
            description: "Condense lengthy content quickly",
            gradient: "from-blue-500/20 to-cyan-500/20",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            icon: TrendingUp,
            title: "Study Guides",
            description: "Comprehensive guides from materials",
            gradient: "from-indigo-500/20 to-purple-500/20",
            iconColor: "text-indigo-600 dark:text-indigo-400",
        },
    ]

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16 md:px-6 lg:px-8">
            {/* Enhanced Background with texture */}
            <div className="absolute inset-0 -z-10">
                {/* Animated blur circles */}
                <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-accent/15 blur-3xl animation-delay-1000" />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/5 blur-3xl animation-delay-2000" />
                <div className="absolute right-1/4 top-1/2 h-[250px] w-[250px] animate-pulse rounded-full bg-accent/8 blur-3xl animation-delay-3000" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
            </div>

            <div className="container mx-auto max-w-7xl">
                <div className="grid gap-5 md:grid-cols-12 md:items-center md:gap-5 lg:gap-6 2xl:gap-8">
                    {/* Main Content - Left Side */}
                    <div className="md:col-span-7 text-center md:text-left">
                        <div className="mb-3 md:mb-4 2xl:mb-5 inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 md:px-3 md:py-1.5 2xl:px-4 2xl:py-2 text-xs md:text-xs 2xl:text-sm font-medium text-primary backdrop-blur-sm animate-fade-in-up load-delay-100">
                            <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 2xl:h-4 2xl:w-4 animate-pulse" />
                            <span>100% Free AI Tools for Students</span>
                        </div>

                        <h1 className="mb-3 md:mb-4 2xl:mb-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl max-w-xl md:max-w-2xl animate-fade-in-up load-delay-200">
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

                        <p className="mx-auto mb-5 md:mb-6 2xl:mb-7 max-w-xl md:max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base md:text-sm lg:text-base xl:text-lg 2xl:text-xl md:mx-0 animate-fade-in-up load-delay-300">
                            Transform how you learn with AI. Create flashcards, summarize content, and ace your exams with intelligent
                            study tools built for students.
                        </p>

                        {/* Key Features Pills */}
                        <div className="mb-5 md:mb-6 2xl:mb-7 flex flex-wrap items-center justify-center gap-1.5 md:gap-2 2xl:gap-2.5 md:justify-start">
                            {keyFeatures.map((feature, index) => {
                                const delayClasses = ["load-delay-400", "load-delay-500", "load-delay-600"]
                                return (
                                    <div
                                        key={index}
                                        className={`group flex items-center gap-1 md:gap-1.5 2xl:gap-2 rounded-full border border-border/50 bg-card/50 px-2.5 py-1 md:px-3 md:py-1.5 2xl:px-4 2xl:py-2 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 animate-fade-in-up ${delayClasses[index]}`}
                                    >
                                        <feature.icon className="h-3 w-3 md:h-3.5 md:w-3.5 2xl:h-4 2xl:w-4 text-primary" />
                                        <span className="text-xs md:text-xs 2xl:text-sm font-medium text-foreground">{feature.text}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* CTA Buttons */}
                        <div className="mb-6 md:mb-7 2xl:mb-9 flex flex-col items-center justify-center gap-2.5 md:gap-3 2xl:gap-3.5 sm:flex-row md:justify-start animate-fade-in-up load-delay-600">
                            <Button
                                size="lg"
                                onClick={handleGetStarted}
                                className="group h-10 md:h-9 lg:h-10 2xl:h-12 bg-primary px-5 md:px-6 lg:px-7 2xl:px-8 text-xs md:text-sm lg:text-sm 2xl:text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all lg:hover:scale-105 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 cursor-pointer"
                            >
                                Get Started Free
                                <ArrowRight className="ml-1.5 md:ml-2 h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={handleViewDemo}
                                className="h-10 md:h-9 lg:h-10 2xl:h-12 border-2 border-primary/20 bg-transparent px-5 md:px-6 lg:px-7 2xl:px-8 text-xs md:text-sm lg:text-sm 2xl:text-base font-semibold backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                            >
                                View Demo
                            </Button>
                        </div>

                        {/* Quick Stats - Stack on small screens */}
                        <div className="mb-5 md:mb-6 2xl:mb-7 flex flex-col sm:grid sm:grid-cols-3 gap-2.5 md:gap-2.5 lg:gap-3 2xl:gap-4">
                            {quickStats.map((stat, index) => {
                                const delayClasses = ["load-delay-700", "load-delay-800", "load-delay-800"]
                                return (
                                    <div
                                        key={index}
                                        className={`group rounded-xl border border-border/50 bg-card/30 p-2.5 md:p-2.5 lg:p-3 2xl:p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50 hover:shadow-lg animate-fade-in-up ${delayClasses[index]}`}
                                    >
                                        <div className="mb-1 md:mb-1.5 2xl:mb-2 flex items-center justify-center md:justify-start">
                                            <stat.icon className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-primary" />
                                        </div>
                                        <div className="text-base md:text-lg lg:text-xl 2xl:text-2xl font-bold text-foreground">{stat.value}</div>
                                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Developer Badge */}
                        <div className="inline-flex items-center gap-1.5 md:gap-2 2xl:gap-2.5 rounded-full border border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-3 py-1.5 md:px-4 md:py-2 2xl:px-5 2xl:py-2.5 backdrop-blur-sm animate-fade-in-up load-delay-800">
                            <span className="text-xs font-medium text-muted-foreground">Developed by</span>
                            <span className="text-xs md:text-xs 2xl:text-sm font-bold text-primary">Jared Omen</span>
                        </div>
                    </div>

                    {/* Right Side - Visual Elements */}
                    <div className="md:col-span-5">
                        {/* Stacked Cards - Visible on small/medium screens */}
                        <div className="lg:hidden space-y-3 md:space-y-3.5 2xl:space-y-4">
                            {featureCards.map((card, index) => {
                                const delayClasses = ["load-delay-400", "load-delay-500", "load-delay-600"]
                                return (
                                    <div
                                        key={index}
                                        className={`group rounded-xl border border-border/50 bg-card p-3 md:p-3.5 2xl:p-4 shadow-xl transition-all hover:border-primary/50 hover:bg-card hover:shadow-2xl animate-fade-in-up ${delayClasses[index]}`}
                                    >
                                        <div className={`mb-2 md:mb-2.5 2xl:mb-3 inline-flex h-9 w-9 md:h-9 md:w-9 2xl:h-10 2xl:w-10 items-center justify-center rounded-lg md:rounded-xl bg-gradient-to-br ${card.gradient} transition-transform group-hover:scale-110`}>
                                            <card.icon className={`h-4 w-4 md:h-4.5 md:w-4.5 2xl:h-5 2xl:w-5 ${card.iconColor}`} />
                                        </div>
                                        <h3 className="mb-1.5 md:mb-2 text-sm md:text-base font-semibold text-foreground">{card.title}</h3>
                                        <p className="text-xs md:text-xs 2xl:text-sm text-muted-foreground">{card.description}</p>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Floating Cards - Visible on large screens */}
                        <div className="hidden lg:block relative min-h-[450px] xl:min-h-[500px] 2xl:min-h-[550px]">
                            {/* Card 1 - Top Left */}
                            <div className="absolute left-0 top-0 group animate-float-fade-in-left load-delay-400">
                                <div className="rounded-xl lg:rounded-2xl border border-border/50 bg-card p-4 lg:p-5 2xl:p-6 shadow-xl transition-all hover:border-primary/50 hover:bg-card hover:shadow-2xl">
                                    <div className="mb-2 lg:mb-2.5 2xl:mb-3 inline-flex h-9 w-9 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12 items-center justify-center rounded-lg lg:rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 transition-transform group-hover:scale-110">
                                        <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="mb-1.5 lg:mb-2 text-base lg:text-base 2xl:text-lg font-semibold text-foreground">AI Flashcards</h3>
                                    <p className="text-xs lg:text-xs 2xl:text-sm text-muted-foreground">Transform text into flashcards instantly</p>
                                </div>
                            </div>

                            {/* Card 2 - Top Right */}
                            <div className="absolute right-0 top-[3rem] group animate-float-fade-in-right load-delay-500">
                                <div className="rounded-xl lg:rounded-2xl border border-border/50 bg-card p-4 lg:p-5 2xl:p-6 shadow-xl transition-all hover:border-primary/50 hover:bg-card hover:shadow-2xl">
                                    <div className="mb-2 lg:mb-2.5 2xl:mb-3 inline-flex h-9 w-9 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12 items-center justify-center rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 transition-transform group-hover:scale-110">
                                        <FileText className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="mb-1.5 lg:mb-2 text-base lg:text-base 2xl:text-lg font-semibold text-foreground">Smart Summarizer</h3>
                                    <p className="text-xs lg:text-xs 2xl:text-sm text-muted-foreground">Condense lengthy content quickly</p>
                                </div>
                            </div>
                            

                            {/* Card 3 - Bottom Left */}
                            <div className="absolute bottom-[4rem] left-4 group animate-float-fade-in-left load-delay-600">
                                <div className="rounded-xl lg:rounded-2xl border border-border/50 bg-card p-4 lg:p-5 2xl:p-6 shadow-xl transition-all hover:border-primary/50 hover:bg-card hover:shadow-2xl">
                                    <div className="mb-2 lg:mb-2.5 2xl:mb-3 inline-flex h-9 w-9 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12 items-center justify-center rounded-lg lg:rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 transition-transform group-hover:scale-110">
                                        <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="mb-1.5 lg:mb-2 text-base lg:text-base 2xl:text-lg font-semibold text-foreground">Study Guides</h3>
                                    <p className="text-xs lg:text-xs 2xl:text-sm text-muted-foreground">Comprehensive guides from materials</p>
                                </div>
                            </div>

                            {/* Center Glow Effect */}
                            <div className="absolute left-1/2 top-1/2 h-48 w-48 lg:h-52 lg:w-52 xl:h-56 xl:w-56 2xl:h-64 2xl:w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl animate-fade-in load-delay-300" />
                        </div>
                    </div>
                </div>
            </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-6 lg:bottom-7 2xl:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="h-6 w-6 lg:h-7 lg:w-7 2xl:h-8 2xl:w-8 rounded-full border-2 border-primary/30 flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 lg:h-3.5 lg:w-3.5 2xl:h-4 2xl:w-4 rotate-90 text-primary/50" />
                    </div>
                </div>
            </section>
        )
    }
