export const cronFieldNames = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"] as const

export const cronFieldRanges = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 6 },
] as const

export const dayOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export function describeCron(fields: string[]): string {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields

  const parts: string[] = []

  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every minute"
  }

  // Time
  if (hour !== "*" && minute !== "*") {
    const h = parseInt(hour)
    const m = parseInt(minute)
    const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    parts.push(`at ${timeStr}`)
  } else if (hour !== "*") {
    parts.push(`at hour ${hour}`)
  } else if (minute !== "*") {
    if (minute.includes("/")) {
      parts.push(`every ${minute.split("/")[1]} minutes`)
    } else {
      parts.push(`at minute ${minute}`)
    }
  }

  // Day of week
  if (dayOfWeek !== "*") {
    if (dayOfWeek.includes(",")) {
      parts.push(`on ${dayOfWeek.split(",").map((d) => dayOfWeekNames[parseInt(d)]).join(", ")}`)
    } else {
      parts.push(`on ${dayOfWeekNames[parseInt(dayOfWeek)]}`)
    }
  }

  // Day of month
  if (dayOfMonth !== "*") {
    parts.push(`on day ${dayOfMonth} of the month`)
  }

  // Month
  if (month !== "*") {
    if (month.includes(",")) {
      parts.push(`in ${month.split(",").map((m) => monthNames[parseInt(m)]).join(", ")}`)
    } else {
      parts.push(`in ${monthNames[parseInt(month)]}`)
    }
  }

  if (parts.length === 0) {
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
  }

  return parts.join(", ")
}

export function parseCron(expression: string): string[] | null {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) return null
  return parts
}