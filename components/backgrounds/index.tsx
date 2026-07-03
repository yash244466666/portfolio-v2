"use client"

import { useState, useEffect, useCallback, lazy, Suspense } from "react"

/**
 * Background Animation Controller
 *
 * ENV VARIABLES (build-time):
 *   NEXT_PUBLIC_BG_MODE   — Controls background behavior:
 *       "switcher"  (default) — Shows the on-screen switcher, default is "aurora"
 *       "random"               — Picks a random background on each page load, no switcher
 *       "<id>"                 — Locked to a specific background (e.g. "neural", "aurora"), no switcher
 *
 *   NEXT_PUBLIC_BG_SWITCHER — Legacy override. "false" hides the switcher (equivalent to BG_MODE="<id>").
 *                              Ignored when BG_MODE is set.
 *
 * When the switcher is disabled or a specific bg is locked, only that background's code
 * is included in the build (tree-shaking via dead-code elimination).
 */

/* ── Build-time constants ── */
const ENV_BG_MODE = process.env.NEXT_PUBLIC_BG_MODE || ""
const ENV_DEFAULT_BG = process.env.NEXT_PUBLIC_DEFAULT_BG || "aurora"
const ENV_BG_SWITCHER_OFF = process.env.NEXT_PUBLIC_BG_SWITCHER === "false"

// Resolve mode: "switcher" | "random" | "<locked-id>"
const BG_MODE: string = ENV_BG_MODE
  || (ENV_BG_SWITCHER_OFF ? ENV_DEFAULT_BG : "switcher")

// Resolve flags
const IS_SWITCHER = BG_MODE === "switcher"
const IS_RANDOM = BG_MODE === "random"
const LOCKED_BG = !IS_SWITCHER && !IS_RANDOM ? BG_MODE : null

/* ── Conditional lazy imports ──
   When switcher is on, all backgrounds are loaded.
   When locked to one bg, only that bg's code is included.
   When random, all are loaded since any could be picked. */
const LOAD_ALL = IS_SWITCHER || IS_RANDOM
type LazyBg = React.LazyExoticComponent<React.ComponentType> | null
const _l = (id: string, loader: () => Promise<{ default: React.ComponentType }>) =>
  (LOAD_ALL || LOCKED_BG === id ? lazy(loader) : null) as LazyBg

const AuroraBackground        = _l("aurora",        () => import("./aurora-background"))
const ParticlesBackground     = _l("particles",     () => import("./particles-background"))
const DotGridBackground       = _l("dotgrid",       () => import("./dot-grid-background"))
const GlassmorphismBackground = _l("glass",         () => import("./glassmorphism-background"))
const WavesBackground         = _l("waves",         () => import("./waves-background"))
const StarfieldBackground     = _l("starfield",     () => import("./starfield-background"))
const MatrixGridBackground    = _l("matrix",        () => import("./matrix-grid-background"))
const NeuralNetworkBackground = _l("neural",        () => import("./neural-network-background"))
const FirefliesBackground     = _l("fireflies",     () => import("./fireflies-background"))
const TopographyBackground    = _l("topography",    () => import("./topography-background"))
const RainBackground          = _l("rain",          () => import("./rain-background"))
const BokehBackground         = _l("bokeh",         () => import("./bokeh-background"))
const VortexBackground        = _l("vortex",        () => import("./vortex-background"))
const RippleBackground        = _l("ripple",        () => import("./ripple-background"))
const NeonRingsBackground     = _l("neonrings",     () => import("./neon-rings-background"))
const MatrixRainBackground    = _l("matrixrain",    () => import("./matrix-rain-background"))
const HexagonGridBackground   = _l("hexgrid",       () => import("./hexagon-grid-background"))
const GradientMeshBackground  = _l("gradient",      () => import("./gradient-mesh-background"))
const ConstellationBackground = _l("constellation", () => import("./constellation-background"))
const SpotlightBackground     = _l("spotlight",     () => import("./spotlight-background"))

export const BACKGROUND_OPTIONS = [
  { id: "aurora",        label: "Aurora",         icon: "🌌" },
  { id: "particles",     label: "Particles",      icon: "✨" },
  { id: "dotgrid",       label: "Dot Grid",       icon: "⊡" },
  { id: "glass",         label: "Glass Blobs",    icon: "◎" },
  { id: "waves",         label: "Waves",          icon: "〰" },
  { id: "starfield",     label: "Starfield",       icon: "🌠" },
  { id: "matrix",        label: "Matrix Grid",    icon: "▦" },
  { id: "neural",        label: "Neural Net",      icon: "🧠" },
  { id: "fireflies",     label: "Fireflies",       icon: "🔮" },
  { id: "topography",    label: "Topography",      icon: "🗺" },
  { id: "rain",          label: "Rain",           icon: "🌧" },
  { id: "bokeh",         label: "Bokeh",          icon: "💡" },
  { id: "vortex",        label: "Vortex",          icon: "🌀" },
  { id: "ripple",        label: "Ripple",          icon: "💧" },
  { id: "neonrings",     label: "Neon Rings",      icon: "⭕" },
  { id: "matrixrain",    label: "Matrix Rain",    icon: "🟢" },
  { id: "hexgrid",       label: "Hex Grid",        icon: "⬡" },
  { id: "gradient",      label: "Gradient Mesh",  icon: "🎨" },
  { id: "constellation", label: "Constellation",  icon: "⭐" },
  { id: "spotlight",     label: "Spotlight",       icon: "🔦" },
] as const

export type BackgroundId = (typeof BACKGROUND_OPTIONS)[number]["id"]

const ALL_BG_IDS = BACKGROUND_OPTIONS.map((o) => o.id)

const STORAGE_KEY = "portfolio-bg"

function isValidBgId(id: string): id is BackgroundId {
  return ALL_BG_IDS.includes(id as BackgroundId)
}

function pickRandomBg(): BackgroundId {
  return ALL_BG_IDS[Math.floor(Math.random() * ALL_BG_IDS.length)]
}

function getInitialBg(): BackgroundId {
  // Locked mode: always use the locked bg
  if (LOCKED_BG && isValidBgId(LOCKED_BG)) return LOCKED_BG

  // Switcher mode: check localStorage, fall back to env default or "aurora"
  if (IS_SWITCHER) {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && isValidBgId(saved)) return saved
    }
    return isValidBgId(ENV_DEFAULT_BG) ? ENV_DEFAULT_BG : "aurora"
  }

  // Random mode: pick a random one (with localStorage seed for SSR consistency? no — client only)
  return pickRandomBg()
}

function BackgroundFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
  )
}

function BackgroundRenderer({ id }: { id: BackgroundId }) {
  return (
    <Suspense fallback={<BackgroundFallback />}>
      {id === "aurora"        && AuroraBackground        && <AuroraBackground />}
      {id === "particles"     && ParticlesBackground     && <ParticlesBackground />}
      {id === "dotgrid"       && DotGridBackground       && <DotGridBackground />}
      {id === "glass"         && GlassmorphismBackground && <GlassmorphismBackground />}
      {id === "waves"         && WavesBackground         && <WavesBackground />}
      {id === "starfield"     && StarfieldBackground     && <StarfieldBackground />}
      {id === "matrix"        && MatrixGridBackground    && <MatrixGridBackground />}
      {id === "neural"        && NeuralNetworkBackground && <NeuralNetworkBackground />}
      {id === "fireflies"     && FirefliesBackground     && <FirefliesBackground />}
      {id === "topography"    && TopographyBackground    && <TopographyBackground />}
      {id === "rain"          && RainBackground          && <RainBackground />}
      {id === "bokeh"         && BokehBackground         && <BokehBackground />}
      {id === "vortex"        && VortexBackground        && <VortexBackground />}
      {id === "ripple"        && RippleBackground        && <RippleBackground />}
      {id === "neonrings"     && NeonRingsBackground     && <NeonRingsBackground />}
      {id === "matrixrain"    && MatrixRainBackground    && <MatrixRainBackground />}
      {id === "hexgrid"       && HexagonGridBackground   && <HexagonGridBackground />}
      {id === "gradient"      && GradientMeshBackground  && <GradientMeshBackground />}
      {id === "constellation" && ConstellationBackground && <ConstellationBackground />}
      {id === "spotlight"     && SpotlightBackground     && <SpotlightBackground />}
    </Suspense>
  )
}

export function BackgroundSwitcher({
  currentBg,
  onSwitch,
}: {
  currentBg: BackgroundId
  onSwitch: (id: BackgroundId) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-7 left-6 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200 flex items-center justify-center text-lg shadow-lg"
        aria-label="Switch background animation"
        title="Switch background"
      >
        {open ? "✕" : "◈"}
      </button>

      {/* Options panel */}
      {open && (
        <div className="absolute bottom-14 left-0 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl min-w-[160px] max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          <p className="text-[10px] uppercase tracking-widest text-white/40 px-2 pt-1 pb-2 font-medium">
            Background
          </p>
          {BACKGROUND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onSwitch(opt.id)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                currentBg === opt.id
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <span>{opt.label}</span>
              {currentBg === opt.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AnimatedBackground() {
  const [currentBg, setCurrentBg] = useState<BackgroundId>(isValidBgId(ENV_DEFAULT_BG) ? ENV_DEFAULT_BG : "aurora")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let initial: BackgroundId

    if (LOCKED_BG && isValidBgId(LOCKED_BG)) {
      // Locked mode: always use the locked bg
      initial = LOCKED_BG
    } else if (IS_SWITCHER) {
      // Switcher mode: check localStorage, fall back to default
      const saved = localStorage.getItem(STORAGE_KEY)
      initial = (saved && isValidBgId(saved)) ? saved : (isValidBgId(ENV_DEFAULT_BG) ? ENV_DEFAULT_BG : "aurora")
    } else {
      // Random mode: pick a random bg fresh on each mount
      initial = pickRandomBg()
    }

    setCurrentBg(initial)
  }, [])

  const handleSwitch = useCallback((id: BackgroundId) => {
    setCurrentBg(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <BackgroundFallback />
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <BackgroundRenderer id={currentBg} />

        {/* Subtle vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)",
          }}
        />
      </div>

      {/* Switcher UI — only in switcher mode */}
      {IS_SWITCHER && (
        <BackgroundSwitcher currentBg={currentBg} onSwitch={handleSwitch} />
      )}
    </>
  )
}