"use client"

import { useEffect, useRef } from "react"

/**
 * Matrix Rain Background
 * Classic "digital rain" falling characters — katakana, numbers, symbols.
 * Cyberpunk / hacker aesthetic. Trending 2026 — AI-era nostalgia.
 */

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\@#$%"
const FONT_SIZE = 14
const FADE_OPACITY = 0.04

interface Column {
  x: number
  y: number
  speed: number
  chars: string[]
  length: number
}

export default function MatrixRainBackground() {
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

    const columns: Column[] = []
    const colCount = Math.ceil(w / FONT_SIZE)

    const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]

    const initColumns = () => {
      columns.length = 0
      for (let i = 0; i < colCount; i++) {
        const length = 8 + Math.floor(Math.random() * 20)
        const chars: string[] = []
        for (let j = 0; j < length; j++) chars.push(randomChar())
        columns.push({
          x: i * FONT_SIZE,
          y: Math.random() * h * -1,
          speed: 1.5 + Math.random() * 3,
          chars,
          length,
        })
      }
    }
    initColumns()

    const startTime = performance.now()
    let lastFrame = startTime

    const draw = (time: number) => {
      const dt = time - lastFrame
      if (dt < 33) { rafRef.current = requestAnimationFrame(draw); return } // ~30fps cap for aesthetic
      lastFrame = time

      const fadeIn = Math.min(1, (time - startTime) / 2000)

      // Fade trail
      ctx.fillStyle = `rgba(0,0,0,${FADE_OPACITY * fadeIn + 0.02})`
      ctx.fillRect(0, 0, w, h)

      ctx.font = `${FONT_SIZE}px monospace`

      for (const col of columns) {
        col.y += col.speed

        // Occasionally change chars
        if (Math.random() < 0.03) {
          const idx = Math.floor(Math.random() * col.chars.length)
          col.chars[idx] = randomChar()
        }

        for (let j = 0; j < col.chars.length; j++) {
          const cy = col.y - j * FONT_SIZE
          if (cy < -FONT_SIZE || cy > h + FONT_SIZE) continue

          if (j === 0) {
            // Lead character — bright white/green
            ctx.fillStyle = `rgba(180,255,180,${0.95 * fadeIn})`
          } else if (j < 3) {
            ctx.fillStyle = `rgba(0,255,70,${(0.8 - j * 0.15) * fadeIn})`
          } else {
            const alpha = Math.max(0.05, (1 - j / col.length) * 0.5) * fadeIn
            ctx.fillStyle = `rgba(0,${150 + Math.floor(Math.random() * 50)},40,${alpha})`
          }

          ctx.fillText(col.chars[j], col.x, cy)
        }

        // Reset when off screen
        if (col.y - col.length * FONT_SIZE > h) {
          col.y = -col.length * FONT_SIZE - Math.random() * 200
          col.speed = 1.5 + Math.random() * 3
        }
      }

      // Bright glitch flashes
      if (Math.random() < 0.005 * fadeIn) {
        const fx = Math.random() * w
        const fy = Math.random() * h
        ctx.fillStyle = `rgba(0,255,70,${0.1 * fadeIn})`
        ctx.fillRect(fx, fy, Math.random() * 100 + 20, 2)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    // Initial black fill
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, w, h)

    rafRef.current = requestAnimationFrame(draw)

    let resizeTimeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        
      w = container.offsetWidth
      h = container.offsetHeight
      canvas.width = w
      canvas.height = h
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, w, h)
      initColumns()
    
      }, 150);
    }

    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
