"use client"

import { useEffect, useRef } from "react"
import { startNeuralAnimation, type NeuralUpdate, type NeuralWorkerMessage } from "./neural-network-animation"

export default function NeuralNetworkBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const createCanvas = () => {
      const canvas = document.createElement("canvas")
      canvas.className = "absolute inset-0 w-full h-full"
      container.append(canvas)
      return canvas
    }

    let bounds = container.getBoundingClientRect()
    const measure = () => ({
      width: Math.max(1, Math.round(bounds.width)),
      height: Math.max(1, Math.round(bounds.height)),
      pixelRatio: window.devicePixelRatio || 1,
    })

    let viewport = measure()
    let canvas = createCanvas()
    let worker: Worker | undefined
    let animation: ReturnType<typeof startNeuralAnimation> | undefined
    let pointer: { x: number; y: number } | null = null

    function startOnMainThread() {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        animation = startNeuralAnimation(ctx, viewport)
        animation.update({ type: "pointer", point: pointer })
      }
    }

    function fallBackToMainThread() {
      if (!worker) return
      worker.terminate()
      worker = undefined
      // A transferred canvas cannot acquire a main-thread context.
      canvas.remove()
      canvas = createCanvas()
      startOnMainThread()
    }

    if (typeof Worker === "function" && typeof canvas.transferControlToOffscreen === "function") {
      try {
        worker = new Worker(new URL(
          /* webpackChunkName: "neural-network-worker" */ "./neural-network-worker.ts",
          import.meta.url,
        ))
        worker.addEventListener("error", (event) => {
          event.preventDefault()
          fallBackToMainThread()
        })
        worker.addEventListener("message", (event) => {
          if (event.data === "fallback") fallBackToMainThread()
        })

        const offscreen = canvas.transferControlToOffscreen()
        const start: NeuralWorkerMessage = { type: "start", canvas: offscreen, viewport }
        worker.postMessage(start, [offscreen])
      } catch {
        if (worker) fallBackToMainThread()
        else startOnMainThread()
      }
    } else {
      startOnMainThread()
    }

    function update(message: NeuralUpdate) {
      if (worker) worker.postMessage(message)
      else animation?.update(message)
    }

    let resizeFrame: number | undefined
    const queueResize = () => {
      if (resizeFrame !== undefined) return
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = undefined
        bounds = container.getBoundingClientRect()
        const next = measure()
        if (viewport.width === next.width && viewport.height === next.height && viewport.pixelRatio === next.pixelRatio) {
          return
        }
        viewport = next
        update({ type: "resize", viewport })
      })
    }

    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(queueResize) : undefined
    observer?.observe(container)

    function onWindowResize() {
      if (!observer || (window.devicePixelRatio || 1) !== viewport.pixelRatio) queueResize()
    }

    function pointAt(clientX: number, clientY: number) {
      return { x: clientX - bounds.left, y: clientY - bounds.top }
    }

    function setPointer(point: typeof pointer) {
      pointer = point
      update({ type: "pointer", point })
    }

    const clearPointer = () => setPointer(null)
    const onMouseMove = (event: MouseEvent) => setPointer(pointAt(event.clientX, event.clientY))
    const onClick = (event: MouseEvent) => update({ type: "pulse", point: pointAt(event.clientX, event.clientY) })

    function onTouch(event: TouchEvent) {
      const touch = event.touches[0]
      if (!touch) return
      const point = pointAt(touch.clientX, touch.clientY)
      setPointer(point)
      if (event.type === "touchstart") update({ type: "pulse", point })
    }

    const hasTouch = "ontouchstart" in window
    if (hasTouch) {
      window.addEventListener("touchstart", onTouch, { passive: true })
      window.addEventListener("touchmove", onTouch, { passive: true })
      window.addEventListener("touchend", clearPointer, { passive: true })
      window.addEventListener("touchcancel", clearPointer, { passive: true })
    } else {
      window.addEventListener("mousemove", onMouseMove, { passive: true })
      window.addEventListener("mouseleave", clearPointer)
      window.addEventListener("click", onClick)
    }
    window.addEventListener("resize", onWindowResize)

    return () => {
      observer?.disconnect()
      if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame)
      worker?.terminate()
      worker = undefined
      animation?.stop()
      canvas.remove()
      if (hasTouch) {
        window.removeEventListener("touchstart", onTouch)
        window.removeEventListener("touchmove", onTouch)
        window.removeEventListener("touchend", clearPointer)
        window.removeEventListener("touchcancel", clearPointer)
      } else {
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseleave", clearPointer)
        window.removeEventListener("click", onClick)
      }
      window.removeEventListener("resize", onWindowResize)
    }
  }, [])

  // Keep the canvas the same size as mobile browser chrome expands and retracts.
  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0 h-lvh overflow-hidden" />
}
