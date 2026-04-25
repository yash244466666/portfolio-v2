"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Flag } from "lucide-react"

interface Lap {
  id: string
  lapTime: number
  totalTime: number
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centiseconds = Math.floor((ms % 1000) / 10)
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
}

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const start = useCallback(() => {
    startRef.current = Date.now() - elapsed
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 10)
  }, [elapsed])

  const stop = useCallback(() => {
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
    setElapsed(0)
    setLaps([])
  }, [])

  const lap = useCallback(() => {
    const lastLapTime = laps.length > 0 ? laps[0].totalTime : 0
    setLaps((prev) => [
      {
        id: Date.now().toString(),
        lapTime: elapsed - lastLapTime,
        totalTime: elapsed,
      },
      ...prev,
    ])
  }, [elapsed, laps])

  // Find best and worst lap times
  const bestLapTime = laps.length > 1 ? Math.min(...laps.map((l) => l.lapTime)) : null
  const worstLapTime = laps.length > 1 ? Math.max(...laps.map((l) => l.lapTime)) : null

  return (
    <div className="space-y-6">
      {/* Display */}
      <ToolResult className="   p-8 text-center">
        <p className="text-5xl font-mono text-foreground tracking-wider">
          {formatTime(elapsed)}
        </p>
      </ToolResult>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!running ? (
          <Button onClick={start} size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            {elapsed > 0 ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button onClick={stop} variant="destructive" size="lg" className="gap-2">
            <Pause className="h-5 w-5" />
            Stop
          </Button>
        )}

        {running && (
          <Button onClick={lap} variant="outline" size="lg" className="gap-2">
            <Flag className="h-5 w-5" />
            Lap
          </Button>
        )}

        {!running && elapsed > 0 && (
          <Button onClick={reset} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset
          </Button>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <ToolResult className="   overflow-hidden">
          <div className="grid grid-cols-3 gap-4 px-4 py-2 border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wider">
            <span>Lap</span>
            <span className="text-right">Lap Time</span>
            <span className="text-right">Total</span>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {laps.map((lapEntry, i) => {
              const lapNum = laps.length - i
              const isBest = bestLapTime !== null && lapEntry.lapTime === bestLapTime
              const isWorst = worstLapTime !== null && lapEntry.lapTime === worstLapTime

              return (
                <div
                  key={lapEntry.id}
                  className={`grid grid-cols-3 gap-4 px-4 py-2 text-sm border-b border-border/30 last:border-0 ${
                    isBest ? "text-emerald-400" : isWorst ? "text-red-400" : ""
                  }`}
                >
                  <span className="font-mono text-foreground">#{lapNum}</span>
                  <span className="text-right font-mono">
                    {formatTime(lapEntry.lapTime)}
                  </span>
                  <span className="text-right font-mono text-muted-foreground">
                    {formatTime(lapEntry.totalTime)}
                  </span>
                </div>
              )
            })}
          </div>
        </ToolResult>
      )}
    </div>
  )
}