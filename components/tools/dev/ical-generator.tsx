"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

function formatICalDate(dateStr: string, allDay: boolean): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ""
  const year = d.getFullYear().toString().padStart(4, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  if (allDay) return `${year}${month}${day}`
  const hours = d.getHours().toString().padStart(2, "0")
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const seconds = d.getSeconds().toString().padStart(2, "0")
  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

function generateUID(): string {
  return crypto.randomUUID().replace(/-/g, "")
}

export default function IcalGenerator() {
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("10:00")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [output, setOutput] = useState("")

  const generate = useCallback(() => {
    const startDateTime = allDay
      ? formatICalDate(startDate, true)
      : formatICalDate(`${startDate}T${startTime}`, false)
    const endDateTime = allDay
      ? formatICalDate(endDate, true)
      : formatICalDate(`${endDate}T${endTime}`, false)

    if (!startDateTime || !endDateTime) return

    const now = formatICalDate(new Date().toISOString(), false)
    const uid = generateUID()
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Portfolio Tools//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART${allDay ? ";VALUE=DATE" : ""}:${startDateTime}`,
      `DTEND${allDay ? ";VALUE=DATE" : ""}:${endDateTime}`,
      `SUMMARY:${title.replace(/,/g, "\\,")}`,
    ]
    if (location) lines.push(`LOCATION:${location.replace(/,/g, "\\,")}`)
    if (description) lines.push(`DESCRIPTION:${description.replace(/,/g, "\\,")}`)
    if (url) lines.push(`URL:${url}`)
    lines.push("END:VEVENT", "END:VCALENDAR")

    setOutput(lines.join("\r\n"))
  }, [title, startDate, startTime, endDate, endTime, location, description, url, allDay])

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "event.ics"
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-2">Event Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting with team"
            className="bg-background/50"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background/50"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background/50"
          />
        </div>

        {!allDay && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-2">Location</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Conference Room B"
            className="bg-background/50"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event description..."
            className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-2">URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/meeting"
            className="bg-background/50"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            All-day event
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generate} size="sm">Generate .ics</Button>
        {output && (
          <Button onClick={handleDownload} variant="outline" size="sm">Download .ics</Button>
        )}
      </div>

      {output && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <CopyButton text={output} />
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
          />
        </div>
      )}
    </div>
  )
}