"use client"

import { useEffect, useState } from "react"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useComponentInstrumentation("LoadingScreen", {
    propsSnapshot: () => ({ hasOnComplete: Boolean(onComplete) }),
    stateSnapshot: () => ({ isLoading, progress }),
    trackValues: () => ({ isLoading, progress }),
    throttleMs: 1000,
  })

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        const next = Math.min(prev + 2, 100)
        logComponentEvent("LoadingScreen", {
          event: "progress-update",
          detail: { value: next },
          throttleMs: 800,
        })
        return next
      })
    }, 40)

    const timer = setTimeout(() => {
      setIsLoading(false)
      logComponentEvent("LoadingScreen", {
        event: "complete",
        detail: { progress: 100 },
        throttleMs: 1500,
      })
      setTimeout(onComplete, 300) // Delay to allow fade out
    }, 2500)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-gray-800 rounded-full animate-spin border-t-purple-500 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-purple-400 font-mono text-sm">{progress}%</span>
          </div>
        </div>

        <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-gray-400 text-sm font-medium">Loading Portfolio...</p>
      </div>
    </div>
  )
}
