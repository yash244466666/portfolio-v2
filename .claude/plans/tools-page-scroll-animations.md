# Plan: Scroll-Driven Animations for `/tools/` Page

## 1. Project analysis summary

**Current architecture**
- Next.js 15 static export, React 19, Tailwind v4, TypeScript.
- `animejs@4.3.6` is installed but only used in `components/backgrounds/starfield-background.tsx`.
- The background system lives in `components/backgrounds/` and is composed of 20 lazy-loaded Canvas 2D backgrounds plus a switcher in `index.tsx`.
- **Three.js / R3F is NOT installed** (`@react-three/*` absent from `node_modules`). The old Three.js hex-grid background described in `AGENT.md` has been replaced.
- The tools page is a client route at `app/tools/page.tsx` that mounts `ToolsPage` → `ToolsGrid` / `ToolView`.
- **Current tools-page animation**: `ToolCard` uses `useSectionVisibility` (IntersectionObserver) + CSS class `animate-fade-in-up` + inline `animationDelay`. `ToolsGrid` and `ToolView` have no scroll choreography beyond that.
- A stale memory claims Tier 1 anime.js scroll animations were already implemented, but the referenced files (`hooks/use-anime-scope.ts`, `app/template.tsx`) do **not** exist.
- `SCROLL-DRIVEN-ANIMATION-GUIDE.md` is outdated: it assumes a Three.js/R3F engine background that the current codebase no longer supports without adding dependencies.

**Key constraints**
- No new heavy runtime dependencies if possible (especially avoid adding Three.js + R3F + postprocessing just for one page).
- Must preserve `prefers-reduced-motion` and mobile performance.
- Must keep the 86 tools functional and the existing lazy-loading intact.
- Static export must still build with `pnpm build`.

## 2. Goal

Apply the **intent** of `SCROLL-DRIVEN-ANIMATION-GUIDE.md` to the `/tools/` page: convert the current passive CSS fade-ins into **active, scroll-driven anime.js v4 choreography** that feels like the animejs.com scroll experience, while fitting the current Canvas 2D / no-Three.js architecture.

## 3. Implementation options

### Option A — Tools-page DOM scroll choreography only (recommended)
- Replace `useSectionVisibility` + CSS `animate-fade-in-up` on tool cards with anime.js `onScroll()` + `createScope()`.
- Add scroll-driven entrances for the page header, search bar, category filter chips, category headings, and staggered card reveals.
- Add a subtle header parallax / blur-as-you-scroll effect.
- **Pros**: No new deps, low risk, directly improves the target page, keeps existing background switcher untouched.
- **Cons**: Not the literal 3D "engine" background from the guide.

### Option B — New scroll-driven Canvas 2D background
- Create `components/backgrounds/scroll-engine-background.tsx`: a Canvas 2D radial "engine" visualization (neon rings, waveform bars, orbiting particles) whose camera/zoom/rotation is scrubbed by page scroll.
- Register it as a new switcher option (`engine`) so it can be used on any page, including `/tools/`.
- **Pros**: Matches the guide's visual concept, fits existing background architecture, no Three.js needed.
- **Cons**: Adds a global background option, not tools-page-specific; more code; visual must be kept subtle so 86 tool cards remain readable.

### Option C — Both A + B
- Implement the DOM scroll choreography on `/tools/` **and** add the new scroll-driven Canvas 2D engine background option.
- **Pros**: Most comprehensive, closest to the guide's vision while respecting current architecture.
- **Cons**: Larger change set, more testing.

## 4. Recommended approach

**Option C with a scoped first pass:**
1. Build the reusable anime.js scroll infrastructure first.
2. Apply it to the `/tools/` page DOM (Option A) — this is the highest-impact, lowest-risk work.
3. Then add the scroll-engine background (Option B) as a polish step.

If the user wants to stop after step 2, the page still has a cohesive scroll-driven experience.

## 5. Detailed implementation steps

### Phase 0 — Shared hooks
Create two small reusable hooks:

- `hooks/use-anime-scope.ts`
  - Wraps `animejs/createScope` lifecycle in React.
  - Accepts `disabled` flag for reduced-motion / mobile skips.
  - Returns `{ rootRef, scopeRef }`.

- `hooks/use-scroll-animation.ts`
  - Higher-level hook that, given a ref and a selector, builds an anime.js animation driven by `onScroll()`.
  - Options: `enter`, `leave`, `stagger`, `duration`, `ease`, `from`/`to` transforms.
  - Auto-reverts on unmount.
  - Respects reduced motion by returning `isDisabled` and skipping observer setup.

### Phase 1 — `/tools/` page DOM choreography
Modify these files:

- `components/tools/tools-grid.tsx`
  - Wrap section root with `useAnimeScope` ref.
  - Header: `opacity: [0,1]`, `y: [40,0]`, `blur` filter from 8px→0, triggered once when the section enters viewport.
  - Search + filter bar: slide-in from top with 100 ms stagger.
  - Category headings (`h2`): fade-up on scroll, each triggered by its own heading.
  - Tool cards: replace per-card `useSectionVisibility` with a single grid-level `onScroll` animation that staggers cards (50–80 ms) and applies `y: [30,0]`, `opacity: [0,1]`, `scale: [0.96,1]`.
  - Ensure re-running search/filter re-animates newly rendered cards (reuse `key` on animated container or reset scope).

- `components/tools/tool-card.tsx`
  - Remove `useSectionVisibility` and `animate-fade-in-up` CSS class.
  - Card is now a plain presentational component with stable CSS classes for parent scope targeting.
  - Keep hover CSS transitions (they are zero-JS and performant).

- `components/tools/tool-view.tsx`
  - Add `useAnimeScope` on the tool detail wrapper.
  - Entrance animation when a tool is selected: card container `opacity: [0,1]`, `y: [20,0]`, `scale: [0.98,1]`.
  - Back button hover can remain CSS.

### Phase 2 — Scroll-engine Canvas 2D background (optional polish)
Create `components/backgrounds/scroll-engine-background.tsx`:
- Uses a full-screen `<canvas>` + `requestAnimationFrame`.
- Reads global scroll progress via a tiny `useScrollProgress` hook or a window `scroll` listener throttled to RAF.
- Visual layers:
  - Concentric neon ring groups that rotate and scale with scroll.
  - Radial waveform bars whose height is modulated by scroll progress + time.
  - Floating particles/dots orbiting a central point.
  - Subtle fade-in on mount.
- Does **not** use Three.js; pure Canvas 2D.
- Reduced motion: render a static gradient and skip the RAF loop.

Register in `components/backgrounds/index.tsx`:
- Lazy import `scroll-engine-background.tsx`.
- Add `{ id: "engine", label: "Engine", icon: "⚙" }` to `BACKGROUND_OPTIONS`.
- Add renderer case.

### Phase 3 — Accessibility & performance guards
- `prefers-reduced-motion: reduce` → skip all entrance/scroll animations, keep content visible immediately.
- Mobile breakpoint (< 768 px) → optionally disable parallax and reduce stagger count.
- All anime.js scopes are reverted on unmount to avoid memory leaks.
- Lazy-loaded tool components already exist; no change needed.

### Phase 4 — Validation
- `pnpm dev`: open `http://localhost:3000/tools/`, scroll, verify card reveals follow scroll.
- Test category filtering and search still re-animate cards correctly.
- Test reduced-motion: cards visible immediately, no console errors.
- Test mobile viewport: no jank.
- `pnpm build`: static export completes.
- Regression checklist from `TESTING-GUIDE.md`: grid load, filter, search, click a tool, back button.

## 6. Files changed / created

**New**
- `hooks/use-anime-scope.ts`
- `hooks/use-scroll-animation.ts`
- `components/backgrounds/scroll-engine-background.tsx` (Phase 2)

**Modified**
- `components/tools/tools-grid.tsx`
- `components/tools/tool-card.tsx`
- `components/tools/tool-view.tsx`
- `components/backgrounds/index.tsx` (Phase 2)

**Unchanged**
- `app/tools/page.tsx` (already mounts the correct components)
- `components/tools/tools-page.tsx` (hash routing stays the same)
- `app/globals.css` (keep existing CSS classes as fallbacks during migration; remove only after all consumers are gone — out of scope for this task)

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| anime.js scope leaks | Always call `scope.revert()` in `useEffect` cleanup. |
| Cards re-appearing after filter don't animate | Use a container `key` tied to `activeCategory + searchQuery` or re-add animations in a `useEffect` when the filtered list changes. |
| Reduced-motion users see blank cards | Animated children start with `opacity-0` only when motion is safe; otherwise keep `opacity-100`. |
| Build fails due to anime.js types | Import from `animejs` (typed). Avoid undocumented APIs. |
| Scroll-engine background hurts readability | Keep opacity low (~0.25) and colors desaturated; ensure text layers have `z-10` and backdrop blur. |

## 8. First deliverable

If approved, the first PR/commit will cover **Phase 0 + Phase 1** only: reusable hooks + tools-page DOM scroll choreography. Phase 2 (scroll-engine background) will follow as a separate commit so progress is incremental and testable.
