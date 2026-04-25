"use client"

import { useEffect, useRef } from "react"

/**
 * Rain + Lightning Background
 * Falling rain streaks with occasional lightning flash.
 * Atmospheric / moody — trending weather effect for dark portfolios.
 */

const DROP_COUNT = 300
const LIGHTNING_INTERVAL = 6000
const WIND_ANGLE = 0.12 // radians, slight angle

interface RainDrop {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
}

export default function RainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const flashRef = useRef(0)

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

    // Generate drops
    const drops: RainDrop[] = []
    for (let i = 0; i < DROP_COUNT; i++) {
      drops.push({
        x: Math.random() * w * 1.2 - w * 0.1,
        y: Math.random() * h,
        length: 15 + Math.random() * 25,
        speed: 8 + Math.random() * 12,
        opacity: 0.1 + Math.random() * 0.3,
      })
    }

    const startTime = performance.now()
    let lastLightning = 0

    const draw = (time: number) => {
      const now = time - startTime
      fadeRef.current = Math.min(1, now / 2000)

      // Flash decay
      if (flashRef.current > 0) flashRef.current *= 0.88

      // Trigger lightning
      if (now - lastLightning > LIGHTNING_INTERVAL + Math.random() * 4000) {
        flashRef.current = 0.7 + Math.random() * 0.3
        lastLightning = now
      }

      // Background with flash
      ctx.fillStyle = `rgba(3,7,18,${1 - flashRef.current * 0.6})`
      ctx.fillRect(0, 0, w, h)

      // Lightning flash overlay
      if (flashRef.current > 0.05) {
        ctx.fillStyle = `rgba(180,200,255,${flashRef.current * 0.12 * fadeRef.current})`
        ctx.fillRect(0, 0, w, h)
      }

      // Draw rain
      const windX = Math.sin(WIND_ANGLE)
      const windY = Math.cos(WIND_ANGLE)

      for (const drop of drops) {
        drop.y += drop.speed
        drop.x += drop.speed * windX * 0.3

        // Reset when off screen
        if (drop.y > h + 20) {
          drop.y = -drop.length
          drop.x = Math.random() * w * 1.2 - w * 0.1
        }
        if (drop.x > w + 20) {
          drop.x = -10
        }

        const endX = drop.x + windX * drop.length
        const endY = drop.y + windY * drop.length

        const alpha = drop.opacity * fadeRef.current
        const flashBoost = flashRef.current * 0.3

        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = `rgba(150,170,210,${alpha + flashBoost})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Splash at bottom
      for (let i = 0; i < 8; i++) {
        const sx = Math.random() * w
        const sy = h - Math.random() * 3
        ctx.beginPath()
        ctx.arc(sx, sy, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(150,170,210,${0.15 * fadeRef.current})`
        ctx.fill()
      }

      // Subtle fog layer
      const fogGrad = ctx.createLinearGradient(0, h * 0.6, 0, h)
      fogGrad.addColorStop(0, "transparent")
      fogGrad.addColorStop(1, `rgba(30,40,60,${0.3 * fadeRef.current})`)
      ctx.fillStyle = fogGrad
      ctx.fillRect(0, h * 0.6, w, h * 0.4)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onResize = () => { w = container.offsetWidth; h = container.offsetHeight; canvas.width = w; canvas.height = h }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
