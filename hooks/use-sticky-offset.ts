"use client"

import { useEffect, useState } from "react"

/**
 * Measures the real heights of the fixed nav and sticky tools toolbar and
 * exposes them as CSS custom properties on <html>. Falls back to hardcoded
 * estimates on first paint / SSR so the sticky filmstrip never jumps.
 *
 * --nav-height: height of [data-nav-root] in pixels.
 * --toolbar-offset: nav-height + height of [data-tools-toolbar] in pixels.
 */
export function useStickyOffset(): { navHeight: number; toolbarOffset: number } {
  const [navHeight, setNavHeight] = useState(68)
  const [toolbarOffset, setToolbarOffset] = useState(136)

  useEffect(() => {
    const write = () => {
      const nav = document.querySelector("[data-nav-root]") as HTMLElement | null
      const toolbar = document.querySelector("[data-tools-toolbar]") as HTMLElement | null
      // Fallback estimates: nav is ~68px; toolbar is ~65px on desktop (single
      // row) and ~150px on mobile (search row + chips row). 150 covers the
      // 2-row mobile layout until the ResizeObserver fires with the real value.
      const narrow = window.matchMedia("(max-width: 639px)").matches
      const fallbackToolbar = narrow ? 150 : 65
      const navHeight = nav?.offsetHeight ?? 68
      const toolbarHeight = toolbar?.offsetHeight ?? fallbackToolbar
      const toolbarOffset = Math.round(navHeight + toolbarHeight)
      document.documentElement.style.setProperty("--nav-height", `${navHeight}px`)
      document.documentElement.style.setProperty("--toolbar-offset", `${toolbarOffset}px`)
      setNavHeight(navHeight)
      setToolbarOffset(toolbarOffset)
    }

    write()

    const ro = new ResizeObserver(write)
    const nav = document.querySelector("[data-nav-root]")
    const toolbar = document.querySelector("[data-tools-toolbar]")
    if (nav) ro.observe(nav)
    if (toolbar) ro.observe(toolbar)

    window.addEventListener("resize", write)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", write)
    }
  }, [])

  return { navHeight, toolbarOffset }
}
