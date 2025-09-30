"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect, useState } from "react"
import { DynamicLights } from "./background/dynamic-lights"
import { HexagonalGrid } from "./background/hexagonal-grid"
import { BackgroundFallback } from "./background/background-fallback"
import { ENABLE_COLOR_CHANGE_ON_CLICK } from "./background/constants"
import { clickWave, globalMouse, mobileState } from "./background/interaction-state"

declare global {
  interface Window {
    updateHexColors?: () => void
    randomizeLights?: () => void
  }
}

export default function Smooth3DBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Device detection
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        window.innerWidth < 768
    }

    mobileState.isMobileDevice = detectMobile()

    // Mouse tracking
    const updateMousePosition = (e: MouseEvent) => {
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    // Click effects
    const handleClick = (e: MouseEvent) => {
      clickWave.active = true
      clickWave.intensity = 1.0

      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1

      // Trigger color and light randomization (if enabled)
      if (ENABLE_COLOR_CHANGE_ON_CLICK) {
        window.updateHexColors?.()
        window.randomizeLights?.()
      }
    }

    // Touch effects
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        clickWave.active = true
        clickWave.intensity = 0.8

        const touch = e.touches[0]
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1

        // Trigger color and light randomization on touch
        window.updateHexColors?.()
        window.randomizeLights?.()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
      }
    }

    // Event listeners
    if (mobileState.isMobileDevice) {
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchstart', handleTouchStart, { passive: true })
    } else {
      window.addEventListener('mousemove', updateMousePosition)
      window.addEventListener('click', handleClick)
    }

    return () => {
      if (mobileState.isMobileDevice) {
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchstart', handleTouchStart)
      } else {
        window.removeEventListener('mousemove', updateMousePosition)
        window.removeEventListener('click', handleClick)
      }
    }
  }, [])

  if (!mounted || typeof window === "undefined") {
    return <BackgroundFallback />
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <Suspense fallback={<BackgroundFallback />}>
        <Canvas
          camera={{ position: [0, 0, 100], fov: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={Math.min(window.devicePixelRatio, 1.5)}
        >
          <DynamicLights />
          <HexagonalGrid />
        </Canvas>
      </Suspense>
    </div>
  )
}