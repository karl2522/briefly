"use client"

import { cn } from "@/lib/utils"

interface ShinyTextProps {
    children: React.ReactNode
    className?: string
    shineColor?: string
}

export function ShinyText({ children, className, shineColor = "rgba(255, 255, 255, 0.5)" }: ShinyTextProps) {
    return (
        <span
            className={cn(
                "relative inline-block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent",
                className
            )}
            style={{
                backgroundSize: "200% auto",
                animation: "shiny-shimmer 3s linear infinite",
            }}
        >
            <style jsx>{`
                @keyframes shiny-shimmer {
                    0% {
                        background-position: 0% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }
            `}</style>
            {children}
        </span>
    )
}
