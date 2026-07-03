"use client"

import { useEffect, useRef } from "react"

/**
 * Vortex / Spiral Tunnel Background
 * Particles spiraling toward a center vanishing point — hyperspace effect.
 * Mouse shifts the vortex center. Click accelerates.
 * Trending 2026 — sci-fi / warp / immersive tech aesthetic.
 */

const PARTICLE_COUNT = 400
const BASE_COLOR = { r: 99, g: 102, b: 241 }
const ACCENT_COLOR = { r: 139, g: 92, b: 246 }
const FAR_COLOR = { r: 56, g: 189, b: 248 }

interface VortexParticle {
  angle: number
  radius: number
  z: number
  speed: number
  size: number
}

export default function VortexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const boostRef = useRef(1)

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

    const particles: VortexParticle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * Math.max(w, h) * 0.6,
        z: Math.random(),
        speed: 0.002 + Math.random() * 0.008,
        size: 1 + Math.random() * 2,
      })
    }

    const startTime = performance.now()

    const draw = (time: number) => {
      fadeRef.current = Math.min(1, (time - startTime) / 2000)
      boostRef.current += (1 - boostRef.current) * 0.02 // decay back to 1

      ctx.fillStyle = `rgba(3,7,18,0.15)`
      ctx.fillRect(0, 0, w, h)

      const cx = w * (0.5 + (mouseRef.current.x - 0.5) * 0.2)
      const cy = h * (0.5 + (mouseRef.current.y - 0.5) * 0.2)

      for (const p of particles) {
        p.angle += p.speed * boostRef.current
        p.z -= 0.003 * boostRef.current

        if (p.z <= 0) {
          p.z = 1
          p.radius = Math.random() * Math.max(w, h) * 0.6
          p.angle = Math.random() * Math.PI * 2
        }

        const projectedRadius = p.radius * p.z
        const px = cx + Math.cos(p.angle) * projectedRadius
        const py = cy + Math.sin(p.angle) * projectedRadius

        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue

        const depth = 1 - p.z
        const r = Math.round(FAR_COLOR.r + (ACCENT_COLOR.r - FAR_COLOR.r) * depth)
        const g = Math.round(FAR_COLOR.g + (ACCENT_COLOR.g - FAR_COLOR.g) * depth)
        const b = Math.round(FAR_COLOR.b + (ACCENT_COLOR.b - FAR_COLOR.b) * depth)
        const alpha = (0.3 + depth * 0.6) * fadeRef.current

        const drawSize = p.size * (0.3 + depth * 1.5)

        ctx.beginPath()
        ctx.arc(px, py, drawSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        // Trail
        const trailAngle = p.angle - p.speed * 4
        const tx = cx + Math.cos(trailAngle) * projectedRadius
        const ty = cy + Math.sin(trailAngle) * projectedRadius
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(tx, ty)
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.3})`
        ctx.lineWidth = drawSize * 0.5
        ctx.stroke()
      }

      // Center glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150)
      grad.addColorStop(0, `rgba(${BASE_COLOR.r},${BASE_COLOR.g},${BASE_COLOR.b},${0.08 * fadeRef.current})`)
      grad.addColorStop(1, "transparent")
      ctx.fillStyle = grad
      ctx.fillRect(cx - 150, cy - 150, 300, 300)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }
    const onClick = () => { boostRef.current = 3 }
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
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("click", onClick)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#030712]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
