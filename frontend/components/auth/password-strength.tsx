"use client"

import { useMemo } from "react"

type PasswordStrength = "weak" | "medium" | "strong"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo<PasswordStrength>(() => {
    if (!password) return "weak"
    
    let score = 0
    
    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1 // lowercase
    if (/[A-Z]/.test(password)) score += 1 // uppercase
    if (/\d/.test(password)) score += 1 // number
    if (/[^a-zA-Z\d]/.test(password)) score += 1 // special character
    
    if (score <= 2) return "weak"
    if (score <= 4) return "medium"
    return "strong"
  }, [password])

  if (!password) return null

  const strengthConfig = {
    weak: {
      label: "Weak",
      color: "text-red-500",
      bgColor: "bg-red-500",
      borderColor: "border-red-500/20",
      bgLight: "bg-red-500/10",
      bars: 1,
    },
    medium: {
      label: "Medium",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      borderColor: "border-yellow-500/20",
      bgLight: "bg-yellow-500/10",
      bars: 2,
    },
    strong: {
      label: "Strong",
      color: "text-green-500",
      bgColor: "bg-green-500",
      borderColor: "border-green-500/20",
      bgLight: "bg-green-500/10",
      bars: 3,
    },
  }

  const config = strengthConfig[strength]

  return (
    <div className={`mt-1.5 rounded-lg border ${config.borderColor} ${config.bgLight} p-2 sm:mt-2 sm:p-2.5`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-xs font-semibold ${config.color} sm:text-sm`}>
          Password Strength: {config.label}
        </span>
      </div>
      
      {/* Strength bars */}
      <div className="flex gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              bar <= config.bars
                ? `${config.bgColor} opacity-100`
                : "bg-muted opacity-30"
            }`}
          />
        ))}
      </div>
      
      {/* Requirements checklist */}
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-green-500" : ""}`}>
          <span>{password.length >= 8 ? "✓" : "○"}</span>
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-500" : ""}`}>
          <span>{/[a-z]/.test(password) && /[A-Z]/.test(password) ? "✓" : "○"}</span>
          <span>Uppercase and lowercase letters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? "text-green-500" : ""}`}>
          <span>{/\d/.test(password) ? "✓" : "○"}</span>
          <span>At least one number</span>
        </div>
      </div>
    </div>
  )
}



