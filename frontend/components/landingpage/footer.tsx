import { Sparkles } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">Briefly</span>
                        </div>
                        <p className="mb-4 max-w-md text-sm text-muted-foreground">
                            AI-powered educational tools designed to help students learn faster and more effectively. Free forever.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-foreground">Product</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#tools" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Tools
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
                                    How It Works
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Terms
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Briefly. All rights reserved. Made with ❤️ for students everywhere.</p>
                </div>
            </div>
        </footer>
    )
}
