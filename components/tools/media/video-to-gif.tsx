"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import Dropzone from "@/components/tools/shared/dropzone"
import CopyButton from "@/components/tools/shared/copy-button"
import { Download, Loader2 } from "lucide-react"

// Simple GIF encoder - pure JS, no dependencies
class GifEncoder {
  private buffer: number[] = []
  private width: number
  private height: number
  private frames: { pixels: Uint8Array; delay: number }[] = []

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  addFrame(pixels: Uint8Array, delay: number) {
    this.frames.push({ pixels, delay })
  }

  encode(): Uint8Array {
    this.buffer = []

    // Header
    this.writeString("GIF89a")

    // Logical Screen Descriptor
    this.writeShort(this.width)
    this.writeShort(this.height)
    this.buffer.push(0x80 | 0x00 | 0x07) // GCT flag, 256 colors
    this.buffer.push(0) // bg color index
    this.buffer.push(0) // pixel aspect ratio

    // Global Color Table (256 * 3 = 768 bytes) - simple 6x6x6 color cube
    for (let r = 0; r < 6; r++) {
      for (let g = 0; g < 6; g++) {
        for (let b = 0; b < 6; b++) {
          this.buffer.push(Math.round(r * 255 / 5))
          this.buffer.push(Math.round(g * 255 / 5))
          this.buffer.push(Math.round(b * 255 / 5))
        }
      }
    }
    // Fill remaining 20 entries
    for (let i = 0; i < 20; i++) {
      this.buffer.push(0, 0, 0)
    }

    // Netscape extension for looping
    this.buffer.push(0x21, 0xff, 0x0b)
    this.writeString("NETSCAPE2.0")
    this.buffer.push(3, 1)
    this.writeShort(0) // infinite loop
    this.buffer.push(0)

    // Frames
    for (const frame of this.frames) {
      // Graphic Control Extension
      this.buffer.push(0x21, 0xf9, 4)
      this.buffer.push(0x08) // dispose to bg
      this.writeShort(Math.max(2, Math.round(frame.delay / 10)))
      this.buffer.push(0) // transparent color index
      this.buffer.push(0) // block terminator

      // Image Descriptor
      this.buffer.push(0x2c)
      this.writeShort(0) // left
      this.writeShort(0) // top
      this.writeShort(this.width)
      this.writeShort(this.height)
      this.buffer.push(0) // no local color table

      // Image Data - LZW minimum code size
      this.buffer.push(8)

      // Quantize pixels to 6x6x6 cube and do simple LZW-like encoding
      const indices = new Uint8Array(frame.pixels.length / 3)
      for (let i = 0; i < indices.length; i++) {
        const r = frame.pixels[i * 3]
        const g = frame.pixels[i * 3 + 1]
        const b = frame.pixels[i * 3 + 2]
        indices[i] = Math.round(r * 5 / 255) * 36 +
                      Math.round(g * 5 / 255) * 6 +
                      Math.round(b * 5 / 255)
      }

      // Simple LZW compression
      const compressed = this.lzwEncode(indices, 8)
      // Write in sub-blocks of max 255 bytes
      let offset = 0
      while (offset < compressed.length) {
        const blockSize = Math.min(255, compressed.length - offset)
        this.buffer.push(blockSize)
        for (let i = 0; i < blockSize; i++) {
          this.buffer.push(compressed[offset + i])
        }
        offset += blockSize
      }
      this.buffer.push(0) // block terminator
    }

    // Trailer
    this.buffer.push(0x3b)

    return new Uint8Array(this.buffer)
  }

  private lzwEncode(indices: Uint8Array, minCodeSize: number): number[] {
    const clearCode = 1 << minCodeSize
    const eoiCode = clearCode + 1
    let codeSize = minCodeSize + 1
    let nextCode = eoiCode + 1
    const codeLimit = 4096

    // Initialize dictionary
    const dictionary = new Map<string, number>()
    for (let i = 0; i < clearCode; i++) {
      dictionary.set(String.fromCharCode(i), i)
    }

    const output: number[] = []
    let bitBuffer = 0
    let bitCount = 0

    const writeBits = (code: number, size: number) => {
      bitBuffer |= code << bitCount
      bitCount += size
      while (bitCount >= 8) {
        output.push(bitBuffer & 0xff)
        bitBuffer >>= 8
        bitCount -= 8
      }
    }

    // Write clear code
    writeBits(clearCode, codeSize)

    let current = String.fromCharCode(indices[0])
    for (let i = 1; i < indices.length; i++) {
      const char = String.fromCharCode(indices[i])
      const combined = current + char
      if (dictionary.has(combined)) {
        current = combined
      } else {
        writeBits(dictionary.get(current)!, codeSize)
        if (nextCode < codeLimit) {
          dictionary.set(combined, nextCode++)
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++
          }
        } else {
          writeBits(clearCode, codeSize)
          dictionary.clear()
          for (let j = 0; j < clearCode; j++) {
            dictionary.set(String.fromCharCode(j), j)
          }
          nextCode = eoiCode + 1
          codeSize = minCodeSize + 1
        }
        current = char
      }
    }

    writeBits(dictionary.get(current)!, codeSize)
    writeBits(eoiCode, codeSize)

    if (bitCount > 0) {
      output.push(bitBuffer & 0xff)
    }

    return output
  }

  private writeString(s: string) {
    for (let i = 0; i < s.length; i++) {
      this.buffer.push(s.charCodeAt(i))
    }
  }

  private writeShort(n: number) {
    this.buffer.push(n & 0xff)
    this.buffer.push((n >> 8) & 0xff)
  }
}

export default function VideoToGif() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [fps, setFps] = useState(5)
  const [width, setWidth] = useState(320)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "extracting" | "encoding" | "done" | "error">("idle")
  const [gifUrl, setGifUrl] = useState<string>("")
  const [gifSize, setGifSize] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      setStatus("idle")
      setGifUrl("")
      setProgress(0)
    }
  }, [])

  const convertToGif = useCallback(async () => {
    if (!videoFile || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true

    const url = URL.createObjectURL(videoFile)
    video.src = url

    setStatus("extracting")
    setProgress(0)

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        const aspectRatio = video.videoWidth / video.videoHeight
        canvas.width = width
        canvas.height = Math.round(width / aspectRatio)
        resolve()
      }
      video.onerror = () => reject(new Error("Failed to load video"))
    }).catch(() => {
      setStatus("error")
      URL.revokeObjectURL(url)
      return
    })

    if (status === "error") return

    const encoder = new GifEncoder(canvas.width, canvas.height)
    const totalFrames = Math.min(100, Math.floor(video.duration * fps))
    const interval = 1000 / fps

    video.currentTime = 0

    let frameCount = 0

    const extractFrame = (): Promise<void> => {
      return new Promise((resolve) => {
        const onSeeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          encoder.addFrame(new Uint8Array(imageData.data), interval)
          frameCount++
          video.removeEventListener("seeked", onSeeked)
          resolve()
        }
        video.addEventListener("seeked", onSeeked)
        video.currentTime = frameCount / fps
      })
    }

    try {
      for (let i = 0; i < totalFrames; i++) {
        await extractFrame()
        setProgress(Math.round(((i + 1) / totalFrames) * 80))
      }

      setStatus("encoding")
      setProgress(85)

      await new Promise((r) => setTimeout(r, 10))

      const gifData = encoder.encode()
      setProgress(95)

      const blob = new Blob([gifData.buffer as ArrayBuffer], { type: "image/gif" })
      const gifUrlStr = URL.createObjectURL(blob)
      setGifUrl(gifUrlStr)
      setGifSize(blob.size)
      setProgress(100)
      setStatus("done")
    } catch {
      setStatus("error")
    }

    URL.revokeObjectURL(url)
  }, [videoFile, fps, width, status])

  const downloadGif = useCallback(() => {
    if (!gifUrl) return
    const a = document.createElement("a")
    a.href = gifUrl
    a.download = `${videoFile?.name?.replace(/\.[^.]+$/, "") || "video"}.gif`
    a.click()
  }, [gifUrl, videoFile])

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {!videoFile && (
        <Dropzone
          onFiles={handleFiles}
          accept="video/*"
          label="Drop a short video file here or click to browse"
          maxSizeMB={50}
        />
      )}

      {videoFile && status === "idle" && (
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">File</span>
              <span className="text-foreground">{videoFile.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Size</span>
              <span className="text-foreground">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">FPS</label>
              <span className="text-sm text-muted-foreground">{fps}</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Width (px)</label>
            <input
              type="number"
              min={100}
              max={640}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full p-2 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <Button onClick={convertToGif} className="w-full">
            Convert to GIF
          </Button>
        </div>
      )}

      {(status === "extracting" || status === "encoding") && (
        <div className="bg-muted/30 border border-border/50 rounded-xl p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm text-foreground mb-2">
            {status === "extracting" ? "Extracting frames..." : "Encoding GIF..."}
          </p>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-sm text-red-400">Failed to convert video. Please try a different file.</p>
          <Button onClick={() => { setVideoFile(null); setStatus("idle") }} variant="outline" className="mt-3">
            Try Again
          </Button>
        </div>
      )}

      {status === "done" && gifUrl && (
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-center">
            <img
              src={gifUrl}
              alt="Generated GIF"
              className="max-w-full mx-auto rounded-lg"
              style={{ maxHeight: 300 }}
            />
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">GIF Size</span>
              <span className="text-foreground">{(gifSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={downloadGif} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download GIF
            </Button>
            <Button
              onClick={() => {
                setVideoFile(null)
                setStatus("idle")
                setGifUrl("")
                setProgress(0)
              }}
              variant="outline"
            >
              New Video
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}