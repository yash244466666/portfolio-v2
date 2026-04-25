"use client"

import { useEffect, useRef } from "react"

/**
 * Spotlight Background
 * Dramatic cursor-following spotlight with volumetric light cone.
 * Theatrical / presentation aesthetic.
 * Trending 2026 — "hero spotlight" / cinematic UI.
 */

export default function SpotlightBackground() {
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

    const startTime = performance.now()
    const target = { x: w / 2, y: h / 2 }
    const current = { x: w / 2, y: h / 2 }

    // Secondary ambient lights
    const ambients = [
      { x: 0.2, y: 0.3, r: 300, color: [99, 102, 241], phase: 0, speed: 0.3 },
      { x: 0.75, y: 0.6, r: 250, color: [139, 92, 246], phase: 1.5, speed: 0.4 },
      { x: 0.5, y: 0.8, r: 280, color: [56, 189, 248], phase: 3, speed: 0.35 },
    ]

    // Dust particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.3,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.3,
      })
    }

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      const fadeIn = Math.min(1, elapsed / 2)

      // Smooth follow
      current.x += (target.x - current.x) * 0.05
      current.y += (target.y - current.y) * 0.05

      // Dark base
      ctx.fillStyle = "rgba(2,2,8,1)"
      ctx.fillRect(0, 0, w, h)

      // Ambient lights
      for (const amb of ambients) {
        const ax = amb.x * w + Math.sin(elapsed * amb.speed + amb.phase) * 40
        const ay = amb.y * h + Math.cos(elapsed * amb.speed * 0.7 + amb.phase) * 30
        const pulse = Math.sin(elapsed * amb.speed * 2 + amb.phase) * 0.15 + 0.85
        const grad = ctx.createRadialGradient(ax, ay, 0, ax, ay, amb.r * pulse)
        grad.addColorStop(0, `rgba(${amb.color[0]},${amb.color[1]},${amb.color[2]},${0.08 * fadeIn})`)
        grad.addColorStop(0.5, `rgba(${amb.color[0]},${amb.color[1]},${amb.color[2]},${0.03 * fadeIn})`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      // Main spotlight — large soft radial gradient
      const spotR = 350 + Math.sin(elapsed * 0.5) * 30
      const spotGrad = ctx.createRadialGradient(current.x, current.y, 0, current.x, current.y, spotR)
      spotGrad.addColorStop(0, `rgba(200,210,255,${0.12 * fadeIn})`)
      spotGrad.addColorStop(0.2, `rgba(99,102,241,${0.08 * fadeIn})`)
      spotGrad.addColorStop(0.5, `rgba(99,102,241,${0.03 * fadeIn})`)
      spotGrad.addColorStop(1, "transparent")
      ctx.fillStyle = spotGrad
      ctx.fillRect(0, 0, w, h)

      // Inner bright core
      const coreGrad = ctx.createRadialGradient(current.x, current.y, 0, current.x, current.y, 80)
      coreGrad.addColorStop(0, `rgba(255,255,255,${0.05 * fadeIn})`)
      coreGrad.addColorStop(0.5, `rgba(99,102,241,${0.04 * fadeIn})`)
      coreGrad.addColorStop(1, "transparent")
      ctx.fillStyle = coreGrad
      ctx.fillRect(0, 0, w, h)

      // Volumetric rays from spotlight
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      const rayCount = 8
      for (let i = 0; i < rayCount; i++) {
        const angle = (Math.PI * 2 / rayCount) * i + elapsed * 0.1
        const rayLen = spotR * 0.8
        const rayWidth = 0.04 + Math.sin(elapsed * 0.8 + i) * 0.02

        ctx.beginPath()
        ctx.moveTo(current.x, current.y)
        ctx.lineTo(
          current.x + Math.cos(angle - rayWidth) * rayLen,
          current.y + Math.sin(angle - rayWidth) * rayLen
        )
        ctx.lineTo(
          current.x + Math.cos(angle + rayWidth) * rayLen,
          current.y + Math.sin(angle + rayWidth) * rayLen
        )
        ctx.closePath()

        const rayAlpha = (Math.sin(elapsed + i * 0.8) * 0.3 + 0.5) * 0.02 * fadeIn
        ctx.fillStyle = `rgba(99,102,241,${rayAlpha})`
        ctx.fill()
      }
      ctx.restore()

      // Dust particles illuminated by spotlight
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w }
        if (p.x < -5 || p.x > w + 5) { p.x = Math.random() * w; p.y = Math.random() * h }

        const dist = Math.hypot(p.x - current.x, p.y - current.y)
        const inSpot = Math.max(0, 1 - dist / spotR)
        const alpha = (p.alpha * 0.2 + inSpot * p.alpha * 0.8) * fadeIn

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,210,255,${alpha})`
        ctx.fill()
      }

      // Subtle vignette
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7)
      vigGrad.addColorStop(0, "transparent")
      vigGrad.addColorStop(1, `rgba(0,0,0,${0.3 * fadeIn})`)
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, w, h)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => { target.x = e.clientX; target.y = e.clientY }
    const onResize = () => { w = container.offsetWidth; h = container.offsetHeight; canvas.width = w; canvas.height = h }

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
