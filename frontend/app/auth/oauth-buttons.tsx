"use client"

import { Button } from "@/components/ui/button";
import type React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const iconBase =
    "h-5 w-5"

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconBase} {...props}>
        <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.4c-.2 1.2-1.3 3.6-5.4 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.6l2.7-2.6C16.8 2.8 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.9 0-.7-.1-1.2-.2-1.7H12Z"
        />
    </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconBase} {...props}>
        <path
            fill="#1877F2"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988h-2.54V12h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z"
        />
    </svg>
)

type Provider = "google" | "facebook"

const providerConfig: Record<Provider, { label: string; icon: React.ReactNode; className: string }> = {
    google: {
        label: "Continue with Google",
        icon: <GoogleIcon />,
        className: "bg-white text-foreground border-border hover:border-primary/40 hover:bg-primary/5",
    },
    facebook: {
        label: "Continue with Facebook",
        icon: <FacebookIcon />,
        className: "bg-white text-foreground border-border hover:border-primary/40 hover:bg-primary/5",
    },
}

interface OAuthButtonsProps {
    onClick?: (provider: Provider) => void
    mode?: "signin" | "signup"
}

export function OAuthButtons({ onClick, mode = "signin" }: OAuthButtonsProps) {
    const handleOAuthClick = (provider: Provider) => {
        if (onClick) {
            onClick(provider);
            return;
        }

        // Redirect to OAuth endpoint with mode as query parameter
        const endpoint = `${API_BASE_URL}/auth/${provider}?mode=${mode}`;
        
        window.location.href = endpoint;
    };

    return (
        <div className="grid gap-3">
            {(Object.keys(providerConfig) as Provider[]).map((provider) => {
                const cfg = providerConfig[provider]
                return (
                    <Button
                        key={provider}
                        variant="outline"
                        className={`w-full justify-center gap-2 border ${cfg.className} cursor-pointer`}
                        onClick={() => handleOAuthClick(provider)}
                        type="button"
                    >
                        {cfg.icon}
                        <span className="font-semibold">{cfg.label}</span>
                    </Button>
                )
            })}
        </div>
    )
}

