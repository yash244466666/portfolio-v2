"use client"

import { useEffect, useRef, useState } from "react"

export default function MouseCursor() {
  const [isMobile, setIsMobile] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number | undefined>(undefined)
  const isHoveringRef = useRef(false)
  const isRunningRef = useRef(false)

  useEffect(() => {
    // Detect mobile device
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        window.innerWidth < 768
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const shouldDisableCursor = detectMobile() || prefersReducedMotion.matches

    setIsMobile(shouldDisableCursor)

    // If it's mobile or reduced motion is requested, skip custom cursor
    if (shouldDisableCursor) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX
      targetRef.current.y = e.clientY
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === "BUTTON" || target.tagName === "A" || target.classList?.contains("cursor-pointer"))
      ) {
        isHoveringRef.current = true
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === "BUTTON" || target.tagName === "A" || target.classList?.contains("cursor-pointer"))
      ) {
        isHoveringRef.current = false
      }
    }

    const animate = () => {
      if (!isRunningRef.current) {
        return
      }

      const cursor = cursorRef.current
      const outer = outerRef.current
      const trail = trailRef.current

      if (cursor && outer && trail) {
        // Smooth interpolation for lag-free movement
        positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.2
        positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.2

        cursor.style.transform = `translate3d(${positionRef.current.x - 8}px, ${positionRef.current.y - 8}px, 0)`
        outer.style.transform = `translate3d(${positionRef.current.x - 24}px, ${positionRef.current.y - 24}px, 0)`
        trail.style.transform = `translate3d(${positionRef.current.x - 16}px, ${positionRef.current.y - 16}px, 0)`

        if (isHoveringRef.current) {
          cursor.style.transform += " scale(1.8)"
          outer.style.transform += " scale(1.5)"
          trail.style.transform += " scale(1.3)"
        }
      }

      if (isRunningRef.current) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    const startAnimation = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    const stopAnimation = () => {
      if (isRunningRef.current) {
        isRunningRef.current = false
        if (animationRef.current !== undefined) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = undefined
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation()
      } else {
        startAnimation()
      }
    }

    document.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseover", handleMouseEnter, { passive: true })
    document.addEventListener("mouseout", handleMouseLeave, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const style = document.createElement("style")
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
      body, html {
        cursor: none !important;
      }
      button, a, [role="button"] {
        cursor: none !important;
      }
    `
    document.head.appendChild(style)

    startAnimation()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseover", handleMouseEnter)
      document.removeEventListener("mouseout", handleMouseLeave)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.head.removeChild(style)
      stopAnimation()
    }
  }, [])

  // Don't render cursor on mobile devices
  if (isMobile) {
    return null
  }

  return (
    <>
      <div ref={cursorRef} className="fixed pointer-events-none z-50 will-change-transform">
        <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse" />
      </div>

      <div ref={outerRef} className="fixed pointer-events-none z-40 will-change-transform opacity-80">
        <div
          className="w-12 h-12 border-2 border-cyan-400/60 rounded-full animate-spin shadow-lg shadow-cyan-400/20"
          style={{ animationDuration: "4s" }}
        />
      </div>

      <div ref={trailRef} className="fixed pointer-events-none z-30 will-change-transform opacity-40">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-sm animate-pulse" />
      </div>
    </>
  )
}
