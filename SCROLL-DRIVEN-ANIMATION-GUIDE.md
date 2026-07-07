# Scroll-Driven Animation Guide — `/tools` Page

> How to add **animejs.com-style** scroll-driven animations to the **tools page** (`/tools`) of portfolio-v2.
> Grounded in the **actual** codebase architecture (anime.js v4 + Canvas-2D backgrounds), not a hypothetical R3F setup.
> Last updated: 2026-07-03.

---

## Table of Contents

1. [Inspiration: what animejs.com does](#1-inspiration-what-animejscom-does)
2. [Codebase reality check (read this first)](#2-codebase-reality-check-read-this-first)
3. [Current `/tools` animation inventory](#3-current-tools-animation-inventory)
4. [Architecture decisions](#4-architecture-decisions)
5. [Shared infrastructure (new hooks)](#5-shared-infrastructure-new-hooks)
6. [Phase 1 — ToolsGrid section + category headers](#6-phase-1--toolsgrid-section--category-headers)
7. [Phase 2 — ToolCard staggered scroll reveal](#7-phase-2--toolcard-staggered-scroll-reveal)
8. [Phase 3 — Tool view / tool header transitions](#8-phase-3--tool-view--tool-header-transitions)
9. [Phase 4 — Scroll progress indicator (optional)](#9-phase-4--scroll-progress-indicator-optional)
10. [Phase 5 — Heading parallax on `/tools` (optional)](#10-phase-5--heading-parallax-on-tools-optional)
11. [Accessibility & performance](#11-accessibility--performance)
12. [File change summary](#12-file-change-summary)
13. [Testing checklist](#13-testing-checklist)
14. [Relation to ANIMATION-MIGRATION-PLAN.md & the stale Tier-1 memory](#14-relation-to-animation-migration-planmd--the-stale-tier-1-memory)

---

## 1. Inspiration: what animejs.com does

The animejs.com homepage is a **scroll-driven 3D scene** — a real-time WebGL render whose timeline is scrubbed by scroll position. Two render systems run at 60fps:

1. **Time-based continuous animations** — rings spin, modules bob, particles float (`requestAnimationFrame`).
2. **Scroll-scrubbed master timeline** — camera fly-through, scene rotation, section transitions (driven by scroll via anime.js `onScroll()`).

Core anime.js v4 APIs used:

| API | Purpose |
|-----|---------|
| `animate()` | Individual tweens (opacity, transforms, colors) |
| `createTimeline()` | Master scroll-scrubbed timeline |
| `onScroll()` | Link an animation's progress to scroll position |
| `stagger()` | Wave effects across many elements |
| `createScope()` | Scoped animations per section (auto-cleanup) |

**The key idea we borrow:** a single scroll-linked timeline + `stagger()` orchestrates many elements, instead of per-element IntersectionObservers. We do **not** borrow the WebGL/Three.js scene — see §2.

---

## 2. Codebase reality check (read this first)

The earlier version of this guide assumed a Three.js / React Three Fiber stack. **That assumption is wrong for this repo.** Verified facts as of 2026-07-03:

### Dependencies actually installed (`package.json`)

| Package | Present? | Notes |
|---------|----------|-------|
| `animejs` | ✅ `^4.3.6` | The animation library. Used heavily. |
| `three` | ❌ | **Not installed.** |
| `@react-three/fiber` | ❌ | **Not installed.** |
| `@react-three/drei` | ❌ | **Not installed.** |
| `@react-three/postprocessing` | ❌ | **Not installed.** |

> ⚠️ The previous guide's "three / R3F / drei already installed" claims were false, and its `engine-background.tsx` (R3F) plan will not compile without installing ~4 new heavy packages. That plan is intentionally **dropped** from this guide. If a 3D scroll-driven background is still desired later, it is a separate, dep-adding decision — see "Relation to..." §14.

### Backgrounds architecture (the real one)

`components/backgrounds/index.tsx` — a switcher over **20 Canvas-2D backgrounds** (aurora, neural, starfield, waves, bokeh, fireflies, glassmorphism, gradient-mesh, dot-grid, matrix-grid, matrix-rain, hexagon-grid, neon-rings, vortex, ripple, rain, topography, constellation, spotlight, particles).

- **All 2D canvas + `animejs`** (`createScope` + `animate` + `stagger`). **None use WebGL/Three.js.**
- Build-time env locking: `NEXT_PUBLIC_BG_MODE` (`switcher` | `random` | `<id>`), `NEXT_PUBLIC_DEFAULT_BG`. `.env.local` currently sets `NEXT_PUBLIC_BG_MODE=neural` (locked to the neural-network background).
- Tree-shaking: when locked to one bg, only that bg's code is bundled.
- The tools page already mounts this via `app/tools/page.tsx` → `dynamic(() => import("@/components/backgrounds"), { ssr: false })`.

**Implication:** the background layer is **separate** from tools content. Scroll-driven work for `/tools` targets the **DOM content** (cards, headers, tool-view), not the background. This matches animejs.com's separation of "continuous RAF animations" (our Canvas bg) vs "scroll-scrubbed timeline" (our content).

### The stale "Tier 1" memory

A memory note claimed anime.js scroll entrances were implemented via `hooks/use-anime-scope.ts` and `app/template.tsx`. **Neither file exists.** The home sections still use the old `useSectionVisibility` + CSS `animate-fade-in-up` pattern. Tier 1 was reverted or never landed. This guide does not assume it. (See §14.)

### `ANIMATION-MIGRATION-PLAN.md` exists and is good

It documents the intended **home-page** migration (hero/about/projects/contact/loading/back-to-top) in detail with exact anime.js v4 code and the `createScope`/`onScroll`/`stagger` convention. **It does not cover `/tools`.** This guide is the `/tools` complement, reusing the same conventions so the two plans compose.

---

## 3. Current `/tools` animation inventory

### Route

`app/tools/page.tsx` ("use client") renders `AnimatedBackground` (dynamic, ssr:false) + `Navigation` + `ToolsPage` + `Footer` + `BackToTop`. `useEffect` does `window.scrollTo(0,0)` on mount.

### Components & current animations

| File | Current animation | Mechanism |
|------|-------------------|-----------|
| `components/tools/tools-page.tsx` | None on transition. `selectTool` sets hash + `scrollTo(0,0)`; `goBack` clears hash. | hash routing + `useState` |
| `components/tools/tools-grid.tsx` | Section: `animate-fade-in-up`. Cards: `animationDelay={index * 100}` inline style. | CSS keyframes |
| `components/tools/tool-card.tsx` | **Each card has its own `useSectionVisibility({ once: true, threshold: 0.1 })`** → toggles `opacity-0` ↔ `animate-fade-in-up`. | IntersectionObserver per card |
| `components/tools/tool-view.tsx` | Tool panel: `animate-fade-in-up` (`animationDelay: 150ms`). Tool body lazy via `Suspense`. | CSS keyframes |
| `components/tools/tool-header.tsx` | Breadcrumb + header: `animate-fade-in-up`. | CSS keyframes |

### The problem to fix

- **Up to 86 `IntersectionObserver`s** (one per `ToolCard`) — wasteful and janky on a long page.
- Stagger is purely time-based (`index * 100ms`), so cards below the fold animate on mount whether visible or not, then `useSectionVisibility` fights to hide them. Mixed signals.
- Grid → tool-view transition is instant (`scrollTo(0,0)` + hash swap), no choreography.
- No scroll progress signal, no parallax — the page feels static despite the animated background.

### Opportunity

86 tools across 6 categories = a long, scroll-heavy page. Perfect for:
- Per-category scroll-triggered header reveals.
- Per-row staggered card reveals tied to scroll (not mount).
- A grid ↔ tool-view transition timeline.
- A thin scroll-progress indicator + subtle heading parallax.

---

## 4. Architecture decisions

1. **No new runtime dependencies.** Use installed `animejs@4.3.6`. No Three.js.
2. **Content-only scope.** Animate the `/tools` DOM. Do **not** touch the Canvas-2D background (it already runs its own RAF).
3. **One scope per orchestrator.** `ToolsGrid` and `ToolView` each own a `createScope({ root })` so anime.js owns cleanup via `scope.revert()`.
4. **Replace per-card observers with scoped `onScroll` + `stagger`.** One observer per category section drives a staggered reveal of all its cards — far fewer observers, and reveals are tied to scroll.
5. **Accessibility-first.** `prefers-reduced-motion: reduce` and small-screen breakpoints skip entrance animations and keep content fully visible (no `opacity-0` traps). Use the `motion-reduce:` Tailwind variant as a CSS safety net.
6. **Keep `useSectionVisibility` for now.** It's still used by home sections. Don't delete it. Just stop using it in `/tools` card components.
7. **Compose with `ANIMATION-MIGRATION-PLAN.md`.** Same hook naming (`use-anime-scope.ts`), same `createScope`/`onScroll`/`stagger` shapes, so the codebase stays consistent.

---

## 5. Shared infrastructure (new hooks)

### 5.1 `hooks/use-anime-scope.ts`

Reusable React lifecycle wrapper around `createScope`. Matches the convention in `ANIMATION-MIGRATION-PLAN.md` §3.2 and the backgrounds.

```ts
"use client"

import { useEffect, useRef } from "react"
import { createScope } from "animejs"
import type { Scope } from "animejs"

export interface UseAnimeScopeOptions {
  defaults?: Record<string, unknown>
  mediaQueries?: Record<string, string>
  /** Skip scope creation (e.g. reduced motion / mobile). Scope is still returned as null. */
  disabled?: boolean
}

export function useAnimeScope(options: UseAnimeScopeOptions = {}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)

  useEffect(() => {
    if (options.disabled || !rootRef.current) return
    scopeRef.current = createScope({
      root: rootRef.current,
      defaults: options.defaults,
      mediaQueries: options.mediaQueries,
    })
    return () => {
      scopeRef.current?.revert()
      scopeRef.current = null
    }
  }, [options.disabled])

  return { rootRef, scope: scopeRef }
}
```

### 5.2 `hooks/use-scroll-progress.ts`

Continuous `0..1` scroll progress of the page, driven by anime.js `onScroll` (the animejs.com pattern). Throttled via `requestAnimationFrame` so it stays cheap. Used by optional phases (§9, §10).

```ts
"use client"

import { useEffect, useRef, useState } from "react"
import { animate, onScroll } from "animejs"

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion.current) return

    const proxy = { value: 0 }
    let raf = 0
    let pending = false

    const flush = () => {
      pending = false
      setProgress(proxy.value)
    }

    const scrollController = onScroll({
      target: document.body,
      enter: "max",
      leave: "min",
      sync: 0.9,
    })

    const animation = animate(proxy, {
      value: [0, 1],
      ease: "linear",
      autoplay: scrollController,
      onUpdate: () => {
        if (!pending) {
          pending = true
          raf = requestAnimationFrame(flush)
        }
      },
    })

    return () => {
      animation.pause()
      scrollController?.disable?.()
      cancelAnimationFrame(raf)
    }
  }, [])

  return progress
}
```

### 5.3 Motion-safety helper (inline, no file)

Reuse this snippet wherever a scope is created. It mirrors the guard used by `starfield-background.tsx` (`window.matchMedia("(prefers-reduced-motion: reduce)").matches`) and adds a small-screen guard.

```ts
function motionSafe() {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
  return true
}
```

---

## 6. Phase 1 — ToolsGrid section + category headers

**Goal:** the heading + search/filter bar reveal on mount; each **category block** (header + description + its cards) reveals as it scrolls into view, with the header leading and cards staggering in behind it.

### `components/tools/tools-grid.tsx` — changes

Add a root ref + scope. Replace the section-level `animate-fade-in-up` with an anime.js entrance. Add stable CSS classes for targeting (`.tools-heading`, `.tools-searchbar`, `.tool-category`, `.category-title`, `.category-desc`, `.tool-card`).

```tsx
"use client"

import { useRef } from "react"
import { getToolCategories, getToolsByCategory } from "@/lib/content/tools/utils"
import type { ToolDefinition } from "@/lib/content/tools/types"
import ToolCard from "@/components/tools/tool-card"
import { useAnimeScope } from "@/hooks/use-anime-scope"
import { animate, onScroll, stagger } from "animejs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// ...ToolsGridProps unchanged...

export default function ToolsGrid({ tools, searchQuery, onSearchChange, searchPlaceholder, heading, description, onSelectTool }: ToolsGridProps) {
  const categories = getToolCategories()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { rootRef, scope } = useAnimeScope()

  // Build scroll-driven reveals once the scope exists.
  useEffect(() => {
    if (!scope.current) return

    scope.current.add(() => {
      // 1. Heading + search/filter entrance on mount (one-shot).
      animate(".tools-heading", {
        opacity: [0, 1], y: [24, 0], duration: 700, ease: "out(3)",
      })
      animate(".tools-searchbar", {
        opacity: [0, 1], y: [16, 0], duration: 600, delay: 120, ease: "out(3)",
      })

      // 2. Per-category scroll reveal: header leads, cards stagger behind.
      animate(".category-title", {
        opacity: [0, 1], y: [24, 0], duration: 600, ease: "out(3)",
        autoplay: false,
        delay: stagger(80, { start: 0 }),
      })
      animate(".tool-card", {
        opacity: [0, 1], y: [28, 0], duration: 600, ease: "out(3)",
        delay: stagger(60),
        autoplay: false,
      })

      // Tie the per-category reveals to scroll. `onScroll` syncs the
      // animation's progress to the category block's position in viewport.
      document.querySelectorAll<HTMLElement>(".tool-category").forEach((block) => {
        const title = block.querySelector(".category-title")
        const cards = block.querySelector(".tool-cards")
        if (title) {
          const a = animate(title, { opacity: [0, 1], y: [24, 0], duration: 600, ease: "out(3)", autoplay: false })
          onScroll(a, { target: title, enter: "bottom", leave: "top" })
        }
        if (cards) {
          const b = animate(cards.querySelectorAll(".tool-card"), {
            opacity: [0, 1], y: [28, 0], duration: 600, ease: "out(3)",
            delay: stagger(60), autoplay: false,
          })
          onScroll(b, { target: cards, enter: "bottom", leave: "top" })
        }
      })
    })
  }, [scope])

  const filteredTools = activeCategory ? tools.filter((t) => t.category === activeCategory) : tools

  return (
    <section ref={rootRef} className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="tools-heading text-center mb-12 opacity-0 motion-reduce:opacity-100">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{heading}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="tools-searchbar flex flex-col sm:flex-row items-center gap-4 mb-8 opacity-0 motion-reduce:opacity-100">
        {/* Search input + category chips — unchanged markup, just wrapped */}
        ...
      </div>

      {/* Default: grouped by category */}
      {!activeCategory && !searchQuery ? (
        categories.map((cat) => {
          const catTools = getToolsByCategory(cat.id)
          return (
            <div key={cat.id} className="tool-category mb-12 last:mb-0">
              <h2 className="category-title text-2xl font-semibold text-foreground mb-2 opacity-0 motion-reduce:opacity-100">
                {cat.label}
              </h2>
              <p className="category-desc text-muted-foreground mb-6 opacity-0 motion-reduce:opacity-100">
                {cat.description}
              </p>
              <div className="tool-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
                ))}
              </div>
            </div>
          )
        })
      ) : (
        /* search / active-category branches — keep existing markup, wrap with .tool-cards */
        <div className="tool-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      )}
    </section>
  )
}
```

**Notes**
- `opacity-0 motion-reduce:opacity-100` ensures content is visible if reduced motion disables the scope (`scope` stays `null`, anime never runs, elements would otherwise stay invisible). This is the critical safety net.
- Don't pass `animationDelay` to `ToolCard` anymore — `stagger(60)` inside the scope handles it. (See Phase 2.)
- The `useEffect` depends on `[scope]`; because `scope` is a ref object, also fine to depend on `[]` and read `scope.current`. Add the dep that satisfies your lint config.

---

## 7. Phase 2 — ToolCard staggered scroll reveal

**Goal:** stop giving each card its own `IntersectionObserver`. Cards start hidden via CSS, and the Phase 1 scope's staggered `onScroll` reveal drives them. `ToolCard` becomes purely presentational.

### `components/tools/tool-card.tsx` — changes

Remove `useSectionVisibility`, remove `isVisible`, remove `animationDelay`, remove the conditional `animate-fade-in-up`/`opacity-0` toggle. Add the `.tool-card` class + `opacity-0 motion-reduce:opacity-100` so the parent scope can target and reveal it.

```tsx
"use client"

import type { ToolDefinition } from "@/lib/content/tools/types"
import { Card } from "@/components/ui/card"
import { ArrowRight, Braces } from "lucide-react"
import { iconMap } from "@/lib/content/tools/icon-map"
import { getToolCategories } from "@/lib/content/tools/utils"

interface ToolCardProps {
  tool: ToolDefinition
  onSelect: (id: string) => void
}

export default function ToolCard({ tool, onSelect }: ToolCardProps) {
  const IconComponent = iconMap[tool.icon] || Braces
  const categoryColors: Record<string, string> = { /* unchanged */ }
  const categories = getToolCategories()
  const categoryLabel = categories.find((c) => c.id === tool.category)?.label || "Dev"

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`Open ${tool.label} tool`}
      className="tool-card group cursor-pointer p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm bg-background/80 border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary opacity-0 motion-reduce:opacity-100"
      onClick={() => onSelect(tool.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(tool.id)
        }
      }}
    >
      {/* ...unchanged inner markup... */}
    </Card>
  )
}
```

**Result:** zero `IntersectionObserver`s per card. One `onScroll` per category block. Cards reveal in a 60ms stagger as the block scrolls into view.

> If you keep the search/active-category branches rendering a flat `.tool-cards` grid (not inside `.tool-category`), add a fallback reveal in the same `scope.current.add(...)` block targeting those `.tool-cards` directly, so filtered results still animate. The example in §6 already wraps both branches with `.tool-cards`.

---

## 8. Phase 3 — Tool view / tool header transitions

**Goal:** the grid → tool-view swap should feel choreographed, not instant. On `selectTool`: fade/zoom the grid out, then fade/zoom the tool panel in. On `goBack`: reverse.

`tools-page.tsx` currently swaps components by `activeToolId` with `scrollTo(0,0)`. Wrap the swap in a short anime.js timeline keyed off `activeToolId`.

### `components/tools/tools-page.tsx` — changes

```tsx
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { animate, createTimeline } from "animejs"
import { getToolsPageContent, searchTools } from "@/lib/content/tools/utils"
import ToolsGrid from "@/components/tools/tools-grid"
import ToolView from "@/components/tools/tool-view"

export default function ToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"grid" | "tool">("grid")
  const swapRef = useRef<HTMLDivElement>(null)
  const content = getToolsPageContent()

  // hash routing unchanged...
  useEffect(() => { /* existing hashchange listener */ }, [])

  const selectTool = useCallback((id: string) => {
    setActiveToolId(id)
    window.history.replaceState(null, "", `#${id}`)
    window.scrollTo(0, 0)

    // Grid → tool timeline.
    const el = swapRef.current
    if (el) {
      const tl = createTimeline({ defaults: { duration: 320, ease: "out(3)" } })
      tl.add(el, { opacity: [1, 0], y: [0, -16] })
        .add(el, { opacity: [0, 1], y: [16, 0], onComplete: () => setView("tool") })
    } else {
      setView("tool")
    }
  }, [])

  const goBack = useCallback(() => {
    const el = swapRef.current
    const finish = () => {
      setActiveToolId(null)
      setView("grid")
      window.history.replaceState(null, "", window.location.pathname)
    }
    if (el) {
      const tl = createTimeline({ defaults: { duration: 280, ease: "out(3)" } })
      tl.add(el, { opacity: [1, 0], y: [0, 16] })
        .add(el, { opacity: [0, 1], y: [-16, 0], onComplete: finish })
    } else {
      finish()
    }
  }, [])

  const filteredTools = searchQuery ? searchTools(searchQuery) : content.tools

  return (
    <div ref={swapRef} className="tools-swap">
      {view === "tool" && activeToolId ? (
        <ToolView toolId={activeToolId} onBack={goBack} backLabel={content.backToGridLabel} />
      ) : (
        <ToolsGrid
          tools={filteredTools}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={content.searchPlaceholder}
          heading={content.heading}
          description={content.description}
          onSelectTool={selectTool}
        />
      )}
    </div>
  )
}
```

### `components/tools/tool-view.tsx` & `tool-header.tsx`

Drop the CSS `animate-fade-in-up` from the tool panel and header (the Phase 3 timeline now handles the entrance). Keep them at rest visible (`opacity-100`). If you want the inner body to settle in after the panel, replace `animate-fade-in-up` on the body wrapper with a small anime.js `animate(".tool-body", { opacity: [0, 1], y: [12, 0], delay: 120, duration: 500, ease: "out(3)" })` inside a `useAnimeScope` in `ToolView`.

---

## 9. Phase 4 — Scroll progress indicator (optional)

A thin top-of-page progress bar driven by `useScrollProgress`. Add to `app/tools/page.tsx` (or a small `<ScrollProgress />` component).

```tsx
"use client"
import { useScrollProgress } from "@/hooks/use-scroll-progress"

function ScrollProgress() {
  const p = useScrollProgress()
  if (p <= 0) return null
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
        style={{ width: `${Math.min(100, p * 100)}%` }}
      />
    </div>
  )
}
```

Render `<ScrollProgress />` inside `app/tools/page.tsx`. The hook already no-ops under reduced motion.

---

## 10. Phase 5 — Heading parallax on `/tools` (optional)

Subtle parallax + fade on the `.tools-heading` as the user scrolls, using `useScrollProgress`.

```tsx
// inside ToolsGrid, after Phase 1 markup:
const p = useScrollProgress()
<div
  className="tools-heading text-center mb-12 opacity-0 motion-reduce:opacity-100"
  style={{
    transform: `translateY(${p * 40}px)`,
    opacity: undefined, // let anime.js own opacity on mount; parallax only adjusts transform
  }}
>
```

Keep the parallax small (≤40px) so it doesn't fight the Phase 1 entrance. Skip entirely on mobile.

---

## 11. Accessibility & performance

### Accessibility (non-negotiable)

- **`prefers-reduced-motion: reduce`**: skip scope creation (`useAnimeScope({ disabled: !motionSafe() })`). Elements must rest visible. The `motion-reduce:opacity-100` Tailwind variant is the CSS safety net — always pair it with `opacity-0` on anime-targeted elements.
- **Don't hide content behind scroll.** Every card, header, and the tool body must be fully readable with JS off or reduced motion on. The `opacity-0` start state is only acceptable because anime.js (or the `motion-reduce:` variant) will reveal it.
- **Keyboard**: `ToolCard` keeps `role="button"`, `tabIndex={0}`, and Enter/Space handlers (already present). Don't break this when removing `useSectionVisibility`.
- **Focus order**: the grid → tool-view swap must move focus sensibly. After `setView("tool")`, focus the tool panel's back button; after `goBack`, return focus to the card that was opened (store the previously-focused element).

### Performance

| Concern | Mitigation |
|---------|------------|
| Many `IntersectionObserver`s | Phase 2 removes 86 per-card observers; Phase 1 adds ~6 (one per category). Net large win. |
| Scroll progress re-renders | `useScrollProgress` flushes via `requestAnimationFrame`, ~60Hz max, and only updates a single width. Don't route it through heavy subtrees. |
| Scope churn | `createScope` once per orchestrator mount; `scope.revert()` on unmount. Don't recreate on every render. |
| Reduced-motion path | Early-return in hooks; no RAF, no observers, no re-renders. |
| Mobile | Consider skipping Phase 4/5 on `< 768px` (reuse `useShouldRenderCanvas` logic or a `matchMedia` check). Phase 1–3 are cheap enough to keep. |
| Background already running | Don't add a second full-screen RAF. The Canvas bg is separate; we only animate DOM. |

---

## 12. File change summary

### New files

| File | Purpose |
|------|---------|
| `hooks/use-anime-scope.ts` | Reusable `createScope` lifecycle hook (shared with home-page migration) |
| `hooks/use-scroll-progress.ts` | Continuous `0..1` scroll progress via `onScroll` (optional phases) |

### Modified files

| File | Change |
|------|--------|
| `components/tools/tools-grid.tsx` | Add `useAnimeScope`, replace CSS entrance with `animate` + per-category `onScroll` + `stagger`; add `.tools-heading` / `.tools-searchbar` / `.tool-category` / `.category-title` / `.tool-cards` classes; `opacity-0 motion-reduce:opacity-100` on targets |
| `components/tools/tool-card.tsx` | Remove `useSectionVisibility`, `isVisible`, `animationDelay`, conditional classes; add `.tool-card` + `opacity-0 motion-reduce:opacity-100` |
| `components/tools/tools-page.tsx` | Wrap grid/tool swap in `createTimeline`; manage `view` state; focus management |
| `components/tools/tool-view.tsx` | Remove `animate-fade-in-up` from panel (Phase 3 owns entrance); optional `useAnimeScope` for body settle |
| `components/tools/tool-header.tsx` | Remove `animate-fade-in-up` |
| `app/tools/page.tsx` | (Optional) render `<ScrollProgress />` |

### Unchanged

| File | Reason |
|------|--------|
| `components/backgrounds/*` | Canvas-2D background layer; separate from content. Out of scope. |
| `hooks/use-section-visibility.ts` | Still used by home sections. Don't delete. |
| `lib/content/tools/*` | Content/types unchanged. |

### Dependencies

**None added.** `animejs@4.3.6` is already installed and used by the backgrounds.

---

## 13. Testing checklist

- [ ] `pnpm dev` starts without errors on `/tools`
- [ ] Heading + search bar fade/slide in on mount
- [ ] Scrolling to a category reveals its title, then its cards in a 60ms stagger
- [ ] Cards below the fold do **not** animate until scrolled into view
- [ ] Opening a tool: grid fades out, tool panel fades in (timeline, not instant)
- [ ] Back button: tool panel fades out, grid fades in
- [ ] Focus moves to the tool back button on open; returns to the card on back
- [ ] `prefers-reduced-motion: reduce` → everything visible immediately, no movement
- [ ] `motion-reduce:` Tailwind variant keeps content visible even if JS fails to load
- [ ] Mobile (`< 768px`): entrances still fine; optional parallax/progress skipped
- [ ] No console errors from anime.js (check for `onScroll` target warnings)
- [ ] Background switcher / locked `neural` bg still works (unchanged)
- [ ] `pnpm build` (static export) completes
- [ ] No `IntersectionObserver` per `ToolCard` anymore (verify in DevTools)

---

## 14. Relation to ANIMATION-MIGRATION-PLAN.md & the stale Tier-1 memory

### `ANIMATION-MIGRATION-PLAN.md`
Covers the **home page** (hero/about/projects/contact/loading/back-to-top) with exact anime.js v4 code and the `createScope`/`onScroll`/`stagger` convention. **This guide is the `/tools` complement** and deliberately reuses the same hook name (`use-anime-scope.ts`) and API shapes so the two compose into one coherent migration. If you implement Phase 0 of the migration plan (create `use-anime-scope.ts`), skip §5.1 here — it's the same file.

### The stale Tier-1 memory
A memory note (`scroll-driven-animation-tier-1.md`) previously claimed Tier-1 scroll animations were implemented via `hooks/use-anime-scope.ts` and `app/template.tsx`. **Neither file exists** as of 2026-07-03 — Tier 1 was reverted or never landed. That memory has been corrected. This guide does not assume any prior anime.js scroll work in the repo.

### The dropped R3F plan
The prior version of this guide proposed an `engine-background.tsx` built on `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`, claiming those packages were "already installed." They are **not** installed, and the existing 20-background system is Canvas-2D. Adding a Three.js background is a separate, dep-adding decision that diverges from the current architecture. It is intentionally **not** part of this `/tools` guide. If desired later, scope it as its own task: install deps, add an `engine` entry to `components/backgrounds/index.tsx`, and gate behind `NEXT_PUBLIC_BG_MODE=engine` — but that affects every page, not just `/tools`.

---

*End of guide. Grounded in the real portfolio-v2 architecture as of 2026-07-03.*