import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-inter",
})

export const metadata: Metadata = {
    title: "Briefly - AI-Powered Study Tools for Students",
    description:
        "Transform your learning with free AI tools. Generate flashcards, summarize texts, and master any subject with Briefly.",
    generator: "v0.app",
    icons: {
        icon: [
            {
                url: "/briefly-logo.png",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/briefly-logo.png",
                media: "(prefers-color-scheme: dark)",
            },
            {
                url: "/briefly-logo.png",
            },
        ],
        apple: "/briefly-logo.png",
    },
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        </body>
        </html>
    )
}
