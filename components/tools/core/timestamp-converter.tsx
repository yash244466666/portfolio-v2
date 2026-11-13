"use client"

import { useState, useEffect } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TimestampUnit = "auto" | "seconds" | "milliseconds"

type ParsedTimestamp =
  | {
      ok: true
      ms: number
      date: Date
      unit: "seconds" | "milliseconds"
      iso: string
    }
  | { ok: false; error: string }

type ParsedDate =
  | { ok: true; ms: number; iso: string; seconds: string }
  | { ok: false; error: string }

const MAX_DATE_MS = 8.64e15
const AUTO_MILLISECONDS_THRESHOLD = 1e11

function parseTimestampInput(value: string, unit: TimestampUnit): ParsedTimestamp {
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, error: "Enter a timestamp to convert." }
  }
  if (!/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: "Enter a whole number of seconds or milliseconds." }
  }

  const numeric = Number(trimmed)
  if (!Number.isSafeInteger(numeric)) {
    return { ok: false, error: "That timestamp is outside the supported range." }
  }

  const resolvedUnit: "seconds" | "milliseconds" =
    unit === "auto"
      ? Math.abs(numeric) >= AUTO_MILLISECONDS_THRESHOLD
        ? "milliseconds"
        : "seconds"
      : unit

  const ms =
    resolvedUnit === "seconds" ? numeric * 1000 : numeric

  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_DATE_MS) {
    return { ok: false, error: "That timestamp is outside the supported date range." }
  }

  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "That timestamp is outside the supported date range." }
  }

  try {
    return { ok: true, ms, date, unit: resolvedUnit, iso: date.toISOString() }
  } catch {
    return { ok: false, error: "That timestamp is outside the supported date range." }
  }
}

function parseDateInput(value: string): ParsedDate {
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, error: "Enter a date to convert." }
  }

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      error: "Enter a valid date, for example 2000-01-01T00:00:00Z.",
    }
  }

  const ms = date.getTime()
  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_DATE_MS) {
    return { ok: false, error: "That date is outside the supported range." }
  }

  try {
    return {
      ok: true,
      ms,
      iso: date.toISOString(),
      seconds: Math.floor(ms / 1000).toString(),
    }
  } catch {
    return { ok: false, error: "That date is outside the supported range." }
  }
}

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("")
  const [unit, setUnit] = useState<TimestampUnit>("auto")
  const [dateString, setDateString] = useState("")
  // Start with null so the server-rendered HTML and the first client render
  // agree; the live clock is filled in after hydration.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const parsedTimestamp = timestamp.trim()
    ? parseTimestampInput(timestamp, unit)
    : null
  const parsedDate = dateString.trim() ? parseDateInput(dateString) : null

  const errorMessage =
    parsedTimestamp && !parsedTimestamp.ok
      ? parsedTimestamp.error
      : parsedDate && !parsedDate.ok
        ? parsedDate.error
        : ""

  const handleTimestampChange = (value: string) => {
    setTimestamp(value)
    const parsed = parseTimestampInput(value, unit)
    setDateString(parsed.ok ? parsed.iso : "")
  }

  const handleDateChange = (value: string) => {
    setDateString(value)
    const parsed = parseDateInput(value)
    setTimestamp(parsed.ok ? parsed.seconds : "")
  }

  const handleUnitChange = (nextUnit: TimestampUnit) => {
    setUnit(nextUnit)
    if (timestamp.trim()) {
      const parsed = parseTimestampInput(timestamp, nextUnit)
      setDateString(parsed.ok ? parsed.iso : "")
    }
  }

  const setNowAsTimestamp = () => {
    const seconds = Math.floor(Date.now() / 1000).toString()
    setTimestamp(seconds)
    const parsed = parseTimestampInput(seconds, unit)
    setDateString(parsed.ok ? parsed.iso : "")
  }

  return (
    <div className="space-y-6">
      <ToolResult>
        <p className="text-sm text-muted-foreground mb-1">Current Unix Timestamp</p>
        {now === null ? (
          <p className="text-sm text-muted-foreground">
            The current time loads in your browser.
          </p>
        ) : (
          <>
            <p className="text-2xl font-mono font-bold text-foreground">
              {Math.floor(now / 1000)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(now).toUTCString()}
            </p>
          </>
        )}
      </ToolResult>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="timestamp-input"
            className="text-sm font-medium text-foreground block mb-2"
          >
            Unix Timestamp
          </label>
          <Input
            id="timestamp-input"
            type="text"
            inputMode="numeric"
            value={timestamp}
            onChange={(e) => handleTimestampChange(e.target.value)}
            placeholder="e.g. 946684800"
            className="bg-background/50 font-mono"
            aria-describedby="timestamp-unit-help"
          />

          <div
            id="timestamp-unit-help"
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Unit</span>
            <div
              role="group"
              aria-label="Timestamp unit"
              className="inline-flex rounded-lg border border-border/60 bg-background/50 p-0.5"
            >
              {(
                [
                  ["auto", "Auto"],
                  ["seconds", "Seconds"],
                  ["milliseconds", "Milliseconds"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={unit === value}
                  onClick={() => handleUnitChange(value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    unit === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {unit === "auto" && parsedTimestamp?.ok ? (
              <span className="text-xs text-muted-foreground">
                detected {parsedTimestamp.unit}
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="date-input"
            className="text-sm font-medium text-foreground block mb-2"
          >
            Date or ISO String
          </label>
          <Input
            id="date-input"
            type="text"
            value={dateString}
            onChange={(e) => handleDateChange(e.target.value)}
            placeholder="e.g. 2000-01-01T00:00:00.000Z"
            className="bg-background/50 font-mono"
            aria-describedby="date-timezone-help"
          />
          <p id="date-timezone-help" className="mt-2 text-xs text-muted-foreground">
            ISO values are UTC; Local uses this browser&apos;s timezone.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <p role="status" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <Button onClick={setNowAsTimestamp} variant="outline" className="w-full">
        Use Current Time
      </Button>

      {parsedTimestamp?.ok ? (
        <ToolResult className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Parsed Details</h3>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <span className="text-muted-foreground">UTC:</span>
            <span className="text-foreground font-mono">{parsedTimestamp.date.toUTCString()}</span>
            <span className="text-muted-foreground">Local:</span>
            <span className="text-foreground font-mono">{parsedTimestamp.date.toLocaleString()}</span>
            <span className="text-muted-foreground">ISO:</span>
            <span className="text-foreground font-mono">{parsedTimestamp.iso}</span>
            <span className="text-muted-foreground">Date:</span>
            <span className="text-foreground font-mono">{parsedTimestamp.date.toDateString()}</span>
            <span className="text-muted-foreground">Time:</span>
            <span className="text-foreground font-mono">{parsedTimestamp.date.toTimeString()}</span>
          </div>
        </ToolResult>
      ) : null}
    </div>
  )
}
