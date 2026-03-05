"use client"

import { useEffect, useRef } from "react"

/**
 * Topography / Contour Map Background
 * Flowing contour lines reminiscent of elevation maps.
 * Mouse proximity warps the contour field. Minimalist & editorial.
 * Trending 2026 — data-viz / cartography aesthetic.
 */

const LINE_COUNT = 28
const BASE_COLOR = { r: 99, g: 102, b: 241 }
const ACCENT_COLOR = { r: 56, g: 189, b: 248 }
const MOUSE_RADIUS = 250

export default function TopographyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(0)
  const fadeRef = useRef(0)

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
    const startTime = performance.now()

    // Simple noise function
    const noise = (x: number, y: number, t: number) => {
      return (
        Math.sin(x * 0.012 + t * 0.3) * 0.5 +
        Math.sin(y * 0.015 - t * 0.2) * 0.3 +
        Math.sin((x + y) * 0.008 + t * 0.15) * 0.4 +
        Math.cos(x * 0.02 - y * 0.01 + t * 0.25) * 0.3
      )
    }

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      fadeRef.current = Math.min(1, (time - startTime) / 2000)
      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < LINE_COUNT; i++) {
        const threshold = -1.5 + (i / LINE_COUNT) * 3
        const points: { x: number; y: number }[] = []
        const step = 6

        // March through grid to find contour
        for (let x = 0; x < w; x += step) {
          for (let y = 0; y < h; y += step) {
            // Mouse warp
            const dx = x - mx
            const dy = y - my
            const dist = Math.sqrt(dx * dx + dy * dy)
            const warp = dist < MOUSE_RADIUS ? (1 - dist / MOUSE_RADIUS) * 0.6 : 0

            const val = noise(x, y, elapsed) + warp
            const valR = noise(x + step, y, elapsed)
            const valB = noise(x, y + step, elapsed)

            // Simple contour detection
            if ((val - threshold) * (valR - threshold) < 0 || (val - threshold) * (valB - threshold) < 0) {
              points.push({ x, y })
            }
          }
        }

        // Draw contour dots as connected segments
        if (points.length === 0) continue

        const depth = i / LINE_COUNT
        const r = Math.round(BASE_COLOR.r + (ACCENT_COLOR.r - BASE_COLOR.r) * depth)
        const g = Math.round(BASE_COLOR.g + (ACCENT_COLOR.g - BASE_COLOR.g) * depth)
        const b = Math.round(BASE_COLOR.b + (ACCENT_COLOR.b - BASE_COLOR.b) * depth)
        const alpha = (0.15 + depth * 0.25) * fadeRef.current

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        for (const p of points) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1 + depth * 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Mouse glow
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS)
        grad.addColorStop(0, `rgba(${ACCENT_COLOR.r},${ACCENT_COLOR.g},${ACCENT_COLOR.b},${0.06 * fadeRef.current})`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.fillRect(mx - MOUSE_RADIUS, my - MOUSE_RADIUS, MOUSE_RADIUS * 2, MOUSE_RADIUS * 2)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    const onResize = () => { w = container.offsetWidth; h = container.offsetHeight; canvas.width = w; canvas.height = h }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("mouseleave", onMouseLeave)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
