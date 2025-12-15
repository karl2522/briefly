"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ghost" | "outline"
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, variant = "outline", type = "button", ...props }, ref) => (
        <button
            ref={ref}
            type={type}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                variant === "outline"
                    ? "border border-border bg-card hover:border-primary/60 hover:text-primary"
                    : "hover:bg-muted/70",
                className,
            )}
            {...props}
        />
    ),
)

IconButton.displayName = "IconButton"

