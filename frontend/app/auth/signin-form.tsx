"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OAuthButtons } from "@/app/auth/oauth-buttons"

export function SignInForm() {
    const [form, setForm] = useState({ email: "", password: "" })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: wire up auth action
        console.log("Sign in", form)
    }

    return (
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur sm:p-6 md:p-7">
            <div className="mb-4 text-center sm:mb-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary sm:text-xs">Welcome back</p>
                <h1 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">Sign in to Briefly</h1>
                <p className="mt-2 text-sm text-muted-foreground">Continue your AI-powered study flow.</p>
            </div>

            <OAuthButtons />

            <div className="my-4 flex items-center gap-3 sm:my-5 md:my-6">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full h-11 md:h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign In
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <a href="/sign-up" className="font-semibold text-primary hover:underline">
                    Sign up
                </a>
            </p>
        </div>
    )
}

