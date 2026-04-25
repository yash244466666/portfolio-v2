"use client"

import { useEffect, useRef } from "react"

/**
 * Constellation Background
 * Star map with connected lines — stars twinkle, mouse reveals connections.
 * Trending 2026 — data-viz inspired / cosmos aesthetic.
 */

interface Star {
  x: number
  y: number
  z: number // depth layer 0–1
  radius: number
  twinkleSpeed: number
  twinkleOffset: number
}

const STAR_COUNT = 200
const CONNECTION_DISTANCE = 120
const MOUSE_REVEAL_RADIUS = 250

export default function ConstellationBackground() {
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

    const mouse = { x: w / 2, y: h / 2 }
    const startTime = performance.now()

    const stars: Star[] = []
    const initStars = () => {
      stars.length = 0
      for (let i = 0; i < STAR_COUNT; i++) {
        const z = Math.random()
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          radius: 0.5 + z * 2,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
        })
      }
    }
    initStars()

    // Pre-compute fixed constellation lines (a subset of close pairs)
    let constellationPairs: [number, number][] = []
    const buildConstellations = () => {
      constellationPairs = []
      for (let i = 0; i < stars.length; i++) {
        let closest = -1
        let closestDist = CONNECTION_DISTANCE * 2
        for (let j = i + 1; j < stars.length; j++) {
          const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y)
          if (d < closestDist && d < CONNECTION_DISTANCE * 1.5) {
            closestDist = d
            closest = j
          }
        }
        if (closest >= 0) constellationPairs.push([i, closest])
      }
    }
    buildConstellations()

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      const fadeIn = Math.min(1, elapsed / 2.5)
      ctx.clearRect(0, 0, w, h)

      // Subtle parallax shift
      const px = (mouse.x - w / 2) * 0.01
      const py = (mouse.y - h / 2) * 0.01

      // Draw constellation lines (always visible, faint)
      ctx.lineWidth = 0.4
      for (const [i, j] of constellationPairs) {
        const a = stars[i], b = stars[j]
        const ax = a.x + px * a.z, ay = a.y + py * a.z
        const bx = b.x + px * b.z, by = b.y + py * b.z
        const d = Math.hypot(bx - ax, by - ay)
        const alpha = Math.max(0, 1 - d / (CONNECTION_DISTANCE * 1.5)) * 0.15 * fadeIn
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.strokeStyle = `rgba(99,102,241,${alpha})`
        ctx.stroke()
      }

      // Mouse-reveal connections
      ctx.lineWidth = 0.6
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i]
        const ax = a.x + px * a.z, ay = a.y + py * a.z
        const mouseDist = Math.hypot(ax - mouse.x, ay - mouse.y)
        if (mouseDist > MOUSE_REVEAL_RADIUS) continue

        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j]
          const bx = b.x + px * b.z, by = b.y + py * b.z
          const bMouseDist = Math.hypot(bx - mouse.x, by - mouse.y)
          if (bMouseDist > MOUSE_REVEAL_RADIUS) continue

          const d = Math.hypot(bx - ax, by - ay)
          if (d > CONNECTION_DISTANCE) continue

          const proximity = (1 - mouseDist / MOUSE_REVEAL_RADIUS) * (1 - bMouseDist / MOUSE_REVEAL_RADIUS)
          const alpha = proximity * (1 - d / CONNECTION_DISTANCE) * 0.5 * fadeIn

          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
          ctx.strokeStyle = `rgba(56,189,248,${alpha})`
          ctx.stroke()
        }
      }

      // Draw stars
      for (const star of stars) {
        const sx = star.x + px * star.z
        const sy = star.y + py * star.z

        const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset) * 0.4 + 0.6
        const mouseDist = Math.hypot(sx - mouse.x, sy - mouse.y)
        const mouseGlow = mouseDist < MOUSE_REVEAL_RADIUS ? (1 - mouseDist / MOUSE_REVEAL_RADIUS) * 0.5 : 0

        const alpha = (twinkle * (0.3 + star.z * 0.7) + mouseGlow) * fadeIn
        const r = star.radius * (1 + mouseGlow * 0.8)

        // Glow
        if (r > 1 || mouseGlow > 0.1) {
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4)
          grad.addColorStop(0, `rgba(99,102,241,${alpha * 0.3})`)
          grad.addColorStop(1, "transparent")
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(sx, sy, r * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Core
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,210,255,${alpha})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    const onResize = () => {
      w = container.offsetWidth; h = container.offsetHeight
      canvas.width = w; canvas.height = h
      initStars(); buildConstellations()
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
