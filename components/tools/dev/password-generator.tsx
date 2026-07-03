"use client"

import { useState, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"
import StrengthMeter from "@/components/tools/shared/strength-meter"

function calculateStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 0.25
  if (password.length >= 12) score += 0.15
  if (password.length >= 16) score += 0.1
  if (/[a-z]/.test(password)) score += 0.125
  if (/[A-Z]/.test(password)) score += 0.125
  if (/[0-9]/.test(password)) score += 0.125
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.125
  return Math.min(1, score)
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [password, setPassword] = useState("")

  const generate = useCallback(() => {
    let charset = ""
    if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (numbers) charset += "0123456789"
    if (symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if (!charset) charset = "abcdefghijklmnopqrstuvwxyz"

    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    const result = Array.from(array, (v) => charset[v % charset.length]).join("")
    setPassword(result)
  }, [length, uppercase, lowercase, numbers, symbols])

  const strength = calculateStrength(password)

  return (
    <div className="space-y-6">
      {password && (
        <ToolResult className="    relative">
          <p className="font-mono text-lg text-foreground break-all pr-20">{password}</p>
          <div className="absolute top-3 right-3 flex gap-2">
            <CopyButton text={password} />
          </div>
          <div className="mt-3">
            <StrengthMeter score={strength} />
          </div>
        </ToolResult>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Length</label>
            <span className="text-sm text-muted-foreground">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Uppercase (A-Z)", value: uppercase, setter: setUppercase },
            { label: "Lowercase (a-z)", value: lowercase, setter: setLowercase },
            { label: "Numbers (0-9)", value: numbers, setter: setNumbers },
            { label: "Symbols (!@#$...)", value: symbols, setter: setSymbols },
          ].map(({ label, value, setter }) => (
            <label key={label} className="flex items-center gap-2 text-sm text-foreground cursor-pointer p-2 rounded-md hover:bg-muted/30">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              {label}
            </label>
          ))}
        </div>

        <Button onClick={generate} className="w-full">
          Generate Password
        </Button>
      </div>
    </div>
  )
}