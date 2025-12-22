"use client"

import { ReactNode } from "react"
import { useScrollAnimation } from "./use-scroll-animation"

interface ScrollAnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "fade"
}

export function ScrollAnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollAnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  const directionClasses = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    fade: "",
  }

  const baseClasses = `transition-all duration-700 ease-out ${
    isVisible
      ? "opacity-100 translate-y-0 translate-x-0"
      : `opacity-0 ${directionClasses[direction]}`
  }`

  return (
    <div ref={ref as any} className={`${baseClasses} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

