"use client"

import { Coffee } from "lucide-react"
import { useState } from "react"

export function DonationButton() {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <a
            href="https://buymeacoffee.com/briefly"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group m-0 p-0 block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Support us on Buy Me a Coffee"
        >
            <div className="relative m-0 p-0">
                {/* Main Button */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 m-0">
                    <Coffee className="size-4 sm:size-5 shrink-0" />
                    <span className={`text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        isHovered ? "opacity-100 max-w-[200px] pr-2" : "opacity-0 max-w-0 overflow-hidden"
                    }`}>
                        Buy us a coffee
                    </span>
                </div>

                {/* Subtle Pulse Animation - Only on hover */}
                {isHovered && (
                    <div className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping m-0" />
                )}
            </div>
        </a>
    )
}
