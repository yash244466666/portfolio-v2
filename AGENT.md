# AGENT.md — Portfolio v2 Codebase Reference

> **Last updated:** 2026-03-05
> **Purpose:** Definitive context document for any AI agent working on this codebase.
> This file describes the full architecture, every component, all animation systems, hooks, utilities, content management, and known issues.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Application Architecture](#4-application-architecture)
5. [Page Lifecycle & Loading Flow](#5-page-lifecycle--loading-flow)
6. [Component Reference](#6-component-reference)
7. [Animation Systems — Complete Guide](#7-animation-systems--complete-guide)
8. [3D Background System (Three.js)](#8-3d-background-system-threejs)
9. [Custom Hooks](#9-custom-hooks)
10. [Telemetry & Instrumentation System](#10-telemetry--instrumentation-system)
11. [Content Management System](#11-content-management-system)
12. [Styling Architecture](#12-styling-architecture)
13. [Build & Configuration](#13-build--configuration)
14. [Known Issues & TODOs](#14-known-issues--todos)
15. [Coding Conventions](#15-coding-conventions)
16. [Development Workflow](#16-development-workflow)

---

## 1. Project Overview

This is **Yash Sikdar's** personal portfolio website — a dark-themed, animation-heavy, single-page application built with Next.js 15. The site features:

- A **full-screen 3D animated hexagonal grid background** rendered with Three.js (`@react-three/fiber` + `@react-three/drei`)
- A **loading screen** with animated progress bar
- A **hero section** with cycling typewriter animation
- **Skills/About section** with fade-in card animations and a secondary Three.js canvas
- **Projects section** with image cards, staggered entry animations, and a secondary Three.js canvas
- **Contact section** with a form and contact info cards
- **Custom mouse cursor** system (currently commented out / disabled)
- **Floating 3D shapes** in About and Projects backgrounds (currently commented out)
- A comprehensive **telemetry/instrumentation system** that wraps every component

The entire page is a single `"use client"` component tree (no SSR for the main page). The 3D background is dynamically imported with `next/dynamic` and `ssr: false`.

---

## 2. Tech Stack & Dependencies

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.2.4 | Framework (App Router) |
| `react` / `react-dom` | ^19 | UI library |
| `typescript` | ^5 | Language |
| `tailwindcss` | ^4.1.9 | Styling (v4, uses `@import "tailwindcss"` syntax) |

### 3D / Animation

| Package | Version | Purpose |
|---------|---------|---------|
| `three` | ^0.179.1 | 3D rendering engine |
| `@react-three/fiber` | ^9.3.0 | React renderer for Three.js |
| `@react-three/drei` | ^10.7.4 | Helpers/abstractions for R3F (Float, Box, MeshDistortMaterial, etc.) |
| `tw-animate-css` | 1.3.3 | Tailwind animation utilities |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-slot` | 1.1.1 | Slot composition for shadcn/ui Button |
| `class-variance-authority` | ^0.7.1 | Button variant definitions |
| `clsx` + `tailwind-merge` | latest | Utility class merging |
| `lucide-react` | ^0.454.0 | Icon library |

### Dev

| Package | Purpose |
|---------|---------|
| `@tailwindcss/postcss` | PostCSS plugin for Tailwind v4 |
| `eslint` + `eslint-config-next` | Linting |
| `@types/three` | Three.js type definitions |

### Package Manager

- **pnpm** (lockfile: `pnpm-lock.yaml`)

---

## 3. Project Structure

```
portfolio-v2/
├── app/
│   ├── globals.css              # Main CSS: Tailwind imports, CSS variables, animation keyframes, utility classes
│   ├── layout.tsx               # Root layout: DM Sans font, dark mode, metadata
│   └── page.tsx                 # Single "use client" page: loading → main content orchestration
│
├── components/
│   ├── background.tsx           # Smooth3DBackground: Three.js Canvas wrapper with mouse/touch tracking
│   ├── background/
│   │   ├── index.ts             # Empty barrel (unused)
│   │   ├── constants.ts         # GRID_CONFIG, COLOR_PALETTES, ENABLE_COLOR_CHANGE_ON_CLICK
│   │   ├── interaction-state.ts # Shared mutable state: globalMouse, clickWave, mobileState
│   │   ├── hexagonal-grid.tsx   # HexagonalGrid + HexagonalInstancedMesh (900 hex tubes, per-frame animation)
│   │   ├── dynamic-lights.tsx   # DynamicLights: 2 point lights that follow mouse + click wave decay
│   │   └── background-fallback.tsx # Static gradient fallback for SSR/no-canvas
│   │
│   ├── hero-section.tsx         # Hero orchestrator: visibility state, typewriter, scroll-to
│   ├── hero-section/
│   │   ├── hero-heading.tsx     # "Hi, I'm" + name with fade-in-up
│   │   ├── hero-typewriter-title.tsx # Gradient title with blinking cursor
│   │   ├── hero-description.tsx # Tagline paragraph with delayed fade-in-up
│   │   ├── hero-actions.tsx     # "View My Work" / "Let's Talk" buttons with gradient + scale
│   │   ├── hero-social-links.tsx # Social icon row with hover scale
│   │   └── scroll-indicator.tsx # Bouncing down arrow
│   │
│   ├── about-section.tsx        # About orchestrator: visibility, canvas toggle, skills grid
│   ├── about-section/
│   │   ├── about-background.tsx # Canvas with ambient+point light (FloatingCubes commented out)
│   │   ├── about-section-header.tsx # "About Me" heading + description with fade-in-up
│   │   ├── skills-grid.tsx      # 3-column responsive grid of SkillCards
│   │   ├── skill-card.tsx       # Card with icon, title, description — staggered fade-in-up
│   │   ├── skill-icon.tsx       # Maps icon string name → Lucide component
│   │   └── floating-cubes.tsx   # [COMMENTED OUT] Float + Box + MeshDistortMaterial cubes
│   │
│   ├── projects-section.tsx     # Projects orchestrator
│   ├── projects-section/
│   │   ├── projects-background.tsx # Canvas (FloatingShapes commented out)
│   │   ├── projects-section-header.tsx # "Featured Projects" heading
│   │   ├── projects-grid.tsx    # 3-column responsive grid of ProjectCards
│   │   ├── project-card.tsx     # Image card with tech tags, Code/Live Demo buttons, hover lift
│   │   └── floating-shapes.tsx  # [COMMENTED OUT] Float + Octahedron shapes
│   │
│   ├── contact-section.tsx      # Contact orchestrator with form state
│   ├── contact-section/
│   │   ├── contact-section-header.tsx # "Let's Work Together" heading
│   │   ├── contact-form-card.tsx     # Form card with name/email/message + slide-in-left
│   │   ├── contact-info-list.tsx     # Info cards wrapper with fade-in-up
│   │   └── contact-info-item.tsx     # Individual email/phone/location row with icon
│   │
│   ├── navigation.tsx           # Navigation orchestrator: scroll detection, mobile menu
│   ├── navigation/
│   │   ├── desktop-nav-links.tsx    # Horizontal nav links (hidden on mobile)
│   │   ├── mobile-nav.tsx           # Vertical mobile menu (conditionally rendered)
│   │   ├── navigation-actions.tsx   # "Get In Touch" button (hidden on mobile)
│   │   └── navigation-toggle.tsx    # Hamburger/X toggle button
│   │
│   ├── loading-screen.tsx       # Loading screen: spinner + progress bar + fade out
│   ├── back-to-top.tsx          # Floating button: appears on scroll > 300px
│   ├── footer.tsx               # Footer with name, social links, copyright
│   ├── mouse-cursor.tsx         # [COMMENTED OUT] Custom cursor orchestrator
│   ├── mouse-cursor/
│   │   ├── cursor-dot.tsx       # [COMMENTED OUT] Small gradient dot
│   │   ├── cursor-outer.tsx     # [COMMENTED OUT] Spinning ring
│   │   └── cursor-trail.tsx     # [COMMENTED OUT] Blurred trail
│   │
│   └── ui/                      # shadcn/ui primitives
│       ├── button.tsx           # Button with CVA variants
│       ├── card.tsx             # Card, CardHeader, CardContent, etc.
│       ├── input.tsx            # Styled input
│       └── textarea.tsx         # Styled textarea
│
├── hooks/
│   ├── use-cycling-typewriter.ts   # Typewriter effect: type → pause → delete → next phrase
│   ├── use-section-visibility.ts   # IntersectionObserver-based section visibility
│   ├── use-scroll-threshold.ts     # Boolean: has user scrolled past N pixels
│   ├── use-should-render-canvas.ts # Should Three.js canvases render (screen size + reduced motion)
│   ├── use-mobile.ts               # Simple mobile breakpoint detection
│   ├── use-instrumentation.ts      # useComponentInstrumentation, useFrameInstrumentation, instrumentComponent
│   └── use-custom-cursor.ts        # [COMMENTED OUT] Custom cursor tracking + animation loop
│
├── lib/
│   ├── utils.ts                 # cn() utility (clsx + tailwind-merge)
│   ├── instrumentation.ts       # Core telemetry: logComponentEvent, logRenderCycle, recordMetric, etc.
│   ├── react-telemetry.ts       # Auto-patches React.createElement for global telemetry
│   └── content/
│       ├── types.ts             # TypeScript interfaces for all content
│       ├── index.ts             # All portfolio content data (personalInfo, projects, skills, etc.)
│       └── utils.ts             # Getter functions, search, filter, validation, stats
│
├── public/                      # Static assets (project images, favicons)
├── styles/
│   └── globals.css              # Duplicate/alternate CSS file (same theme variables)
├── types/
│   └── css.d.ts                 # CSS module type declarations
│
├── components.json              # shadcn/ui configuration (new-york style, neutral base)
├── next.config.mjs              # Static export mode, unoptimized images
├── tsconfig.json                # ES6 target, bundler module resolution, @/* path alias
├── postcss.config.mjs           # PostCSS with @tailwindcss/postcss
└── package.json                 # pnpm, scripts: dev/build/export/lint/start
```

---

## 4. Application Architecture

### Rendering Strategy

- **Static Export mode:** `output: 'export'` in `next.config.mjs` — the site builds to static HTML/JS/CSS in `out/` directory
- **Client-only rendering:** The entire `page.tsx` is `"use client"` — no server components
- **Dynamic import for 3D:** `Smooth3DBackground` is loaded via `next/dynamic` with `ssr: false`

### State Management

- No external state library (no Redux, Zustand, etc.)
- All state is local React state (`useState`)
- Shared mutable state for 3D interactions lives in `background/interaction-state.ts` (plain objects, not React state — this is intentional for per-frame Three.js performance)

### Data Flow

```
lib/content/index.ts  (static data)
       ↓
lib/content/utils.ts  (getter functions)
       ↓
Components call getPersonalInfo(), getSkills(), getProjects(), etc.
```

All content is hardcoded in `lib/content/index.ts`. There is no backend, no CMS, no API calls.

---

## 5. Page Lifecycle & Loading Flow

```
1. Browser loads page
2. React mounts <Home /> (page.tsx)
3. mounted = false → renders <LoadingScreen /> only
4. useEffect sets mounted = true
5. Re-render: Shows <LoadingScreen /> + <Smooth3DBackground /> (dynamic import starts)
6. LoadingScreen runs a progress counter (0→100 over ~2.5s)
7. After 2.5s timeout: setIsLoading(false) → LoadingScreen fades out
8. After 300ms delay: onComplete() fires → loadingComplete = true
9. Main content fades in: Navigation, Hero, About, Projects, Contact, Footer, BackToTop
10. HeroSection: becomes visible after 200ms delay, typewriter starts after 800ms
11. About/Projects/Contact: become visible when scrolled into viewport (IntersectionObserver)
```

---

## 6. Component Reference

### Top-Level Components (rendered in page.tsx)

| Component | File | Purpose |
|-----------|------|---------|
| `LoadingScreen` | `components/loading-screen.tsx` | Animated loading with spinner + progress bar. Auto-completes after 2.5s. |
| `Smooth3DBackground` | `components/background.tsx` | Fixed full-screen Three.js canvas with hexagonal grid. Dynamically imported. |
| `Navigation` | `components/navigation.tsx` | Fixed top nav bar. Transparent → blurred on scroll. Mobile hamburger menu. |
| `HeroSection` | `components/hero-section.tsx` | Full-viewport hero with greeting, name, typewriter title, CTA buttons, social links, scroll indicator. |
| `AboutSection` | `components/about-section.tsx` | Skills grid with section visibility trigger. Optional Three.js background canvas. |
| `ProjectsSection` | `components/projects-section.tsx` | Project cards grid with section visibility trigger. Optional Three.js background canvas. |
| `ContactSection` | `components/contact-section.tsx` | Contact form + info list with section visibility trigger. |
| `Footer` | `components/footer.tsx` | Name, title, social links, copyright. |
| `BackToTop` | `components/back-to-top.tsx` | Floating button (bottom-right) that appears when scrolled > 300px. |

### Disabled/Commented-Out Components

| Component | File | Status |
|-----------|------|--------|
| `MouseCursor` | `components/mouse-cursor.tsx` | Fully commented out. Was a custom cursor with dot, outer ring, and trail. Import commented out in `page.tsx`. |
| `FloatingCubes` | `components/about-section/floating-cubes.tsx` | Fully commented out. Was `@react-three/drei` Float + Box + MeshDistortMaterial. Import commented out in `about-background.tsx`. |
| `FloatingShapes` | `components/projects-section/floating-shapes.tsx` | Fully commented out. Was `@react-three/drei` Float + Octahedron + MeshDistortMaterial. Import commented out in `projects-background.tsx`. |

---

## 7. Animation Systems — Complete Guide

This codebase has **five distinct animation systems**. Understanding each is critical.

### 7.1. CSS Keyframe Animations (globals.css)

Defined in `app/globals.css`, these are the primary entry/reveal animations:

| Keyframe | Class | Duration | Description |
|----------|-------|----------|-------------|
| `fadeInUp` | `.animate-fade-in-up` | 0.8s ease-out | Translate from Y+30px to Y0, opacity 0→1. Used by almost all section headers, cards, hero elements. |
| `fadeIn` | `.animate-fade-in` | 0.6s ease-out | Simple opacity 0→1. Used by scroll indicator. |
| `slideInLeft` | `.animate-slide-in-left` | 0.8s ease-out | Translate from X-30px to X0, opacity 0→1. Used by contact form card. |
| `glow` | `.animate-glow` | 3s infinite | Purple box-shadow pulse. Available but not actively used in current state. |
| `float` | `.animate-float` | 4s infinite | Y-axis bob ±10px. Used by CSS particles (if enabled). |
| `pulse-glow` | `.animate-pulse-glow` | 2s infinite | Scale 1→1.05 + opacity 0.4→0.8. Available but not actively used. |

**How entry animations are triggered:** Components accept an `isVisible` prop. When `false`, they have class `opacity-0`. When `true`, they get `animate-fade-in-up` (or similar). The `transition-all duration-1000` class on the wrapper provides the initial transition. The CSS animation then plays with `forwards` fill mode.

**Staggered animations:** Cards use `animationDelay` via inline `style={{ animationDelay: '${index * 200}ms' }}`. Each card in a grid appears 200ms after the previous one.

### 7.2. CSS Transition Animations

These are hover/interaction micro-animations defined in `globals.css`:

| Target | Effect |
|--------|--------|
| `.interactive-element:hover` | translateY(-2px) + purple box-shadow |
| `.btn-primary` | Gradient background, shimmer pseudo-element sweep on hover, translateY(-3px) + scale(1.02) |
| `.btn-primary:active` | translateY(-1px) + scale(0.98) quick snap |
| All `button` / `.cursor-pointer` | translateY(-2px) on hover, scale(0.95) on active |
| `.glow-on-hover:hover` | Blue box-shadow + border glow |
| `nav a` / `.nav-link` | Underline expands from 0→100% width on hover (gradient line) |
| `nav a:hover` | Color shift to blue-400 + translateY(-1px) |

### 7.3. Tailwind Utility Animations

From `tw-animate-css` and Tailwind's built-in utilities:

| Class | Usage |
|-------|-------|
| `animate-spin` | Loading spinner border rotation |
| `animate-pulse` | Typewriter cursor blink, cursor dot pulse |
| `animate-bounce` | Scroll indicator arrow |

### 7.4. Inline/Component Transition Animations

Several components use Tailwind `transition-*` classes for programmatic animations:

| Component | Animation |
|-----------|-----------|
| `Navigation` | `transition-all duration-300` — bg transparent → blurred on scroll |
| `BackToTop` | `transition-all duration-300 ease-in-out` — opacity/translateY on scroll threshold |
| `SkillCard` / `ProjectCard` | `transition-all duration-300 hover:-translate-y-2` — lift on hover |
| `ProjectCard` image | `transition-transform duration-300 group-hover:scale-105` — zoom on hover |
| Hero buttons | `transition-all transform hover:scale-105` — scale on hover |

### 7.5. Three.js Per-Frame Animations (requestAnimationFrame)

The most complex animation system. Runs at display refresh rate (~60fps). See [Section 8](#8-3d-background-system-threejs) for full details.

| Animation | Location | Description |
|-----------|----------|-------------|
| Hexagonal grid depth wave | `hexagonal-grid.tsx` | Each hex instance oscillates Z-position using `sin(phase + time)` |
| Mouse proximity effect | `hexagonal-grid.tsx` | Hexes near cursor position get pushed forward (Z-axis) with smooth hermite interpolation |
| Grid tilt | `hexagonal-grid.tsx` | Entire grid tilts based on mouse position via `lerp` |
| Dynamic lights follow mouse | `dynamic-lights.tsx` | Two point lights track mouse position in world space |
| Click wave decay | `dynamic-lights.tsx` | On click, intensity starts at 1.0 and decays by 0.95× per frame until < 0.01 |
| Color transition | `hexagonal-grid.tsx` | On click, all hex colors interpolate from current→random palette over ~50 frames |
| Responsive scaling | `hexagonal-grid.tsx` | Grid group scales based on viewport aspect ratio |

---

## 8. 3D Background System (Three.js)

### Architecture

```
Smooth3DBackground (background.tsx)
├── Registers mouse/touch event listeners on window
├── Updates shared mutable state (globalMouse, clickWave)
├── <Canvas> (camera at Z=100, FOV=50, DPR capped at 1.5)
│   ├── <DynamicLights />
│   │   ├── ambientLight (intensity 0.3)
│   │   ├── pointLight #1 (white, intensity 1000, follows mouse)
│   │   └── pointLight #2 (red, intensity 500, follows mouse at Z=-20)
│   └── <HexagonalGrid />
│       └── <group> (scales based on viewport)
│           └── <HexagonalInstancedMesh />
│               └── <instancedMesh> (900 instances, physical material)
```

### Configuration Constants (`background/constants.ts`)

```typescript
GRID_CONFIG = {
  n: 30,              // Grid is 30×30 = 900 hexagon instances
  radius: 2.5,        // Hex radius in world units
  colors: [0x0066ff, 0x33ccff, 0xffffff],  // Default palette (blue, cyan, white)
  lightIntensity1: 1000,
  lightIntensity2: 500,
  timeCoef: 1,         // Speed of sine wave animation
  depthScale: 1,       // Mouse proximity push depth
  metalness: 0.8,      // Material metalness
  roughness: 0.5,
  clearcoat: 1,        // Clearcoat for gloss
  clearcoatRoughness: 0.1,
}
```

### Color Palettes

7 palettes that rotate randomly on click:
1. Blue + Cyan + White (default)
2. Gray tones
3. Dark gray tones
4. Near-black tones
5. Light blue tones
6. Purple + Violet
7. Teal + Mint

### Hexagonal Geometry

- Created via `THREE.LatheGeometry` with 6 segments → hexagonal cross-section
- Has rounded corners (cornerRadius = 0.15 × radius, 8 samples)
- Height = radius × 5 = 12.5 world units
- Uses `THREE.DoubleSide` rendering
- Material: `MeshPhysicalMaterial` with vertex colors

### Shared Mutable State (`background/interaction-state.ts`)

```typescript
globalMouse = { x: 0, y: 0 }        // Normalized device coordinates (-1 to 1)
clickWave = { active: false, intensity: 0, decay: 0.95 }
mobileState = { isMobileDevice: false }
```

These are **NOT** React state — they are plain objects mutated directly for per-frame performance. React state would cause re-renders on every mouse move.

### Event Handling

- **Desktop:** `mousemove` → update `globalMouse`; `click` → trigger `clickWave` + color/light randomization
- **Mobile:** `touchstart` → trigger `clickWave` + randomization; `touchmove` → update `globalMouse`
- Event listeners are added/removed in `useEffect` cleanup based on `mobileState.isMobileDevice`

### Performance Considerations

- DPR capped at 1.5 (`Math.min(window.devicePixelRatio, 1.5)`)
- `useShouldRenderCanvas()` disables section canvases on screens < 768px or when `prefers-reduced-motion: reduce`
- `InstancedMesh` is used for the grid (single draw call for 900 hexes)
- `DynamicDrawUsage` on the color buffer attribute
- Canvas is in a `pointer-events-none` div so it doesn't intercept clicks meant for UI

---

## 9. Custom Hooks

### `useCyclingTypewriter(phrases, options)`

**File:** `hooks/use-cycling-typewriter.ts`

Cycles through an array of phrases with a typewriter effect.

| Option | Default | Description |
|--------|---------|-------------|
| `typingSpeed` | 80ms | Interval between each character typed |
| `deletingSpeed` | 50ms | Interval between each character deleted |
| `pauseDuration` | 2000ms | Pause after a phrase is fully typed before deleting |
| `startDelay` | 0ms | Delay before starting the first phrase |

**Returns:** `string` — the currently displayed text (partial phrase being typed or deleted).

**State machine:** Type forward → pause → delete backward → move to next phrase → repeat.

### `useSectionVisibility<T>(options)`

**File:** `hooks/use-section-visibility.ts`

Uses `IntersectionObserver` to detect when a section scrolls into view.

| Option | Default | Description |
|--------|---------|-------------|
| `threshold` | 0.25 | How much of element must be visible (0–1) |
| `rootMargin` | "0px" | Observer root margin |
| `once` | true | Disconnect after first visibility (animation plays once) |
| `fallbackVisible` | true | Fallback when IntersectionObserver unavailable |
| `shouldSkip` | undefined | Predicate to skip observer (e.g., reduced motion, mobile) |

**Returns:** `{ sectionRef: RefObject<T>, isVisible: boolean }`

Used by `AboutSection`, `ProjectsSection`, `ContactSection` to trigger fade-in animations when scrolled into view.

### `useScrollThreshold(threshold)`

**File:** `hooks/use-scroll-threshold.ts`

Simple boolean: has the user scrolled past `threshold` pixels (default: 50).

**Returns:** `boolean`

Used by `Navigation` to toggle between transparent and glass-morphism backgrounds.

### `useShouldRenderCanvas(options)`

**File:** `hooks/use-should-render-canvas.ts`

Determines whether Three.js canvases should render.

**Logic:** Returns `false` if screen width < 768px OR `prefers-reduced-motion: reduce` is set. Listens for media query changes.

**Returns:** `boolean`

Used by `AboutSection` and `ProjectsSection` to conditionally render their background canvases.

### `useIsMobile()`

**File:** `hooks/use-mobile.ts`

Simple mobile breakpoint (< 768px) detection via `matchMedia`.

**Returns:** `boolean`

### `useCustomCursor()` — COMMENTED OUT

**File:** `hooks/use-custom-cursor.ts`

Would provide a custom animated cursor with dot, outer ring, and trail layers. Uses `requestAnimationFrame` for smooth tracking with easing. Detects interactive elements for hover scaling. Hides the native cursor via injected `<style>`. Respects reduced motion.

### `useComponentInstrumentation(componentName, options)`

**File:** `hooks/use-instrumentation.ts`

Comprehensive instrumentation hook. See [Section 10](#10-telemetry--instrumentation-system).

### `useFrameInstrumentation(componentName, callback, options)`

**File:** `hooks/use-instrumentation.ts`

Wraps a Three.js `useFrame` callback with duration tracking and metric recording. See [Section 10](#10-telemetry--instrumentation-system).

---

## 10. Telemetry & Instrumentation System

This codebase has an **extensive custom telemetry system**. It is important to understand because it adds significant code to every component.

### Overview

Every component in the app is instrumented in two ways:

1. **Manual instrumentation** via `useComponentInstrumentation()` hook — used in all major components
2. **Automatic instrumentation** via patched `React.createElement` in `lib/react-telemetry.ts` — wraps components NOT manually instrumented

### Control

- Telemetry is **OFF by default** unless `NEXT_PUBLIC_ENABLE_LOGS=true` env var is set
- Can be toggled at runtime: `window.__PORTFOLIO_TELEMETRY__.enable()` / `.disable()` / `.toggle()`
- Persisted in `localStorage` key `portfolio:telemetry:enabled`

### What Gets Logged

| Event | Description |
|-------|-------------|
| `mount` | Component mounted (with props snapshot) |
| `unmount` | Component unmounted |
| `render` | Every render cycle (duration, render count, state/props/metrics snapshots) |
| `value-change` | Tracked values changed between renders (diff logged) |
| Custom events | `scroll-to`, `navigate`, `form-submit`, `form-change`, `toggle-mobile`, `click-wave-complete`, `color-transition-complete`, `randomize-colors`, `randomize-lights`, `device-detected`, `pointer-move`, `pointer-click`, `touch-start`, `touch-move`, `progress-update`, `scroll-to-top`, etc. |
| Frame metrics | Per-frame duration and interval for Three.js animation loops |

### Throttling

All log events are throttled (default 1200ms). Each event type has a configurable `throttleMs`. High-frequency events like pointer moves use 4800ms throttle.

### Metric Buffering

`recordMetric()` buffers values and only logs aggregated stats (average, min, max) when either:
- `sampleSize` (default 45) samples collected, OR
- `throttleMs` elapsed since last log AND buffer has data

### React.createElement Monkey-Patch (`react-telemetry.ts`)

This file patches `React.createElement` to automatically wrap any un-instrumented function component with telemetry. It:
- Checks a `manualNameOverrides` set to skip already-instrumented components
- Uses a `WeakMap` cache to avoid re-wrapping
- Creates a `Telemetry(ComponentName)` wrapper that calls `useComponentInstrumentation`
- Sets a `__IS_TELEMETRY_WRAPPED__` flag to prevent double-wrapping

**Important:** This is imported at the top of `page.tsx` as a side effect: `import "@/lib/react-telemetry"`

### Key Files

| File | Purpose |
|------|---------|
| `lib/instrumentation.ts` | Core logging engine: `logComponentEvent`, `logRenderCycle`, `recordMetric`, `createDurationTracker`, `trackMutation` |
| `lib/react-telemetry.ts` | Auto-patches `React.createElement` for global telemetry |
| `hooks/use-instrumentation.ts` | React hooks: `useComponentInstrumentation`, `useFrameInstrumentation`, `instrumentComponent` HOC |

---

## 11. Content Management System

All website content is centralized in `lib/content/`:

### `lib/content/types.ts`

TypeScript interfaces for all content shapes:
- `PersonalInfo`, `SocialLink`, `ContactInfo`, `Project`, `Skill`
- `SectionContent`, `FormContent`, `ButtonTexts`, `FooterContent`
- `SiteMetadata`, `ContentValidation`

### `lib/content/index.ts`

Contains all actual content data as exported constants:

| Export | Type | Description |
|--------|------|-------------|
| `personalInfo` | `PersonalInfo` | Name, full name, title, greeting, typing titles, tagline, about description, contact availability |
| `socialLinks` | `SocialLink[]` | GitHub, LinkedIn, Twitter, Email, + a "testing" entry |
| `contactInfo` | `ContactInfo[]` | Email, Phone, Location |
| `skills` | `Skill[]` | 9 skills (6 real + 3 "Testing" placeholders) |
| `projects` | `Project[]` | 7 projects (6 real + 1 "Testing" placeholder) |
| `navigationItems` | `NavigationItem[]` | About, Projects, Contact, + a "Testing" entry |
| `buttonTexts` | `ButtonTexts` | All button labels |
| `sectionContent` | `SectionContent` | Section headings and descriptions |
| `formContent` | `FormContent` | Form placeholders and labels |
| `footerContent` | `FooterContent` | Copyright text |
| `siteMetadata` | `SiteMetadata` | SEO metadata |

### `lib/content/utils.ts`

Getter functions, search/filter utilities, validation:
- `getPersonalInfo()`, `getSocialLinks()`, `getProjects()`, `getSkills()`, etc.
- `getProjectsByTech(tech)` — filter projects by technology
- `getIncompleteProjects()` — find projects with `#` placeholder links
- `validateSocialLinks()` — check for invalid URLs
- `getContentStats()` — content completeness statistics

---

## 12. Styling Architecture

### CSS Framework

- **Tailwind CSS v4** with `@import "tailwindcss"` syntax (not PostCSS directives)
- **tw-animate-css** for animation utility classes
- **shadcn/ui** (new-york style) for base components

### Theme System

- **Dark mode only** — `<html>` has `class="dark"` hardcoded in `layout.tsx`
- CSS custom properties defined in both `:root` and `.dark` selectors using `oklch` color space
- Mapped to Tailwind via `@theme inline { ... }` block
- Color tokens: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--chart-1` through `--chart-5`, `--sidebar-*`

### Key Color Values (Dark Mode)

| Token | Value | Visual |
|-------|-------|--------|
| `--background` | `oklch(0.145 0 0)` | Near-black (#1a1a1a) |
| `--foreground` | `oklch(0.985 0 0)` | Near-white |
| `--card` | `oklch(0.145 0 0)` | Same as background |
| `--border` | `oklch(0.269 0 0)` | Dark gray |
| `--muted-foreground` | `oklch(0.708 0 0)` | Medium gray |

### Gradient System

Key gradients used throughout:
- **Hero buttons:** `from-purple-600 to-cyan-600` (primary CTA), `from-purple-400 to-cyan-400` (typewriter text)
- **Loading bar:** `from-purple-500 to-cyan-400`
- **Back to top:** `from-blue-600 to-cyan-600`
- **CSS buttons:** `linear-gradient(135deg, #3b82f6, #06b6d4)` (blue-cyan)
- **Nav underline:** `linear-gradient(90deg, #3b82f6, #06b6d4)` (blue-cyan)

### Two globals.css Files

There are **two** CSS files with similar content:
1. `app/globals.css` — **Active** (imported by `layout.tsx`). Contains theme variables AND animation keyframes/classes.
2. `styles/globals.css` — **Not imported anywhere.** Contains only theme variables (subset). Likely a leftover from initial shadcn/ui setup.

---

## 13. Build & Configuration

### `next.config.mjs`

```javascript
{
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: 'export',          // Static HTML export
  trailingSlash: true,
  distDir: 'out',
}
```

**Key points:**
- ESLint and TypeScript errors are ignored during build
- Images are unoptimized (no Next.js image optimization since it's a static export)
- Output goes to `out/` directory
- Trailing slashes enabled for static hosting compatibility

### Development

```bash
pnpm dev         # Start dev server (default port 3000, currently running on 3001)
pnpm build       # Build static export to out/
pnpm start       # Serve the built static files
pnpm lint        # Run ESLint
```

### `tsconfig.json`

- Target: ES6
- Module: ESNext with bundler resolution
- Path alias: `@/*` → `./*`
- Strict mode enabled

---

## 14. Known Issues & TODOs

### Placeholder/Testing Content

The content data has several placeholder entries that should be cleaned up:

1. **`personalInfo.typingTitles`** — Last entry is `"testing testing testing testing testing "` (with trailing space)
2. **`skills[]`** — Last 3 entries are "Testing Testing Testing..." placeholders
3. **`projects[]`** — Last entry is a "Testing Testing Testing..." placeholder
4. **`navigationItems[]`** — Last entry is `{ label: "Testing", target: "contact" }` — visible in the nav bar
5. **`socialLinks[]`** — Last entry is `{ name: "testing", url: "mailto:info@testing.com" }` — visible as an extra email icon

### Incomplete Project Links

Most projects have `github: "#"` and `live: "#"` placeholder links. Only "Sendout.ai" has a real live URL.

### Disabled Features

- **Custom mouse cursor** (`mouse-cursor.tsx`, `use-custom-cursor.ts`) — Fully commented out. Was a 3-layer animated cursor replacement.
- **Floating 3D objects** (`floating-cubes.tsx`, `floating-shapes.tsx`) — Commented out in About and Projects backgrounds. The Canvas elements still render but only have ambient/point lights with no visible objects.
- **About/Projects background canvases** — Render empty Three.js scenes on desktop (nothing visible except lighting affecting nothing). These canvases consume resources for no visual benefit in current state.

### Copyright Year

`footerContent.copyrightYear` and `copyrightText` still say "2024".

### Duplicate CSS File

`styles/globals.css` is not imported and duplicates theme variables from `app/globals.css`.

### Contact Form

The form `handleSubmit` only fires a telemetry event — there is no actual form submission (no API call, no email service, no backend).

### Background Index File

`components/background/index.ts` is empty — it's supposed to be a barrel export but isn't used. The background is imported directly via `components/background.tsx`.

---

## 15. Coding Conventions

### Component Patterns

- All components marked `"use client"` (even pure presentational ones)
- Orchestrator components (section-level) handle state and pass props to sub-components
- Sub-components are purely presentational with typed props interfaces
- Every component has `useComponentInstrumentation()` call
- Default exports used for section-level components, named exports for sub-components

### Naming

- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `use-kebab-case.ts` → `useCamelCase`
- Props interfaces: `ComponentNameProps`
- Content getters: `getXxx()` prefix

### Animation Pattern

Most animated components follow this pattern:

```tsx
function MyComponent({ isVisible = false }: { isVisible?: boolean }) {
  return (
    <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
      {/* content */}
    </div>
  )
}
```

For staggered animations in grids:

```tsx
<Card
  className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
  style={{ animationDelay: `${index * 200}ms` }}
>
```

### Import Conventions

```typescript
// React/Next
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Three.js
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Canvas } from "@react-three/fiber"

// Icons
import { Github, Linkedin, Mail } from "lucide-react"

// Internal (path alias)
import { Button } from "@/components/ui/button"
import { getPersonalInfo } from "@/lib/content/utils"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"
```

---

## 16. Development Workflow

### Running Locally

```bash
cd /home/yash/Desktop/yash/portfolio-v2
pnpm install
pnpm dev          # → http://localhost:3000 (or custom port like 3001)
```

### Enabling Telemetry for Debugging

In browser console:
```javascript
window.__PORTFOLIO_TELEMETRY__.enable()   // Turn on
window.__PORTFOLIO_TELEMETRY__.disable()  // Turn off
window.__PORTFOLIO_TELEMETRY__.toggle()   // Toggle
```

### Modifying Content

1. Edit `lib/content/index.ts` directly
2. Types are in `lib/content/types.ts`
3. No build step needed — content is bundled at build time

### Adding a New Section

1. Create `components/new-section.tsx` (orchestrator)
2. Create `components/new-section/` directory for sub-components
3. Add section content to `lib/content/index.ts` and `types.ts`
4. Add `useSectionVisibility()` for scroll-triggered animations
5. Add `useComponentInstrumentation()` for telemetry
6. Import and render in `app/page.tsx` inside the `loadingComplete` conditional

### Adding a New Animation

1. For CSS animations: Add `@keyframes` and utility class to `app/globals.css`
2. For Three.js animations: Add to the `useFrame` callback in the relevant component
3. For transition animations: Use Tailwind `transition-*` utilities directly in JSX

### Modifying the 3D Background

1. Grid parameters: Edit `GRID_CONFIG` in `components/background/constants.ts`
2. Color palettes: Edit `COLOR_PALETTES` in the same file
3. Animation behavior: Edit the `useFrame` callback in `hexagonal-grid.tsx`
4. Lighting: Edit `dynamic-lights.tsx`
5. Interaction: Edit event handlers in `background.tsx` and mutable state in `interaction-state.ts`

---

*End of AGENT.md — This document covers the entire codebase as of 2026-03-05.*
