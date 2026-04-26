"use client"

import { useEffect, useRef, useCallback } from "react"

/**
 * Neural Network / Constellation Background
 * Nodes connected by edges that pulse with energy.
 * Nodes drift slowly, connections light up in waves. Mouse creates attraction.
 * Classic developer portfolio — "connected knowledge" aesthetic.
 * Trending 2026 — AI/ML portfolio sites.
 */

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseOpacity: number
  pulse: number
  pulseSpeed: number
}

const NODE_COUNT = 40
const CONNECTION_DIST = 200
const MOUSE_RADIUS = 280
const PULSE_WAVE_SPEED = 300
const NODE_COLOR = { r: 99, g: 102, b: 241 }
const ACTIVE_COLOR = { r: 56, g: 189, b: 248 }
const ENERGY_COLOR = { r: 168, g: 85, b: 247 }

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const nodesRef = useRef<Node[]>([])
  const rafRef = useRef(0)
  const fadeRef = useRef(0)
  const pulseOriginRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: Node[] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.1 + Math.random() * 0.25
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        baseOpacity: 0.4 + Math.random() * 0.4,
        pulse: 0,
        pulseSpeed: 0.5 + Math.random() * 1.5,
      })
    }
    return nodes
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
    nodesRef.current = initNodes(w, h)

    const startTime = performance.now()

    const draw = (time: number) => {
      const elapsed = (time - startTime) / 1000
      fadeRef.current = Math.min(1, (time - startTime) / 2000)

      ctx.clearRect(0, 0, w, h)

      const nodes = nodesRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const pulse = pulseOriginRef.current

      // Pulse wave radius
      let pulseRadius = 0
      let pulseAlpha = 0
      if (pulse) {
        pulseRadius = (elapsed - pulse.time) * PULSE_WAVE_SPEED
        pulseAlpha = Math.max(0, 1 - pulseRadius / (Math.max(w, h) * 0.8))
        if (pulseAlpha <= 0) pulseOriginRef.current = null
      }

      // Update nodes
      for (const node of nodes) {
        // Mouse attraction
        const dx = mx - node.x
        const dy = my - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.3
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        }

        // Damping
        node.vx *= 0.985
        node.vy *= 0.985

        // Min speed
        const spd = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
        if (spd < 0.08) {
          node.vx = (node.vx / (spd || 1)) * 0.08
          node.vy = (node.vy / (spd || 1)) * 0.08
        }

        node.x += node.vx
        node.y += node.vy

        // Wrap
        if (node.x < -20) node.x = w + 20
        if (node.x > w + 20) node.x = -20
        if (node.y < -20) node.y = h + 20
        if (node.y > h + 20) node.y = -20

        // Pulse effect from click
        node.pulse = 0
        if (pulse && pulseAlpha > 0) {
          const pDist = Math.abs(Math.sqrt((node.x - pulse.x) ** 2 + (node.y - pulse.y) ** 2) - pulseRadius)
          if (pDist < 80) {
            node.pulse = (1 - pDist / 80) * pulseAlpha
          }
        }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DIST) {
            const t = 1 - dist / CONNECTION_DIST

            // Mouse proximity for connection
            const midX = (nodes[i].x + nodes[j].x) / 2
            const midY = (nodes[i].y + nodes[j].y) / 2
            const mDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2)
            const mouseInfl = mDist < MOUSE_RADIUS ? 1 - mDist / MOUSE_RADIUS : 0

            // Pulse on connections
            const connPulse = Math.max(nodes[i].pulse, nodes[j].pulse)

            // Energy flow animation along connection
            const energyPhase = (elapsed * 2 + i * 0.3) % 1
            const energyBrightness = connPulse > 0 ? connPulse : mouseInfl * 0.5

            const baseAlpha = t * 0.2 * fadeRef.current
            const activeAlpha = baseAlpha + energyBrightness * 0.4

            // Color shifts: base → active (mouse) → energy (pulse)
            const cTarget = connPulse > 0.2 ? ENERGY_COLOR : mouseInfl > 0.2 ? ACTIVE_COLOR : NODE_COLOR
            const r = Math.round(NODE_COLOR.r + (cTarget.r - NODE_COLOR.r) * (mouseInfl + connPulse))
            const g = Math.round(NODE_COLOR.g + (cTarget.g - NODE_COLOR.g) * (mouseInfl + connPulse))
            const b = Math.round(NODE_COLOR.b + (cTarget.b - NODE_COLOR.b) * (mouseInfl + connPulse))

            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${activeAlpha})`
            ctx.lineWidth = 0.5 + (mouseInfl + connPulse) * 1.5
            ctx.stroke()

            // Energy dot traveling along the connection
            if (energyBrightness > 0.15) {
              const ex = nodes[i].x + (nodes[j].x - nodes[i].x) * energyPhase
              const ey = nodes[i].y + (nodes[j].y - nodes[i].y) * energyPhase
              ctx.beginPath()
              ctx.arc(ex, ey, 1.5, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(${ACTIVE_COLOR.r},${ACTIVE_COLOR.g},${ACTIVE_COLOR.b},${energyBrightness * 0.7 * fadeRef.current})`
              ctx.fill()
            }
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const mDist = Math.sqrt((node.x - mx) ** 2 + (node.y - my) ** 2)
        const mouseInfl = mDist < MOUSE_RADIUS ? 1 - mDist / MOUSE_RADIUS : 0
        const activity = mouseInfl + node.pulse

        // Breathing pulse
        const breathe = 0.8 + 0.2 * Math.sin(elapsed * node.pulseSpeed)

        const r = Math.round(NODE_COLOR.r + (ACTIVE_COLOR.r - NODE_COLOR.r) * activity)
        const g = Math.round(NODE_COLOR.g + (ACTIVE_COLOR.g - NODE_COLOR.g) * activity)
        const b = Math.round(NODE_COLOR.b + (ACTIVE_COLOR.b - NODE_COLOR.b) * activity)
        const alpha = (node.baseOpacity + activity * 0.4) * breathe * fadeRef.current

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + activity * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        // Outer glow
        if (activity > 0.2) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 4 + activity * 6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${ACTIVE_COLOR.r},${ACTIVE_COLOR.g},${ACTIVE_COLOR.b},${activity * 0.1 * fadeRef.current})`
          ctx.fill()
        }
      }

      // Ambient glow
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS)
        grad.addColorStop(0, `rgba(${ACTIVE_COLOR.r},${ACTIVE_COLOR.g},${ACTIVE_COLOR.b},${0.05 * fadeRef.current})`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
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
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      pulseOriginRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: (performance.now() - startTime) / 1000,
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      mouseRef.current.x = touch.clientX - rect.left
      mouseRef.current.y = touch.clientY - rect.top
      pulseOriginRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        time: (performance.now() - startTime) / 1000,
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      mouseRef.current.x = touch.clientX - rect.left
      mouseRef.current.y = touch.clientY - rect.top
    }
    const onTouchEnd = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }

    let resizeTimeout: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {

      w = container.offsetWidth
      h = container.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)

      }, 150);
    }

    const isMobile = "ontouchstart" in window

    if (isMobile) {
      window.addEventListener("touchstart", onTouchStart, { passive: true })
      window.addEventListener("touchmove", onTouchMove, { passive: true })
      window.addEventListener("touchend", onTouchEnd, { passive: true })
    } else {
      window.addEventListener("mousemove", onMouseMove, { passive: true })
      window.addEventListener("mouseleave", onMouseLeave)
      window.addEventListener("click", onClick)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (isMobile) {
        window.removeEventListener("touchstart", onTouchStart)
        window.removeEventListener("touchmove", onTouchMove)
        window.removeEventListener("touchend", onTouchEnd)
      } else {
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseleave", onMouseLeave)
        window.removeEventListener("click", onClick)
      }
      window.removeEventListener("resize", onResize)
    }
  }, [initNodes])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
