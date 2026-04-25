"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import StrengthMeter from "@/components/tools/shared/strength-meter"
import { Check, X, Shield } from "lucide-react"

function analyzePassword(password: string) {
  const length = password.length
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)
  const hasLength8 = length >= 8
  const hasLength12 = length >= 12
  const hasLength16 = length >= 16

  // Character pool size
  let poolSize = 0
  if (hasLowercase) poolSize += 26
  if (hasUppercase) poolSize += 26
  if (hasNumbers) poolSize += 10
  if (hasSymbols) poolSize += 33

  // Entropy
  const entropy = poolSize > 0 ? length * Math.log2(poolSize) : 0

  // Score (0 to 1)
  let score = 0
  if (length > 0) score += 0.1
  if (hasLength8) score += 0.15
  if (hasLength12) score += 0.1
  if (hasLength16) score += 0.1
  if (hasLowercase) score += 0.1
  if (hasUppercase) score += 0.1
  if (hasNumbers) score += 0.1
  if (hasSymbols) score += 0.15
  // Bonus for high entropy
  if (entropy > 60) score += 0.1
  score = Math.min(1, score)

  // Crack time estimate
  let crackTime = ""
  let crackLabel = ""
  if (entropy === 0) {
    crackTime = "Instant"
    crackLabel = "N/A"
  } else if (entropy < 28) {
    crackTime = "Less than a second"
    crackLabel = "Very Weak"
  } else if (entropy < 36) {
    crackTime = "A few seconds"
    crackLabel = "Very Weak"
  } else if (entropy < 60) {
    crackTime = "Minutes to hours"
    crackLabel = "Weak"
  } else if (entropy < 80) {
    crackTime = "Days to months"
    crackLabel = "Fair"
  } else if (entropy < 100) {
    crackTime = "Years"
    crackLabel = "Strong"
  } else {
    crackTime = "Centuries+"
    crackLabel = "Very Strong"
  }

  return {
    length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasLength8,
    hasLength12,
    hasLength16,
    entropy: Math.round(entropy),
    score,
    crackTime,
    crackLabel,
  }
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("")

  const analysis = useMemo(() => analyzePassword(password), [password])

  const checks = [
    { label: "Uppercase letter (A-Z)", pass: analysis.hasUppercase },
    { label: "Lowercase letter (a-z)", pass: analysis.hasLowercase },
    { label: "Number (0-9)", pass: analysis.hasNumbers },
    { label: "Symbol (!@#$...)", pass: analysis.hasSymbols },
    { label: "At least 8 characters", pass: analysis.hasLength8 },
    { label: "At least 12 characters", pass: analysis.hasLength12 },
    { label: "At least 16 characters", pass: analysis.hasLength16 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Enter Password
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type a password to analyze..."
          className="font-mono"
        />
      </div>

      {password && (
        <>
          <StrengthMeter
            score={analysis.score}
            labels={{
              weak: "Very Weak",
              fair: "Weak",
              good: "Fair",
              strong: "Strong",
            }}
          />

          {/* Crack time estimate */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Crack Time Estimate</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated time</span>
              <span className="text-sm font-medium text-foreground">{analysis.crackTime}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Strength</span>
              <span
                className={`text-sm font-medium ${
                  analysis.score < 0.25
                    ? "text-red-400"
                    : analysis.score < 0.5
                    ? "text-orange-400"
                    : analysis.score < 0.75
                    ? "text-yellow-400"
                    : "text-emerald-400"
                }`}
              >
                {analysis.crackLabel}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Entropy</span>
              <span className="text-sm font-mono text-foreground">{analysis.entropy} bits</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Length</span>
              <span className="text-sm font-mono text-foreground">{analysis.length}</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-2">
            <span className="text-sm font-medium text-foreground block mb-3">Requirements</span>
            {checks.map(({ label, pass }) => (
              <div key={label} className="flex items-center gap-2">
                {pass ? (
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    pass ? "text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}