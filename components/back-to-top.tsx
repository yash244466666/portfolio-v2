"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useComponentInstrumentation("BackToTop", {
    stateSnapshot: () => ({ isVisible }),
    trackValues: () => ({ isVisible }),
    throttleMs: 1200,
  })

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    logComponentEvent("BackToTop", {
      event: "scroll-to-top",
      detail: { triggeredAt: window.pageYOffset },
      throttleMs: 2000,
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        !fixed bottom-8 right-8 z-50 p-3 rounded-full !right-8 !left-auto
        bg-yellow-400
        text-zinc-950 shadow-lg shadow-yellow-400/20 cursor-pointer
        transition-all duration-300 ease-in-out
        hover:bg-yellow-300
        hover:shadow-xl hover:shadow-yellow-400/30 hover:scale-110
        active:scale-95
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
      aria-label="Back to top"
    >
      <ChevronUp size={24} />
    </button>
  )
}
