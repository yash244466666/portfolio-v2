"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import QRCode from "qrcode"

export default function QrGenerator() {
  const [text, setText] = useState("")
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQR = useCallback(async () => {
    if (!canvasRef.current || !text) return
    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: "#ffffff", light: "#00000000" },
      })
    } catch {
      // text too long or invalid
    }
  }, [text, size, errorLevel])

  useEffect(() => {
    generateQR()
  }, [generateQR])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "qr-code.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
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
              {[128, 256, 512].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
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
              {(["L", "M", "Q", "H"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setErrorLevel(level)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    errorLevel === level ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {text && (
            <Button onClick={handleDownload} variant="outline" className="w-full">
              Download PNG
            </Button>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 inline-block">
            <canvas ref={canvasRef} className={!text ? "hidden" : ""} />
            {!text && (
              <div className="w-[256px] h-[256px] flex items-center justify-center text-gray-400 text-sm">
                Enter text to generate QR
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}