"use client"

import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import * as React from "react"

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
    return (
        <button
            type="button"
            aria-label="Toggle sidebar"
            className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className,
            )}
            {...props}
        >
            <Menu className="h-5 w-5" />
        </button>
    )
}



