"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BookOpen,
    Brain,
    ChevronDown,
    ChevronUp,
    CreditCard,
    FileText,
    HelpCircle,
    Mail,
    MessageCircle,
    PenTool,
    Search,
    Shield,
    Zap,
} from "lucide-react"
import { useState } from "react"

interface FAQItem {
    question: string
    answer: string
    category: "general" | "features" | "account" | "technical"
}

const faqs: FAQItem[] = [
    {
        category: "general",
        question: "What is Briefly?",
        answer:
            "Briefly is an AI-powered study platform designed to help students learn more effectively. We offer tools like flashcards, text summarization, study guides, and quiz generation to enhance your learning experience.",
    },
    {
        category: "general",
        question: "Is Briefly free to use?",
        answer:
            "Yes! Briefly is completely free to use. All our AI-powered study tools are available at no cost to help you succeed in your studies.",
    },
    {
        category: "features",
        question: "How do I create flashcards?",
        answer:
            "Navigate to the Flashcards section from your dashboard, paste or type the content you want to study, optionally add a topic, and click generate. Our AI will create interactive flashcards for you instantly.",
    },
    {
        category: "features",
        question: "Can I customize the length of summaries?",
        answer:
            "Yes! When using the Summarizer tool, you can choose between short, medium, or long summaries to match your needs. Short summaries capture key points, while longer ones include more detail.",
    },
    {
        category: "features",
        question: "How does the Quiz Generator work?",
        answer:
            "Simply paste your study material into the Quiz Generator, specify the number of questions and difficulty level (easy, medium, or hard), and our AI will create a practice quiz to test your knowledge.",
    },
    {
        category: "features",
        question: "What can I use Study Guides for?",
        answer:
            "Study Guides are perfect for organizing course materials, textbooks, or lecture notes. The generator creates comprehensive guides with organized sections and key concepts to help you prepare for exams.",
    },
    {
        category: "account",
        question: "How do I sign up?",
        answer:
            "You can sign up using your email and password, or quickly sign in with Google or Facebook. Click the 'Sign Up' button on the homepage to get started.",
    },
    {
        category: "account",
        question: "Can I change my profile information?",
        answer:
            "If you signed in with Google or Facebook, you can update your name and avatar from the Profile page. Email/password accounts have limited profile editing options.",
    },
    {
        category: "account",
        question: "I forgot my password. How do I reset it?",
        answer:
            "Password reset functionality is coming soon! For now, if you signed up with Google or Facebook, you can continue using those methods to sign in.",
    },
    {
        category: "technical",
        question: "Why is my content not generating?",
        answer:
            "Make sure you've entered text content and that it's not too long (we recommend keeping it under 10,000 words). If issues persist, try refreshing the page or clearing your browser cache.",
    },
    {
        category: "technical",
        question: "Is my data secure and private?",
        answer:
            "Absolutely! We prioritize your privacy. Your study materials and personal information are never shared with third parties. All data is encrypted and stored securely.",
    },
    {
        category: "technical",
        question: "What browsers are supported?",
        answer:
            "Briefly works best on modern browsers like Chrome, Firefox, Safari, and Edge. Make sure you're using the latest version for the best experience.",
    },
    {
        category: "technical",
        question: "Can I use Briefly offline?",
        answer:
            "Briefly requires an internet connection to generate AI-powered content. However, once generated, you can view and study your flashcards, summaries, and guides offline.",
    },
]

const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "general", label: "General", icon: MessageCircle },
    { id: "features", label: "Features", icon: Zap },
    { id: "account", label: "Account", icon: Shield },
    { id: "technical", label: "Technical", icon: Search },
]

const tools = [
    {
        icon: CreditCard,
        title: "Flashcards",
        description: "Create interactive flashcards from any text",
        href: "/dashboard/flashcards",
    },
    {
        icon: FileText,
        title: "Summarizer",
        description: "Condense long texts into concise summaries",
        href: "/dashboard/summarizer",
    },
    {
        icon: BookOpen,
        title: "Study Guides",
        description: "Generate comprehensive study guides",
        href: "/dashboard/study-guide",
    },
    {
        icon: PenTool,
        title: "Quiz Generator",
        description: "Create practice quizzes to test knowledge",
        href: "/dashboard/quiz",
    },
]

export default function HelpPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [openFAQ, setOpenFAQ] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredFAQs = faqs.filter((faq) => {
        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
        const matchesSearch =
            searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index)
    }

    return (
        <DashboardLayout title="Help & Support">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-4 pb-6">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-4">
                        <HelpCircle className="size-8" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground">How can we help you?</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
                        Find answers to common questions or get in touch with our support team
                    </p>
                </div>

                {/* Search Bar */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links - Tools */}
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4 px-2">Quick Links</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tools.map((tool, index) => (
                            <a
                                key={index}
                                href={tool.href}
                                className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform">
                                        <tool.icon className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                            {tool.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                        const Icon = category.icon
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedCategory === category.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border border-border text-foreground hover:bg-accent/10"
                                }`}
                            >
                                <Icon className="size-4" />
                                {category.label}
                            </button>
                        )
                    })}
                </div>

                {/* FAQs Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground px-2">
                        Frequently Asked Questions
                        {filteredFAQs.length > 0 && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                ({filteredFAQs.length} {filteredFAQs.length === 1 ? "question" : "questions"})
                            </span>
                        )}
                    </h2>

                    {filteredFAQs.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Search className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground">No questions found matching your search.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedCategory("all")
                                    }}
                                    className="mt-4 text-primary hover:underline"
                                >
                                    Clear filters
                                </button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredFAQs.map((faq, index) => (
                                <Card key={index} className="overflow-hidden">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full text-left"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <CardTitle className="text-base sm:text-lg pr-8">
                                                    {faq.question}
                                                </CardTitle>
                                                <div className="shrink-0 mt-1">
                                                    {openFAQ === index ? (
                                                        <ChevronUp className="size-5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="size-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </button>
                                    {openFAQ === index && (
                                        <CardContent className="pt-0 pb-4 sm:pb-6">
                                            <CardDescription className="text-sm sm:text-base leading-relaxed text-foreground/80">
                                                {faq.answer}
                                            </CardDescription>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Section */}
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="size-5 text-primary" />
                            Still need help?
                        </CardTitle>
                        <CardDescription>
                            Can't find what you're looking for? Get in touch with our support team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                    <Mail className="size-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Email Support</p>
                                    <a
                                        href="mailto:support@briefly.app"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        support@briefly.app
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                    <MessageCircle className="size-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Response Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        We typically respond within 24-48 hours
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tips Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="size-5 text-primary" />
                            Tips for Best Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm sm:text-base">
                            <li className="flex items-start gap-3">
                                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold">1</span>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Be specific:</strong> Include context and
                                    relevant details in your input for better AI-generated content.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold">2</span>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Review and edit:</strong> AI-generated content
                                    is a starting point - review and customize it to fit your needs.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold">3</span>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Combine tools:</strong> Use flashcards for
                                    memorization, summaries for quick review, and quizzes to test your knowledge.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold">4</span>
                                </div>
                                <span className="text-muted-foreground">
                                    <strong className="text-foreground">Regular practice:</strong> Consistent use of
                                    study tools improves retention and understanding.
                                </span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}




