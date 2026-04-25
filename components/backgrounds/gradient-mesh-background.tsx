"use client"

import { animate, createScope } from "animejs"
import { useEffect, useRef } from "react"

import type { Scope } from "animejs"

/**
 * Gradient Mesh Background
 * Stripe / Linear-style animated gradient mesh — large soft blobs that morph.
 * Uses anime.js DOM animations with blur filters for a premium SaaS feel.
 * Trending 2026 — "aurora mesh" / gradient everything.
 */

const BLOBS = [
  { color: "from-indigo-500/30 to-purple-600/20", size: "w-[600px] h-[600px]", x: "15%", y: "10%", dur: 18000 },
  { color: "from-cyan-400/25 to-blue-500/15", size: "w-[500px] h-[500px]", x: "60%", y: "15%", dur: 22000 },
  { color: "from-violet-500/20 to-fuchsia-500/15", size: "w-[550px] h-[550px]", x: "40%", y: "55%", dur: 20000 },
  { color: "from-blue-400/25 to-indigo-600/20", size: "w-[480px] h-[480px]", x: "75%", y: "60%", dur: 16000 },
  { color: "from-purple-400/20 to-pink-500/15", size: "w-[520px] h-[520px]", x: "25%", y: "70%", dur: 24000 },
  { color: "from-teal-400/20 to-cyan-500/15", size: "w-[450px] h-[450px]", x: "85%", y: "35%", dur: 19000 },
]

export default function GradientMeshBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!rootRef.current) return

    scopeRef.current = createScope({ root: rootRef }).add(() => {
      // Animate each blob with organic motion
      BLOBS.forEach((_, i) => {
        const el = `.mesh-blob-${i}`

        // Primary drifting motion
        animate(el, {
          x: [
            { to: `${30 + Math.random() * 40}px`, duration: _.dur },
            { to: `${-20 - Math.random() * 30}px`, duration: _.dur * 0.8 },
          ],
          y: [
            { to: `${-25 - Math.random() * 35}px`, duration: _.dur * 0.9 },
            { to: `${20 + Math.random() * 30}px`, duration: _.dur },
          ],
          scale: [
            { to: 1.15, duration: _.dur * 0.6 },
            { to: 0.9, duration: _.dur * 0.7 },
            { to: 1.05, duration: _.dur * 0.5 },
          ],
          rotate: [
            { to: 15 + Math.random() * 20, duration: _.dur },
            { to: -(10 + Math.random() * 15), duration: _.dur * 0.9 },
          ],
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })

        // Opacity breathing
        animate(el, {
          opacity: [
            { to: 0.7, duration: _.dur * 0.5 },
            { to: 1, duration: _.dur * 0.4 },
          ],
          ease: "inOutQuad",
          loop: true,
          alternate: true,
          composition: "blend",
        })
      })
    })

    return () => scopeRef.current?.revert()
  }, [])

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      {/* Backdrop blur layer */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className={`mesh-blob-${i} absolute rounded-full bg-gradient-to-br ${blob.color} ${blob.size} blur-3xl opacity-0`}
          style={{
            left: blob.x,
            top: blob.y,
            transform: "translate(-50%, -50%)",
            animation: `fadeIn 2s ${i * 0.3}s forwards`,
          }}
        />
      ))}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

    </div>
  )
}
