"use client"

import { useEffect, useRef, useCallback } from "react"
import { animate, createScope, stagger } from "animejs"
import type { Scope } from "animejs"

/**
 * Aurora / Gradient Mesh Flow Background
 * Soft morphing gradient blobs (northern lights effect).
 * Trendy 2026 style — used by Apple, Linear, Vercel.
 */

const BLOB_COUNT = 5

const BLOBS = [
  {
    colors: "radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.65) 0%, rgba(59,130,246,0.35) 40%, transparent 70%)",
    size: 750,
    startX: 15,
    startY: 20,
  },
  {
    colors: "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.60) 0%, rgba(168,85,247,0.30) 40%, transparent 70%)",
    size: 650,
    startX: 60,
    startY: 15,
  },
  {
    colors: "radial-gradient(ellipse at 50% 60%, rgba(6,182,212,0.55) 0%, rgba(34,211,238,0.25) 40%, transparent 70%)",
    size: 600,
    startX: 40,
    startY: 65,
  },
  {
    colors: "radial-gradient(ellipse at 70% 30%, rgba(236,72,153,0.45) 0%, rgba(244,114,182,0.20) 40%, transparent 70%)",
    size: 550,
    startX: 75,
    startY: 55,
  },
  {
    colors: "radial-gradient(ellipse at 40% 70%, rgba(52,211,153,0.40) 0%, rgba(16,185,129,0.20) 40%, transparent 70%)",
    size: 500,
    startX: 25,
    startY: 75,
  },
]

export default function AuroraBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef(0)

  useEffect(() => {
    if (!rootRef.current) return

    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      // Entrance: blobs fade in staggered
      animate(".aurora-blob", {
        opacity: [0, 1],
        scale: [0.6, 1],
        duration: 2500,
        ease: "out(3)",
        delay: stagger(300),
      })

      // Continuous organic drift — each blob moves in a unique elliptical path
      BLOBS.forEach((_, i) => {
        const el = rootRef.current?.querySelectorAll(".aurora-blob")[i] as HTMLElement
        if (!el) return

        // Horizontal drift
        animate(el, {
          translateX: [
            { to: `${30 + i * 15}px`, duration: 8000 + i * 2000 },
            { to: `${-25 - i * 12}px`, duration: 9000 + i * 1500 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutSine",
          composition: "none",
        })

        // Vertical drift (different timing for organic feel)
        animate(el, {
          translateY: [
            { to: `${-20 - i * 10}px`, duration: 10000 + i * 1800 },
            { to: `${35 + i * 8}px`, duration: 7000 + i * 2200 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutSine",
          composition: "none",
        })

        // Scale breathing
        animate(el, {
          scale: [
            { to: 1.15, duration: 6000 + i * 1500 },
            { to: 0.9, duration: 7000 + i * 1000 },
          ],
          loop: true,
          alternate: true,
          ease: "inOutQuad",
          composition: "none",
        })

        // Slow rotation for organic blob shape
        animate(el, {
          rotate: [0, 360],
          duration: 40000 + i * 10000,
          loop: true,
          ease: "linear",
          composition: "none",
        })
      })
    })

    // Mouse parallax — blobs subtly follow cursor
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }

    const positions = BLOBS.map(() => ({ x: 0, y: 0 }))
    const tick = () => {
      const mx = (mouseRef.current.x - 0.5) * 2
      const my = (mouseRef.current.y - 0.5) * 2

      rootRef.current?.querySelectorAll(".aurora-blob").forEach((el, i) => {
        const parallaxStrength = 15 + i * 8
        const targetX = mx * parallaxStrength
        const targetY = my * parallaxStrength
        const lerpFactor = 0.02 + i * 0.005

        positions[i].x += (targetX - positions[i].x) * lerpFactor
        positions[i].y += (targetY - positions[i].y) * lerpFactor

        ;(el as HTMLElement).style.marginLeft = `${positions[i].x}px`
        ;(el as HTMLElement).style.marginTop = `${positions[i].y}px`
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
          className="aurora-blob absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.startX}%`,
            top: `${blob.startY}%`,
            background: blob.colors,
            filter: "blur(60px)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  )
}
