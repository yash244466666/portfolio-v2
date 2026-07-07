"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { ToolCategory } from "@/lib/content/tools/types"
import type { ToolDefinition } from "@/lib/content/tools/types"
import { getToolsByCategory } from "@/lib/content/tools/utils"
import ToolCard from "@/components/tools/tool-card"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface ToolsSectionsProps {
  categories: ToolCategory[]
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder: string
  onSelect: (id: string) => void
}

// Distance from the viewport top at which a panel should stick (matches the
// fixed nav + the page's `pt-20` offset).
const NAV_OFFSET = 80

// Large categories (e.g. Dev: 44 tools) would create absurdly long horizontal
// tracks if rendered as one section. Split them into chunks so each pinned
// scene stays a reasonable scroll distance while keeping the filmstrip feel.
const MAX_CARDS_PER_SECTION = 12

interface SectionMeta {
  overflow: number
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Cinematic scroll-pinned category sections.
 *
 * Each category becomes a pinned "scene". Inside the pinned viewport is a
 * single horizontal row of tool cards. Vertical scroll translates the row
 * horizontally (film-strip style); when the row reaches its end the pin
 * releases and the next category's row takes over. Scrolling up reverses.
 *
 * The global search and category filter live inside *every* section header so
 * they are always available at the top of the pinned viewport. The active
 * category chip reflects the section currently in view.
 *
 * Accessibility: under `prefers-reduced-motion: reduce` or on narrow screens
 * (<768px) the sticky positioning and transform are disabled via Tailwind
 * variants (`motion-reduce:` / `max-md:`) and JS skips the scroll-driven
 * transform, yielding a normal stacked grid.
 */
export default function ToolsSections({
  categories,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onSelect,
}: ToolsSectionsProps) {
  const sectionEls = useRef<(HTMLElement | null)[]>([])
  const trackEls = useRef<(HTMLElement | null)[]>([])
  const viewportEls = useRef<(HTMLElement | null)[]>([])
  const meta = useRef<SectionMeta[]>([])
  const [motionSafe, setMotionSafe] = useState(false)
  const [openSearchSectionId, setOpenSearchSectionId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const activeSectionIndexRef = useRef(activeSectionIndex)
  activeSectionIndexRef.current = activeSectionIndex

  // Sync local input value when the parent clears the search (e.g. from the results page).
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  // Detect reduced motion + narrow viewport, and re-check on resize / OS pref change.
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

  // Focus the search input when it opens so the user can type immediately.
  useEffect(() => {
    if (!openSearchSectionId) {
      setActiveSuggestionIndex(-1)
      return
    }
    const input = document.querySelector<HTMLInputElement>(`#tool-search-${openSearchSectionId}`)
    if (input) input.focus()
  }, [openSearchSectionId])

  // Measure the horizontal overflow of each track and size the outer section
  // so there is exactly `overflow` px of scroll while its panel is pinned.
  useIsoLayoutEffect(() => {
    if (!motionSafe) return

    const measure = () => {
      const panelHeight = window.innerHeight - NAV_OFFSET
      sectionEls.current.forEach((section, i) => {
        if (!section) return
        const track = trackEls.current[i]
        const viewport = viewportEls.current[i]
        if (!track || !viewport) return
        const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth)
        section.style.height = `${panelHeight + overflow}px`
        meta.current[i] = { overflow }
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

  // Drive each horizontal track from the section's scroll progress and track
  // which section is currently pinned in view.
  useEffect(() => {
    if (!motionSafe) return

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const scrollY = window.scrollY
        let nextActive = -1

        sectionEls.current.forEach((section, i) => {
          if (!section) return
          const track = trackEls.current[i]
          const m = meta.current[i]
          if (!track || !m) return

          const rect = section.getBoundingClientRect()
          const isPinned = rect.top <= NAV_OFFSET && rect.bottom > NAV_OFFSET
          if (isPinned) nextActive = i

          if (m.overflow > 0) {
            const sectionTop = rect.top + scrollY
            const pinStart = sectionTop - NAV_OFFSET
            let progress = (scrollY - pinStart) / m.overflow
            progress = Math.max(0, Math.min(1, progress))
            track.style.transform = `translateX(${-m.overflow * progress}px)`
            section.style.setProperty("--section-progress", String(progress))
          }
        })

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

  // Keyboard-driven horizontal scrub for users who prefer arrow keys.
  useEffect(() => {
    if (!motionSafe) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
      const section = sectionEls.current.find((s) => {
        if (!s) return false
        const rect = s.getBoundingClientRect()
        return rect.top <= NAV_OFFSET && rect.bottom > NAV_OFFSET
      })
      if (!section) return
      const i = sectionEls.current.indexOf(section)
      const m = meta.current[i]
      if (!m || m.overflow <= 0) return
      e.preventDefault()
      const step = m.overflow * 0.15
      const current = window.scrollY
      window.scrollTo({ top: e.key === "ArrowRight" ? current + step : current - step, behavior: "smooth" })
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [motionSafe])

  // Build a flat list of sections. Large categories are chunked so each pinned
  // scene has at most MAX_CARDS_PER_SECTION cards.
  const sectionDefinitions = categories.flatMap((cat) => {
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
  })

  const activeCategoryId = sectionDefinitions[activeSectionIndex]?.categoryId

  // Clicking a category chip smoothly scrolls to that category's first pinned
  // section instead of swapping to a separate filtered view.
  const scrollToCategory = (categoryId: string) => {
    const idx = sectionDefinitions.findIndex((s) => s.categoryId === categoryId)
    const el = sectionEls.current[idx]
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    window.scrollTo({ top, behavior: "smooth" })
  }

  // Tool catalogue used for search suggestions.
  const allTools = useMemo(
    () => categories.flatMap((cat) => getToolsByCategory(cat.id)),
    [categories]
  )

  // Build a short suggestion list from tool labels/descriptions whenever the
  // search input has a value.
  const getSuggestions = (query: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allTools
      .filter(
        (tool) =>
          tool.label.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q)
      )
      .slice(0, 6)
  }

  return (
    <div className="tools-sections" role="region" aria-label="Tools">
      {sectionDefinitions.map((section, i) => {
        const title =
          section.totalChunks > 1
            ? `${section.label} — Part ${section.chunkIndex + 1}/${section.totalChunks}`
            : section.label

        const isOpen = openSearchSectionId === section.id
        const suggestions = getSuggestions(inputValue)
        const listboxId = `tool-listbox-${section.id}`
        const selectSuggestion = (label: string) => {
          setInputValue(label)
          onSearchChange(label)
          setOpenSearchSectionId(null)
        }

        return (
          <section
            key={section.id}
            ref={(el) => {
              sectionEls.current[i] = el
            }}
            className="tool-section motion-reduce:!h-auto max-md:!h-auto"
            aria-labelledby={`section-title-${section.id}`}
          >
            {/**
             * Sticky pinned panel. The CSS fallback classes below collapse it
             * to normal flow on mobile / reduced-motion so the scroll-driven
             * transform never hides content.
             */}
            <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-visible flex flex-col pt-14 motion-reduce:!static motion-reduce:!h-auto motion-reduce:!overflow-visible motion-reduce:!pt-0 max-md:!static max-md:!h-auto max-md:!overflow-visible max-md:!pt-0">
              <header className="shrink-0 px-4 sm:px-6">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <h2
                      id={`section-title-${section.id}`}
                      className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight tracking-tight truncate"
                    >
                      {title}
                    </h2>
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap shrink-0">
                      {section.tools.length} tools
                    </span>
                  </div>
                  {section.totalChunks > 1 && (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {String(section.chunkIndex + 1).padStart(2, "0")}/{String(section.totalChunks).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground/80 text-sm sm:text-base leading-snug mt-1 max-w-2xl">
                  {section.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 relative">
                  {/** Search combobox */}
                  <div className="relative">
                    <div
                      className={`flex items-center h-11 rounded-full border transition-all duration-200 ease-out ${
                        isOpen
                          ? "w-56 sm:w-64 bg-muted/80 border-primary/40 pr-1"
                          : "w-auto bg-muted/60 border-border/60 hover:bg-muted hover:border-border cursor-pointer"
                      }`}
                      onClick={isOpen ? undefined : () => setOpenSearchSectionId(section.id)}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenSearchSectionId(isOpen ? null : section.id)}
                        aria-label={isOpen ? "Close search" : "Search tools"}
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? listboxId : undefined}
                        className="inline-flex items-center justify-center h-11 w-11 shrink-0 text-foreground transition-colors focus-visible:outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Search className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {isOpen ? (
                        <div className="flex-1 flex items-center gap-1">
                          <label htmlFor={`tool-search-${section.id}`} className="sr-only">
                            {searchPlaceholder}
                          </label>
                          <Input
                            id={`tool-search-${section.id}`}
                            type="text"
                            role="combobox"
                            aria-expanded={isOpen && suggestions.length > 0}
                            aria-controls={listboxId}
                            aria-autocomplete="list"
                            aria-activedescendant={
                              activeSuggestionIndex >= 0
                                ? `${listboxId}-opt-${activeSuggestionIndex}`
                                : undefined
                            }
                            placeholder={searchPlaceholder}
                            value={inputValue}
                            onChange={(e) => {
                              setInputValue(e.target.value)
                              setActiveSuggestionIndex(-1)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowDown") {
                                e.preventDefault()
                                if (suggestions.length > 0) {
                                  setActiveSuggestionIndex((prev) =>
                                    prev < suggestions.length - 1 ? prev + 1 : 0
                                  )
                                }
                                return
                              }
                              if (e.key === "ArrowUp") {
                                e.preventDefault()
                                if (suggestions.length > 0) {
                                  setActiveSuggestionIndex((prev) =>
                                    prev > 0 ? prev - 1 : suggestions.length - 1
                                  )
                                }
                                return
                              }
                              if (e.key === "Enter") {
                                e.preventDefault()
                                if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                                  selectSuggestion(suggestions[activeSuggestionIndex].label)
                                } else {
                                  onSearchChange(inputValue)
                                }
                                return
                              }
                              if (e.key === "Escape") {
                                e.preventDefault()
                                if (inputValue) {
                                  setInputValue("")
                                } else {
                                  setOpenSearchSectionId(null)
                                }
                              }
                            }}
                            onBlur={() => {
                              setOpenSearchSectionId(null)
                            }}
                            autoComplete="off"
                            spellCheck={false}
                            className="h-9 border-0 bg-transparent shadow-none focus-within:ring-0 focus-within:ring-offset-0 focus-within:border-transparent hover:bg-transparent hover:border-transparent pl-1 pr-1 w-full"
                          />
                          {inputValue && (
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => setInputValue("")}
                              aria-label="Clear search input"
                              className="inline-flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="pr-3 text-sm font-medium text-foreground/80 whitespace-nowrap select-none">
                          Search
                        </span>
                      )}
                    </div>

                    {/** Suggestion dropdown — listbox. */}
                    {isOpen && suggestions.length > 0 && (
                      <ul
                        id={listboxId}
                        role="listbox"
                        className="absolute top-full left-0 mt-2 w-56 sm:w-64 max-h-72 overflow-auto rounded-xl border border-border/60 bg-muted/95 backdrop-blur-md shadow-xl shadow-black/20 z-40 py-1"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {suggestions.map((tool, idx) => {
                          const isActive = idx === activeSuggestionIndex
                          return (
                            <li key={tool.id} role="presentation">
                              <button
                                id={`${listboxId}-opt-${idx}`}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() => selectSuggestion(tool.label)}
                                onMouseEnter={() => setActiveSuggestionIndex(idx)}
                                className={`w-full text-left px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                                  isActive
                                    ? "bg-primary/15 text-foreground"
                                    : "text-foreground hover:bg-primary/10"
                                }`}
                              >
                                <span className="font-medium block">{tool.label}</span>
                                <span className="block text-xs text-muted-foreground truncate">
                                  {tool.description}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>

                  {/** Category chips */}
                  {categories.map((cat) => {
                    const isActive = activeCategoryId === cat.id
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        aria-pressed={isActive}
                        aria-current={isActive ? "true" : undefined}
                        className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-4px_rgba(124,58,237,0.45)]"
                            : "bg-muted/60 text-foreground border-border/60 hover:bg-muted hover:border-border"
                        }`}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>

                <div
                  className="mt-2 h-0.5 w-full bg-border/40 rounded-full overflow-hidden motion-reduce:hidden max-md:hidden"
                  role="progressbar"
                  aria-label="Section scroll progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={0}
                >
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-400 origin-left transition-transform duration-75 ease-linear"
                    style={{ transform: "scaleX(var(--section-progress, 0))" }}
                  />
                </div>
              </header>

              <div
                ref={(el) => {
                  viewportEls.current[i] = el
                }}
                className="tool-track-viewport relative flex-1 overflow-hidden flex items-start px-4 sm:px-6 motion-reduce:!overflow-visible max-md:!overflow-visible"
                style={
                  motionSafe
                    ? {
                        maskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                      }
                    : undefined
                }
              >
                {/**
                 * Horizontal filmstrip. `flex-nowrap` keeps cards in one row.
                 * Cards are sized so ~2.5–3 are visible and the next card peeks
                 * in, giving a clear affordance that horizontal scroll is driven
                 * by vertical page scroll.
                 */}
                <div
                  ref={(el) => {
                    trackEls.current[i] = el
                  }}
                  style={{ willChange: "transform" }}
                  className="tool-track flex flex-nowrap gap-5 py-2 motion-reduce:!transform-none motion-reduce:flex-col motion-reduce:h-auto motion-reduce:py-0 motion-reduce:gap-4 max-md:!transform-none max-md:flex-col max-md:h-auto max-md:py-0 max-md:gap-4"
                >
                  {section.tools.map((tool: ToolDefinition) => (
                    <div
                      key={tool.id}
                      className="flex-none w-[300px] sm:w-[340px] lg:w-[380px] h-[280px] sm:h-[320px] lg:h-[340px] motion-reduce:w-full motion-reduce:h-auto max-md:w-full max-md:h-auto"
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
}
