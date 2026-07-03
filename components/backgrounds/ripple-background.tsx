"use client"

import { useEffect, useRef } from "react"

/**
 * Ripple / Expanding Rings Background
 * Concentric rings that expand from random points and the mouse.
 * Zen / meditative — water drop effect. Click spawns a ripple.
 * Trending 2026 — mindful UX / calm tech aesthetic.
 */

const MAX_RIPPLES = 12
const AUTO_INTERVAL = 2500
const RIPPLE_SPEED = 2.5
const MAX_RADIUS = 500

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
}

export default function RippleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const ripplesRef = useRef<Ripple[]>([])
  const mouseRef = useRef({ x: -1, y: -1 })

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

    const addRipple = (x: number, y: number) => {
      if (ripplesRef.current.length >= MAX_RIPPLES) ripplesRef.current.shift()
      ripplesRef.current.push({
        x, y, radius: 0,
        maxRadius: MAX_RADIUS + Math.random() * 200,
        opacity: 0.6 + Math.random() * 0.3,
      })
    }

    // Auto-spawn ripples
    const autoInterval = setInterval(() => {
      addRipple(Math.random() * w, Math.random() * h)
    }, AUTO_INTERVAL)

    // Mouse trail ripple
    let mouseTimer = 0
    const mouseTrail = () => {
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        addRipple(mouseRef.current.x, mouseRef.current.y)
      }
    }
    mouseTimer = window.setInterval(mouseTrail, 800)

    const draw = (time: number) => {
      fadeRef.current = Math.min(1, (time - startTime) / 2000)
      ctx.clearRect(0, 0, w, h)

      const ripples = ripplesRef.current

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += RIPPLE_SPEED
        const life = r.radius / r.maxRadius
        if (life >= 1) { ripples.splice(i, 1); continue }

        const alpha = r.opacity * (1 - life) * fadeRef.current

        // Multiple concentric rings
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = r.radius - ring * 15
          if (ringRadius <= 0) continue

          const ringAlpha = alpha * (1 - ring * 0.3)

          ctx.beginPath()
          ctx.arc(r.x, r.y, ringRadius, 0, Math.PI * 2)
          ctx.strokeStyle = ring === 0
            ? `rgba(99,102,241,${ringAlpha})`
            : ring === 1
            ? `rgba(56,189,248,${ringAlpha * 0.7})`
            : `rgba(139,92,246,${ringAlpha * 0.5})`
          ctx.lineWidth = 1.5 - ring * 0.4
          ctx.stroke()
        }

        // Inner glow at origin
        if (life < 0.3) {
          const glowAlpha = (1 - life / 0.3) * alpha * 0.5
          const grad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 30)
          grad.addColorStop(0, `rgba(99,102,241,${glowAlpha})`)
          grad.addColorStop(1, "transparent")
          ctx.fillStyle = grad
          ctx.fillRect(r.x - 30, r.y - 30, 60, 60)
        }
      }

      // Subtle grid pattern
      ctx.strokeStyle = `rgba(99,102,241,${0.03 * fadeRef.current})`
      ctx.lineWidth = 0.5
      const gridSize = 60
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      addRipple(e.clientX - rect.left, e.clientY - rect.top)
    }
    let resizeTimeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
         w = container.offsetWidth; h = container.offsetHeight; canvas.width = w; canvas.height = h 
      }, 150);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("click", onClick)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(autoInterval)
      clearInterval(mouseTimer)
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
