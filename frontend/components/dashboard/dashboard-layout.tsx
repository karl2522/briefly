"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient, type User } from "@/lib/api"
import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"
import {
    BookOpen,
    Brain,
    Coffee,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Loader2,
    LogOut,
    Menu,
    Target,
    User as UserIcon,
    X
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

// Hook to detect mobile screens
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768) // md breakpoint
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}

interface DashboardLayoutProps {
    children: ReactNode
    title: string
    headerAction?: ReactNode
}

export function DashboardLayout({ children, title, headerAction }: DashboardLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [isLoadingUser, setIsLoadingUser] = useState(true)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Auto-close sidebar on mobile screens
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false)
        } else {
            setSidebarOpen(true)
        }
    }, [isMobile])

    // Close sidebar when navigating on mobile
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false)
        }
    }, [pathname, isMobile])

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiClient.getCurrentUser()
                if (response.success && response.data) {
                    setUser(response.data)
                } else {
                    if (response.error?.includes('Unauthorized') || response.error?.includes('401')) {
                        router.push('/sign-in')
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user:', error)
            } finally {
                setIsLoadingUser(false)
            }
        }

        fetchUser()
    }, [router])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await logout(router)
        } catch (error) {
            console.error('Logout error:', error)
            setIsLoggingOut(false)
        }
    }

    const getInitials = (name: string | null, email: string): string => {
        if (name) {
            const parts = name.trim().split(' ')
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            }
            return name[0].toUpperCase()
        }
        return email[0].toUpperCase()
    }

    const displayName = user?.name || user?.email || 'User'
    const displayEmail = user?.email || ''
    const initials = user ? getInitials(user.name, user.email) : 'U'

    return (
        <div className="min-h-screen bg-purple-50/50">
            {/* Desktop Sidebar - Always visible on desktop, hidden on mobile */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out w-64",
                    // Desktop: show/hide based on sidebarOpen state
                    // Mobile: always hidden (we'll use a separate mobile sidebar)
                    "hidden md:block",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
                        <div className="relative size-8 overflow-hidden rounded-lg">
                            <Image src="/briefly-logo.png" alt="Briefly logo" fill className="object-contain" priority unoptimized />
                        </div>
                        <span className="text-lg font-semibold text-sidebar-foreground">Briefly</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        <NavItem icon={<LayoutDashboard className="size-5" />} label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
                        <NavItem icon={<Brain className="size-5" />} label="Flashcards" href="/dashboard/flashcards" active={pathname === '/dashboard/flashcards'} />
                        <NavItem icon={<FileText className="size-5" />} label="Summarizer" href="/dashboard/summarizer" active={pathname === '/dashboard/summarizer'} />
                        <NavItem icon={<BookOpen className="size-5" />} label="Study Guides" href="/dashboard/study-guide" active={pathname === '/dashboard/study-guide'} />
                        <NavItem icon={<Target className="size-5" />} label="Quiz Generator" href="/dashboard/quiz" active={pathname === '/dashboard/quiz'} />

                        <div className="pt-4">
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                                Settings
                            </p>
                            <NavItem icon={<UserIcon className="size-5" />} label="Profile" href="/dashboard/profile" active={pathname === '/dashboard/profile'} />
                            <NavItem icon={<HelpCircle className="size-5" />} label="Help & Support" href="/dashboard/help" active={pathname === '/dashboard/help'} />
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                disabled={isLoggingOut}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                                )}
                            >
                                <LogOut className="size-5" />
                                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                            </button>
                        </div>
                    </nav>

                    <div className="space-y-3 p-4">
                        <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/60 p-4 text-sidebar-accent-foreground shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
                                    <Coffee className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Fuel Briefly</p>
                                    <p className="text-xs text-sidebar-foreground/70">Buy us a coffee</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Donate
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-sidebar-border/80 p-4">
                        {isLoadingUser ? (
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-sidebar-accent animate-pulse">
                                    <div className="size-6 rounded-full bg-sidebar-foreground/20" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 rounded bg-sidebar-foreground/20 animate-pulse" />
                                    <div className="h-3 w-32 rounded bg-sidebar-foreground/10 animate-pulse" />
                                </div>
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={displayName}
                                        className="size-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                                        {initials}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-sidebar-foreground/70 truncate">
                                        {displayEmail}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-sidebar-foreground/60 text-center py-2">
                                Failed to load profile
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar - Overlay drawer for mobile only */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out shadow-xl",
                    // Only show on mobile
                    "md:hidden",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Mobile Sidebar Header with Close Button */}
                    <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
                        <div className="flex items-center gap-2">
                            <div className="relative size-8 overflow-hidden rounded-lg">
                                <Image src="/briefly-logo.png" alt="Briefly logo" fill className="object-contain" priority unoptimized />
                            </div>
                            <span className="text-lg font-semibold text-sidebar-foreground">Briefly</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                            className="text-sidebar-foreground hover:bg-sidebar-accent"
                        >
                            <X className="size-5" />
                        </Button>
                    </div>

                    {/* Mobile Navigation - Same content as desktop */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        <NavItem 
                            icon={<LayoutDashboard className="size-5" />} 
                            label="Dashboard" 
                            href="/dashboard" 
                            active={pathname === '/dashboard'}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                        <NavItem 
                            icon={<Brain className="size-5" />} 
                            label="Flashcards" 
                            href="/dashboard/flashcards" 
                            active={pathname === '/dashboard/flashcards'}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                        <NavItem 
                            icon={<FileText className="size-5" />} 
                            label="Summarizer" 
                            href="/dashboard/summarizer" 
                            active={pathname === '/dashboard/summarizer'}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                        <NavItem 
                            icon={<BookOpen className="size-5" />} 
                            label="Study Guides" 
                            href="/dashboard/study-guide" 
                            active={pathname === '/dashboard/study-guide'}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                        <NavItem 
                            icon={<Target className="size-5" />} 
                            label="Quiz Generator" 
                            href="/dashboard/quiz" 
                            active={pathname === '/dashboard/quiz'}
                            onNavigate={() => setSidebarOpen(false)}
                        />

                        <div className="pt-4">
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                                Settings
                            </p>
                            <NavItem 
                                icon={<UserIcon className="size-5" />} 
                                label="Profile"
                                href="/dashboard/profile"
                                active={pathname === '/dashboard/profile'}
                                onNavigate={() => setSidebarOpen(false)}
                            />
                            <NavItem 
                                icon={<HelpCircle className="size-5" />} 
                                label="Help & Support"
                                href="/dashboard/help"
                                active={pathname === '/dashboard/help'}
                                onNavigate={() => setSidebarOpen(false)}
                            />
                            <button
                                onClick={() => {
                                    setShowLogoutModal(true)
                                    setSidebarOpen(false)
                                }}
                                disabled={isLoggingOut}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                                )}
                            >
                                <LogOut className="size-5" />
                                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Donate Section */}
                    <div className="space-y-3 p-4 border-t border-sidebar-border/80">
                        <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/60 p-4 text-sidebar-accent-foreground shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
                                    <Coffee className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Fuel Briefly</p>
                                    <p className="text-xs text-sidebar-foreground/70">Buy us a coffee</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => setSidebarOpen(false)}
                            >
                                Donate
                            </Button>
                        </div>
                    </div>

                    {/* Mobile User Profile */}
                    <div className="border-t border-sidebar-border/80 p-4">
                        {isLoadingUser ? (
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-sidebar-accent animate-pulse">
                                    <div className="size-6 rounded-full bg-sidebar-foreground/20" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 rounded bg-sidebar-foreground/20 animate-pulse" />
                                    <div className="h-3 w-32 rounded bg-sidebar-foreground/10 animate-pulse" />
                                </div>
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={displayName}
                                        className="size-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                                        {initials}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-sidebar-foreground/70 truncate">
                                        {displayEmail}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-sidebar-foreground/60 text-center py-2">
                                Failed to load profile
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={cn(
                "min-h-screen transition-all duration-300 ease-in-out",
                // Desktop: add margin when sidebar is open
                // Mobile: no margin (sidebar is overlay)
                sidebarOpen && !isMobile ? "ml-64" : "ml-0"
            )}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSidebarOpen(!sidebarOpen)} 
                        className="text-foreground"
                    >
                        {sidebarOpen && !isMobile ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>

                    <div className="flex-1">
                        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                    </div>

                    {headerAction}
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay - Only show on mobile when sidebar is open */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Logout Confirmation Modal */}
            <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign Out?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to sign out? You'll need to sign in again to access your account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutModal(false)}
                            disabled={isLoggingOut}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Signing out...</span>
                                </>
                            ) : (
                                "Sign Out"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function NavItem({ 
    icon, 
    label, 
    href, 
    active = false,
    onNavigate
}: { 
    icon: React.ReactNode
    label: string
    href?: string
    active?: boolean
    onNavigate?: () => void
}) {
    const content = (
        <>
            {icon}
            <span>{label}</span>
        </>
    )

    const className = cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
        active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    )

    if (href) {
        return (
            <Link 
                href={href} 
                className={className}
                onClick={onNavigate}
            >
                {content}
            </Link>
        )
    }

    return (
        <button 
            className={className}
            onClick={onNavigate}
        >
            {content}
        </button>
    )
}



