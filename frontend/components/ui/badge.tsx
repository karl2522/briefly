"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

const variantStyles: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-foreground border border-border/70",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-border text-foreground",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof variantStyles
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                variantStyles[variant],
                className,
            )}
            {...props}
        />
    )
}







