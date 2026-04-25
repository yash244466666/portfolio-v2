"use client"

import { useEffect, useRef } from "react"
import { animate, createScope, stagger } from "animejs"
import type { Scope } from "animejs"

/**
 * Fireflies / Luminous Particles Background
 * Glowing orbs that float organically, leave soft trails, and pulse gently.
 * Uses anime.js for the float paths + pulse animations on DOM elements.
 * Trending 2026 — magical/editorial portfolio style (Awwwards-winning pattern).
 */

const FIREFLY_COUNT = 35

const COLORS = [
  "rgba(99,102,241,VAR)",   // Indigo
  "rgba(139,92,246,VAR)",   // Purple
  "rgba(56,189,248,VAR)",   // Sky
  "rgba(52,211,153,VAR)",   // Emerald
  "rgba(251,191,36,VAR)",   // Amber
  "rgba(244,114,182,VAR)",  // Pink
]

function generateFireflies() {
  return Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    size: 3 + Math.random() * 6,
    blur: 8 + Math.random() * 16,
    color: COLORS[i % COLORS.length],
    opacity: 0.3 + Math.random() * 0.4,
    // Unique timing for organic feel
    driftDuration: 8000 + Math.random() * 12000,
    pulseDuration: 2000 + Math.random() * 4000,
    driftRangeX: 30 + Math.random() * 80,
    driftRangeY: 20 + Math.random() * 60,
  }))
}

export default function FirefliesBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const posRef = useRef(Array.from({ length: FIREFLY_COUNT }, () => ({ x: 0, y: 0 })))
  const rafRef = useRef(0)
  const fireflies = useRef(generateFireflies()).current

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!rootRef.current) return

    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      // Entrance: staggered fade + scale
      animate(".firefly", {
        opacity: [0, 1],
        scale: [0, 1],
        duration: 2500,
        ease: "out(4)",
        delay: stagger(60),
      })

      // Each firefly: unique organic drift + pulse
      fireflies.forEach((ff, i) => {
        const el = rootRef.current?.querySelectorAll(".firefly")[i] as HTMLElement
        if (!el) return

        // Horizontal float
        animate(el, {
          translateX: [
            { to: `${ff.driftRangeX}px`, duration: ff.driftDuration },
            { to: `${-ff.driftRangeX * 0.7}px`, duration: ff.driftDuration * 0.85 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutSine",
          composition: "none",
        })

        // Vertical float (offset timing)
        animate(el, {
          translateY: [
            { to: `${-ff.driftRangeY}px`, duration: ff.driftDuration * 1.1 },
            { to: `${ff.driftRangeY * 0.8}px`, duration: ff.driftDuration * 0.9 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutSine",
          delay: ff.driftDuration * 0.3,
          composition: "none",
        })

        // Opacity pulse (breathing glow)
        animate(el, {
          opacity: [
            { to: ff.opacity * 1.6, duration: ff.pulseDuration },
            { to: ff.opacity * 0.3, duration: ff.pulseDuration * 1.5 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutSine",
          composition: "none",
        })

        // Scale pulse
        animate(el, {
          scale: [
            { to: 1.4, duration: ff.pulseDuration * 1.2 },
            { to: 0.7, duration: ff.pulseDuration },
          ],
          loop: true,
          alternate: true,
          ease: "inOutQuad",
          composition: "none",
        })
      })
    })

    // Mouse parallax — fireflies drift away from cursor
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }

    const tick = () => {
      const mx = (mouseRef.current.x - 0.5) * 2
      const my = (mouseRef.current.y - 0.5) * 2

      rootRef.current?.querySelectorAll(".firefly").forEach((el, i) => {
        // Alternate direction: some follow, some flee
        const direction = i % 3 === 0 ? -1 : 1
        const strength = 8 + (i % 5) * 4
        const targetX = mx * strength * direction
        const targetY = my * strength * direction
        const lerp = 0.015 + (i % 4) * 0.005

        posRef.current[i].x += (targetX - posRef.current[i].x) * lerp
        posRef.current[i].y += (targetY - posRef.current[i].y) * lerp

        ;(el as HTMLElement).style.marginLeft = `${posRef.current[i].x}px`
        ;(el as HTMLElement).style.marginTop = `${posRef.current[i].y}px`
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
      {fireflies.map((ff) => (
        <div
          key={ff.id}
          className="firefly absolute rounded-full"
          style={{
            left: `${ff.x}%`,
            top: `${ff.y}%`,
            width: ff.size,
            height: ff.size,
            background: ff.color.replace("VAR", String(ff.opacity)),
            boxShadow: `0 0 ${ff.blur}px ${ff.blur / 2}px ${ff.color.replace("VAR", String(ff.opacity * 0.6))}`,
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Subtle gradient atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.04) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.03) 0%, transparent 50%)",
        }}
      />
    </div>
  )
}
