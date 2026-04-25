"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("")

  const result = useMemo(() => {
    if (!birthDate) return null

    const birth = new Date(birthDate)
    const now = new Date()

    if (isNaN(birth.getTime())) return null
    if (birth > now) return null

    // Exact age calculation
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    let days = now.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    // Total calculations
    const diffMs = now.getTime() - birth.getTime()
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
    const totalMinutes = Math.floor(diffMs / (1000 * 60))

    // Next birthday
    let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday <= now) {
      nextBirthday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate())
    }
    const daysUntilBirthday = Math.ceil(
      (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      daysUntilBirthday,
      nextBirthdayAge: nextBirthday.getFullYear() - birth.getFullYear(),
    }
  }, [birthDate])

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Birth Date
        </label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="font-mono"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {result && (
        <>
          {/* Main age display */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Age</p>
            <p className="text-3xl font-mono text-foreground">
              {result.years}{" "}
              <span className="text-lg text-muted-foreground">years</span>{" "}
              {result.months}{" "}
              <span className="text-lg text-muted-foreground">months</span>{" "}
              {result.days}{" "}
              <span className="text-lg text-muted-foreground">days</span>
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-mono text-foreground">
                {result.totalDays.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Days</p>
            </div>
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-mono text-foreground">
                {result.totalHours.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Hours</p>
            </div>
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-mono text-foreground">
                {result.totalMinutes.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Minutes</p>
            </div>
          </div>

          {/* Birthday countdown */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">
              Next birthday in {result.daysUntilBirthday} day{result.daysUntilBirthday !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Turning {result.nextBirthdayAge} years old
            </p>
          </div>
        </>
      )}
    </div>
  )
}