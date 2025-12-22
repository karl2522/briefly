"use client"

import { OAuthButtons } from "@/app/auth/oauth-buttons"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { handleAuthResponse } from "@/lib/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Check for OAuth errors from URL params
    useEffect(() => {
        const urlError = searchParams.get('error')
        const urlMessage = searchParams.get('message')
        
        if (urlError) {
            if (urlError === 'account_not_found') {
                setError(urlMessage || "No account found. Please sign up first to create your account.")
            } else if (urlError === 'oauth_failed') {
                setError(urlMessage || "Authentication failed. Please try again.")
            } else if (urlMessage?.includes('email/password')) {
                setError(urlMessage || "This account was created with email/password. Please sign in with email/password.")
            } else if (urlMessage?.includes('OAuth') || urlMessage?.includes('Google') || urlMessage?.includes('Facebook')) {
                setError(urlMessage || "This account was created with OAuth. Please sign in with OAuth.")
            } else {
                setError(urlMessage || "An error occurred. Please try again.")
            }
            
            // Clean up URL params
            router.replace('/sign-in', { scroll: false })
        }
    }, [searchParams, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const response = await apiClient.login(form.email, form.password)
            
            if (!response.success) {
                // Show user-friendly error message from backend
                // Prioritize error field, then message field, with a user-friendly fallback
                const errorMsg = response.error || response.message;
                
                // If we get a generic "Unauthorized" message, show a more helpful one
                if (errorMsg === 'Unauthorized' || errorMsg === '401') {
                    setError("No account found with this email address. Please check your email or sign up to create an account.")
                } else {
                    setError(errorMsg || "Unable to sign in. Please check your credentials and try again.")
                }
                return
            }
            
            // If successful, handle the auth response (redirect, etc.)
            await handleAuthResponse(response, router)
        } catch (err) {
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur sm:p-6 md:p-7">
            <div className="mb-4 text-center sm:mb-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary sm:text-xs">Welcome back</p>
                <h1 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">Sign in to Briefly</h1>
                <p className="mt-2 text-sm text-muted-foreground">Continue your AI-powered study flow.</p>
            </div>

            <OAuthButtons mode="signin" />

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
                    <PasswordInput
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </div>

                {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    className="w-full h-11 md:h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
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

