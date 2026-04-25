"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("")
  const [dateString, setDateString] = useState("")
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const tsToDate = (ts: string) => {
    const num = Number(ts)
    if (isNaN(num)) return ""
    const ms = ts.length === 10 ? num * 1000 : num
    return new Date(ms).toISOString()
  }

  const dateToTs = (date: string) => {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ""
    return Math.floor(d.getTime() / 1000).toString()
  }

  const setNowAsTimestamp = () => {
    const ts = Math.floor(Date.now() / 1000).toString()
    setTimestamp(ts)
    setDateString(tsToDate(ts))
  }

  const handleTimestampChange = (val: string) => {
    setTimestamp(val)
    setDateString(val ? tsToDate(val) : "")
  }

  const handleDateChange = (val: string) => {
    setDateString(val)
    setTimestamp(val ? dateToTs(val) : "")
  }

  const currentUnix = Math.floor(now / 1000)
  const currentUTC = new Date(now).toUTCString()

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1">Current Unix Timestamp</p>
        <p className="text-2xl font-mono font-bold text-foreground">{currentUnix}</p>
        <p className="text-sm text-muted-foreground mt-1">{currentUTC}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Unix Timestamp</label>
          <Input
            type="text"
            value={timestamp}
            onChange={(e) => handleTimestampChange(e.target.value)}
            placeholder="e.g. 1700000000"
            className="bg-background/50 font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">ISO Date String</label>
          <Input
            type="text"
            value={dateString}
            onChange={(e) => handleDateChange(e.target.value)}
            placeholder="e.g. 2024-01-15T00:00:00.000Z"
            className="bg-background/50 font-mono"
          />
        </div>
      </div>

      <Button onClick={setNowAsTimestamp} variant="outline" className="w-full">
        Use Current Time
      </Button>

      {timestamp && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">Parsed Details</h3>
          {(() => {
            const ms = timestamp.length === 10 ? Number(timestamp) * 1000 : Number(timestamp)
            const d = new Date(ms)
            if (isNaN(d.getTime())) return <p className="text-red-400 text-sm">Invalid timestamp</p>
            return (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">UTC:</span><span className="text-foreground font-mono">{d.toUTCString()}</span>
                <span className="text-muted-foreground">Local:</span><span className="text-foreground font-mono">{d.toLocaleString()}</span>
                <span className="text-muted-foreground">ISO:</span><span className="text-foreground font-mono">{d.toISOString()}</span>
                <span className="text-muted-foreground">Date:</span><span className="text-foreground font-mono">{d.toDateString()}</span>
                <span className="text-muted-foreground">Time:</span><span className="text-foreground font-mono">{d.toTimeString()}</span>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}