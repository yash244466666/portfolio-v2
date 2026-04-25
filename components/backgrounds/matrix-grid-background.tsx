"use client"

import { useEffect, useRef } from "react"

/**
 * Retro-Futuristic Perspective Grid Background
 * Infinite scrolling grid receding into a vanishing point — synthwave/cyberpunk aesthetic.
 * Mouse tilts the perspective. Click creates a pulse wave.
 * Trending 2026 — Tron / neon / web3 style.
 */

const GRID_COLOR = { r: 99, g: 102, b: 241 }
const ACCENT_COLOR = { r: 56, g: 189, b: 248 }
const HORIZON = 0.38
const GRID_LINES_X = 30
const GRID_LINES_Z = 40
const SCROLL_SPEED = 0.4
const GLOW_INTENSITY = 0.6

export default function MatrixGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const pulseRef = useRef<{ time: number; active: boolean }>({ time: 0, active: false })

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = container.offsetWidth
    let h = container.offsetHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const startTime = performance.now()

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      fadeRef.current = Math.min(1, (time - startTime) / 2000)

      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Horizon line position influenced by mouse
      const horizonY = h * (HORIZON - (my - 0.5) * 0.08)
      const vanishX = w * (0.5 + (mx - 0.5) * 0.12)

      // Pulse effect
      let pulseStrength = 0
      if (pulseRef.current.active) {
        const pElapsed = elapsed - pulseRef.current.time
        pulseStrength = Math.max(0, 1 - pElapsed * 0.8) * Math.sin(pElapsed * 8) * 0.5
        if (pElapsed > 2) pulseRef.current.active = false
      }

      const globalAlpha = fadeRef.current

      // ---------- Draw vertical lines (receding to vanishing point) ----------
      for (let i = -GRID_LINES_X / 2; i <= GRID_LINES_X / 2; i++) {
        const spacing = w / GRID_LINES_X
        const bottomX = w / 2 + i * spacing

        const dist = Math.abs(i) / (GRID_LINES_X / 2)
        const alpha = (1 - dist * 0.7) * 0.4 * globalAlpha

        ctx.beginPath()
        ctx.moveTo(vanishX, horizonY)
        ctx.lineTo(bottomX, h + 20)
        ctx.strokeStyle = `rgba(${GRID_COLOR.r},${GRID_COLOR.g},${GRID_COLOR.b},${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // ---------- Draw horizontal lines (scrolling toward viewer) ----------
      for (let i = 0; i < GRID_LINES_Z; i++) {
        // Exponential spacing for perspective
        const t = (i + (elapsed * SCROLL_SPEED) % 1) / GRID_LINES_Z
        const perspectiveY = horizonY + (h - horizonY) * Math.pow(t, 2.2)

        if (perspectiveY < horizonY || perspectiveY > h) continue

        // Width at this depth
        const depthFactor = (perspectiveY - horizonY) / (h - horizonY)
        const lineWidth = w * (0.5 + depthFactor * 1.5)
        const startX = vanishX - lineWidth / 2
        const endX = vanishX + lineWidth / 2

        const alpha = depthFactor * 0.5 * globalAlpha
        const pulseAlpha = alpha + pulseStrength * depthFactor * 0.3

        // Color shifts slightly near viewer
        const r = Math.round(GRID_COLOR.r + (ACCENT_COLOR.r - GRID_COLOR.r) * depthFactor * 0.4)
        const g = Math.round(GRID_COLOR.g + (ACCENT_COLOR.g - GRID_COLOR.g) * depthFactor * 0.4)
        const b = Math.round(GRID_COLOR.b + (ACCENT_COLOR.b - GRID_COLOR.b) * depthFactor * 0.4)

        ctx.beginPath()
        ctx.moveTo(startX, perspectiveY)
        ctx.lineTo(endX, perspectiveY)
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.max(0, pulseAlpha)})`
        ctx.lineWidth = 0.5 + depthFactor * 1.5
        ctx.stroke()
      }

      // ---------- Horizon glow line ----------
      const horizonGrad = ctx.createLinearGradient(0, horizonY - 2, 0, horizonY + 2)
      horizonGrad.addColorStop(0, "transparent")
      horizonGrad.addColorStop(0.5, `rgba(${ACCENT_COLOR.r},${ACCENT_COLOR.g},${ACCENT_COLOR.b},${0.5 * globalAlpha * GLOW_INTENSITY})`)
      horizonGrad.addColorStop(1, "transparent")
      ctx.fillStyle = horizonGrad
      ctx.fillRect(0, horizonY - 10, w, 20)

      // Wider bloom
      const bloomGrad = ctx.createRadialGradient(vanishX, horizonY, 0, vanishX, horizonY, w * 0.4)
      bloomGrad.addColorStop(0, `rgba(${ACCENT_COLOR.r},${ACCENT_COLOR.g},${ACCENT_COLOR.b},${0.08 * globalAlpha})`)
      bloomGrad.addColorStop(0.5, `rgba(${GRID_COLOR.r},${GRID_COLOR.g},${GRID_COLOR.b},${0.03 * globalAlpha})`)
      bloomGrad.addColorStop(1, "transparent")
      ctx.fillStyle = bloomGrad
      ctx.fillRect(0, 0, w, h)

      // ---------- Scanline overlay ----------
      for (let y = 0; y < h; y += 4) {
        ctx.fillStyle = `rgba(0,0,0,${0.04 * globalAlpha})`
        ctx.fillRect(0, y, w, 1)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }

    const onClick = () => {
      pulseRef.current = { time: (performance.now() - startTime) / 1000, active: true }
    }

    let resizeTimeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        
      w = container.offsetWidth
      h = container.offsetHeight
      canvas.width = w
      canvas.height = h
    
      }, 150);
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
