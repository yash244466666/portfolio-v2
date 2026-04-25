"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

type ChartType = "bar" | "line" | "pie"

interface DataPoint {
  label: string
  value: number
}

const defaultColors = [
  "#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#10b981",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#3b82f6",
]

const chartTypes: { id: ChartType; label: string }[] = [
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "pie", label: "Pie" },
]

export default function ChartGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [data, setData] = useState<DataPoint[]>([
    { label: "A", value: 40 },
    { label: "B", value: 65 },
    { label: "C", value: 30 },
    { label: "D", value: 80 },
    { label: "E", value: 55 },
  ])
  const [colorScheme, setColorScheme] = useState(0)

  const colorSchemes = [
    { name: "Indigo", colors: ["#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#3b82f6"] },
    { name: "Pastel", colors: ["#a78bfa", "#67e8f9", "#fcd34d", "#fca5a5", "#6ee7b7", "#c4b5fd", "#f9a8d4", "#5eead4", "#fdba74", "#93c5fd"] },
    { name: "Warm", colors: ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6"] },
    { name: "Cool", colors: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#14b8a6", "#06b6d4", "#0ea5e9"] },
  ]

  const addDataPoint = () => {
    setData([...data, { label: String.fromCharCode(65 + data.length), value: Math.floor(Math.random() * 100) + 10 }])
  }

  const removeDataPoint = (index: number) => {
    if (data.length <= 1) return
    setData(data.filter((_, i) => i !== index))
  }

  const updateDataPoint = (index: number, field: "label" | "value", value: string | number) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    setData(updated)
  }

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const colors = colorSchemes[colorScheme].colors

    ctx.clearRect(0, 0, w, h)

    const maxVal = Math.max(...data.map((d) => d.value), 1)
    const padding = { top: 30, right: 30, bottom: 50, left: 50 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    if (chartType === "bar") {
      const barWidth = chartW / data.length * 0.6
      const gap = chartW / data.length * 0.4

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + chartH * (1 - i / 5)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(w - padding.right, y)
        ctx.stroke()
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        ctx.font = "11px monospace"
        ctx.textAlign = "right"
        ctx.fillText(String(Math.round(maxVal * i / 5)), padding.left - 8, y + 4)
      }

      data.forEach((point, i) => {
        const x = padding.left + i * (chartW / data.length) + gap / 2
        const barH = (point.value / maxVal) * chartH
        const y = padding.top + chartH - barH

        ctx.fillStyle = colors[i % colors.length]
        ctx.beginPath()
        const radius = Math.min(4, barWidth / 2)
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + barWidth - radius, y)
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
        ctx.lineTo(x + barWidth, padding.top + chartH)
        ctx.lineTo(x, padding.top + chartH)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.fill()

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(point.label, x + barWidth / 2, padding.top + chartH + 20)

        // Value
        ctx.fillStyle = "rgba(255,255,255,0.9)"
        ctx.font = "bold 11px sans-serif"
        ctx.fillText(String(point.value), x + barWidth / 2, y - 8)
      })
    } else if (chartType === "line") {
      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + chartH * (1 - i / 5)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(w - padding.right, y)
        ctx.stroke()
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        ctx.font = "11px monospace"
        ctx.textAlign = "right"
        ctx.fillText(String(Math.round(maxVal * i / 5)), padding.left - 8, y + 4)
      }

      const stepX = chartW / Math.max(data.length - 1, 1)
      const points = data.map((point, i) => ({
        x: padding.left + i * stepX,
        y: padding.top + chartH - (point.value / maxVal) * chartH,
        label: point.label,
        value: point.value,
      }))

      // Fill area
      ctx.beginPath()
      ctx.moveTo(points[0].x, padding.top + chartH)
      points.forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH)
      ctx.closePath()
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
      gradient.addColorStop(0, colors[0] + "40")
      gradient.addColorStop(1, colors[0] + "05")
      ctx.fillStyle = gradient
      ctx.fill()

      // Line
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const cx = (points[i - 1].x + points[i].x) / 2
        ctx.bezierCurveTo(cx, points[i - 1].y, cx, points[i].y, points[i].x, points[i].y)
      }
      ctx.strokeStyle = colors[0]
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Dots and labels
      points.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = colors[0]
        ctx.fill()
        ctx.fillStyle = "rgba(255,255,255,0.9)"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(String(p.value), p.x, p.y - 12)
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.font = "12px sans-serif"
        ctx.fillText(p.label, p.x, padding.top + chartH + 20)
      })
    } else if (chartType === "pie") {
      const cx = w / 2
      const cy = h / 2
      const radius = Math.min(chartW, chartH) / 2 - 10
      const total = data.reduce((sum, d) => sum + d.value, 0) || 1
      let startAngle = -Math.PI / 2

      data.forEach((point, i) => {
        const sliceAngle = (point.value / total) * Math.PI * 2
        const endAngle = startAngle + sliceAngle

        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()

        // Label
        const midAngle = startAngle + sliceAngle / 2
        const labelRadius = radius * 0.65
        const lx = cx + Math.cos(midAngle) * labelRadius
        const ly = cy + Math.sin(midAngle) * labelRadius

        if (sliceAngle > 0.2) {
          ctx.fillStyle = "rgba(255,255,255,0.9)"
          ctx.font = "bold 12px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(point.label, lx, ly)
        }

        startAngle = endAngle
      })

      // Center circle for donut effect
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = "rgb(10, 10, 10)"
      ctx.fill()

      // Legend
      const legendY = h - 20
      const legendStartX = (w - data.length * 60) / 2
      data.forEach((point, i) => {
        const x = legendStartX + i * 60
        ctx.fillStyle = colors[i % colors.length]
        ctx.fillRect(x, legendY - 8, 12, 12)
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.fillText(point.label, x + 16, legendY - 2)
      })
    }
  }, [data, chartType, colorScheme])

  useEffect(() => {
    drawChart()
  }, [drawChart])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `chart-${chartType}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        {chartTypes.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setChartType(ct.id)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              chartType === ct.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {ct.label}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          {colorSchemes.map((scheme, i) => (
            <button
              key={i}
              onClick={() => setColorScheme(i)}
              className={`w-8 h-8 rounded-full border-2 transition-colors ${
                colorScheme === i ? "border-primary" : "border-border"
              }`}
              style={{ background: `linear-gradient(135deg, ${scheme.colors[0]}, ${scheme.colors[2]})` }}
              title={scheme.name}
            />
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-border/50 bg-[#0a0a0a]"
        style={{ height: "350px" }}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Data Points</h3>
          <Button size="sm" onClick={addDataPoint}>+ Add</Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {data.map((point, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div
                className="w-4 h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: colorSchemes[colorScheme].colors[i % colorSchemes[colorScheme].colors.length] }}
              />
              <Input
                value={point.label}
                onChange={(e) => updateDataPoint(i, "label", e.target.value)}
                placeholder="Label"
                className="bg-background/50 w-24"
              />
              <Input
                type="number"
                value={point.value}
                onChange={(e) => updateDataPoint(i, "value", Number(e.target.value))}
                placeholder="Value"
                className="bg-background/50 w-24"
              />
              <button
                onClick={() => removeDataPoint(i)}
                className="text-muted-foreground hover:text-red-400 text-sm px-2"
                disabled={data.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleDownload} variant="outline">Download as PNG</Button>
      </div>
    </div>
  )
}