"use client"

import { useEffect, useRef } from "react"
import { animate, createScope, stagger } from "animejs"
import type { Scope } from "animejs"

/**
 * Floating Glassmorphism Blobs Background
 * Large semi-transparent gradient orbs with backdrop-blur (frosted glass).
 * Glassmorphism 2.0 — top 2026 trend. Modern layered depth.
 */

const BLOBS = [
  {
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.7) 0%, rgba(139,92,246,0.4) 100%)",
    size: 500,
    x: 20,
    y: 25,
    blur: 40,
  },
  {
    gradient: "linear-gradient(225deg, rgba(56,189,248,0.65) 0%, rgba(6,182,212,0.35) 100%)",
    size: 420,
    x: 70,
    y: 20,
    blur: 35,
  },
  {
    gradient: "linear-gradient(315deg, rgba(236,72,153,0.55) 0%, rgba(244,114,182,0.30) 100%)",
    size: 380,
    x: 55,
    y: 65,
    blur: 30,
  },
  {
    gradient: "linear-gradient(45deg, rgba(52,211,153,0.50) 0%, rgba(16,185,129,0.25) 100%)",
    size: 350,
    x: 15,
    y: 70,
    blur: 28,
  },
  {
    gradient: "linear-gradient(180deg, rgba(251,191,36,0.45) 0%, rgba(245,158,11,0.20) 100%)",
    size: 320,
    x: 80,
    y: 55,
    blur: 25,
  },
  {
    gradient: "linear-gradient(90deg, rgba(99,102,241,0.40) 0%, rgba(56,189,248,0.25) 100%)",
    size: 550,
    x: 45,
    y: 40,
    blur: 45,
  },
]

export default function GlassmorphismBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const positionsRef = useRef(BLOBS.map(() => ({ x: 0, y: 0 })))
  const rafRef = useRef(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!rootRef.current) return

    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      // Entrance: staggered scale + fade
      animate(".glass-blob", {
        opacity: [0, 1],
        scale: [0.3, 1],
        duration: 2000,
        ease: "out(4)",
        delay: stagger(200),
      })

      // Each blob: unique floating orbit
      BLOBS.forEach((blob, i) => {
        const el = rootRef.current?.querySelectorAll(".glass-blob")[i] as HTMLElement
        if (!el) return

        // Horizontal float
        animate(el, {
          translateX: [
            { to: `${25 + i * 12}px`, duration: 7000 + i * 1500 },
            { to: `${-20 - i * 10}px`, duration: 8000 + i * 1200 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutSine",
          composition: "none",
        })

        // Vertical float
        animate(el, {
          translateY: [
            { to: `${-15 - i * 8}px`, duration: 9000 + i * 1800 },
            { to: `${30 + i * 6}px`, duration: 6500 + i * 2000 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutSine",
          composition: "none",
        })

        // Slow rotation
        animate(el, {
          rotate: [0, i % 2 === 0 ? 360 : -360],
          duration: 50000 + i * 8000,
          loop: true,
          ease: "linear",
          composition: "none",
        })

        // Scale pulse
        animate(el, {
          scale: [
            { to: 1.1, duration: 5000 + i * 2000 },
            { to: 0.92, duration: 6000 + i * 1500 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutQuad",
          composition: "none",
        })
      })
    })

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }

    const tick = () => {
      const mx = (mouseRef.current.x - 0.5) * 2
      const my = (mouseRef.current.y - 0.5) * 2

      rootRef.current?.querySelectorAll(".glass-blob").forEach((el, i) => {
        const strength = 10 + i * 6
        const targetX = mx * strength
        const targetY = my * strength
        const lerp = 0.025 + i * 0.004

        positionsRef.current[i].x += (targetX - positionsRef.current[i].x) * lerp
        positionsRef.current[i].y += (targetY - positionsRef.current[i].y) * lerp

        ;(el as HTMLElement).style.marginLeft = `${positionsRef.current[i].x}px`
        ;(el as HTMLElement).style.marginTop = `${positionsRef.current[i].y}px`
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    window.addEventListener("mousemove", onMouseMove, { passive: true })

    return () => {
      scopeRef.current?.revert()
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="glass-blob absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            background: blob.gradient,
            borderRadius: "30% 70% 53% 47% / 26% 46% 54% 74%",
            filter: `blur(${blob.blur}px)`,
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Very subtle darkening for depth — no blur to keep blobs vivid */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(3,7,18,0.10)",
        }}
      />
    </div>
  )
}
