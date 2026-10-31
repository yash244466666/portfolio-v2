"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import QRCode from "qrcode"

const SIZE_OPTIONS = [128, 256, 512] as const
const ERROR_LEVELS = ["L", "M", "Q", "H"] as const
const CONTROL_BUTTON_CLASSES =
  "px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

const GENERATION_ERROR =
  "Could not generate a QR code. Try shorter text or a lower error-correction level."

export default function QrGenerator() {
  const [text, setText] = useState("")
  const [size, setSize] = useState<(typeof SIZE_OPTIONS)[number]>(256)
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M")
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!text) {
      setError(null)
      return
    }

    try {
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        // Standard dark-on-white modules so the preview and the exported PNG
        // both scan against a white background.
        color: { dark: "#000000", light: "#ffffff" },
      })
      // The library pins the pixel size with inline styles. Clear them so the
      // canvas can scale down inside the preview column via CSS; the canvas
      // width/height attributes (and therefore the export) stay at `size`.
      canvas.style.width = ""
      canvas.style.height = ""
      setError(null)
    } catch {
      setError(GENERATION_ERROR)
    }
  }, [text, size, errorLevel])

  useEffect(() => {
    generateQR()
  }, [generateQR])

  const showQr = Boolean(text) && !error

  const handleDownload = () => {
    if (!canvasRef.current || !showQr) return
    const link = document.createElement("a")
    link.download = "qr-code.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4 min-w-0">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Text or URL</label>
            <Input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Size</label>
            <div className="flex gap-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`${CONTROL_BUTTON_CLASSES} ${
                    size === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Error Correction</label>
            <div className="flex gap-2">
              {ERROR_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setErrorLevel(level)}
                  aria-pressed={errorLevel === level}
                  className={`${CONTROL_BUTTON_CLASSES} ${
                    errorLevel === level ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {showQr && (
            <Button onClick={handleDownload} variant="outline" className="w-full">
              Download PNG
            </Button>
          )}
        </div>

        <div className="flex min-w-0 items-center justify-center">
          <div className="bg-white rounded-xl p-4 inline-block max-w-full">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="QR code preview"
              className={`h-auto max-w-full ${showQr ? "" : "hidden"}`}
            />
            {!showQr && (
              <div className="w-[256px] max-w-full aspect-square flex items-center justify-center px-4 text-center text-gray-400 text-sm">
                {error ? "Unable to generate QR" : "Enter text to generate QR"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
