"use client"

import { useEffect, useRef, useCallback } from "react"

/**
 * Animated Dot Grid / Matrix Background
 * Uniform grid of dots that responds to mouse proximity.
 * Dots near cursor grow, glow, and change color in a ripple.
 * Minimal/clean — Stripe/Notion-inspired.
 */

const DOT_SPACING = 35
const DOT_BASE_RADIUS = 1.5
const DOT_MAX_RADIUS = 5
const MOUSE_RADIUS = 240
const WAVE_RADIUS = 280
const BASE_COLOR = { r: 100, g: 110, b: 140 }
const GLOW_COLOR = { r: 99, g: 102, b: 241 }
const ACCENT_COLOR = { r: 56, g: 189, b: 248 }

interface Dot {
  x: number
  y: number
  col: number
  row: number
}

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const dotsRef = useRef<Dot[]>([])
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const clickWaveRef = useRef<{ x: number; y: number; time: number; radius: number } | null>(null)

  const buildGrid = useCallback((w: number, h: number) => {
    const dots: Dot[] = []
    const cols = Math.ceil(w / DOT_SPACING) + 2
    const rows = Math.ceil(h / DOT_SPACING) + 2
    const offsetX = (w - (cols - 1) * DOT_SPACING) / 2
    const offsetY = (h - (rows - 1) * DOT_SPACING) / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: offsetX + c * DOT_SPACING,
          y: offsetY + r * DOT_SPACING,
          col: c,
          row: r,
        })
      }
    }
    return dots
  }, [])

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
    dotsRef.current = buildGrid(w, h)

    const startTime = performance.now()

    const draw = (time: number) => {
      const elapsed = time - startTime
      fadeRef.current = Math.min(1, elapsed / 2000)

      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const wave = clickWaveRef.current

      // Advance wave
      if (wave) {
        wave.radius += 6
        if (wave.radius > Math.max(w, h) * 1.5) {
          clickWaveRef.current = null
        }
      }

      for (const dot of dotsRef.current) {
        const dx = dot.x - mx
        const dy = dot.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const mouseInfluence = dist < MOUSE_RADIUS ? 1 - dist / MOUSE_RADIUS : 0

        // Wave effect
        let waveInfluence = 0
        if (wave) {
          const wDist = Math.abs(Math.sqrt((dot.x - wave.x) ** 2 + (dot.y - wave.y) ** 2) - wave.radius)
          if (wDist < WAVE_RADIUS) {
            waveInfluence = (1 - wDist / WAVE_RADIUS) * Math.max(0, 1 - wave.radius / (Math.max(w, h) * 0.8))
          }
        }

        const influence = Math.min(1, mouseInfluence + waveInfluence)

        // Radius
        const radius = DOT_BASE_RADIUS + (DOT_MAX_RADIUS - DOT_BASE_RADIUS) * influence

        // Color interpolation
        const targetColor = waveInfluence > mouseInfluence ? ACCENT_COLOR : GLOW_COLOR
        const r = Math.round(BASE_COLOR.r + (targetColor.r - BASE_COLOR.r) * influence)
        const g = Math.round(BASE_COLOR.g + (targetColor.g - BASE_COLOR.g) * influence)
        const b = Math.round(BASE_COLOR.b + (targetColor.b - BASE_COLOR.b) * influence)
        const alpha = (0.35 + influence * 0.55) * fadeRef.current

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        // Outer glow for strongly influenced dots
        if (influence > 0.4) {
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, radius * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${targetColor.r},${targetColor.g},${targetColor.b},${influence * 0.08 * fadeRef.current})`
          ctx.fill()
        }
      }

      // Mouse glow
      if (mx > 0 && my > 0) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS * 0.8)
        gradient.addColorStop(0, `rgba(${GLOW_COLOR.r},${GLOW_COLOR.g},${GLOW_COLOR.b},${0.04 * fadeRef.current})`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.fillRect(mx - MOUSE_RADIUS, my - MOUSE_RADIUS, MOUSE_RADIUS * 2, MOUSE_RADIUS * 2)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }
    const onMouseLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      clickWaveRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: performance.now(),
        radius: 0,
      }
    }

    const onResize = () => {
      w = container.offsetWidth
      h = container.offsetHeight
      canvas.width = w
      canvas.height = h
      dotsRef.current = buildGrid(w, h)
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("mouseleave", onMouseLeave)
    window.addEventListener("click", onClick)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("click", onClick)
      window.removeEventListener("resize", onResize)
    }
  }, [buildGrid])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
