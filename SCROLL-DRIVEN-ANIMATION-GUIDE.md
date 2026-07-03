# Scroll-Driven Animation Guide for Portfolio-v2

> How to add **animejs.com-style** scroll-driven animations to this portfolio.  
> Based on reverse-engineering https://animejs.com/ and the current portfolio-v2 architecture.

---

## 1. What is the animejs.com animation?

The animejs.com homepage uses a **scroll-driven 3D scene** that transforms as you scroll. It is not a video, GIF, or simple CSS parallax. It is a real-time rendered WebGL scene whose timeline is scrubbed by scroll position.

### Visual breakdown

| Element | What it is |
|---------|-----------|
| Central 3D "engine" | Rotating modules, rings, waveform bars, floating dots |
| Neon segmented rings | Torus arcs colored red/green/yellow/blue/cyan |
| Waveform bars | Audio-style radial bars that pulse |
| Floating particles | Small colored dots orbiting the center |
| Tick marks | Radial clock-like ticks around the perimeter |
| HTML overlays | Feature cards inserted as `CSS3DObject` inside the 3D scene |
| Bloom glow | Post-processing makes everything look neon |
| Scroll sync | Page scroll drives the entire 3D choreography |

### Technical categories

- **Scroll-driven animation** — animation progress tied to scroll position
- **Scrollytelling / scroll choreography** — narrative progression via scroll
- **WebGL scroll experience** — Three.js/WebGL rendering
- **Immersive hero animation** — motion is the core UX

---

## 2. How animejs.com implements it

### File structure (from reverse-engineered `scripts.js`)

```
animejs.com/
├── assets/js/scripts.js          # Main bundle (~2 MB, minified)
├── assets/css/styles.css
└── assets/models/                # GLB 3D models
    ├── module-animate-01.glb
    ├── module-easing-01.glb
    ├── module-draggable-01.glb
    ├── module-scroll-01.glb
    ├── module-timer-01.glb
    └── ...
```

### JavaScript modules inside the bundle

| Module | Purpose |
|--------|---------|
| `js/pages/home/stage.js` | Sets up Three.js renderer, camera, scene, CSS3DRenderer, labels renderer |
| `js/pages/home/engine.js` | Loads GLB models, builds the 3D engine hierarchy, arranges modules in 3D space |
| `js/pages/home/lights.js` | Ambient + directional light setup |
| `js/pages/home/materials.js` | Custom outline shader material |
| `js/pages/home/postprocessing.js` | Bloom, FXAA, edge detection passes |
| `js/pages/home/canvas.js` | Helper class for 2D canvas overlays (dots, lines, grids) |
| `js/pages/home/home.js` | **Master timeline + scroll sync** |
| `js/pages/home/features-demos.js` | Feature demo mini-animations |

### The master timeline pattern

The core technique:

```js
// 1. Build one long timeline
const TL = createTimeline({ autoplay: false });

TL.label('INTRO')
  .label('INTRO_ON', 1400)
  .label('HEADING')
  .label('HEADING_CASE', 'HEADING+=250')
  .label('TOOLBOX')
  .label('FEATURES')
  .label('MODULES')
  .label('SPONSORS')
  .label('GET_STARTED')
  // ... hundreds of animations between labels

// 2. Scroll drives the timeline
const proxy = { currentTime: 0 };

const scrollController = onScroll({
  target: document.body,
  enter: 'max',
  leave: 'min',
  sync: 0.9,
});

animate(proxy, {
  currentTime: [TL.labels.INTRO, TL.labels.GET_STARTED_END],
  autoplay: scrollController,
  onUpdate: () => TL.seek(proxy.currentTime),
});
```

### Key insight

The site has **two render systems running at 60fps**:

1. **Time-based continuous animations** — rings spin, modules bob, particles float (these run on `requestAnimationFrame`).
2. **Scroll-scrubbed master timeline** — camera fly-through, scene rotation, section transitions (these run from scroll position).

They are separate but composited together.

---

## 3. Why anime.js itself is used

animejs.com is the marketing site for the **anime.js v4** library. It uses its own APIs:

| API | Use on animejs.com |
|-----|-------------------|
| `animate()` | Individual tweens (opacity, transforms, colors) |
| `createTimeline()` | Master scroll-scrubbed timeline |
| `onScroll()` | Link animations to scroll position |
| `stagger()` | Wave effects across many elements |
| `createScope()` | Scoped animations per section |
| `createTimer()` | Render loop timing |
| `createAnimatable()` / `createDraggable()` | Interactive scroll cursor |

The same library is **already installed** in portfolio-v2 (`package.json` → `"animejs": "^4.3.6"`).

---

## 4. Current portfolio-v2 context

### Existing stack

| Package | Version | Relevance |
|---------|---------|-----------|
| `next` | 15.2.4 | Framework |
| `react` / `react-dom` | ^19 | UI |
| `tailwindcss` | 4.1.9 | Styling |
| `animejs` | 4.3.6 | **Animation library** |
| `three` | ^0.179.1 | **3D rendering** |
| `@react-three/fiber` | ^9.3.0 | **React wrapper for Three.js** |
| `@react-three/drei` | ^10.7.4 | **Three.js helpers** |
| `tw-animate-css` | 1.3.3 | Tailwind animations |

### Existing background system

File: `components/backgrounds/index.tsx`

- 20+ background options
- Lazy-loaded via `next/dynamic` equivalent
- Switcher UI at bottom-left
- Supports env-based locking: `NEXT_PUBLIC_BG_MODE=engine`
- Supports random mode and localStorage persistence

### Existing background examples

| File | Tech | Uses anime.js? |
|------|------|----------------|
| `starfield-background.tsx` | Canvas 2D | Yes (`createScope`, `animate`, `stagger`) |
| `neon-rings-background.tsx` | Canvas 2D | No (raw RAF) |
| `hexagon-grid-background.tsx` | Canvas 2D | No (raw RAF) |
| `aurora-background.tsx` | Canvas 2D | No (raw RAF) |

### Existing animation migration plan

File: `ANIMATION-MIGRATION-PLAN.md`

- Plans to convert all CSS keyframe animations to anime.js
- Already identifies `useSectionVisibility` → `onScroll()` replacement
- Recommends keeping Three.js for the 3D background
- Estimated 6-8 hours for full migration

---

## 5. Implementation options for portfolio-v2

### Option A: Add a new R3F scroll-driven background (recommended)

Create a new background option `engine-background.tsx` that uses R3F + anime.js `onScroll()` to drive a procedural 3D scene.

**Pros:**
- Fits the existing background switcher architecture
- Uses installed dependencies (R3F, Three.js, anime.js)
- Non-breaking — default remains `aurora`
- Can be selected via `NEXT_PUBLIC_BG_MODE=engine`

**Cons:**
- WebGL performance cost on low-end devices
- Requires R3F knowledge
- Not a 1:1 clone of animejs.com GLB models

### Option B: Add scroll-driven section entrance animations

Convert `useSectionVisibility` + CSS fade-ins to anime.js `onScroll()` animations.

**Pros:**
- Directly implements part of `ANIMATION-MIGRATION-PLAN.md`
- Works with existing DOM structure
- Lighter than WebGL

**Cons:**
- Not the "animejs.com background" effect the user asked for
- More refactor work across many components

### Option C: Canvas 2D scroll-driven engine

Build the engine visualization as a 2D canvas (similar to existing backgrounds) but driven by scroll.

**Pros:**
- Matches existing background patterns (canvas + RAF)
- Simpler than R3F
- Easier to deploy

**Cons:**
- Less visual depth than WebGL
- No real 3D camera movement
- Harder to add HTML overlays inside the scene

### Recommended combination

**Phase 1:** Option A — add the `engine` R3F background.  
**Phase 2:** Option B — add `useScrollProgress` hook and wire section entrances.

---

## 6. Detailed implementation plan

### Phase 1: Reusable scroll progress hook

Create `hooks/use-scroll-progress.ts`:

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
      onUpdate: () => setProgress(proxy.value),
    })

    return () => {
      animation.pause()
      scrollController?.disable?.()
    }
  }, [])

  return progress
}
```

### Phase 2: Engine background component

Create `components/backgrounds/engine-background.tsx`:

```tsx
"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { useScrollProgress } from "@/hooks/use-scroll-progress"

const PALETTE = [
  0xff4d4d, // red
  0x6ee7b7, // green
  0x22d3ee, // cyan
  0x60a5fa, // blue
  0xfacc15, // yellow
  0xfb923c, // orange
  0xc084fc, // purple
]

function NeonRing({ radius, segments, color, speed, progress }: {
  radius: number
  segments: number
  color: number
  speed: number
  progress: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const arc = (Math.PI * 2) / segments

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.z += speed * 0.002
    groupRef.current.rotation.x = progress * Math.PI * 0.5
    groupRef.current.rotation.y = progress * Math.PI * 0.3
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, i * arc]}>
          <torusGeometry args={[radius, 0.08, 8, 32, arc * 0.85]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function WaveformBars({ count, progress }: { count: number; progress: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const bars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2
      return { angle, baseHeight: 1 + Math.random() * 2 }
    })
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    bars.forEach((bar, i) => {
      const wave = Math.sin(bar.angle * 3 + time * 2 + progress * Math.PI * 8)
      const h = bar.baseHeight + wave * 1.5
      const x = Math.cos(bar.angle) * 8
      const y = Math.sin(bar.angle) * 8
      dummy.position.set(x, y, wave * 1.5)
      dummy.rotation.set(0, 0, bar.angle - Math.PI / 2)
      dummy.scale.set(0.15, h, 0.15)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={PALETTE[0]} transparent opacity={0.9} />
    </instancedMesh>
  )
}

function Scene() {
  const progress = useScrollProgress()
  const sceneRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!sceneRef.current) return
    sceneRef.current.rotation.y = -progress * Math.PI * 2.2
    sceneRef.current.rotation.x = progress * Math.PI * 0.55
    sceneRef.current.position.z = 20 - progress * 45
    sceneRef.current.position.y = progress * 10
  })

  return (
    <group ref={sceneRef}>
      <NeonRing radius={14} segments={24} color={PALETTE[0]} speed={0.3} progress={progress} />
      <NeonRing radius={16} segments={20} color={PALETTE[2]} speed={-0.4} progress={progress} />
      <NeonRing radius={18} segments={28} color={PALETTE[4]} speed={0.5} progress={progress} />
      <WaveformBars count={48} progress={progress} />
      {/* Add particles, ticks, lights here */}
    </group>
  )
}

function CameraController() {
  const progress = useScrollProgress()
  const camera = useThree((state) => state.camera)

  useFrame(() => {
    camera.position.z = 40 - progress * 25
    camera.lookAt(0, 0, 0)
  })

  return null
}

export default function EngineBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 40], fov: 40 }}
        gl={{ antialias: false, alpha: false }}
        style={{ background: "#030712" }}
      >
        <color attach="background" args={["#030712"]} />
        <fog attach="fog" args={["#030712", 20, 90]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Scene />
        <CameraController />
        <EffectComposer>
          <Bloom intensity={0.6} radius={0.4} threshold={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
```

### Phase 3: Register in background switcher

Modify `components/backgrounds/index.tsx`:

```tsx
// 1. Add lazy import
const EngineBackground = _l("engine", () => import("./engine-background"))

// 2. Add to options
export const BACKGROUND_OPTIONS = [
  // ... existing options
  { id: "engine", label: "Engine", icon: "⚙" },
] as const

// 3. Add to renderer
function BackgroundRenderer({ id }: { id: BackgroundId }) {
  return (
    <Suspense fallback={<BackgroundFallback />}>
      {/* ... existing cases ... */}
      {id === "engine" && EngineBackground && <EngineBackground />}
    </Suspense>
  )
}
```

### Phase 4: Hero scroll parallax

Modify `components/hero-section.tsx`:

```tsx
import { useScrollProgress } from "@/hooks/use-scroll-progress"

export default function HeroSection({ loadingComplete }: { loadingComplete: boolean }) {
  const scrollProgress = useScrollProgress()

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 relative overflow-hidden"
      style={{
        transform: `translateY(${scrollProgress * 60}px)`,
        opacity: 1 - scrollProgress * 0.5,
      }}
    >
      {/* ... */}
    </section>
  )
}
```

> Note: Use `transform` and `opacity` carefully so it does not conflict with the existing loading entrance animations.

### Phase 5: Add CSS3D/HTML overlays (optional advanced)

To place DOM elements inside the 3D scene like animejs.com:

```bash
pnpm add @react-three/drei
```

Then use Drei `Html` component:

```tsx
import { Html } from "@react-three/drei"

function FeatureCard() {
  return (
    <mesh position={[5, 0, 0]}>
      <Html transform occlude>
        <div className="bg-gray-900/80 backdrop-blur border border-white/10 p-4 rounded-xl text-white w-64">
          <h3 className="font-bold">Feature</h3>
          <p className="text-sm text-white/70">Description here</p>
        </div>
      </Html>
    </mesh>
  )
}
```

---

## 7. File change summary

### New files

| File | Purpose |
|------|---------|
| `hooks/use-scroll-progress.ts` | Reusable anime.js scroll progress hook |
| `components/backgrounds/engine-background.tsx` | New scroll-driven 3D background |

### Modified files

| File | Change |
|------|--------|
| `components/backgrounds/index.tsx` | Add lazy import, option entry, renderer case |
| `components/hero-section.tsx` | Add scroll parallax (optional) |

### Dependencies

No new runtime dependencies needed:
- `animejs` already installed
- `three`, `@react-three/fiber` already installed
- `@react-three/drei` already installed
- `@react-three/postprocessing` may need installation if not present:

```bash
pnpm list @react-three/postprocessing
# If not present:
pnpm add @react-three/postprocessing
```

---

## 8. Learning resources

### Official documentation

| Resource | URL | Why |
|----------|-----|-----|
| Three.js docs | https://threejs.org/docs/ | Core 3D concepts |
| React Three Fiber docs | https://docs.pmnd.rs/react-three-fiber/ | React integration |
| Drei docs | https://github.com/pmndrs/drei | Helpers |
| Anime.js v4 docs | https://animejs.com/documentation/ | The library itself |
| Anime.js onScroll | https://animejs.com/documentation/events/onscroll | Scroll sync |
| React Three Postprocessing | https://github.com/pmndrs/react-postprocessing | Bloom effects |

### Courses & tutorials

| Resource | Why |
|----------|-----|
| **Bruno Simon — Three.js Journey** | Best paid R3F course |
| **Wawa Sensei (YouTube)** | Free Three.js/R3F tutorials |
| **Fireship** | Quick overviews |
| **animejs.com/learn** | Julian Garnier's own course waitlist |

### Inspiration sites

| Site | What to study |
|------|---------------|
| https://animejs.com | Scroll-driven 3D engine |
| https://bruno-simon.com | Playful scroll-driven 3D portfolio |
| https://linear.app | High-end marketing motion |
| https://vercel.com | Clean animated landing pages |
| https://stripe.com | Product motion design |
| https://www.awwwards.com | Award-winning interactive sites |

---

## 9. Performance & accessibility considerations

### Performance

| Concern | Mitigation |
|---------|-----------|
| WebGL on low-end devices | Check `navigator.hardwareConcurrency` or use canvas fallback |
| Battery drain | Pause RAF when tab hidden; reduce particle count on mobile |
| Bundle size | Lazy-load the engine background so it is only fetched when selected |
| Re-renders | Keep `useScrollProgress` state updates throttled or use refs in R3F |
| Bloom cost | Use low-resolution bloom on mobile |

### Accessibility

```ts
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches

if (prefersReducedMotion) {
  // Show static fallback, skip animations
}
```

Also:
- Keep content readable over the background.
- Ensure text has sufficient contrast.
- Do not make scroll interactions the only way to access content.

---

## 10. Testing checklist

- [ ] `pnpm dev` starts without errors
- [ ] Background switcher shows "Engine" option
- [ ] Selecting "Engine" renders the 3D scene
- [ ] Scrolling drives scene rotation/zoom
- [ ] Reduced motion mode shows fallback
- [ ] Mobile performance is acceptable (target 30fps+ on mid-tier)
- [ ] Default background (`aurora`) still works
- [ ] `NEXT_PUBLIC_BG_MODE=engine` locks to engine background
- [ ] No console errors from R3F or anime.js
- [ ] Build completes: `pnpm build`

---

## 11. Next steps

1. Install `@react-three/postprocessing` if missing.
2. Create `hooks/use-scroll-progress.ts`.
3. Create `components/backgrounds/engine-background.tsx`.
4. Register it in `components/backgrounds/index.tsx`.
5. Optionally add hero parallax in `components/hero-section.tsx`.
6. Test and iterate on the visual style.
