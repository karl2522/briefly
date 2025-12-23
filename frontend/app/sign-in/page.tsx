import { SignInForm } from "@/app/auth/signin-form"
import Link from "next/link"
import { Suspense } from "react"

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="mx-auto flex h-screen max-w-5xl flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
                <div className="mb-5 text-center sm:mb-7">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:border-primary/40"
                    >
                        ← Back to home
                    </Link>
                </div>
                <Suspense
                    fallback={
                        <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur sm:p-6 md:p-7">
                            <div className="mb-4 text-center sm:mb-5">
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary sm:text-xs">Welcome back</p>
                                <h1 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">Sign in to Briefly</h1>
                                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                            </div>
                        </div>
                    }
                >
                <SignInForm />
                </Suspense>
            </div>
        </div>
    )
}

