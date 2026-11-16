"use client"

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react"
import type { ToolCategory, ToolDefinition } from "@/lib/content/tools/types"
import { getToolsByCategory } from "@/lib/content/tools/utils"
import { useStickyOffset } from "@/hooks/use-sticky-offset"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ToolCard from "@/components/tools/tool-card"

interface ToolsSectionsProps {
  categories: ToolCategory[]
  onSelect: (id: string) => void
  onActiveCategoryChange?: (categoryId: string | null) => void
}

export interface ToolsSectionsHandle {
  scrollToCategory: (id: string) => void
}

/**
 * "stacked" is the default: ordinary document flow with one visible heading
 * per category, used before hydration, on narrow screens, and whenever the
 * visitor prefers reduced motion.
 *
 * "measuring" renders the horizontal track once so its real width and card
 * positions can be read. "pinned" is the active continuous track: the panel is
 * sticky below the nav + toolbar and vertical scroll drives horizontal travel.
 */
type TrackMode = "stacked" | "measuring" | "pinned"

interface CardPosition {
  left: number
  width: number
}

interface TrackMetrics {
  offset: number
  travel: number
  viewportWidth: number
  cards: CardPosition[]
  categoryStarts: number[]
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Continuous desktop tools track.
 *
 * All categories share one horizontal row of cards. A single sticky panel holds
 * the current category heading, its description, the Previous/Next controls,
 * and the card viewport. While the visitor scrolls vertically through the
 * scene, the row translates horizontally from the first Core Tools card to the
 * last Math & Logic card. The heading, active toolbar chip, and progress
 * indicator change in place as each category's first card reaches the leading
 * edge. When the final card has passed, the scene releases and normal document
 * scrolling continues.
 *
 * On narrow screens, under `prefers-reduced-motion: reduce`, without
 * JavaScript, or when the panel cannot fit below the sticky toolbar, the same
 * cards render as an ordinary stacked catalogue with visible category
 * headings.
 */
const ToolsSections = forwardRef<ToolsSectionsHandle, ToolsSectionsProps>(function ToolsSections(
  { categories, onSelect, onActiveCategoryChange },
  ref
) {
  const { toolbarOffset } = useStickyOffset()
  const toolbarOffsetRef = useRef(toolbarOffset)
  toolbarOffsetRef.current = toolbarOffset

  const sectionRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const groupRefs = useRef<(HTMLElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const cardElsRef = useRef<HTMLElement[]>([])

  const [mode, setMode] = useState<TrackMode>("stacked")
  const modeRef = useRef(mode)
  modeRef.current = mode
  const [sectionHeight, setSectionHeight] = useState<number | null>(null)
  const [endBuffer, setEndBuffer] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const atStartRef = useRef(true)
  const atEndRef = useRef(false)

  const metricsRef = useRef<TrackMetrics | null>(null)
  const pendingCategoryRef = useRef<string | null>(null)

  const categoryEntries = useMemo(
    () =>
      categories.map((category) => ({
        category,
        tools: getToolsByCategory(category.id),
      })),
    [categories]
  )

  const categoryStartCounts = useMemo(() => {
    const starts: number[] = []
    let total = 0
    for (const entry of categoryEntries) {
      starts.push(total)
      total += entry.tools.length
    }
    return starts
  }, [categoryEntries])

  const pinnedLayout = mode !== "stacked"

  const scrollToTravel = useCallback((travel: number, behavior: ScrollBehavior = "smooth") => {
    const metrics = metricsRef.current
    const section = sectionRef.current
    if (!metrics || !section) return
    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    const target = sectionTop - metrics.offset + clamp(travel, 0, metrics.travel)
    window.scrollTo({ top: target, behavior })
  }, [])

  const scrollToCategoryInternal = useCallback(
    (id: string, behavior: ScrollBehavior = "instant") => {
      const index = categoryEntries.findIndex((entry) => entry.category.id === id)
      if (index < 0) return

      const metrics = metricsRef.current
      if (metrics) {
        scrollToTravel(metrics.categoryStarts[index] ?? metrics.travel, behavior)
        return
      }

      // Stacked mode (or before the pinned measurements are ready): move the
      // category group into view, leaving room for the sticky nav + toolbar.
      const group = groupRefs.current[index]
      if (!group) return
      const groupTop = group.getBoundingClientRect().top + window.scrollY
      const target = Math.max(0, groupTop - toolbarOffsetRef.current - 8)
      window.scrollTo({ top: target, behavior: "instant" })
    },
    [categoryEntries, scrollToTravel]
  )

  const scrollToCategory = useCallback(
    (id: string) => {
      pendingCategoryRef.current = id

      if (metricsRef.current) {
        pendingCategoryRef.current = null
        scrollToCategoryInternal(id, "instant")
        return
      }

      if (modeRef.current === "stacked") {
        // Let React commit the stacked groups before scrolling to one.
        pendingCategoryRef.current = null
        requestAnimationFrame(() => scrollToCategoryInternal(id, "instant"))
      }
      // In "measuring" mode the measurement pass consumes the pending id.
    },
    [scrollToCategoryInternal]
  )

  useImperativeHandle(ref, () => ({ scrollToCategory }), [scrollToCategory])

  /**
   * Decide whether the continuous track is allowed. Pinning is desktop-only
   * and never overrides a reduced-motion preference. Initial render stays in
   * the stacked mode so the exported HTML and no-JS visits are fully usable.
   */
  useIsoLayoutEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const wideQuery = window.matchMedia("(min-width: 768px)")

    const update = () => {
      if (!motionQuery.matches && wideQuery.matches) {
        setMode((current) => (current === "pinned" ? current : "measuring"))
      } else {
        setMode("stacked")
        modeRef.current = "stacked"
        setSectionHeight(null)
        setEndBuffer(0)
        metricsRef.current = null
        setAtStart(true)
        setAtEnd(false)
        atStartRef.current = true
        atEndRef.current = false
      }
    }

    update()
    motionQuery.addEventListener("change", update)
    wideQuery.addEventListener("change", update)
    return () => {
      motionQuery.removeEventListener("change", update)
      wideQuery.removeEventListener("change", update)
    }
  }, [])

  /**
   * Update the transform, progress indicator, active category, and control end
   * states from the current scroll position. Reads live geometry so a toolbar
   * height change or a restored history position always maps correctly.
   */
  const updateScrollFrame = useCallback(() => {
    const metrics = metricsRef.current
    const section = sectionRef.current
    const track = trackRef.current
    if (!metrics || !section || !track) return
    // The grid is display:none while an in-place tool is open. Keep the last
    // measured state so returning restores the browse position immediately.
    if (!track.clientWidth) return

    const scrollY = window.scrollY
    const sectionTop = section.getBoundingClientRect().top + scrollY
    const travel = clamp(scrollY - (sectionTop - metrics.offset), 0, metrics.travel)

    track.style.transform = `translate3d(${-travel}px, 0, 0)`

    const progress = metrics.travel > 0 ? travel / metrics.travel : 0
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${progress})`
    }
    if (progressRef.current) {
      progressRef.current.setAttribute("aria-valuenow", String(Math.round(progress * 100)))
    }

    let nextIndex = 0
    if (travel >= metrics.travel - 0.5) {
      nextIndex = Math.max(0, categoryEntries.length - 1)
    } else {
      for (let i = 0; i < metrics.categoryStarts.length; i += 1) {
        if (travel + 0.5 >= metrics.categoryStarts[i]) nextIndex = i
      }
    }
    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex
      setActiveIndex(nextIndex)
    }

    const start = travel <= 0.5
    const end = travel >= metrics.travel - 0.5
    if (start !== atStartRef.current) {
      atStartRef.current = start
      setAtStart(start)
    }
    if (end !== atEndRef.current) {
      atEndRef.current = end
      setAtEnd(end)
    }
  }, [categoryEntries.length])

  /**
   * Measure the horizontal track and the panel that holds it, then size the
   * scene to the panel height plus the horizontal travel required. Any change
   * in the toolbar, panel, viewport, or track re-runs the measurement.
   */
  useIsoLayoutEffect(() => {
    if (mode === "stacked") return

    const section = sectionRef.current
    const panel = panelRef.current
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!section || !panel || !viewport || !track) return

    const measure = () => {
      if (modeRef.current === "stacked") return

      const viewportWidth = viewport.clientWidth
      const trackWidth = track.scrollWidth
      const panelHeight = panel.offsetHeight
      // Hidden behind display:none (an opened tool): leave the previous
      // measurements and scene height intact for history restoration.
      if (viewportWidth === 0 || trackWidth === 0 || panelHeight === 0) return

      const travel = Math.max(0, trackWidth - viewportWidth)
      const offset = toolbarOffsetRef.current
      const fitsBelowToolbar = offset + panelHeight + 8 <= window.innerHeight

      if (travel <= 0 || !fitsBelowToolbar) {
        setMode("stacked")
        modeRef.current = "stacked"
        setSectionHeight(null)
        setEndBuffer(0)
        metricsRef.current = null
        const pending = pendingCategoryRef.current
        if (pending) {
          pendingCategoryRef.current = null
          requestAnimationFrame(() => scrollToCategoryInternal(pending, "instant"))
        }
        return
      }

      const trackRect = track.getBoundingClientRect()
      const cardEls = Array.from(track.querySelectorAll<HTMLElement>("[data-tool-card]"))
      const cards = cardEls.map((el) => {
        const rect = el.getBoundingClientRect()
        return { left: rect.left - trackRect.left, width: rect.width }
      })
      const categoryStarts = categoryEntries.map((entry, index) => {
        const position = cards[categoryStartCounts[index]]
        return position ? clamp(position.left, 0, travel) : travel
      })

      cardElsRef.current = cardEls
      metricsRef.current = { offset, travel, viewportWidth, cards, categoryStarts }
      setSectionHeight(Math.round(panelHeight + travel))

      if (modeRef.current !== "pinned") {
        setMode("pinned")
        modeRef.current = "pinned"
      }

      const pending = pendingCategoryRef.current
      if (pending) {
        pendingCategoryRef.current = null
        scrollToCategoryInternal(pending, "instant")
      } else {
        updateScrollFrame()
      }
    }

    measure()

    const observer = new ResizeObserver(() => measure())
    observer.observe(viewport)
    observer.observe(panel)
    observer.observe(track)
    window.addEventListener("resize", measure)
    window.addEventListener("load", measure)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("load", measure)
    }
  }, [
    mode,
    toolbarOffset,
    categoryEntries,
    categoryStartCounts,
    scrollToCategoryInternal,
    updateScrollFrame,
  ])

  /**
   * The browser stops scrolling when the document ends. If the footer and page
   * padding below the track are shorter than the space under the pinned panel,
   * the last few pixels of horizontal travel would be unreachable and the final
   * card would stay clipped. Reserve exactly that shortfall after the scene so
   * the full travel (and the last card) can be reached.
   */
  useIsoLayoutEffect(() => {
    if (mode !== "pinned") {
      setEndBuffer(0)
      return
    }
    const section = sectionRef.current
    const panel = panelRef.current
    if (!section || !panel || section.offsetHeight === 0) return

    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    const offset = toolbarOffsetRef.current
    const endScroll = sectionTop + section.offsetHeight - offset - panel.offsetHeight
    const availableScroll =
      document.documentElement.scrollHeight - window.innerHeight - endBuffer
    const shortfall = Math.max(0, Math.ceil(endScroll - availableScroll))
    setEndBuffer((current) => (Math.abs(current - shortfall) > 1 ? shortfall : current))
  }, [mode, sectionHeight, toolbarOffset, endBuffer])

  useEffect(() => {
    if (mode !== "pinned") return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        updateScrollFrame()
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    updateScrollFrame()
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [mode, updateScrollFrame])

  /**
   * Keep keyboard focus visible across the horizontal track. Without this, Tab
   * would move focus to a card scrolled outside the clipped viewport. Focus is
   * never trapped: once focus leaves the track, the browser continues normally.
   */
  useEffect(() => {
    if (mode !== "pinned") return
    const track = trackRef.current
    if (!track) return

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const card = target.closest("[data-tool-card]") as HTMLElement | null
      if (!card) return

      const metrics = metricsRef.current
      const section = sectionRef.current
      if (!metrics || !section) return
      const index = cardElsRef.current.indexOf(card)
      const position = metrics.cards[index]
      if (!position) return

      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const current = clamp(
        window.scrollY - (sectionTop - metrics.offset),
        0,
        metrics.travel
      )
      const margin = 24
      let targetTravel = current

      if (position.left < current + margin) {
        targetTravel = Math.max(0, position.left - margin)
      } else if (
        position.left + position.width >
        current + metrics.viewportWidth - margin
      ) {
        targetTravel = Math.min(
          metrics.travel,
          position.left + position.width - metrics.viewportWidth + margin
        )
      }

      if (Math.abs(targetTravel - current) > 0.5) {
        scrollToTravel(targetTravel, "instant")
      }
    }

    track.addEventListener("focusin", onFocusIn)
    return () => track.removeEventListener("focusin", onFocusIn)
  }, [mode, scrollToTravel])

  /**
   * Stacked mode (mobile, reduced motion, no pinning) still highlights the
   * category chip as its group passes through the viewport.
   */
  useEffect(() => {
    if (mode !== "stacked") return
    const groups = groupRefs.current.filter((group): group is HTMLElement => Boolean(group))
    if (groups.length === 0) return

    const visibility = new Map<HTMLElement, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target as HTMLElement, entry.intersectionRatio)
        }
        let bestGroup: HTMLElement | null = null
        let bestRatio = 0
        visibility.forEach((ratio, group) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestGroup = group
          }
        })
        if (!bestGroup) return
        const index = groupRefs.current.indexOf(bestGroup)
        if (index >= 0 && index !== activeIndexRef.current) {
          activeIndexRef.current = index
          setActiveIndex(index)
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    groups.forEach((group) => observer.observe(group))
    return () => observer.disconnect()
  }, [mode])

  useEffect(() => {
    onActiveCategoryChange?.(categoryEntries[activeIndex]?.category.id ?? null)
  }, [activeIndex, categoryEntries, onActiveCategoryChange])

  /**
   * Move roughly one card. Next/Previous resolve to the next or previous card
   * start so repeated clicks track the same positions as free scrolling.
   */
  const moveByCard = useCallback(
    (direction: 1 | -1) => {
      const metrics = metricsRef.current
      const section = sectionRef.current
      if (!metrics || !section) return

      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const current = clamp(
        window.scrollY - (sectionTop - metrics.offset),
        0,
        metrics.travel
      )
      let target = direction > 0 ? metrics.travel : 0

      if (direction > 0) {
        for (const card of metrics.cards) {
          if (card.left > current + 1) {
            target = Math.min(metrics.travel, card.left)
            break
          }
        }
      } else {
        for (let i = metrics.cards.length - 1; i >= 0; i -= 1) {
          if (metrics.cards[i].left < current - 1) {
            target = Math.max(0, metrics.cards[i].left)
            break
          }
        }
      }

      scrollToTravel(target, "smooth")
    },
    [scrollToTravel]
  )

  const activeEntry = categoryEntries[activeIndex] ?? categoryEntries[0]

  return (
    <>
      <section
        ref={sectionRef}
        className="tools-track tools-track--root"
        style={mode === "pinned" && sectionHeight ? { height: `${sectionHeight}px` } : undefined}
        role="region"
        aria-label="Tools"
      >
      <div
        ref={panelRef}
        className={
          mode === "pinned"
            ? "tools-track__panel sticky top-[var(--toolbar-offset,8.5rem)] z-30 flex flex-col"
            : "tools-track__panel flex flex-col"
        }
      >
        {pinnedLayout && activeEntry && (
          <header className="tools-track__header shrink-0 px-1 pt-2 pb-3 sm:pb-4">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <h2 className="tools-track__title text-2xl sm:text-3xl font-semibold text-foreground leading-tight tracking-tight">
                    {activeEntry.category.label}
                  </h2>
                  <span className="tools-track__count text-xs text-muted-foreground tabular-nums whitespace-nowrap shrink-0">
                    {activeEntry.tools.length} tools
                  </span>
                </div>
                <p className="tools-track__description text-muted-foreground/80 text-sm sm:text-base leading-snug mt-1 max-w-2xl">
                  {activeEntry.category.description}
                </p>
              </div>

              <div className="tools-track__controls flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => moveByCard(-1)}
                  disabled={atStart}
                  aria-label="Previous tools"
                  className="tools-track__control inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-muted/50 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted/50"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveByCard(1)}
                  disabled={atEnd}
                  aria-label="Next tools"
                  className="tools-track__control inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-muted/50 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted/50"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div
              ref={progressRef}
              className="tools-track__progress mt-3 h-0.5 w-full overflow-hidden rounded-full bg-border/40"
              role="progressbar"
              aria-label="Tools browsing progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
            >
              <div
                ref={progressBarRef}
                className="tools-track__progress-bar h-full origin-left bg-gradient-to-r from-yellow-400 to-amber-500 transition-transform duration-75 ease-linear"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </header>
        )}

        <div
          ref={viewportRef}
          className={
            pinnedLayout
              ? "tools-track__viewport relative shrink-0 overflow-clip"
              : "tools-track__viewport relative"
          }
          style={
            pinnedLayout
              ? {
                  maskImage:
                    "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                }
              : undefined
          }
        >
          <div
            ref={trackRef}
            className={
              pinnedLayout
                ? "tools-track__rail flex w-max flex-nowrap items-stretch gap-5 py-4"
                : "tools-track__rail"
            }
            style={pinnedLayout ? { willChange: "transform" } : undefined}
          >
            {categoryEntries.map((entry, categoryIndex) => (
              <section
                key={entry.category.id}
                ref={(el) => {
                  groupRefs.current[categoryIndex] = el
                }}
                className={
                  pinnedLayout
                    ? "tools-track__group flex-none"
                    : "tools-track__group scroll-mt-[calc(var(--toolbar-offset,8.5rem)+1rem)]"
                }
                aria-label={pinnedLayout ? entry.category.label : undefined}
                aria-labelledby={
                  pinnedLayout ? undefined : `tools-category-${entry.category.id}`
                }
              >
                {!pinnedLayout && (
                  <header className="tools-grid__group-header mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h2
                        id={`tools-category-${entry.category.id}`}
                        className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight tracking-tight"
                      >
                        {entry.category.label}
                      </h2>
                      <p className="text-muted-foreground/80 text-sm sm:text-base leading-snug mt-1">
                        {entry.category.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {entry.tools.length} tools
                    </span>
                  </header>
                )}

                <div
                  className={
                    pinnedLayout
                      ? "flex flex-nowrap items-stretch gap-5"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  }
                >
                  {entry.tools.map((tool: ToolDefinition) => (
                    <div
                      key={tool.id}
                      className={
                        pinnedLayout
                          ? "tools-track__card-slot h-[280px] w-[300px] flex-none overflow-visible sm:h-[320px] sm:w-[340px] lg:h-[340px] lg:w-[380px]"
                          : "tools-track__card-slot"
                      }
                    >
                      <ToolCard tool={tool} onSelect={onSelect} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      </section>
      {endBuffer > 0 && (
        <div
          className="tools-track__end-buffer"
          style={{ height: `${endBuffer}px` }}
          aria-hidden="true"
        />
      )}
    </>
  )
})

export default ToolsSections
