"use client"

import { useState, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, hslToHex, getContrastRatio, meetsWcagAA, meetsWcagAAA, getComplementary, getAnalogous, getTriadic, getSplitComplementary } from "@/lib/tools/color-utils"
import CopyButton from "@/components/tools/shared/copy-button"

export default function ColorPicker() {
  const [hex, setHex] = useState("#6366f1")
  const [r, setR] = useState(99)
  const [g, setG] = useState(102)
  const [b, setB] = useState(241)
  const [h, setH] = useState(239)
  const [s, setS] = useState(86)
  const [l, setL] = useState(67)
  const [contrastHex, setContrastHex] = useState("#ffffff")

  const updateFromHex = useCallback((hexVal: string) => {
    const rgb = hexToRgb(hexVal)
    if (!rgb) return
    setHex(hexVal)
    setR(rgb.r); setG(rgb.g); setB(rgb.b)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    setH(hsl.h); setS(hsl.s); setL(hsl.l)
  }, [])

  const updateFromRgb = useCallback(() => {
    const hexVal = rgbToHex(r, g, b)
    setHex(hexVal)
    const hsl = rgbToHsl(r, g, b)
    setH(hsl.h); setS(hsl.s); setL(hsl.l)
  }, [r, g, b])

  const updateFromHsl = useCallback(() => {
    const { r: nr, g: ng, b: nb } = hslToRgb(h, s, l)
    setR(nr); setG(ng); setB(nb)
    setHex(rgbToHex(nr, ng, nb))
  }, [h, s, l])

  const palette = {
    complementary: hslToHex(getComplementary(h), s, l),
    analogous: getAnalogous(h).map((hh) => hslToHex(hh, s, l)),
    triadic: getTriadic(h).map((hh) => hslToHex(hh, s, l)),
    splitComplementary: getSplitComplementary(h).map((hh) => hslToHex(hh, s, l)),
  }

  const contrastRgb = hexToRgb(contrastHex)
  const currentRgb = hexToRgb(hex)
  const contrastRatio = contrastRgb && currentRgb ? getContrastRatio(currentRgb, contrastRgb) : 1

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="w-full h-32 rounded-xl border border-border/50 mb-4" style={{ backgroundColor: hex }} />
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">HEX</label>
              <div className="flex gap-2">
                <Input value={hex} onChange={(e) => updateFromHex(e.target.value)} className="font-mono bg-background/50" />
                <CopyButton text={hex} />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">RGB</label>
              <div className="flex gap-2 items-center">
                <Input type="number" value={r} onChange={(e) => { setR(Number(e.target.value)); updateFromRgb(); }} className="font-mono bg-background/50" />
                <Input type="number" value={g} onChange={(e) => { setG(Number(e.target.value)); updateFromRgb(); }} className="font-mono bg-background/50" />
                <Input type="number" value={b} onChange={(e) => { setB(Number(e.target.value)); updateFromRgb(); }} className="font-mono bg-background/50" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">HSL</label>
              <div className="flex gap-2 items-center">
                <Input type="number" value={h} onChange={(e) => { setH(Number(e.target.value)); updateFromHsl(); }} className="font-mono bg-background/50" />
                <Input type="number" value={s} onChange={(e) => { setS(Number(e.target.value)); updateFromHsl(); }} className="font-mono bg-background/50" />
                <Input type="number" value={l} onChange={(e) => { setL(Number(e.target.value)); updateFromHsl(); }} className="font-mono bg-background/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Contrast Checker</h3>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-muted-foreground">Against:</label>
              <Input value={contrastHex} onChange={(e) => setContrastHex(e.target.value)} className="w-32 font-mono bg-background/50" />
              <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: contrastHex }} />
            </div>
            <ToolResult >
              <p className="text-2xl font-bold text-foreground">{contrastRatio.toFixed(2)}:1</p>
              <div className="flex gap-3 mt-1 text-sm">
                <span className={meetsWcagAA(contrastRatio) ? "text-emerald-400" : "text-red-400"}>
                  AA {meetsWcagAA(contrastRatio) ? "✓" : "✗"}
                </span>
                <span className={meetsWcagAAA(contrastRatio) ? "text-emerald-400" : "text-red-400"}>
                  AAA {meetsWcagAAA(contrastRatio) ? "✓" : "✗"}
                </span>
              </div>
            </ToolResult>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Palettes</h3>
            <div className="space-y-3">
              {Object.entries(palette).map(([name, colors]) => (
                <div key={name}>
                  <p className="text-xs text-muted-foreground mb-1 capitalize">{name.replace(/([A-Z])/g, " $1")}</p>
                  <div className="flex gap-1.5">
                    {(Array.isArray(colors) ? colors : [colors]).map((color, i) => (
                      <div key={i} className="group relative">
                        <div
                          className="w-10 h-10 rounded-md border border-border/50 cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => updateFromHex(color)}
                        />
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {color}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Pick a color</label>
        <input
          type="color"
          value={hex}
          onChange={(e) => updateFromHex(e.target.value)}
          className="w-full h-12 rounded-lg cursor-pointer border border-border/50 bg-transparent"
        />
      </div>
    </div>
  )
}