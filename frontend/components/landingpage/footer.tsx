import Image from "next/image"

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                                <Image src="/briefly-logo.png" alt="Briefly logo" fill className="object-contain" unoptimized />
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
                                <a href="#features" className="cursor-pointer text-muted-foreground transition-colors hover:text-primary">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#tools" className="cursor-pointer text-muted-foreground transition-colors hover:text-primary">
                                    Tools
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="cursor-pointer text-muted-foreground transition-colors hover:text-primary">
                                    How It Works
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="cursor-pointer text-muted-foreground transition-colors hover:text-primary">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="cursor-pointer text-muted-foreground transition-colors hover:text-primary">
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="cursor-pointer text-muted-foreground transition-colors hover:text-primary">
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
