import Link from "next/link"
import { SignInForm } from "@/app/auth/signin-form"

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="mx-auto flex h-screen max-w-5xl flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
                <div className="mb-5 text-center sm:mb-7">
                    <Link
                        href="/frontend/public"
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:border-primary/40"
                    >
                        ← Back to home
                    </Link>
                </div>
                <SignInForm />
            </div>
        </div>
    )
}

