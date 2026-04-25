"use client"

import { useEffect, useRef } from "react"

/**
 * Hexagon Grid Background
 * Honeycomb pattern with pulse effects — hover highlights neighbors.
 * Trending 2026 — geometric minimalism / sci-fi data visualisation.
 */

export default function HexagonGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = container.offsetWidth
    let h = container.offsetHeight
    canvas.width = w
    canvas.height = h

    const SIZE = 30 // hex radius
    const GAP = 4
    const mouse = { x: -1000, y: -1000 }
    const pulses: { cx: number; cy: number; time: number }[] = []
    const startTime = performance.now()

    interface Hex { cx: number; cy: number; col: number; row: number }

    const buildGrid = (): Hex[] => {
      const hexes: Hex[] = []
      const hSpacing = (SIZE + GAP) * Math.sqrt(3)
      const vSpacing = (SIZE + GAP) * 1.5
      const cols = Math.ceil(w / hSpacing) + 2
      const rows = Math.ceil(h / vSpacing) + 2

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const offset = row % 2 === 0 ? 0 : hSpacing / 2
          const cx = col * hSpacing + offset
          const cy = row * vSpacing
          hexes.push({ cx, cy, col, row })
        }
      }
      return hexes
    }

    let hexes = buildGrid()

    const drawHex = (cx: number, cy: number, r: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      const fadeIn = Math.min(1, elapsed / 2)

      ctx.clearRect(0, 0, w, h)

      // Remove expired pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        if (time - pulses[i].time > 1500) pulses.splice(i, 1)
      }

      for (const hex of hexes) {
        const dist = Math.hypot(hex.cx - mouse.x, hex.cy - mouse.y)
        const hover = Math.max(0, 1 - dist / 200)

        // Pulse proximity
        let pulseGlow = 0
        for (const p of pulses) {
          const pDist = Math.hypot(hex.cx - p.cx, hex.cy - p.cy)
          const pTime = (time - p.time) / 1500
          const waveRadius = pTime * 400
          const waveDist = Math.abs(pDist - waveRadius)
          if (waveDist < 60) {
            pulseGlow += (1 - waveDist / 60) * (1 - pTime) * 0.6
          }
        }
        pulseGlow = Math.min(1, pulseGlow)

        // Ambient wave
        const wave = Math.sin(elapsed * 0.5 + hex.col * 0.3 + hex.row * 0.2) * 0.1 + 0.1

        const alpha = (wave + hover * 0.5 + pulseGlow * 0.7) * fadeIn

        // Fill
        if (alpha > 0.01) {
          drawHex(hex.cx, hex.cy, SIZE)
          const r = Math.round(99 + pulseGlow * 60)
          const g = Math.round(102 + hover * 80 + pulseGlow * 50)
          const b = Math.round(241)
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.25})`
          ctx.fill()
        }

        // Stroke
        drawHex(hex.cx, hex.cy, SIZE)
        const strokeAlpha = (0.08 + hover * 0.25 + pulseGlow * 0.4) * fadeIn
        ctx.strokeStyle = `rgba(99,102,241,${strokeAlpha})`
        ctx.lineWidth = hover > 0.3 ? 1.2 : 0.5
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      pulses.push({ cx: e.clientX - rect.left, cy: e.clientY - rect.top, time: performance.now() })
    }
    const onResize = () => {
      w = container.offsetWidth; h = container.offsetHeight
      canvas.width = w; canvas.height = h
      hexes = buildGrid()
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("click", onClick)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("click", onClick)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
