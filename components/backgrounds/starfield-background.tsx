"use client"

import { useEffect, useRef } from "react"
import { animate, createScope, stagger } from "animejs"
import type { Scope } from "animejs"

/**
 * Parallax Starfield + Shooting Stars Background
 * Multi-layer star field with depth parallax, twinkling, and occasional shooting stars.
 * Trending 2026 — space / cosmic portfolios (Linear, Vercel, Stripe vibes).
 * Uses anime.js for twinkling + shooting star animations.
 */

const STAR_LAYERS = [
  { count: 120, sizeRange: [1, 1.5], opacity: 0.35, parallax: 0.02, twinkleSpeed: 4000 },
  { count: 80, sizeRange: [1.5, 2.5], opacity: 0.55, parallax: 0.05, twinkleSpeed: 3000 },
  { count: 40, sizeRange: [2.5, 3.5], opacity: 0.75, parallax: 0.09, twinkleSpeed: 2000 },
]

const SHOOTING_STAR_INTERVAL = 3500

interface Star {
  x: number
  y: number
  size: number
  layer: number
}

export default function StarfieldBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scopeRef = useRef<Scope | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const starsRef = useRef<Star[]>([])
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const shootingRef = useRef<{ x: number; y: number; angle: number; progress: number; active: boolean }>({
    x: 0, y: 0, angle: 0, progress: 0, active: false,
  })

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = root.offsetWidth
    let h = root.offsetHeight
    canvas.width = w
    canvas.height = h

    // Generate stars
    const stars: Star[] = []
    STAR_LAYERS.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0])
        stars.push({ x: Math.random() * w, y: Math.random() * h, size, layer: li })
      }
    })
    starsRef.current = stars

    // Animate shooting stars via anime.js scope
    scopeRef.current = createScope({ root }).add(() => {
      // Entrance glow
      animate(".starfield-glow", {
        opacity: [0, 1],
        duration: 3000,
        ease: "out(3)",
      })
    })

    // Shooting star trigger
    const triggerShootingStar = () => {
      if (shootingRef.current.active) return
      shootingRef.current = {
        x: Math.random() * w * 0.7 + w * 0.1,
        y: Math.random() * h * 0.3,
        angle: Math.PI * 0.2 + Math.random() * Math.PI * 0.15,
        progress: 0,
        active: true,
      }
    }

    const shootingInterval = setInterval(triggerShootingStar, SHOOTING_STAR_INTERVAL)

    const startTime = performance.now()

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      fadeRef.current = Math.min(1, (time - startTime) / 2500)

      ctx.clearRect(0, 0, w, h)

      const mx = (mouseRef.current.x - 0.5) * 2
      const my = (mouseRef.current.y - 0.5) * 2

      // Draw stars with parallax + twinkling
      for (const star of starsRef.current) {
        const layer = STAR_LAYERS[star.layer]
        const px = star.x + mx * layer.parallax * w
        const py = star.y + my * layer.parallax * h

        // Twinkling
        const twinkle = 0.5 + 0.5 * Math.sin(elapsed * (Math.PI * 2) / (layer.twinkleSpeed / 1000) + star.x * 0.1)
        const alpha = layer.opacity * twinkle * fadeRef.current

        // Draw star
        ctx.beginPath()
        ctx.arc(px, py, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,225,255,${alpha})`
        ctx.fill()

        // Glow for bigger stars
        if (star.size > 2) {
          ctx.beginPath()
          ctx.arc(px, py, star.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(180,190,255,${alpha * 0.15})`
          ctx.fill()
        }
      }

      // Draw shooting star
      const s = shootingRef.current
      if (s.active) {
        s.progress += 0.025
        if (s.progress >= 1) {
          s.active = false
        } else {
          const len = 120
          const headX = s.x + Math.cos(s.angle) * s.progress * w * 0.5
          const headY = s.y + Math.sin(s.angle) * s.progress * h * 0.5
          const tailX = headX - Math.cos(s.angle) * len
          const tailY = headY - Math.sin(s.angle) * len

          const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
          const brightness = Math.sin(s.progress * Math.PI)
          grad.addColorStop(0, `rgba(255,255,255,0)`)
          grad.addColorStop(0.7, `rgba(200,210,255,${0.3 * brightness * fadeRef.current})`)
          grad.addColorStop(1, `rgba(255,255,255,${0.9 * brightness * fadeRef.current})`)

          ctx.beginPath()
          ctx.moveTo(tailX, tailY)
          ctx.lineTo(headX, headY)
          ctx.strokeStyle = grad
          ctx.lineWidth = 2
          ctx.lineCap = "round"
          ctx.stroke()

          // Head glow
          ctx.beginPath()
          ctx.arc(headX, headY, 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${0.7 * brightness * fadeRef.current})`
          ctx.fill()
        }
      }

      // Subtle nebula glow at center
      const gradient = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.5)
      gradient.addColorStop(0, `rgba(99,102,241,${0.04 * fadeRef.current})`)
      gradient.addColorStop(0.5, `rgba(139,92,246,${0.02 * fadeRef.current})`)
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }

    let resizeTimeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        
      w = root.offsetWidth
      h = root.offsetHeight
      canvas.width = w
      canvas.height = h
    
      }, 150);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("resize", onResize)

    return () => {
      scopeRef.current?.revert()
      cancelAnimationFrame(rafRef.current)
      clearInterval(shootingInterval)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="starfield-glow absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.06) 0%, transparent 60%)",
          opacity: 0,
        }}
      />
    </div>
  )
}
