"use client"

import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, forwardRef } from "react"
import type { ToolCategory, ToolDefinition } from "@/lib/content/tools/types"
import { getToolsByCategory } from "@/lib/content/tools/utils"
import { useStickyOffset } from "@/hooks/use-sticky-offset"
import ToolCard from "@/components/tools/tool-card"

interface ToolsSectionsProps {
  categories: ToolCategory[]
  onSelect: (id: string) => void
  onActiveCategoryChange?: (categoryId: string | null) => void
}

export interface ToolsSectionsHandle {
  scrollToCategory: (id: string) => void
}

// Large categories (e.g. Dev: 44 tools) would create absurdly long horizontal
// tracks if rendered as one section. Split them into chunks so each pinned
// scene stays a reasonable scroll distance while keeping the filmstrip feel.
const MAX_CARDS_PER_SECTION = 12

interface SectionMeta {
  overflow: number
  pinTravel: number
}

// Vertical scroll distance used as the crossfade transition between two
// pinned sections. The previous section fades from 1 → 0 over this distance
// so it only becomes fully invisible once the next section has fully arrived.
const SECTION_RELEASE = 400

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Cinematic scroll-pinned category sections. The persistent toolbar
 * (in tools-toolbar.tsx) owns the search combobox and category chips; this
 * component only renders the per-category title, description, count, section
 * progress, and the horizontal filmstrip of cards.
 *
 * Each category becomes a pinned "scene". Inside the pinned viewport is a
 * single horizontal row of tool cards. Vertical scroll translates the row
 * horizontally (film-strip style); when the row reaches its end the pin
 * releases and the next category's row takes over. Scrolling up reverses.
 *
 * Accessibility: under `prefers-reduced-motion: reduce` or on narrow screens
 * (<768px) the sticky positioning and transform are disabled via Tailwind
 * variants (`motion-reduce:` / `max-md:`) and JS skips the scroll-driven
 * transform, yielding a normal stacked grid.
 */
const ToolsSections = forwardRef<ToolsSectionsHandle, ToolsSectionsProps>(function ToolsSections(
  { categories, onSelect, onActiveCategoryChange },
  ref
) {
  const sectionEls = useRef<(HTMLElement | null)[]>([])
  const trackEls = useRef<(HTMLElement | null)[]>([])
  const viewportEls = useRef<(HTMLElement | null)[]>([])
  const progressEls = useRef<(HTMLElement | null)[]>([])
  const meta = useRef<SectionMeta[]>([])
  const { toolbarOffset: navOffset } = useStickyOffset()
  const [motionSafe, setMotionSafe] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const activeSectionIndexRef = useRef(activeSectionIndex)
  activeSectionIndexRef.current = activeSectionIndex
  const navOffsetRef = useRef(navOffset)
  navOffsetRef.current = navOffset
  const onActiveCategoryChangeRef = useRef(onActiveCategoryChange)
  onActiveCategoryChangeRef.current = onActiveCategoryChange
  const sectionDefinitionsRef = useRef<typeof sectionDefinitions>([])
  useEffect(() => {
    const check = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const narrow = window.matchMedia("(max-width: 767px)").matches
      setMotionSafe(!reduced && !narrow)
    }
    check()
    window.addEventListener("resize", check)
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    mq.addEventListener("change", check)
    return () => {
      window.removeEventListener("resize", check)
      mq.removeEventListener("change", check)
    }
  }, [])

  useIsoLayoutEffect(() => {
    if (!motionSafe) return

    const measure = () => {
      sectionEls.current.forEach((section, i) => {
        if (!section) return
        const track = trackEls.current[i]
        const viewport = viewportEls.current[i]
        if (!track || !viewport) return
        const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth)
        section.style.height = `${overflow + SECTION_RELEASE}px`
        meta.current[i] = { overflow, pinTravel: overflow }
      })
    }

    measure()

    const ro = new ResizeObserver(() => measure())
    trackEls.current.forEach((t) => t && ro.observe(t))
    window.addEventListener("resize", measure)
    window.addEventListener("load", measure)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("load", measure)
    }
  }, [motionSafe])

  useEffect(() => {
    if (!motionSafe) return

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const scrollY = window.scrollY
        let nextActive = -1

        let firstVisibleIndex = -1
        sectionEls.current.forEach((section, i) => {
          if (!section) return
          const track = trackEls.current[i]
          const m = meta.current[i]
          if (!track || !m) return

          const currentNavOffset = navOffsetRef.current
          const rect = section.getBoundingClientRect()
          const isPinned = rect.top <= currentNavOffset && rect.bottom > currentNavOffset
          if (isPinned) nextActive = i

          if (firstVisibleIndex === -1 && rect.bottom > currentNavOffset) {
            firstVisibleIndex = i
          }

          {
            const sectionTop = rect.top + scrollY
            const pinStart = sectionTop - currentNavOffset
            let progress = (scrollY - pinStart) / m.pinTravel
            progress = Math.max(0, Math.min(1, progress))
            track.style.transform = `translateX(${-m.overflow * progress}px)`
            section.style.setProperty("--section-progress", String(progress))
            const bar = progressEls.current[i]
            if (bar) bar.setAttribute("aria-valuenow", String(Math.round(progress * 100)))

            // Fade this section out over the release distance after its cards
            // have fully scrolled. With the section height set to exactly
            // overflow + release, the release ends exactly when the next section
            // pins, so this panel becomes fully invisible right as the next one
            // takes over.
            const releaseStart = pinStart + m.pinTravel
            let releaseProgress = (scrollY - releaseStart) / SECTION_RELEASE
            releaseProgress = Math.max(0, Math.min(1, releaseProgress))
            section.style.setProperty("--section-release-progress", String(releaseProgress))
            section.style.setProperty("--section-pointer-events", releaseProgress > 0.01 ? "none" : "auto")
          }
        })

        // If no section is currently pinned (e.g. we jumped to the very top),
        // default to the first section visible below the toolbar so the active
        // category chip updates immediately without requiring a scroll nudge.
        if (nextActive === -1 && firstVisibleIndex !== -1) {
          nextActive = firstVisibleIndex
        }

        if (nextActive !== -1 && nextActive !== activeSectionIndexRef.current) {
          setActiveSectionIndex(nextActive)
        }
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [motionSafe])

  useEffect(() => {
    if (motionSafe) return

    // Mobile / reduced-motion fallback: the pinned filmstrip is disabled, so
    // the pin-detection scroll handler does not run. Use an IntersectionObserver
    // to detect which section's title is currently in view and surface it as
    // the active category for the toolbar chip.
    const sections = sectionEls.current.filter((el): el is HTMLElement => Boolean(el))
    if (sections.length === 0) return

    const visibility = new Map<HTMLElement, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target as HTMLElement, entry.intersectionRatio)
        }
        let bestEl: HTMLElement | null = null
        let bestRatio = 0
        visibility.forEach((ratio, el) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestEl = el
          }
        })
        if (!bestEl) return
        const idx = sectionEls.current.indexOf(bestEl)
        if (idx >= 0 && idx !== activeSectionIndexRef.current) {
          setActiveSectionIndex(idx)
        }
      },
      {
        // Account for the sticky nav + toolbar at the top, plus a small lead so
        // the chip flips right as the title clears the toolbar instead of after
        // the user scrolls past it.
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [motionSafe])

  useEffect(() => {
    if (!onActiveCategoryChangeRef.current) return
    const section = sectionDefinitionsRef.current[activeSectionIndex]
    onActiveCategoryChangeRef.current(section?.categoryId ?? null)
  }, [activeSectionIndex])

  useEffect(() => {
    if (!motionSafe) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
      const currentNavOffset = navOffsetRef.current
      const section = sectionEls.current.find((s) => {
        if (!s) return false
        const rect = s.getBoundingClientRect()
        return rect.top <= currentNavOffset && rect.bottom > currentNavOffset
      })
      if (!section) return
      const i = sectionEls.current.indexOf(section)
      const m = meta.current[i]
      if (!m || m.overflow <= 0) return
      e.preventDefault()
      const step = m.pinTravel * 0.15
      const current = window.scrollY
      window.scrollTo({ top: e.key === "ArrowRight" ? current + step : current - step, behavior: "smooth" })
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [motionSafe])

  const sectionDefinitions = useMemo(
    () =>
      categories.flatMap((cat) => {
        const tools = getToolsByCategory(cat.id)
        const chunks = chunkArray(tools, MAX_CARDS_PER_SECTION)
        return chunks.map((chunk, chunkIndex) => ({
          id: `${cat.id}-${chunkIndex}`,
          categoryId: cat.id,
          label: cat.label,
          description: cat.description,
          tools: chunk,
          chunkIndex,
          totalChunks: chunks.length,
        }))
      }),
    [categories]
  )
  sectionDefinitionsRef.current = sectionDefinitions

  useImperativeHandle(
    ref,
    () => ({
      scrollToCategory: (id: string) => {
        const idx = sectionDefinitions.findIndex((s) => s.categoryId === id)
        const el = sectionEls.current[idx]
        if (!el) return
        // If motion is disabled, just scroll the section into view normally.
        if (!motionSafe) {
          el.scrollIntoView({ behavior: "auto", block: "start" })
          return
        }
        // For the pinned filmstrip, scroll to the exact point where this
        // section becomes the active pinned scene (top of panel flush with
        // the bottom of the sticky toolbar).
        const currentNavOffset = navOffsetRef.current
        const rect = el.getBoundingClientRect()
        // If the element is not yet laid out (e.g. grid was display:none),
        // fall back to standard scrollIntoView and let the browser find it.
        if (rect.height === 0 && rect.width === 0) {
          el.scrollIntoView({ behavior: "auto", block: "start" })
          return
        }
        const sectionTop = rect.top + window.scrollY
        const target = sectionTop - currentNavOffset
        window.scrollTo({ top: target, behavior: "auto" })
      },
    }),
    [sectionDefinitions, motionSafe]
  )

  return (
    <div className="tools-sections tools-sections--root" role="region" aria-label="Tools">
      {sectionDefinitions.map((section, i) => {
        return (
          <section
            key={section.id}
            ref={(el) => {
              sectionEls.current[i] = el
            }}
            className="tool-section tools-section motion-reduce:!h-auto max-md:!h-auto"
            aria-labelledby={`section-title-${section.id}`}
          >
            <div
              className="tools-section__panel sticky top-[var(--toolbar-offset,8.5rem)] z-40 overflow-visible flex flex-col pt-6 sm:pt-12 motion-reduce:!static motion-reduce:!h-auto motion-reduce:!overflow-visible motion-reduce:!pt-0 motion-reduce:!opacity-100 motion-reduce:!z-auto max-md:!static max-md:!h-auto max-md:!overflow-visible max-md:!pt-0 max-md:!opacity-100 max-md:!z-auto"
              style={{
                opacity: "calc(1 - var(--section-release-progress, 0))",
                pointerEvents: "var(--section-pointer-events, auto)" as React.CSSProperties["pointerEvents"],
              }}
            >
              <header className="tools-section__header shrink-0 px-4 sm:px-6 pt-2 sm:pt-4 pb-4 sm:pb-8">
                <div className="tools-section__title-row flex items-baseline justify-between gap-4">
                  <div className="tools-section__title-group flex items-baseline gap-3 min-w-0">
                    <h2
                      id={`section-title-${section.id}`}
                      className="tools-section__title text-2xl sm:text-3xl font-semibold text-foreground leading-tight tracking-tight truncate"
                    >
                      {section.label}
                    </h2>
                    <span className="tools-section__count text-xs text-muted-foreground tabular-nums whitespace-nowrap shrink-0">
                      {section.tools.length} tools
                    </span>
                  </div>
                  {section.totalChunks > 1 && (
                    <span className="tools-section__chunk-badge text-sm text-muted-foreground tabular-nums hidden sm:inline">
                      {String(section.chunkIndex + 1).padStart(2, "0")}/{String(section.totalChunks).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <p className="tools-section__description text-muted-foreground/80 text-sm sm:text-base leading-snug mt-1 max-w-2xl">
                  {section.description}
                </p>

                <div
                  ref={(el) => {
                    progressEls.current[i] = el
                  }}
                  className="tools-section__progress mt-2 h-0.5 w-full bg-border/40 rounded-full overflow-hidden motion-reduce:hidden max-md:hidden"
                  role="progressbar"
                  aria-label="Section scroll progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={0}
                >
                  <div
                    className="tools-section__progress-bar h-full bg-gradient-to-r from-primary to-cyan-400 origin-left transition-transform duration-75 ease-linear"
                    style={{ transform: "scaleX(var(--section-progress, 0))" }}
                  />
                </div>
              </header>

              <div
                ref={(el) => {
                  viewportEls.current[i] = el
                }}
                className="tools-section__viewport tool-track-viewport relative shrink-0 overflow-hidden flex items-start px-4 sm:px-6 motion-reduce:!overflow-visible max-md:!overflow-visible"
                style={
                  motionSafe
                    ? {
                        maskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                      }
                    : undefined
                }
              >
                <div
                  ref={(el) => {
                    trackEls.current[i] = el
                  }}
                  style={{ willChange: "transform" }}
                  className="tools-section__track tool-track flex flex-nowrap items-center gap-5 py-4 motion-reduce:!transform-none motion-reduce:flex-col motion-reduce:h-auto motion-reduce:py-0 motion-reduce:gap-4 max-md:!transform-none max-md:flex-col max-md:h-auto max-md:py-0 max-md:gap-4"
                >
                  {section.tools.map((tool: ToolDefinition) => (
                    <div
                      key={tool.id}
                      className="tools-section__card-slot flex-none w-[300px] sm:w-[340px] lg:w-[380px] h-[280px] sm:h-[320px] lg:h-[340px] overflow-visible motion-reduce:w-full motion-reduce:h-auto motion-reduce:overflow-visible max-md:w-full max-md:min-h-[180px] max-md:h-auto max-md:overflow-visible"
                    >
                      <ToolCard tool={tool} onSelect={onSelect} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
})

export default ToolsSections