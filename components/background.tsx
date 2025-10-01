"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect, useState } from "react"
import { DynamicLights } from "./background/dynamic-lights"
import { HexagonalGrid } from "./background/hexagonal-grid"
import { BackgroundFallback } from "./background/background-fallback"
import { ENABLE_COLOR_CHANGE_ON_CLICK } from "./background/constants"
import { clickWave, globalMouse, mobileState } from "./background/interaction-state"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

declare global {
  interface Window {
    updateHexColors?: () => void
    randomizeLights?: () => void
  }
}

export default function Smooth3DBackground() {
  const [mounted, setMounted] = useState(false)

  useComponentInstrumentation("Smooth3DBackground", {
    stateSnapshot: () => ({ mounted }),
    metricsSnapshot: () => ({ device: mobileState.isMobileDevice ? "mobile" : "desktop" }),
    trackValues: () => ({ mounted, device: mobileState.isMobileDevice ? "mobile" : "desktop" }),
    throttleMs: 4800,
  })

  useEffect(() => {
    setMounted(true)

    const getNow = () =>
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now()

    // Device detection
    const detectMobile = () => {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        window.innerWidth < 768
      logComponentEvent("Smooth3DBackground", {
        event: "device-detected",
        detail: { isMobile },
        throttleMs: 5000,
      })
      return isMobile
    }

    mobileState.isMobileDevice = detectMobile()

    const pointerLogState = {
      lastTime: 0,
      lastX: null as number | null,
      lastY: null as number | null,
    }

    const touchLogState = {
      lastTime: 0,
      lastCount: -1,
    }

    const shouldLogPointer = (x: number, y: number) => {
      const now = getNow()
      const dx = pointerLogState.lastX === null ? Number.POSITIVE_INFINITY : Math.abs(pointerLogState.lastX - x)
      const dy = pointerLogState.lastY === null ? Number.POSITIVE_INFINITY : Math.abs(pointerLogState.lastY - y)
      const movedEnough = dx > 0.08 || dy > 0.08
      const enoughTimePassed = now - pointerLogState.lastTime > 4800
      if (!movedEnough && !enoughTimePassed) {
        return false
      }

      pointerLogState.lastTime = now
      pointerLogState.lastX = x
      pointerLogState.lastY = y
      return true
    }

    // Mouse tracking
    const updateMousePosition = (e: MouseEvent) => {
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      if (shouldLogPointer(globalMouse.x, globalMouse.y)) {
        logComponentEvent("Smooth3DBackground", {
          event: "pointer-move",
          detail: { x: Number(globalMouse.x.toFixed(3)), y: Number(globalMouse.y.toFixed(3)) },
          throttleMs: 4800,
        })
      }
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

      logComponentEvent("Smooth3DBackground", {
        event: "pointer-click",
        detail: { x: Number(globalMouse.x.toFixed(3)), y: Number(globalMouse.y.toFixed(3)) },
        throttleMs: 2500,
      })
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
      logComponentEvent("Smooth3DBackground", {
        event: "touch-start",
        detail: { activeTouches: e.touches.length },
        throttleMs: 2500,
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
      }
      const now = getNow()
      if (
        e.touches.length !== touchLogState.lastCount ||
        now - touchLogState.lastTime > 4800
      ) {
        touchLogState.lastCount = e.touches.length
        touchLogState.lastTime = now
        logComponentEvent("Smooth3DBackground", {
          event: "touch-move",
          detail: { activeTouches: e.touches.length },
          throttleMs: 4800,
        })
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