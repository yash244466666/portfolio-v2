"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  originalX: number
  originalY: number
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>(0)
  const isRunningRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mediaQuery.matches) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return () => {
        window.removeEventListener("resize", resizeCanvas)
      }
    }

    const particles: Particle[] = []

    const colors = ["#8b5cf6", "#06b6d4"]
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      particles.push({
        x,
        y,
        originalX: x,
        originalY: y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current.x = e.clientX
      mousePositionRef.current.y = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    const tick = () => {
      if (!isRunningRef.current) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index]
        const dx = mousePositionRef.current.x - particle.x
        const dy = mousePositionRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const force = (100 - distance) / 100
          particle.vx += (dx / distance) * force * 0.0005
          particle.vy += (dy / distance) * force * 0.0005
        }

        const returnForceX = (particle.originalX - particle.x) * 0.002
        const returnForceY = (particle.originalY - particle.y) * 0.002
        particle.vx += returnForceX
        particle.vy += returnForceY

        particle.vx *= 0.98
        particle.vy *= 0.98

        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fill()

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex++) {
          const otherParticle = particles[otherIndex]
          const linkDx = particle.x - otherParticle.x
          const linkDy = particle.y - otherParticle.y
          const linkDistance = Math.sqrt(linkDx * linkDx + linkDy * linkDy)

          if (linkDistance < 80) {
            const opacity = (1 - linkDistance / 80) * 0.2
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `${particle.color}${Math.floor(opacity * 255)
              .toString(16)
              .padStart(2, "0")}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick)
    }

    const startAnimation = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true
        animationFrameRef.current = requestAnimationFrame(tick)
      }
    }

    const stopAnimation = () => {
      if (isRunningRef.current) {
        isRunningRef.current = false
        if (animationFrameRef.current !== 0) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = 0
        }
      }
    }

    startAnimation()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation()
      } else {
        startAnimation()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      stopAnimation()
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: "transparent" }} />
  )
}
