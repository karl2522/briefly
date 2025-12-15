"use client"

import type React from "react"
import { useState } from "react"
import { Mail, MessageSquare, Send } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ContactSection() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Placeholder submission handler
        console.log("Contact form submitted:", formData)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <section
            id="contact"
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="container max-w-5xl">
                <div className="mb-8 text-center lg:mb-12">
                    <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl lg:mb-4 lg:text-5xl">Get in Touch</h2>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
                        Have questions or feedback? We&apos;d love to hear from you.
                    </p>
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-foreground">Email Us</h3>
                                <p className="text-sm text-muted-foreground">support@briefly.ai</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-foreground">Live Chat</h3>
                                <p className="text-sm text-muted-foreground">Available Monday to Friday, 9am-5pm EST</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                            <p className="mb-2 text-sm text-muted-foreground">Developed by</p>
                            <p className="text-lg font-semibold text-foreground">Jared Omen</p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-lg lg:p-8"
                    >
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="How can we help you?"
                            />
                        </div>

                        <Button type="submit" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                            Send Message
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    )
}
