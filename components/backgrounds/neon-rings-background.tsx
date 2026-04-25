"use client"

import { useEffect, useRef } from "react"

/**
 * Neon Rings Background
 * Glowing, pulsing concentric circles that breathe.
 * Cyberpunk / retro-futurist aesthetic. Trending 2026 — neon revival.
 */

export default function NeonRingsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

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
    const mouse = { x: w / 2, y: h / 2 }

    const RING_GROUPS = [
      { cx: 0.3, cy: 0.35, rings: 6, baseR: 30, gap: 45, color: [99, 102, 241], speed: 0.6 },
      { cx: 0.7, cy: 0.55, rings: 5, baseR: 40, gap: 50, color: [56, 189, 248], speed: 0.8 },
      { cx: 0.5, cy: 0.25, rings: 4, baseR: 25, gap: 40, color: [139, 92, 246], speed: 0.5 },
      { cx: 0.2, cy: 0.75, rings: 3, baseR: 50, gap: 55, color: [236, 72, 153], speed: 0.7 },
      { cx: 0.8, cy: 0.2, rings: 4, baseR: 35, gap: 42, color: [34, 211, 238], speed: 0.9 },
    ]

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      const fadeIn = Math.min(1, elapsed / 2)
      ctx.clearRect(0, 0, w, h)

      for (const group of RING_GROUPS) {
        const gcx = group.cx * w
        const gcy = group.cy * h

        // Gentle drift toward mouse
        const dx = (mouse.x - gcx) * 0.02
        const dy = (mouse.y - gcy) * 0.02
        const cx = gcx + dx + Math.sin(elapsed * group.speed) * 20
        const cy = gcy + dy + Math.cos(elapsed * group.speed * 0.8) * 15

        for (let i = 0; i < group.rings; i++) {
          const breathe = Math.sin(elapsed * group.speed + i * 0.5) * 0.15 + 1
          const radius = (group.baseR + i * group.gap) * breathe

          const pulseAlpha = (Math.sin(elapsed * group.speed * 2 + i * 0.8) * 0.3 + 0.5)
          const distFade = 1 - (i / group.rings) * 0.6
          const alpha = pulseAlpha * distFade * fadeIn * 0.6

          // Glow (wider, softer)
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${group.color[0]},${group.color[1]},${group.color[2]},${alpha * 0.3})`
          ctx.lineWidth = 6
          ctx.stroke()

          // Core line
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${group.color[0]},${group.color[1]},${group.color[2]},${alpha})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Center glow
        const centerAlpha = (Math.sin(elapsed * group.speed * 1.5) * 0.2 + 0.3) * fadeIn
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, group.baseR * 1.5)
        grad.addColorStop(0, `rgba(${group.color[0]},${group.color[1]},${group.color[2]},${centerAlpha})`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, group.baseR * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Connecting lines between groups
      ctx.lineWidth = 0.5
      for (let i = 0; i < RING_GROUPS.length; i++) {
        for (let j = i + 1; j < RING_GROUPS.length; j++) {
          const a = RING_GROUPS[i], b = RING_GROUPS[j]
          const ax = a.cx * w + Math.sin(elapsed * a.speed) * 20
          const ay = a.cy * h + Math.cos(elapsed * a.speed * 0.8) * 15
          const bx = b.cx * w + Math.sin(elapsed * b.speed) * 20
          const by = b.cy * h + Math.cos(elapsed * b.speed * 0.8) * 15
          const dist = Math.hypot(bx - ax, by - ay)
          if (dist < 500) {
            const lineAlpha = (1 - dist / 500) * 0.08 * fadeIn
            ctx.beginPath()
            ctx.moveTo(ax, ay)
            ctx.lineTo(bx, by)
            ctx.strokeStyle = `rgba(139,92,246,${lineAlpha})`
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    let resizeTimeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
         w = container.offsetWidth; h = container.offsetHeight; canvas.width = w; canvas.height = h 
      }, 150);
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
