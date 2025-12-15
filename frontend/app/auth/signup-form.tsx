"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OAuthButtons } from "@/app/auth/oauth-buttons"

export function SignUpForm() {
    const [form, setForm] = useState({ name: "", email: "", password: "" })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: wire up sign-up action
        console.log("Sign up", form)
    }

    return (
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-4 shadow-lg backdrop-blur sm:p-5 md:p-6 min-h-0 flex-shrink">
            <div className="mb-3 text-center sm:mb-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:mb-2 sm:text-xs">
                    Get started free
                </p>
                <h1 className="text-base font-bold text-foreground sm:text-lg md:text-xl lg:text-2xl">Create your account</h1>
                <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">Access Briefly&apos;s AI study toolkit.</p>
            </div>

            <OAuthButtons />

            <div className="my-3 flex items-center gap-3 sm:my-4 md:my-5">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-2.5 sm:space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="name" className="text-xs font-medium text-foreground sm:text-sm">
                        Full name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:px-3.5 sm:py-2.5"
                        placeholder="Alex Johnson"
                    />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="email" className="text-xs font-medium text-foreground sm:text-sm">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:px-3.5 sm:py-2.5"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="password" className="text-xs font-medium text-foreground sm:text-sm">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:px-3.5 sm:py-2.5"
                        placeholder="••••••••"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-11 md:h-12"
                >
                    Create Account
                </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground sm:mt-5 sm:text-sm md:mt-6">
                Already have an account?{" "}
                <a href="/sign-in" className="font-semibold text-primary hover:underline">
                    Sign in
                </a>
            </p>
        </div>
    )
}
