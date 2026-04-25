# Animation Migration Plan: CSS/Three.js → anime.js v4

> Complete analysis of every animation in the portfolio, with exact anime.js v4 replacement code.
> Goal: 1:1 visual parity — same timing, same easing, same behavior.

---

## Table of Contents

1. [Current Animation Inventory](#1-current-animation-inventory)
2. [Migration Categories](#2-migration-categories)
3. [Shared Infrastructure](#3-shared-infrastructure)
4. [Migration A — Loading Screen](#4-migration-a--loading-screen)
5. [Migration B — Hero Section Staggered Entrance](#5-migration-b--hero-section-staggered-entrance)
6. [Migration C — Section Visibility Entrances](#6-migration-c--section-visibility-entrances)
7. [Migration D — Navigation Scroll Transition](#7-migration-d--navigation-scroll-transition)
8. [Migration E — Back-to-Top Button](#8-migration-e--back-to-top-button)
9. [Migration F — Continuous Animations (bounce, pulse, spin)](#9-migration-f--continuous-animations-bounce-pulse-spin)
10. [Migration G — Hover Interactions](#10-migration-g--hover-interactions)
11. [Migration H — Typewriter Effect](#11-migration-h--typewriter-effect)
12. [Migration I — Three.js Hexagonal Grid Background](#12-migration-i--threejs-hexagonal-grid-background)
13. [Migration J — CSS Utility Animations](#13-migration-j--css-utility-animations)
14. [Hooks to Replace or Adapt](#14-hooks-to-replace-or-adapt)
15. [CSS Keyframes to Remove](#15-css-keyframes-to-remove)
16. [Implementation Order](#16-implementation-order)
17. [File Change Summary](#17-file-change-summary)
18. [Bundle Impact](#18-bundle-impact)

---

## 1. Current Animation Inventory

### Custom CSS Keyframes (app/globals.css)

| Keyframe | Used By Animation Class | Behavior |
|----------|------------------------|----------|
| `fadeInUp` | `.animate-fade-in-up` | opacity 0→1 + translateY 30px→0, 0.8s ease-out forwards |
| `fadeIn` | `.animate-fade-in` | opacity 0→1, 0.6s ease-out forwards |
| `slideInLeft` | `.animate-slide-in-left` | opacity 0→1 + translateX -30px→0, 0.8s ease-out forwards |
| `glow` | `.animate-glow` | box-shadow pulse purple, 3s ease-in-out infinite |
| `float` | `.animate-float` | translateY 0→-10px→0, 4s ease-in-out infinite |
| `pulse-glow` | `.animate-pulse-glow` | opacity 0.4→0.8 + scale 1→1.05, 2s ease-in-out infinite |

### Tailwind Built-in Animations (tw-animate-css)

| Class | Used In | Behavior |
|-------|---------|----------|
| `animate-spin` | `loading-screen.tsx` | 360deg rotation, 1s linear infinite |
| `animate-bounce` | `scroll-indicator.tsx` | translateY bounce, 1s infinite |
| `animate-pulse` | `hero-typewriter-title.tsx` | opacity 1→0.5→1, 2s cubic-bezier infinite |

### CSS Transitions

| Component | Transition | What It Does |
|-----------|-----------|--------------|
| Hero children (6 components) | `transition-all duration-1000 delay-{0-800}` | Smooth opacity/transform when `isVisible` toggles |
| `SkillCard`, `ProjectCard` | `transition-all duration-300` | Hover shadow/translate |
| `ContactFormCard` | `transition-all duration-1000` | Slide-in entrance |
| `Navigation` | `transition-all duration-300` | Bg/blur on scroll |
| `BackToTop` | `transition-all duration-300 ease-in-out` | Show/hide with opacity + translateY |
| `LoadingScreen` progress bar | `transition-all duration-100 ease-out` | Width change |
| All buttons | `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Global CSS hover effects |
| Nav links | `transition: all 0.3s ease` | Underline + color on hover |
| Image in ProjectCard | `transition-transform duration-300` | Scale on hover |

### JavaScript-Driven Animations

| System | File | Mechanism |
|--------|------|-----------|
| Three.js hexagonal grid | `background/hexagonal-grid.tsx` | `useFrame()` — 900 instanced hexagons with sine wave + mouse parallax |
| Three.js dynamic lights | `background/dynamic-lights.tsx` | `useFrame()` — 2 point lights follow mouse, click wave decay |
| Typewriter cycling | `hooks/use-cycling-typewriter.ts` | `setTimeout` chain — type/delete loop |
| Section visibility | `hooks/use-section-visibility.ts` | `IntersectionObserver` → `isVisible` boolean |
| Scroll threshold | `hooks/use-scroll-threshold.ts` | `scroll` event → boolean |
| Loading progress | `loading-screen.tsx` | `setInterval` — progress +=2 every 40ms |

### Commented-Out Systems (skip migration)

| System | Status |
|--------|--------|
| `MouseCursor` component | Fully commented out in page.tsx |
| `useCustomCursor` hook | Fully commented out |
| `FloatingCubes` (about background) | Commented out |
| `FloatingShapes` (projects background) | Commented out |

---

## 2. Migration Categories

| Category | Difficulty | Components Affected | anime.js Feature |
|----------|-----------|---------------------|-----------------|
| **A. Loading Screen** | Easy | 1 component | `animate()` + `createTimer()` |
| **B. Hero Staggered Entrance** | Easy | 6 sub-components + orchestrator | `createTimeline()` + `stagger()` |
| **C. Section Entrances** | Easy | ~12 sub-components | `animate()` + `onScroll()` |
| **D. Nav Scroll Transition** | Easy | 1 component | `animate()` (or keep CSS) |
| **E. Back-to-Top** | Easy | 1 component | `animate()` |
| **F. Continuous (bounce/pulse/spin)** | Easy | 3 instances | `animate()` with `loop: true, alternate: true` |
| **G. Hover Interactions** | Medium | ~10 components + global CSS | `animate()` with `composition: 'blend'` |
| **H. Typewriter** | Medium | 1 hook + 1 component | `createTimer()` + `onUpdate` |
| **I. Three.js Background** | **Hard** | 4 files, 312+ lines | Canvas-based anime.js OR hybrid approach |
| **J. CSS Utility Animations** | Easy | global CSS classes | Remove after all components migrated |

---

## 3. Shared Infrastructure

### 3.1 Install anime.js

```bash
pnpm add animejs
```

### 3.2 Create Animation Scope Hook

Create `hooks/use-anime-scope.ts` — reusable React hook for all components:

```ts
'use client';

import { useEffect, useRef } from 'react';
import { createScope } from 'animejs';
import type { Scope } from 'animejs';

export interface UseAnimeScopeOptions {
  defaults?: Record<string, unknown>;
  mediaQueries?: Record<string, string>;
}

export function useAnimeScope(options: UseAnimeScopeOptions = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<Scope | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scopeRef.current = createScope({
      root: rootRef.current,
      defaults: options.defaults,
      mediaQueries: options.mediaQueries,
    });

    return () => {
      scopeRef.current?.revert();
    };
  }, []);

  return { rootRef, scopeRef };
}
```

### 3.3 Create Scroll-Triggered Animation Hook

Replace `useSectionVisibility` + CSS class toggle with anime.js `onScroll()`:

```ts
'use client';

import { useEffect, useRef } from 'react';
import { animate, onScroll, createScope } from 'animejs';
import type { Scope } from 'animejs';

export interface UseScrollAnimationOptions {
  enter?: 'top' | 'center' | 'bottom' | number;
  leave?: 'top' | 'center' | 'bottom' | number;
  once?: boolean;
}

export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
) {
  const rootRef = useRef<HTMLElement>(null);
  const scopeRef = useRef<Scope | null>(null);

  return { rootRef, scopeRef };
}
```

---

## 4. Migration A — Loading Screen

### Current Behavior (loading-screen.tsx)
- Spinner: `animate-spin` — 360deg, 1s linear infinite
- Progress bar: CSS `transition-all duration-100 ease-out` on `width` style
- Progress: `setInterval` every 40ms, increment by 2 (reaches 100 in ~2s)
- Complete at 2500ms → `isLoading = false` → null → `onComplete()` after 300ms delay

### anime.js Replacement

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, createScope, createTimer } from 'animejs';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const progressState = useRef({ value: 0 });

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({ root: root.current }).add(() => {
      // Spinner rotation — replaces animate-spin
      animate('.spinner-circle', {
        rotate: 360,
        duration: 1000,
        ease: 'linear',
        loop: true,
      });

      // Progress bar — replaces setInterval + CSS transition
      animate(progressState.current, {
        value: 100,
        duration: 2500,
        ease: 'linear',
        onUpdate: () => {
          const bar = root.current?.querySelector('.progress-bar') as HTMLElement;
          const label = root.current?.querySelector('.progress-label');
          if (bar) bar.style.width = `${Math.round(progressState.current.value)}%`;
          if (label) label.textContent = `${Math.round(progressState.current.value)}%`;
        },
        onComplete: () => {
          // Fade out the entire loading screen
          animate('.loading-container', {
            opacity: [1, 0],
            duration: 300,
            ease: 'out(3)',
            onComplete: () => {
              setIsLoading(false);
              onComplete();
            },
          });
        },
      });
    });

    return () => scope.current?.revert();
  }, [onComplete]);

  if (!isLoading) return null;

  return (
    <div ref={root} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      <div className="loading-container text-center">
        <div className="relative mb-8">
          <div className="spinner-circle w-20 h-20 border-4 border-gray-800 rounded-full border-t-purple-500 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="progress-label text-purple-400 font-mono text-sm">0%</span>
          </div>
        </div>
        <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden">
          <div className="progress-bar h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: '0%' }} />
        </div>
        <p className="text-gray-400 text-sm font-medium">Loading Portfolio...</p>
      </div>
    </div>
  );
}
```

**Key changes:**
- Remove `animate-spin` class → anime.js `rotate: 360, loop: true`
- Remove `setInterval` + `transition-all` → anime.js `animate(obj, { value: 100 })` with `onUpdate`
- Add fade-out animation before unmounting (currently instant `return null`)

---

## 5. Migration B — Hero Section Staggered Entrance

### Current Behavior
The hero section uses a pattern repeated across 6 child components:
1. `HeroSection` sets `isVisible = true` after `loadingComplete` + 200ms delay
2. Each child toggles `opacity-0` ↔ `animate-fade-in-up` based on `isVisible`
3. Stagger is done via CSS `delay-{0, 0, 200, 400, 600, 800}`

| Child | Delay | Animation |
|-------|-------|-----------|
| `HeroHeading` | 0ms | fade-in-up (1000ms) |
| `HeroTypewriterTitle` | 0ms | fade-in-up (1000ms) |
| `HeroDescription` | 200ms | fade-in-up (1000ms) |
| `HeroActions` | 400ms | fade-in-up (1000ms) |
| `HeroSocialLinks` | 600ms | fade-in-up (1000ms) |
| `ScrollIndicator` | 800ms | fade-in (1000ms) + bounce (continuous) |

### anime.js Replacement

**hero-section.tsx** — becomes the animation orchestrator:

```tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createScope, createTimeline, animate, spring } from 'animejs';
// ... other imports

export default function HeroSection({ loadingComplete }: { loadingComplete: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  const personalInfo = getPersonalInfo();
  const socialLinks = getSocialLinks();
  const buttonTexts = getButtonTexts();
  const title = useCyclingTypewriter(personalInfo.typingTitles, { ... });

  useEffect(() => {
    if (!loadingComplete || !root.current) return;

    scope.current = createScope({ root: root.current }).add(() => {
      // Main entrance timeline — replaces all isVisible + CSS delays
      const tl = createTimeline({
        defaults: { duration: 800, ease: 'out(3)' },
        autoplay: false,
      });

      tl.add('.hero-heading', {
          opacity: [0, 1],
          y: [30, 0],
        }, 200) // 200ms after loadingComplete (was setTimeout 200)
        .add('.hero-typewriter', {
          opacity: [0, 1],
          y: [30, 0],
        }, '<') // same time as heading
        .add('.hero-description', {
          opacity: [0, 1],
          y: [30, 0],
        }, '<+=200') // 200ms after heading
        .add('.hero-actions', {
          opacity: [0, 1],
          y: [30, 0],
        }, '<+=200')
        .add('.hero-social-links', {
          opacity: [0, 1],
          y: [30, 0],
        }, '<+=200')
        .add('.scroll-indicator', {
          opacity: [0, 1],
          duration: 600,
        }, '<+=200');

      tl.play();

      // Continuous bounce on scroll arrow — replaces animate-bounce
      animate('.scroll-arrow', {
        y: [0, -10, 0],
        duration: 1000,
        ease: 'inOutSine',
        loop: true,
      });
    });

    return () => scope.current?.revert();
  }, [loadingComplete]);

  // ... rest of component
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 relative overflow-hidden bg-gray-950">
      <div ref={root} className="max-w-4xl mx-auto text-center relative z-10">
        {/* Children no longer need isVisible prop */}
        <HeroHeading greeting={personalInfo.greeting} name={personalInfo.name} />
        <HeroTypewriterTitle title={title} loadingComplete={loadingComplete} />
        <HeroDescription tagline={personalInfo.tagline} />
        <HeroActions ... />
        <HeroSocialLinks links={socialLinks} />
        <ScrollIndicator onClick={() => scrollToSection('about')} />
      </div>
    </section>
  );
}
```

**Child components simplification** — remove `isVisible` prop, remove CSS animation classes:

```tsx
// hero-heading.tsx — BEFORE
<div className={`... transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>

// hero-heading.tsx — AFTER
<div className="hero-heading opacity-0 ...">
```

Each child just gets a CSS class name for targeting + starts at `opacity-0`. The timeline in the parent handles everything.

---

## 6. Migration C — Section Visibility Entrances

### Current Pattern (identical across 3 sections)

Each section uses `useSectionVisibility` → `isVisible` boolean → passed to children → children toggle `animate-fade-in-up` / `opacity-0`.

**About Section children:**
- `AboutSectionHeader`: `animate-fade-in-up` on visible
- `SkillCard` x6: `animate-fade-in-up` with `animationDelay: index * 200` via inline style

**Projects Section children:**
- `ProjectsSectionHeader`: `animate-fade-in-up` on visible
- `ProjectCard` xN: `animate-fade-in-up` with `animationDelay: index * 200`

**Contact Section children:**
- `ContactSectionHeader`: `animate-fade-in-up` on visible
- `ContactFormCard`: `animate-slide-in-left` on visible
- `ContactInfoList`: `animate-fade-in-up` with `delay-200`
- `ContactInfoItem` xN: `animate-fade-in-up`

### anime.js Replacement: Scroll-Triggered Animations

Each section becomes self-contained with `onScroll()`:

```tsx
// about-section.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createScope, animate, stagger, onScroll } from 'animejs';

export default function AboutSection() {
  const root = useRef<HTMLElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({ root: root.current }).add(() => {
      // Section header entrance
      const headerAnim = animate('.section-header', {
        opacity: [0, 1],
        y: [30, 0],
        duration: 800,
        ease: 'out(3)',
        autoplay: false,
      });

      onScroll(headerAnim, {
        target: '.section-header',
        enter: 'bottom',
        leave: 'top',
      });

      // Skill cards staggered entrance
      const cardsAnim = animate('.skill-card', {
        opacity: [0, 1],
        y: [30, 0],
        duration: 800,
        ease: 'out(3)',
        delay: stagger(200),
        autoplay: false,
      });

      onScroll(cardsAnim, {
        target: '.skills-grid',
        enter: 'bottom',
        leave: 'top',
      });
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <section id="about" ref={root} className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30 relative overflow-hidden">
      {/* Children no longer need isVisible prop */}
    </section>
  );
}
```

**Child component changes:**
- Remove `isVisible` prop from all children
- Remove `animate-fade-in-up` / `animate-slide-in-left` / `opacity-0` conditional classes
- Add static CSS class names for targeting (`.skill-card`, `.project-card`, etc.)
- Add `opacity: 0` as starting state (anime.js animates from 0)
- Remove `animationDelay` prop — stagger handles it
- Remove `style={{ animationDelay }}` inline styles

**Contact section** uses `animate-slide-in-left` for the form card — anime.js equivalent:

```ts
animate('.contact-form-card', {
  opacity: [0, 1],
  x: [-30, 0], // translateX instead of translateY
  duration: 800,
  ease: 'out(3)',
  autoplay: false,
});
```

---

## 7. Migration D — Navigation Scroll Transition

### Current Behavior
- `useScrollThreshold(50)` → `isScrolled` boolean
- Toggles classes: `bg-background/95 backdrop-blur-sm border-b border-border` ↔ `bg-transparent`
- `transition-all duration-300` handles the smooth change

### anime.js Replacement

**Option A (Recommended): Keep CSS transitions** — This is a simple binary state toggle on non-animated properties (background-color, backdrop-filter, border). CSS transitions are ideal here and anime.js adds no value.

**Option B (Full anime.js):** If you want everything in anime.js:

```ts
const scrollObs = onScroll({
  onEnter: () => {
    animate('nav', {
      backgroundColor: 'rgba(var(--background), 0.95)',
      backdropFilter: 'blur(4px)',
      duration: 300,
      ease: 'out(2)',
    });
  },
  onLeave: () => {
    animate('nav', {
      backgroundColor: 'transparent',
      backdropFilter: 'blur(0px)',
      duration: 300,
      ease: 'out(2)',
    });
  },
});
```

**Recommendation:** Keep CSS for this one. The `transition-all duration-300` is perfect here.

---

## 8. Migration E — Back-to-Top Button

### Current Behavior
- `scroll` event listener → `isVisible` when `pageYOffset > 300`
- `transition-all duration-300 ease-in-out` on the button
- Toggles: `opacity-100 translate-y-0` ↔ `opacity-0 translate-y-4 pointer-events-none`
- Hover: `hover:scale-110`, `hover:shadow-xl`
- Active: `active:scale-95`

### anime.js Replacement

```tsx
useEffect(() => {
  scope.current = createScope({ root: root.current }).add(self => {
    self.add('show', () => {
      animate('.back-to-top-btn', {
        opacity: [0, 1],
        y: [16, 0],
        duration: 300,
        ease: 'out(2)',
        onBegin: () => {
          const btn = root.current?.querySelector('.back-to-top-btn') as HTMLElement;
          if (btn) btn.style.pointerEvents = 'auto';
        },
      });
    });

    self.add('hide', () => {
      animate('.back-to-top-btn', {
        opacity: [1, 0],
        y: [0, 16],
        duration: 300,
        ease: 'out(2)',
        onComplete: () => {
          const btn = root.current?.querySelector('.back-to-top-btn') as HTMLElement;
          if (btn) btn.style.pointerEvents = 'none';
        },
      });
    });
  });

  const handleScroll = () => {
    if (window.pageYOffset > 300) {
      scope.current?.methods.show();
    } else {
      scope.current?.methods.hide();
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('scroll', handleScroll);
    scope.current?.revert();
  };
}, []);
```

---

## 9. Migration F — Continuous Animations (bounce, pulse, spin)

### Current Instances

| Animation | Component | Current CSS |
|-----------|-----------|-------------|
| Spin | `LoadingScreen` spinner | `animate-spin` (360deg, 1s linear infinite) |
| Bounce | `ScrollIndicator` arrow | `animate-bounce` (translateY, 1s infinite) |
| Pulse | `HeroTypewriterTitle` cursor `\|` | `animate-pulse` (opacity 1→0.5→1, 2s infinite) |

### anime.js Replacements

**Spin:**
```ts
animate('.spinner', {
  rotate: 360,
  duration: 1000,
  ease: 'linear',
  loop: true,
});
```

**Bounce:**
```ts
animate('.scroll-arrow', {
  y: [0, -25, 0, -10, 0], // mimics CSS bounce keyframes
  duration: 1000,
  ease: 'out(2)',
  loop: true,
});
```

**Pulse (cursor blink):**
```ts
animate('.typewriter-cursor', {
  opacity: [1, 0.5, 1],
  duration: 2000,
  ease: 'inOut(2)',
  loop: true,
});
```

---

## 10. Migration G — Hover Interactions

### Current Hover Effects

| Element | Hover Effect | CSS |
|---------|-------------|-----|
| `SkillCard` | Shadow + translateY(-2px) | `hover:shadow-lg hover:-translate-y-2` |
| `ProjectCard` | Shadow + translateY(-2px) | `hover:shadow-xl hover:-translate-y-2` |
| `ProjectCard` image | Scale 1.05 | `group-hover:scale-105` |
| `ProjectCard` overlay | Opacity 0→1 | `group-hover:opacity-100` |
| Hero buttons | Scale 1.05 | `hover:scale-105` |
| Social links | Scale 1.10 | `hover:scale-110` |
| `BackToTop` | Scale 1.10 + shadow | `hover:scale-110 hover:shadow-xl` |
| All buttons (global CSS) | translateY(-2px) + brightness | CSS `.btn-primary:hover`, generic `button:hover` |
| Nav links (global CSS) | Underline width 0→100% + color | CSS pseudo `::after` |
| Footer links | Color change | `hover:text-primary` |

### Recommendation: **Keep CSS for hover effects**

Hover effects are **not** good candidates for anime.js migration because:
1. CSS `:hover` is zero-JS, zero-overhead
2. anime.js hover requires `mouseenter`/`mouseleave` listeners per element
3. The current effects are simple (scale, translateY, shadow) — CSS handles them perfectly
4. No visual difference to the user

**If you still want anime.js for richer hover effects** (e.g., spring physics):

```ts
// Per card, inside createScope
const cards = document.querySelectorAll('.skill-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    animate(card, {
      y: -8,
      scale: 1.02,
      duration: 300,
      ease: spring({ stiffness: 300, damping: 15 }),
      composition: 'blend',
    });
  });
  card.addEventListener('mouseleave', () => {
    animate(card, {
      y: 0,
      scale: 1,
      duration: 400,
      ease: 'out(3)',
      composition: 'blend',
    });
  });
});
```

---

## 11. Migration H — Typewriter Effect

### Current Behavior (use-cycling-typewriter.ts)
- `setTimeout` chain: type one char every 80ms, delete one char every 50ms
- Pause 2000ms between phrases
- Start delay 800ms
- Cycles through `personalInfo.typingTitles` array
- Updates `displayText` state → re-render

### anime.js Replacement

The typewriter is character-by-character state manipulation. anime.js can drive the timing, but the logic stays similar:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { createTimer } from 'animejs';

export function useCyclingTypewriter(
  phrases: string[],
  { typingSpeed = 80, deletingSpeed = 50, pauseDuration = 2000, startDelay = 0 } = {}
) {
  const [displayText, setDisplayText] = useState('');
  const stateRef = useRef({
    phraseIndex: 0,
    charIndex: 0,
    isDeleting: false,
    isPaused: false,
  });

  useEffect(() => {
    if (phrases.length === 0) return;

    let timer: ReturnType<typeof createTimer> | null = null;

    const startTyping = () => {
      timer = createTimer({
        duration: Infinity,
        frameRate: 1000 / typingSpeed, // ~12.5 fps for typing
        onUpdate: () => {
          const s = stateRef.current;
          const currentPhrase = phrases[s.phraseIndex];

          if (s.isPaused) return;

          if (!s.isDeleting) {
            if (s.charIndex < currentPhrase.length) {
              s.charIndex++;
              setDisplayText(currentPhrase.slice(0, s.charIndex));
            } else {
              s.isPaused = true;
              setTimeout(() => {
                s.isPaused = false;
                s.isDeleting = true;
                if (timer) timer.frameRate = 1000 / deletingSpeed;
              }, pauseDuration);
            }
          } else {
            if (s.charIndex > 0) {
              s.charIndex--;
              setDisplayText(currentPhrase.slice(0, s.charIndex));
            } else {
              s.isDeleting = false;
              s.phraseIndex = (s.phraseIndex + 1) % phrases.length;
              if (timer) timer.frameRate = 1000 / typingSpeed;
            }
          }
        },
      });
    };

    if (startDelay > 0) {
      const delayTimeout = setTimeout(startTyping, startDelay);
      return () => {
        clearTimeout(delayTimeout);
        timer?.revert();
      };
    } else {
      startTyping();
      return () => timer?.revert();
    }
  }, [phrases, typingSpeed, deletingSpeed, pauseDuration, startDelay]);

  return displayText;
}
```

**Alternative: Keep current hook** — The typewriter is fundamentally a state machine, not a visual animation. The current `setTimeout` approach works fine. anime.js doesn't add visual improvement here. Consider keeping the current hook and only migrating the `animate-pulse` on the cursor character.

**Recommendation:** Keep `useCyclingTypewriter` as-is. Only replace the cursor blink animation.

---

## 12. Migration I — Three.js Hexagonal Grid Background

### Current System (the "biggest of them all")

**Files:**
- `components/background.tsx` — Canvas setup, mouse/touch event listeners (199 lines)
- `components/background/hexagonal-grid.tsx` — 900 instanced hex tubes with sine wave animation (312 lines)
- `components/background/dynamic-lights.tsx` — 2 point lights following mouse + click wave decay (108 lines)
- `components/background/constants.ts` — Grid config, color palettes (28 lines)
- `components/background/interaction-state.ts` — Shared mouse/click state (5 lines)
- `components/background/background-fallback.tsx` — Static gradient fallback (20 lines)

**What it does:**
1. **30×30 = 900 hexagonal tubes** arranged in a grid using `THREE.InstancedMesh`
2. Each hex has a **sine wave depth oscillation**: `z = sin(phase + time) * radius * 0.5`
3. **Mouse parallax**: hexes near mouse cursor push forward (z-depth) with smooth influence falloff
4. Entire grid **tilts** toward mouse position via `lerp`
5. **Dynamic lights**: 2 point lights track mouse position
6. **Click wave**: click sets intensity → exponential decay via `*= 0.95` per frame
7. **Color randomization**: on click, picks random palette, lerps all 900 hex colors over ~50 frames
8. **Responsive scaling**: grid scales based on viewport aspect ratio

### Migration Analysis

**This is a WebGL/Three.js system. anime.js is a DOM animation library.** The core challenge:

| Feature | Can anime.js replace? | Why |
|---------|----------------------|-----|
| Instanced mesh rendering | **NO** | anime.js doesn't render 3D geometry |
| Per-frame sine wave on 900 objects | **NO** | anime.js can't drive `useFrame` loops on GPU meshes |
| Mouse parallax on instanced mesh | **NO** | Requires per-instance matrix updates |
| Point light following mouse | **NO** | Three.js light objects |
| Color transition (lerp 2700 floats) | **NO** | InstancedBufferAttribute manipulation |
| Grid tilt (group rotation) | **NO** | Three.js group transform |

### Three Options for the Background

#### Option 1: Keep Three.js (Recommended)

The Three.js hex grid is fundamentally a **WebGL rendering system**, not a DOM animation. It uses:
- GPU instanced rendering (900 objects in 1 draw call)
- Per-frame buffer attribute updates
- Three.js scene graph (lights, camera, materials)

**anime.js cannot replicate this.** Attempting to create 900 DOM elements and animate them would be:
- ~100x slower (no GPU instancing)
- Unable to do 3D depth/lighting/materials
- Missing metalness, clearcoat, vertex colors

**Recommendation:** Keep Three.js for the 3D background. Use anime.js for everything else.

#### Option 2: Replace with 2D Canvas + anime.js Hybrid

Replace the 3D hexes with a 2D canvas/SVG hexagonal grid animated by anime.js:

```tsx
// Create 900 SVG hexagons
// Use anime.js to animate their opacity, fill, transform
// Use onScroll for parallax
// Use mouse events for interaction

animate('.hex', {
  translateZ: (el, i) => Math.sin(phases[i] + time) * 10,
  delay: stagger(10, { grid: [30, 30], from: 'center' }),
  loop: true,
  alternate: true,
  duration: 3000,
});
```

**Problems:**
- No 3D depth/lighting — looks flat
- 900 SVG/DOM elements = very heavy (vs 1 instanced draw call)
- No metalness/clearcoat material look
- Significant visual downgrade

#### Option 3: CSS-Only Background + anime.js Accents

Replace the entire 3D background with a CSS gradient + animated accents:

```tsx
// Static gradient background
<div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />

// Floating gradient orbs animated with anime.js
animate('.bg-orb', {
  x: () => random(-100, 100),
  y: () => random(-100, 100),
  scale: [0.8, 1.2],
  opacity: [0.05, 0.15],
  duration: () => random(4000, 8000),
  ease: 'inOutSine',
  loop: true,
  alternate: true,
});
```

**Good for:** Performance, simplicity, mobile  
**Bad for:** Not the same visual — significant downgrade from the 3D hex grid

### Recommended Approach for Background

**Keep Three.js as-is**, but use anime.js to animate the **transitions around** the background:
- Fade-in the Canvas on mount: `animate('.bg-canvas', { opacity: [0, 1], duration: 1000 })`
- Animate the click wave decay with anime.js instead of manual `*= 0.95`:

```ts
// In background.tsx click handler, INSTEAD of setting clickWave.intensity = 1.0
animate(clickWave, {
  intensity: [1.0, 0],
  duration: 1500,
  ease: 'out(4)',
});
```

- Animate color transitions with anime.js instead of manual lerp:

```ts
// In hexagonal-grid.tsx, INSTEAD of manual color lerp in useFrame
// Use anime.js to drive the transition progress
animate(colorTransitionProgressRef, {
  current: [0, 1],
  duration: 1000,
  ease: 'out(3)',
});
```

---

## 13. Migration J — CSS Utility Animations

### Global CSS to Keep

| CSS Rule | Keep? | Reason |
|----------|-------|--------|
| `.interactive-element` hover | Keep (or migrate) | Generic hover pattern |
| `.btn-primary` hover + shine | Keep | Complex pseudo-element animation |
| `button:hover` global | **Remove** | Conflicts with anime.js hover if migrated |
| `nav a::after` underline | Keep | Pure CSS, works well |
| `.glow-on-hover` | Keep | Not actively used |
| `.particle-container` / `.particle` | **Remove** | Not used (no particles in DOM) |
| Scroll behavior smooth | Keep | Not animation-related |

### CSS Keyframes to Remove After Migration

```css
/* REMOVE these from app/globals.css after anime.js migration: */
@keyframes fadeInUp { ... }
@keyframes fadeIn { ... }
@keyframes slideInLeft { ... }

/* REMOVE these classes: */
.animate-fade-in-up { ... }
.animate-fade-in { ... }
.animate-slide-in-left { ... }

/* KEEP these (used for non-migrated elements or as fallbacks): */
@keyframes glow { ... }        /* keep if .animate-glow is used */
@keyframes float { ... }       /* keep if .animate-float is used */
@keyframes pulse-glow { ... }  /* keep if .animate-pulse-glow is used */
```

---

## 14. Hooks to Replace or Adapt

| Hook | Action | Reason |
|------|--------|--------|
| `useSectionVisibility` | **Replace with anime.js `onScroll()`** | anime.js has built-in scroll observers |
| `useScrollThreshold` | **Keep** | Simple scroll boolean, not an animation |
| `useCyclingTypewriter` | **Keep** | State machine, not a visual animation |
| `useCustomCursor` | **Skip** | Fully commented out |
| `useShouldRenderCanvas` | **Keep** | Device detection, not animation |
| `useMobile` | **Keep** | Device detection |

### New Hook

Create `hooks/use-anime-scope.ts` (see Section 3.2) — shared by all components.

---

## 15. CSS Keyframes to Remove

After all components are migrated, remove from `app/globals.css`:

```
@keyframes fadeInUp      → replaced by anime.js y: [30, 0] + opacity: [0, 1]
@keyframes fadeIn        → replaced by anime.js opacity: [0, 1]
@keyframes slideInLeft   → replaced by anime.js x: [-30, 0] + opacity: [0, 1]

.animate-fade-in-up      → remove class
.animate-fade-in         → remove class
.animate-slide-in-left   → remove class
```

Keep: `glow`, `float`, `pulse-glow` (may be used elsewhere or as CSS fallbacks).

---

## 16. Implementation Order

| Phase | What | Files Affected | Effort |
|-------|------|----------------|--------|
| **Phase 0** | Install anime.js, create `use-anime-scope.ts` hook | `package.json`, new hook file | 10 min |
| **Phase 1** | Loading Screen | `loading-screen.tsx` | 30 min |
| **Phase 2** | Hero Section entrance timeline | `hero-section.tsx` + 6 children | 1 hr |
| **Phase 3** | About Section scroll entrance | `about-section.tsx` + children | 45 min |
| **Phase 4** | Projects Section scroll entrance | `projects-section.tsx` + children | 45 min |
| **Phase 5** | Contact Section scroll entrance | `contact-section.tsx` + children | 45 min |
| **Phase 6** | Back-to-Top button | `back-to-top.tsx` | 20 min |
| **Phase 7** | Continuous animations (bounce, pulse) | `scroll-indicator.tsx`, `hero-typewriter-title.tsx` | 20 min |
| **Phase 8** | (Optional) Hover interactions | Cards, buttons | 1 hr |
| **Phase 9** | (Optional) Nav scroll transition | `navigation.tsx` | 20 min |
| **Phase 10** | CSS cleanup — remove unused keyframes | `app/globals.css` | 15 min |
| **Phase 11** | Remove `useSectionVisibility` hook | Delete hook, remove all imports | 30 min |
| **Phase 12** | (Optional) Background anime.js accents | `background.tsx`, `hexagonal-grid.tsx` | 1 hr |

**Total estimated effort:** ~6-8 hours

### Dependencies
- Phase 0 must be first
- Phases 1-6 are independent of each other
- Phase 10-11 must come after Phases 1-6 (all consumers removed)
- Phase 12 is independent and optional

---

## 17. File Change Summary

### New Files
| File | Purpose |
|------|---------|
| `hooks/use-anime-scope.ts` | Reusable anime.js scope hook for React |

### Modified Files
| File | Changes |
|------|---------|
| `package.json` | Add `animejs` dependency |
| `app/globals.css` | Remove migrated keyframes + classes |
| `components/loading-screen.tsx` | Full rewrite with anime.js |
| `components/hero-section.tsx` | Add createTimeline, remove isVisible state |
| `components/hero-section/hero-heading.tsx` | Remove isVisible prop + CSS animation classes |
| `components/hero-section/hero-typewriter-title.tsx` | Remove isVisible + animation classes |
| `components/hero-section/hero-description.tsx` | Remove isVisible + animation classes |
| `components/hero-section/hero-actions.tsx` | Remove isVisible + animation classes |
| `components/hero-section/hero-social-links.tsx` | Remove isVisible + animation classes |
| `components/hero-section/scroll-indicator.tsx` | Remove isVisible + animation classes, add anime.js bounce |
| `components/about-section.tsx` | Replace useSectionVisibility with anime.js onScroll |
| `components/about-section/about-section-header.tsx` | Remove isVisible + animation classes |
| `components/about-section/skills-grid.tsx` | Remove isVisible + animationDelay |
| `components/about-section/skill-card.tsx` | Remove isVisible + animationDelay + animation classes |
| `components/projects-section.tsx` | Replace useSectionVisibility with anime.js onScroll |
| `components/projects-section/projects-section-header.tsx` | Remove isVisible + animation classes |
| `components/projects-section/projects-grid.tsx` | Remove isVisible + animationDelay |
| `components/projects-section/project-card.tsx` | Remove isVisible + animationDelay + animation classes |
| `components/contact-section.tsx` | Replace useSectionVisibility with anime.js onScroll |
| `components/contact-section/contact-section-header.tsx` | Remove isVisible + animation classes |
| `components/contact-section/contact-form-card.tsx` | Remove isVisible + animation classes |
| `components/contact-section/contact-info-list.tsx` | Remove isVisible + animation classes |
| `components/contact-section/contact-info-item.tsx` | Remove isVisible + animation classes |
| `components/back-to-top.tsx` | Replace CSS transition with anime.js |

### Files to Delete (after full migration)
| File | Reason |
|------|--------|
| `hooks/use-section-visibility.ts` | Replaced by anime.js `onScroll()` |

### Files Unchanged
| File | Reason |
|------|--------|
| `components/background.tsx` | Keep Three.js |
| `components/background/*` | Keep all Three.js files |
| `components/navigation.tsx` | Keep CSS transitions (recommended) |
| `components/navigation/*` | No animation migration needed |
| `components/footer.tsx` | Only `hover:text-primary` — CSS |
| `hooks/use-cycling-typewriter.ts` | Keep as-is (state machine) |
| `hooks/use-scroll-threshold.ts` | Keep (simple boolean) |
| `hooks/use-should-render-canvas.ts` | Keep (device detection) |
| `hooks/use-mobile.ts` | Keep |

---

## 18. Bundle Impact

### Current Animation Dependencies
| Dependency | Size |
|-----------|------|
| tw-animate-css | ~2 KB |
| Three.js + R3F + Drei | ~200+ KB (gzipped) |
| CSS keyframes | ~1 KB |

### After Migration
| Dependency | Size | Notes |
|-----------|------|-------|
| anime.js (full) | ~24.5 KB | If using all features |
| anime.js (tree-shaken) | ~10-15 KB | Using subpath imports |
| tw-animate-css | Keep or remove | Still needed for `animate-spin/bounce/pulse` if not migrated |
| Three.js + R3F + Drei | ~200+ KB | **Unchanged** — kept for background |

### Optimization Tips
- Use subpath imports: `import { animate } from 'animejs/animation'` etc.
- The `onScroll` replaces `IntersectionObserver` code, so net JS size is comparable
- If you remove tw-animate-css after migrating all its classes, save ~2 KB

---

*Migration plan created from analysis of 30+ source files across the portfolio codebase.*
*All animation timings, easings, and behaviors are mapped to exact anime.js v4 equivalents.*
