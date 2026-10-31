"use client"

import { useEffect } from "react"

/**
 * Scrolls to the current URL hash once its target is available.
 *
 * The home route mounts its sections only after the loading screen, so the
 * browser's own hash scroll finds nothing on direct loads and when arriving
 * from another route. This retries after mount and on later hash changes,
 * without adding history entries.
 */
export function useHashScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return
    }

    let frame = 0
    let timeout = 0
    let cancelled = false

    const scrollToHash = () => {
      if (cancelled) {
        return
      }

      const hash = window.location.hash
      if (!hash || hash === "#") {
        return
      }

      let id: string
      try {
        id = decodeURIComponent(hash.slice(1))
      } catch {
        return
      }

      if (!id) {
        return
      }

      const target = document.getElementById(id)
      if (!target) {
        return
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      target.scrollIntoView({
        block: "start",
        behavior: reduceMotion ? "auto" : "smooth",
      })
    }

    // Let the freshly mounted sections finish their first layout before
    // measuring; the loading screen gates the whole tree.
    const schedule = () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      frame = window.requestAnimationFrame(() => {
        timeout = window.setTimeout(scrollToHash, 50)
      })
    }

    schedule()
    window.addEventListener("hashchange", schedule)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      window.removeEventListener("hashchange", schedule)
    }
  }, [enabled])
}

export default useHashScroll
