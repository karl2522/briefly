"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TypingTextProps {
    text: string
    className?: string
    speed?: number
    delay?: number
    showCursor?: boolean
    cursorChar?: string
    onComplete?: () => void
    highlightText?: string
    highlightClassName?: string
}

export function TypingText({
    text,
    className,
    speed = 50,
    delay = 0,
    showCursor = true,
    cursorChar = "|",
    onComplete,
    highlightText,
    highlightClassName,
}: TypingTextProps) {
    const [displayedText, setDisplayedText] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [showPulseCursor, setShowPulseCursor] = useState(true)

    useEffect(() => {
        if (delay > 0) {
            // Show pulsing cursor during delay
            setShowPulseCursor(true)
            const delayTimer = setTimeout(() => {
                setIsTyping(true)
                setShowPulseCursor(false)
            }, delay)
            return () => clearTimeout(delayTimer)
        } else {
            setIsTyping(true)
            setShowPulseCursor(false)
        }
    }, [delay])

    useEffect(() => {
        if (!isTyping) return

        let currentIndex = 0
        const typingInterval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1))
                currentIndex++
            } else {
                clearInterval(typingInterval)
                setIsTyping(false)
                setIsComplete(true)
                if (onComplete) {
                    onComplete()
                }
            }
        }, speed)

        return () => clearInterval(typingInterval)
    }, [isTyping, text, speed, onComplete])

    const renderText = () => {
        if (!highlightText) {
            return displayedText
        }

        const highlightIndex = text.indexOf(highlightText)
        if (highlightIndex === -1) {
            return displayedText
        }

        const beforeHighlight = text.slice(0, highlightIndex)
        const highlightEnd = highlightIndex + highlightText.length
        const afterHighlight = text.slice(highlightEnd)

        const displayedBefore = displayedText.slice(0, highlightIndex)
        const displayedHighlight = displayedText.slice(highlightIndex, Math.min(highlightEnd, displayedText.length))
        const displayedAfter = displayedText.slice(highlightEnd)

        return (
            <>
                {displayedBefore}
                {displayedHighlight && (
                    <span className={cn(highlightClassName)}>
                        {displayedHighlight}
                    </span>
                )}
                {displayedAfter}
            </>
        )
    }

    return (
        <span className={cn("inline-block", className)}>
            {renderText()}
            {/* Show blinking cursor before typing starts */}
            {showPulseCursor && showCursor && (
                <span className="ml-1 inline-block animate-blink text-foreground">
                    {cursorChar}
                </span>
            )}
            {/* Show blinking cursor while typing */}
            {isTyping && !showPulseCursor && showCursor && (
                <span className="ml-1 inline-block animate-blink text-foreground">
                    {cursorChar}
                </span>
            )}
            {/* Hide cursor after typing is complete */}
        </span>
    )
}

