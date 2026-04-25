"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, RotateCcw, Bell } from "lucide-react"

function formatDisplay(seconds: number): string {
  if (seconds <= 0) return "00:00:00"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function CountdownTimer() {
  const [inputHours, setInputHours] = useState("0")
  const [inputMinutes, setInputMinutes] = useState("5")
  const [inputSeconds, setInputSeconds] = useState("0")
  const [remaining, setRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (finished) {
      const timeout = setTimeout(() => setFinished(false), 5000)
      return () => clearTimeout(timeout)
    }
  }, [finished])

  const startCountdown = useCallback(() => {
    const h = parseInt(inputHours) || 0
    const m = parseInt(inputMinutes) || 0
    const s = parseInt(inputSeconds) || 0
    const total = h * 3600 + m * 60 + s

    if (total <= 0) return

    if (!started) {
      setTotalTime(total)
      setRemaining(total)
    }
    setStarted(true)
    setRunning(true)
    setFinished(false)

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setRunning(false)
          setFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [inputHours, inputMinutes, inputSeconds, started])

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
    setStarted(false)
    setRemaining(0)
    setTotalTime(0)
    setFinished(false)
  }, [])

  const progress = totalTime > 0 ? ((totalTime - remaining) / totalTime) * 100 : 0
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="space-y-6">
      {/* Input fields */}
      {!started && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Hours</label>
            <Input
              type="number"
              min="0"
              max="99"
              value={inputHours}
              onChange={(e) => setInputHours(e.target.value)}
              className="font-mono text-center text-lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Minutes</label>
            <Input
              type="number"
              min="0"
              max="59"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              className="font-mono text-center text-lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Seconds</label>
            <Input
              type="number"
              min="0"
              max="59"
              value={inputSeconds}
              onChange={(e) => setInputSeconds(e.target.value)}
              className="font-mono text-center text-lg"
            />
          </div>
        </div>
      )}

      {/* Progress ring and display */}
      <div className="flex justify-center">
        <div className="relative w-56 h-56">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ${
                finished
                  ? "text-red-500 animate-pulse"
                  : remaining <= 10 && remaining > 0
                  ? "text-orange-500"
                  : "text-primary"
              }`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className={`text-3xl font-mono tracking-wider ${
                finished ? "text-red-400 animate-pulse" : "text-foreground"
              }`}
            >
              {formatDisplay(remaining)}
            </p>
            {finished && (
              <div className="flex items-center gap-1 mt-2 text-red-400">
                <Bell className="h-4 w-4 animate-bounce" />
                <span className="text-sm font-medium">Time is up!</span>
              </div>
            )}
            {!finished && started && (
              <p className="text-xs text-muted-foreground mt-2">
                {running ? "Running" : "Paused"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!running && !finished && (
          <Button onClick={startCountdown} size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            {started ? "Resume" : "Start"}
          </Button>
        )}

        {running && (
          <Button onClick={pause} variant="outline" size="lg" className="gap-2">
            <Pause className="h-5 w-5" />
            Pause
          </Button>
        )}

        {started && (
          <Button onClick={reset} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset
          </Button>
        )}
      </div>

      {/* Quick presets */}
      {!started && (
        <div className="flex gap-2 justify-center">
          {[
            { label: "1 min", h: "0", m: "1", s: "0" },
            { label: "5 min", h: "0", m: "5", s: "0" },
            { label: "10 min", h: "0", m: "10", s: "0" },
            { label: "15 min", h: "0", m: "15", s: "0" },
            { label: "30 min", h: "0", m: "30", s: "0" },
            { label: "1 hour", h: "1", m: "0", s: "0" },
          ].map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => {
                setInputHours(preset.h)
                setInputMinutes(preset.m)
                setInputSeconds(preset.s)
              }}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}