"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        required={required}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-border bg-background pr-10 pl-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:px-3.5 sm:py-2.5 ${className}`}
        placeholder={placeholder}
        autoComplete="current-password"
      />
      
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none rounded p-1 cursor-pointer"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>
    </div>
  )
}






