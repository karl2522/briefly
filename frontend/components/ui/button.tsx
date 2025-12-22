import * as React from "react"

type Variant = "default" | "outline" | "ghost" | "destructive"
type Size = "default" | "sm" | "lg" | "icon"

const variantStyles: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-transparent text-foreground hover:bg-accent/10",
    ghost: "text-foreground hover:bg-accent/10",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
}

const sizeStyles: Record<Size, string> = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-6 text-base",
    icon: "h-10 w-10 p-0",
}

function cn(...inputs: Array<string | false | null | undefined>) {
    return inputs.filter(Boolean).join(" ")
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background cursor-pointer",
                    variantStyles[variant],
                    sizeStyles[size],
                    className,
                )}
                {...props}
            />
        )
    },
)

Button.displayName = "Button"

