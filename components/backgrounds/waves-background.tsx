"use client"

import { useEffect, useRef } from "react"
import { animate, createScope, stagger } from "animejs"
import type { Scope } from "animejs"

/**
 * Motion Narrative Waves Background
 * Layered flowing SVG sine waves, scroll-reactive.
 * Organic and editorial — popular in creative portfolios.
 */

const WAVE_LAYERS = [
  { color: "rgba(99,102,241,0.22)", amplitude: 45, frequency: 0.008, speed: 0.3, yOffset: 0.55 },
  { color: "rgba(139,92,246,0.18)", amplitude: 40, frequency: 0.010, speed: -0.4, yOffset: 0.60 },
  { color: "rgba(56,189,248,0.15)", amplitude: 55, frequency: 0.006, speed: 0.5, yOffset: 0.50 },
  { color: "rgba(6,182,212,0.12)", amplitude: 35, frequency: 0.012, speed: -0.35, yOffset: 0.65 },
  { color: "rgba(236,72,153,0.10)", amplitude: 50, frequency: 0.007, speed: 0.25, yOffset: 0.45 },
]

export default function WavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const scrollRef = useRef(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !rootRef.current) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = container.offsetWidth
    let h = container.offsetHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    // Animate floating particles (small dots along waves)
    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      animate(".wave-dot", {
        opacity: [0, 0.6],
        scale: [0, 1],
        duration: 3000,
        ease: "out(4)",
        delay: stagger(80),
      })
    })

    const startTime = performance.now()

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      fadeRef.current = Math.min(1, (time - startTime) / 2500)

      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const scrollOffset = scrollRef.current * 0.1

      for (const layer of WAVE_LAYERS) {
        const baseY = h * layer.yOffset

        ctx.beginPath()
        ctx.moveTo(0, h)

        for (let x = 0; x <= w; x += 3) {
          const normalX = x / w
          // Mouse influence on wave
          const mouseDist = Math.abs(normalX - mx)
          const mouseInfluence = mouseDist < 0.3 ? (1 - mouseDist / 0.3) * 15 : 0

          const y =
            baseY +
            Math.sin(x * layer.frequency + elapsed * layer.speed + scrollOffset) * layer.amplitude +
            Math.sin(x * layer.frequency * 2.5 + elapsed * layer.speed * 0.7) * (layer.amplitude * 0.3) +
            Math.cos(x * layer.frequency * 0.5 + elapsed * layer.speed * 1.3) * (layer.amplitude * 0.5) -
            mouseInfluence * (my - 0.5) * 2

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.lineTo(w, h)
        ctx.lineTo(0, h)
        ctx.closePath()

        ctx.fillStyle = layer.color.replace(
          /[\d.]+\)$/,
          `${parseFloat(layer.color.match(/[\d.]+\)$/)?.[0] || "0.1") * fadeRef.current})`
        )
        ctx.fill()

        // Subtle stroke on top wave edge
        ctx.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const normalX = x / w
          const mouseDist = Math.abs(normalX - mx)
          const mouseInfluence = mouseDist < 0.3 ? (1 - mouseDist / 0.3) * 15 : 0

          const y =
            baseY +
            Math.sin(x * layer.frequency + elapsed * layer.speed + scrollOffset) * layer.amplitude +
            Math.sin(x * layer.frequency * 2.5 + elapsed * layer.speed * 0.7) * (layer.amplitude * 0.3) +
            Math.cos(x * layer.frequency * 0.5 + elapsed * layer.speed * 1.3) * (layer.amplitude * 0.5) -
            mouseInfluence * (my - 0.5) * 2

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = layer.color.replace(/[\d.]+\)$/, `${0.3 * fadeRef.current})`)
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Ambient glow at mouse position
      if (mx > 0 && my > 0) {
        const gx = mx * w
        const gy = my * h
        const gradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, 250)
        gradient.addColorStop(0, `rgba(99,102,241,${0.06 * fadeRef.current})`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.fillRect(gx - 250, gy - 250, 500, 500)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }
    const onScroll = () => {
      scrollRef.current = window.scrollY
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
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)

    return () => {
      scopeRef.current?.revert()
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  // Floating dots for extra depth
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 30 + Math.random() * 50,
    size: 2 + Math.random() * 3,
  }))

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Floating accent dots */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="wave-dot absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            backgroundColor: "rgba(99,102,241,0.5)",
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
