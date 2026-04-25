"use client"

import { useEffect, useRef, useCallback } from "react"

/**
 * Interactive Particle Constellation Background
 * Floating dots with connecting lines + mouse interaction.
 * Classic developer portfolio look — canvas-based for performance.
 * Anime.js used for smooth entrance fade + mouse glow animation.
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  baseOpacity: number
}

const PARTICLE_COUNT = 80
const CONNECTION_DISTANCE = 160
const MOUSE_RADIUS = 220
const MOUSE_PUSH_STRENGTH = 0.8
const PARTICLE_MIN_SPEED = 0.15
const PARTICLE_MAX_SPEED = 0.5
const BASE_COLOR = { r: 99, g: 102, b: 241 } // Indigo
const ACCENT_COLOR = { r: 56, g: 189, b: 248 } // Sky

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)
  const fadeRef = useRef(0)

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const speed = PARTICLE_MIN_SPEED + Math.random() * (PARTICLE_MAX_SPEED - PARTICLE_MIN_SPEED)
      const angle = Math.random() * Math.PI * 2
      const baseOpacity = 0.45 + Math.random() * 0.45
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        opacity: baseOpacity,
        baseOpacity,
      })
    }
    return particles
  }, [])

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

    particlesRef.current = initParticles(w, h)
    let startTime = performance.now()

    const draw = (time: number) => {
      const elapsed = time - startTime
      // Smooth entrance fade over 2 seconds
      fadeRef.current = Math.min(1, elapsed / 2000)

      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse repulsion
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_PUSH_STRENGTH
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Damping to prevent runaway velocity
        p.vx *= 0.99
        p.vy *= 0.99

        // Minimum speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed < PARTICLE_MIN_SPEED) {
          p.vx = (p.vx / (speed || 1)) * PARTICLE_MIN_SPEED
          p.vy = (p.vy / (speed || 1)) * PARTICLE_MIN_SPEED
        }

        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        // Mouse proximity glow
        const mouseDist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2)
        const mouseInfluence = mouseDist < MOUSE_RADIUS ? 1 - mouseDist / MOUSE_RADIUS : 0

        const r = Math.round(BASE_COLOR.r + (ACCENT_COLOR.r - BASE_COLOR.r) * mouseInfluence)
        const g = Math.round(BASE_COLOR.g + (ACCENT_COLOR.g - BASE_COLOR.g) * mouseInfluence)
        const b = Math.round(BASE_COLOR.b + (ACCENT_COLOR.b - BASE_COLOR.b) * mouseInfluence)
        const alpha = (p.baseOpacity + mouseInfluence * 0.4) * fadeRef.current

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + mouseInfluence * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        // Glow for particles near mouse
        if (mouseInfluence > 0.3) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${ACCENT_COLOR.r},${ACCENT_COLOR.g},${ACCENT_COLOR.b},${mouseInfluence * 0.15 * fadeRef.current})`
          ctx.fill()
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.25 * fadeRef.current

            // Color based on proximity to mouse
            const midX = (particles[i].x + particles[j].x) / 2
            const midY = (particles[i].y + particles[j].y) / 2
            const mouseDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2)
            const mouseInfl = mouseDist < MOUSE_RADIUS ? 1 - mouseDist / MOUSE_RADIUS : 0

            const r = Math.round(BASE_COLOR.r + (ACCENT_COLOR.r - BASE_COLOR.r) * mouseInfl)
            const g = Math.round(BASE_COLOR.g + (ACCENT_COLOR.g - BASE_COLOR.g) * mouseInfl)
            const b = Math.round(BASE_COLOR.b + (ACCENT_COLOR.b - BASE_COLOR.b) * mouseInfl)

            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha + mouseInfl * 0.12})`
            ctx.lineWidth = 0.5 + mouseInfl * 0.8
            ctx.stroke()
          }
        }
      }

      // Mouse glow orb
      if (mx > 0 && my > 0) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS)
        gradient.addColorStop(0, `rgba(${ACCENT_COLOR.r},${ACCENT_COLOR.g},${ACCENT_COLOR.b},${0.06 * fadeRef.current})`)
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

    let resizeTimeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        
      w = container.offsetWidth
      h = container.offsetHeight
      canvas.width = w
      canvas.height = h
      particlesRef.current = initParticles(w, h)
      // startTime = performance.now() // Prevent visible fade-in restart
    
      }, 150);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("mouseleave", onMouseLeave)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("resize", onResize)
    }
  }, [initParticles])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
