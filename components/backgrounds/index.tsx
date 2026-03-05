"use client"

import { useState, useEffect, useCallback, lazy, Suspense } from "react"

/**
 * Background Switcher
 * Toggle between 20 background animation styles.
 * Persists selection in localStorage.
 */

const AuroraBackground = lazy(() => import("./aurora-background"))
const ParticlesBackground = lazy(() => import("./particles-background"))
const DotGridBackground = lazy(() => import("./dot-grid-background"))
const GlassmorphismBackground = lazy(() => import("./glassmorphism-background"))
const WavesBackground = lazy(() => import("./waves-background"))
const StarfieldBackground = lazy(() => import("./starfield-background"))
const MatrixGridBackground = lazy(() => import("./matrix-grid-background"))
const NeuralNetworkBackground = lazy(() => import("./neural-network-background"))
const FirefliesBackground = lazy(() => import("./fireflies-background"))
const TopographyBackground = lazy(() => import("./topography-background"))
const RainBackground = lazy(() => import("./rain-background"))
const BokehBackground = lazy(() => import("./bokeh-background"))
const VortexBackground = lazy(() => import("./vortex-background"))
const RippleBackground = lazy(() => import("./ripple-background"))
const NeonRingsBackground = lazy(() => import("./neon-rings-background"))
const MatrixRainBackground = lazy(() => import("./matrix-rain-background"))
const HexagonGridBackground = lazy(() => import("./hexagon-grid-background"))
const GradientMeshBackground = lazy(() => import("./gradient-mesh-background"))
const ConstellationBackground = lazy(() => import("./constellation-background"))
const SpotlightBackground = lazy(() => import("./spotlight-background"))

export const BACKGROUND_OPTIONS = [
  { id: "aurora", label: "Aurora", icon: "🌌" },
  { id: "particles", label: "Particles", icon: "✨" },
  { id: "dotgrid", label: "Dot Grid", icon: "⊡" },
  { id: "glass", label: "Glass Blobs", icon: "◎" },
  { id: "waves", label: "Waves", icon: "〰" },
  { id: "starfield", label: "Starfield", icon: "🌠" },
  { id: "matrix", label: "Matrix Grid", icon: "▦" },
  { id: "neural", label: "Neural Net", icon: "🧠" },
  { id: "fireflies", label: "Fireflies", icon: "🔮" },
  { id: "topography", label: "Topography", icon: "🗺" },
  { id: "rain", label: "Rain", icon: "🌧" },
  { id: "bokeh", label: "Bokeh", icon: "💡" },
  { id: "vortex", label: "Vortex", icon: "🌀" },
  { id: "ripple", label: "Ripple", icon: "💧" },
  { id: "neonrings", label: "Neon Rings", icon: "⭕" },
  { id: "matrixrain", label: "Matrix Rain", icon: "🟢" },
  { id: "hexgrid", label: "Hex Grid", icon: "⬡" },
  { id: "gradient", label: "Gradient Mesh", icon: "🎨" },
  { id: "constellation", label: "Constellation", icon: "⭐" },
  { id: "spotlight", label: "Spotlight", icon: "🔦" },
] as const

export type BackgroundId = (typeof BACKGROUND_OPTIONS)[number]["id"]

const STORAGE_KEY = "portfolio-bg"
const DEFAULT_BG: BackgroundId = "aurora"

function BackgroundFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
  )
}

function BackgroundRenderer({ id }: { id: BackgroundId }) {
  return (
    <Suspense fallback={<BackgroundFallback />}>
      {id === "aurora" && <AuroraBackground />}
      {id === "particles" && <ParticlesBackground />}
      {id === "dotgrid" && <DotGridBackground />}
      {id === "glass" && <GlassmorphismBackground />}
      {id === "waves" && <WavesBackground />}
      {id === "starfield" && <StarfieldBackground />}
      {id === "matrix" && <MatrixGridBackground />}
      {id === "neural" && <NeuralNetworkBackground />}
      {id === "fireflies" && <FirefliesBackground />}
      {id === "topography" && <TopographyBackground />}
      {id === "rain" && <RainBackground />}
      {id === "bokeh" && <BokehBackground />}
      {id === "vortex" && <VortexBackground />}
      {id === "ripple" && <RippleBackground />}
      {id === "neonrings" && <NeonRingsBackground />}
      {id === "matrixrain" && <MatrixRainBackground />}
      {id === "hexgrid" && <HexagonGridBackground />}
      {id === "gradient" && <GradientMeshBackground />}
      {id === "constellation" && <ConstellationBackground />}
      {id === "spotlight" && <SpotlightBackground />}
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
        <div className="absolute bottom-14 left-0 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl min-w-[160px] max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
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
  const [currentBg, setCurrentBg] = useState<BackgroundId>(DEFAULT_BG)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY) as BackgroundId | null
    if (saved && BACKGROUND_OPTIONS.some((o) => o.id === saved)) {
      setCurrentBg(saved)
    }
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

      {/* Switcher UI — sits outside the pointer-events-none container */}
      <BackgroundSwitcher currentBg={currentBg} onSwitch={handleSwitch} />
    </>
  )
}
