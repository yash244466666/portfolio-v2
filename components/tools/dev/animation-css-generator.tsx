"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

type AnimationType = "fadeIn" | "fadeOut" | "slideIn" | "slideOut" | "bounce" | "rotate" | "pulse" | "scale"

const animationTypes: { id: AnimationType; label: string }[] = [
  { id: "fadeIn", label: "Fade In" },
  { id: "fadeOut", label: "Fade Out" },
  { id: "slideIn", label: "Slide In" },
  { id: "slideOut", label: "Slide Out" },
  { id: "bounce", label: "Bounce" },
  { id: "rotate", label: "Rotate" },
  { id: "pulse", label: "Pulse" },
  { id: "scale", label: "Scale" },
]

const timingFunctions = ["linear", "ease", "ease-in", "ease-out", "ease-in-out"]

const keyframesMap: Record<AnimationType, string> = {
  fadeIn: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
  fadeOut: `@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}`,
  slideIn: `@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}`,
  slideOut: `@keyframes slideOut {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(20px); opacity: 0; }
}`,
  bounce: `@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}`,
  rotate: `@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
  pulse: `@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}`,
  scale: `@keyframes scale {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`,
}

export default function AnimationCssGenerator() {
  const [animationType, setAnimationType] = useState<AnimationType>("fadeIn")
  const [duration, setDuration] = useState(1)
  const [delay, setDelay] = useState(0)
  const [iteration, setIteration] = useState("1")
  const [timingFunction, setTimingFunction] = useState("ease")
  const [isPlaying, setIsPlaying] = useState(true)

  const cssCode = useMemo(() => {
    const keyframes = keyframesMap[animationType]
    const animName = animationType
    const iterValue = iteration === "0" ? "infinite" : iteration
    const css = `.animated-element {
  animation: ${animName} ${duration}s ${timingFunction} ${delay}s ${iterValue};
}

${keyframes}`
    return css
  }, [animationType, duration, delay, iteration, timingFunction])

  const animStyle: React.CSSProperties = isPlaying
    ? {
        animation: `${animationType} ${duration}s ${timingFunction} ${delay}s ${iteration === "0" ? "infinite" : iteration}`,
      }
    : {}

  return (
    <div className="space-y-6">
      <div
        className="w-full h-48 rounded-xl border border-border/50 flex items-center justify-center bg-background/50"
        style={animStyle}
      >
        <div className="w-24 h-24 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center">
          <span className="text-primary font-medium text-sm">Preview</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            isPlaying ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {isPlaying ? "Playing" : "Paused"}
        </button>
        {!isPlaying && (
          <button
            onClick={() => {
              setIsPlaying(true)
              // Force re-render to restart animation
              setTimeout(() => setIsPlaying(true), 10)
            }}
            className="px-4 py-1.5 rounded-md text-sm bg-muted text-muted-foreground hover:bg-muted/80"
          >
            Replay
          </button>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Animation Type</label>
        <div className="flex flex-wrap gap-2">
          {animationTypes.map((at) => (
            <button
              key={at.id}
              onClick={() => setAnimationType(at.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                animationType === at.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {at.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Duration (s)</label>
            <span className="text-sm text-muted-foreground">{duration}s</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Delay (s)</label>
            <span className="text-sm text-muted-foreground">{delay}s</span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Iterations</label>
          <Input
            type="number"
            min={0}
            value={iteration}
            onChange={(e) => setIteration(e.target.value)}
            placeholder="0 = infinite"
            className="bg-background/50"
          />
          <p className="text-xs text-muted-foreground mt-1">0 = infinite</p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Timing Function</label>
          <div className="flex flex-wrap gap-2">
            {timingFunctions.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimingFunction(tf)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  timingFunction === tf ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ToolResult className="    relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">CSS</p>
          <CopyButton text={cssCode} />
        </div>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">{cssCode}</pre>
      </ToolResult>
    </div>
  )
}