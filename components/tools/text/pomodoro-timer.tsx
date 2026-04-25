"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"

type TimerState = "idle" | "running" | "paused"
type TimerMode = "work" | "break"

export default function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [mode, setMode] = useState<TimerMode>("work")
  const [state, setState] = useState<TimerState>("idle")
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalTime = mode === "work" ? workMinutes * 60 : breakMinutes * 60
  const progress = ((totalTime - secondsLeft) / totalTime) * 100

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        if (Notification.permission === "granted") {
          new Notification(mode === "work" ? "Break time!" : "Back to work!", {
            body: mode === "work" ? "Great job! Take a break." : "Break is over. Focus time!",
          })
        }
        if (mode === "work") {
          setSessions((s) => s + 1)
          setMode("break")
          return breakMinutes * 60
        } else {
          setMode("work")
          return workMinutes * 60
        }
      }
      return prev - 1
    })
  }, [mode, workMinutes, breakMinutes])

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [state, tick])

  const start = () => {
    if (Notification.permission === "default") Notification.requestPermission()
    setState("running")
  }

  const pause = () => setState("paused")
  const reset = () => {
    setState("idle")
    setMode("work")
    setSecondsLeft(workMinutes * 60)
  }

  const modeColor = mode === "work" ? "text-primary" : "text-emerald-400"
  const modeBg = mode === "work" ? "bg-primary" : "bg-emerald-500"

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-2">
        <button
          onClick={() => { setMode("work"); setSecondsLeft(workMinutes * 60); setState("idle"); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "work" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Work ({workMinutes}m)
        </button>
        <button
          onClick={() => { setMode("break"); setSecondsLeft(breakMinutes * 60); setState("idle"); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "break" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
        >
          Break ({breakMinutes}m)
        </button>
      </div>

      <div className="text-center space-y-4">
        <p className={`text-sm font-medium uppercase tracking-wider ${modeColor}`}>
          {mode === "work" ? "Focus Time" : "Break Time"}
        </p>
        <p className="text-7xl font-mono font-bold text-foreground tabular-nums">
          {formatTime(secondsLeft)}
        </p>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${modeBg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {state === "idle" || state === "paused" ? (
          <Button onClick={start} size="lg">{state === "paused" ? "Resume" : "Start"}</Button>
        ) : (
          <Button onClick={pause} variant="outline" size="lg">Pause</Button>
        )}
        <Button onClick={reset} variant="ghost" size="lg">Reset</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Work Duration (min)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={workMinutes}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value))
              setWorkMinutes(v)
              if (mode === "work" && state === "idle") setSecondsLeft(v * 60)
            }}
            className="w-full h-9 px-3 rounded-md border border-border bg-background/50 text-foreground text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Break Duration (min)</label>
          <input
            type="number"
            min={1}
            max={30}
            value={breakMinutes}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value))
              setBreakMinutes(v)
              if (mode === "break" && state === "idle") setSecondsLeft(v * 60)
            }}
            className="w-full h-9 px-3 rounded-md border border-border bg-background/50 text-foreground text-sm"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">Sessions completed: <span className="text-foreground font-medium">{sessions}</span></p>
      </div>
    </div>
  )
}