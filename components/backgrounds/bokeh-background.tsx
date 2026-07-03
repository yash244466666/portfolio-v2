"use client"

import { useEffect, useRef } from "react"
import { animate, createScope, stagger } from "animejs"
import type { Scope } from "animejs"

/**
 * Bokeh / Out-of-Focus Lights Background
 * Soft glowing circular orbs of various sizes — camera bokeh effect.
 * Mouse parallax shifts layers. Uses anime.js for float + pulse.
 * Trending 2026 — photography / editorial portfolio aesthetic.
 */

const BOKEH_COUNT = 28

const BOKEH_COLORS = [
  "rgba(99,102,241,VAR)",
  "rgba(139,92,246,VAR)",
  "rgba(56,189,248,VAR)",
  "rgba(244,114,182,VAR)",
  "rgba(52,211,153,VAR)",
  "rgba(251,191,36,VAR)",
  "rgba(168,85,247,VAR)",
]

function generateBokeh() {
  return Array.from({ length: BOKEH_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 40 + Math.random() * 160,
    color: BOKEH_COLORS[i % BOKEH_COLORS.length],
    opacity: 0.06 + Math.random() * 0.12,
    blur: 20 + Math.random() * 40,
    layer: Math.floor(Math.random() * 3), // 0=far, 1=mid, 2=near
    driftDur: 10000 + Math.random() * 15000,
    pulseDur: 4000 + Math.random() * 6000,
    driftX: 20 + Math.random() * 60,
    driftY: 15 + Math.random() * 50,
  }))
}

export default function BokehBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const posRef = useRef(Array.from({ length: BOKEH_COUNT }, () => ({ x: 0, y: 0 })))
  const rafRef = useRef(0)
  const bokehs = useRef(generateBokeh()).current

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!rootRef.current) return

    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      animate(".bokeh-orb", {
        opacity: [0, 1],
        scale: [0.3, 1],
        duration: 3000,
        ease: "out(4)",
        delay: stagger(80),
      })

      bokehs.forEach((b, i) => {
        const el = rootRef.current?.querySelectorAll(".bokeh-orb")[i] as HTMLElement
        if (!el) return

        animate(el, {
          translateX: [
            { to: `${b.driftX}px`, duration: b.driftDur },
            { to: `${-b.driftX * 0.7}px`, duration: b.driftDur * 0.9 },
          ],
          loop: true, alternate: true, ease: "inOutSine", composition: "none",
        })

        animate(el, {
          translateY: [
            { to: `${-b.driftY}px`, duration: b.driftDur * 1.15 },
            { to: `${b.driftY * 0.8}px`, duration: b.driftDur * 0.85 },
          ],
          loop: true, alternate: true, ease: "inOutSine", composition: "none",
        })

        animate(el, {
          opacity: [
            { to: b.opacity * 1.8, duration: b.pulseDur },
            { to: b.opacity * 0.4, duration: b.pulseDur * 1.3 },
          ],
          loop: true, alternate: true, ease: "inOutSine", composition: "none",
        })

        animate(el, {
          scale: [
            { to: 1.15, duration: b.pulseDur * 1.1 },
            { to: 0.85, duration: b.pulseDur * 0.9 },
          ],
          loop: true, alternate: true, ease: "inOutQuad", composition: "none",
        })
      })
    })

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }

    const tick = () => {
      const mx = (mouseRef.current.x - 0.5) * 2
      const my = (mouseRef.current.y - 0.5) * 2

      rootRef.current?.querySelectorAll(".bokeh-orb").forEach((el, i) => {
        const layerStrength = [5, 12, 22][bokehs[i].layer]
        const tx = mx * layerStrength
        const ty = my * layerStrength
        const lerp = 0.02

        posRef.current[i].x += (tx - posRef.current[i].x) * lerp
        posRef.current[i].y += (ty - posRef.current[i].y) * lerp
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
  }, [bokehs])

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      {bokehs.map((b) => (
        <div
          key={b.id}
          className="bokeh-orb absolute rounded-full"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            background: b.color.replace("VAR", String(b.opacity)),
            filter: `blur(${b.blur}px)`,
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  )
}
