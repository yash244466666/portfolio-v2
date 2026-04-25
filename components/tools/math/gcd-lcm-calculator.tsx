"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    [a, b] = [b, a % b]
  }
  return a
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return Math.abs(a * b) / gcd(a, b)
}

function gcdSteps(a: number, b: number): string[] {
  const steps: string[] = []
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    steps.push(`gcd(${a}, ${b}) = gcd(${b}, ${a} mod ${b}) = gcd(${b}, ${a % b})`)
    const temp = b
    b = a % b
    a = temp
  }
  steps.push(`gcd = ${a}`)
  return steps
}

function multiGcd(numbers: number[]): number {
  return numbers.reduce((acc, n) => gcd(acc, n))
}

function multiLcm(numbers: number[]): number {
  return numbers.reduce((acc, n) => lcm(acc, n))
}

export default function GcdLcmCalculator() {
  const [input, setInput] = useState("48, 18")

  const numbers = useMemo(() => {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n) && isFinite(n))
  }, [input])

  const gcdResult = useMemo(() => {
    if (numbers.length < 2) return null
    return multiGcd(numbers)
  }, [numbers])

  const lcmResult = useMemo(() => {
    if (numbers.length < 2) return null
    return multiLcm(numbers)
  }, [numbers])

  const steps = useMemo(() => {
    if (numbers.length < 2) return []
    // Show steps for first two numbers
    return gcdSteps(numbers[0], numbers[1])
  }, [numbers])

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Numbers (comma separated)
        </label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 48, 18, 12"
          className="font-mono"
        />
      </div>

      {gcdResult !== null && lcmResult !== null && (
        <>
          {/* Results */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                GCD
              </p>
              <p className="text-3xl font-mono text-foreground">{gcdResult}</p>
            </div>
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                LCM
              </p>
              <p className="text-3xl font-mono text-foreground">{lcmResult}</p>
            </div>
          </div>

          {/* Step-by-step for GCD */}
          {steps.length > 0 && (
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
              <span className="text-sm font-medium text-foreground block mb-3">
                GCD Steps (Euclidean Algorithm)
              </span>
              <div className="space-y-1">
                {steps.map((step, i) => (
                  <p key={i} className="font-mono text-sm text-muted-foreground">
                    {step}
                  </p>
                ))}
              </div>
              {numbers.length > 2 && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Showing steps for first two numbers. Full GCD: gcd({numbers.join(", ")}) = {gcdResult}
                </p>
              )}
            </div>
          )}

          {/* Number details */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <span className="text-sm font-medium text-foreground block mb-2">
              Numbers
            </span>
            <div className="flex flex-wrap gap-2">
              {numbers.map((n, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-md bg-primary/10 text-primary font-mono text-sm"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}