"use client"

import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const NAV_ITEMS = [
    { label: "Features", target: "features" },
    { label: "Tools", target: "tools" },
    { label: "How It Works", target: "how-it-works" },
    { label: "Contact", target: "contact" },
]

const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    const headerOffset = 80 // account for fixed header height
    const elementPosition = el.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - headerOffset

    window.scrollTo({ top: offsetPosition, behavior: "smooth" })
}

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener("scroll", handleScroll)
        // Check initial scroll position
        handleScroll()
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleNav = (target: string) => {
        setIsOpen(false)
        scrollToSection(target)
    }

    const handleSignIn = () => {
        setIsOpen(false)
        router.push("/sign-in")
    }

    const handleSignUp = () => {
        setIsOpen(false)
        router.push("/sign-up")
    }

    return (
        <header className={`fixed left-0 right-0 top-0 z-50 bg-background transition-all duration-200 ${isScrolled ? "border-b border-border/40 shadow-sm" : ""}`}>
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-background">
                        <Image src="/briefly-logo.png" alt="Briefly logo" fill className="object-contain" priority unoptimized />
                    </div>
                    <span className="text-2xl font-extrabold text-foreground">Briefly</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.target}
                            type="button"
                            onClick={() => handleNav(item.target)}
                            className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 self-center sm:flex">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 items-center"
                        onClick={handleSignIn}
                    >
                        Sign In
                    </Button>
                    <Button
                        size="sm"
                        className="h-10 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleSignUp}
                    >
                        Get Started Free
                    </Button>
                </div>

                <IconButton
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    className="h-10 w-10 sm:hidden"
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </IconButton>
            </div>

                <div className="md:hidden">
                    <div
                    className={`fixed inset-0 z-40 bg-background/90 transition-opacity duration-300 ${
                        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu overlay"
                        role="button"
                        tabIndex={-1}
                    />
                <div
                    className={`fixed right-0 top-0 z-50 flex h-full w-72 max-w-[80vw] transform flex-col border-l border-border/80 bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
                        isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                    aria-hidden={!isOpen}
                >
                        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                            <div className="flex items-center gap-2">
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-background">
                                <Image src="/briefly-logo.png" alt="Briefly logo" fill className="object-contain" priority unoptimized />
                                </div>
                            <span className="text-xl font-extrabold text-foreground">Briefly</span>
                            </div>
                            <IconButton aria-label="Close menu" className="h-9 w-9" onClick={() => setIsOpen(false)}>
                                <X className="h-5 w-5" />
                            </IconButton>
                        </div>

                        <nav className="flex flex-col gap-2 px-4 py-4">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.target}
                                    type="button"
                                    onClick={() => handleNav(item.target)}
                                    className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/8 hover:text-primary"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-3 px-4 pb-6">
                            <Button
                                variant="ghost"
                                className="w-full justify-center border border-border text-foreground hover:border-primary/60"
                                onClick={handleSignIn}
                            >
                                Sign In
                            </Button>
                            <Button
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={handleSignUp}
                            >
                                Get Started Free
                            </Button>
                        </div>
                    </div>
                </div>
        </header>
    )
}
