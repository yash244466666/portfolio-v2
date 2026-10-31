"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { AlertTriangle, CheckCircle2, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import Dropzone from "@/components/tools/shared/dropzone"
import { cn } from "@/lib/utils"
import {
  ENCODABLE_MIME_BY_FORMAT,
  MAX_CANVAS_DIMENSION,
  OUTPUT_FORMAT_OPTIONS,
  SUPPORTED_INPUT_ACCEPT,
  bitmapHasAlpha,
  canEncodeMime,
  decodeImageFile,
  encodeBitmapToBlob,
  exceedsCanvasLimits,
  formatBytes,
  formatLabel,
  getTargetDimensions,
  isAnimatedImage,
  isEncodableInputMime,
  isSupportedInputMime,
  outputFileName,
  resolveImageMime,
  type ImageOutputFormat,
} from "@/lib/tools/image-compression"

const DEFAULT_QUALITY = 80

const ENCODER_MIMES = ["image/png", "image/jpeg", "image/webp", "image/avif"] as const

interface SourceImage {
  file: File
  url: string
  mime: string
  width: number
  height: number
  hasAlpha: boolean
  isAnimated: boolean
}

interface CompressionResult {
  url: string
  /** True when the untouched original file is the result. */
  keptOriginal: boolean
  mime: string
  width: number
  height: number
  size: number
  fileName: string
  /** Settings that produced this result, used to flag stale output. */
  signature: string
  reason?: string
}

/**
 * Formats to try for the current setting. Auto collects every format this
 * browser can encode and the caller keeps the smallest result.
 */
function buildCandidateMimes(
  format: ImageOutputFormat,
  inputMime: string,
  hasAlpha: boolean,
  encoderSupport: Record<string, boolean>
): string[] {
  // PNG, JPEG and WebP encoders exist in every supported browser; only AVIF
  // needs probing, so treat unknown entries as supported for those three.
  const supports = (mime: string) => encoderSupport[mime] ?? mime !== "image/avif"

  if (format === "auto") {
    const candidates: string[] = []
    const add = (mime: string) => {
      if (supports(mime) && !candidates.includes(mime)) candidates.push(mime)
    }
    add("image/webp")
    add("image/avif")
    add("image/png")
    // JPEG cannot store alpha, so only offer it when there is nothing to lose.
    if (!hasAlpha) add("image/jpeg")
    if (isEncodableInputMime(inputMime)) add(inputMime)
    return candidates
  }

  if (format === "original") {
    return isEncodableInputMime(inputMime) && supports(inputMime) ? [inputMime] : []
  }

  const mime = ENCODABLE_MIME_BY_FORMAT[format]
  return supports(mime) ? [mime] : []
}

export default function ImageCompressor() {
  const [source, setSource] = useState<SourceImage | null>(null)
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [quality, setQuality] = useState(DEFAULT_QUALITY)
  const [format, setFormat] = useState<ImageOutputFormat>("auto")
  const [resizeEnabled, setResizeEnabled] = useState(false)
  const [maxWidthInput, setMaxWidthInput] = useState("")
  const [maxHeightInput, setMaxHeightInput] = useState("")
  const [background, setBackground] = useState("#ffffff")
  const [encoderSupport, setEncoderSupport] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [readingFile, setReadingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bitmapRef = useRef<ImageBitmap | null>(null)
  const sourceUrlRef = useRef<string | null>(null)
  const resultUrlRef = useRef<string | null>(null)
  const loadTokenRef = useRef(0)
  const operationTokenRef = useRef(0)

  // Probe the optional encoders once. AVIF encoding is not available in most
  // browsers; the selector reflects that instead of failing at export time.
  useEffect(() => {
    let cancelled = false
    Promise.all(
      ENCODER_MIMES.map(async (mime) => [mime, await canEncodeMime(mime)] as const)
    )
      .then((entries) => {
        if (!cancelled) setEncoderSupport(Object.fromEntries(entries))
      })
      .catch(() => {
        if (!cancelled) {
          setEncoderSupport({ "image/png": true, "image/jpeg": true, "image/webp": true, "image/avif": false })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Release every expensive resource when the tool unmounts.
  useEffect(() => {
    return () => {
      operationTokenRef.current += 1
      bitmapRef.current?.close()
      bitmapRef.current = null
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current)
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      sourceUrlRef.current = null
      resultUrlRef.current = null
    }
  }, [])

  const resetAll = useCallback(() => {
    loadTokenRef.current += 1
    operationTokenRef.current += 1
    bitmapRef.current?.close()
    bitmapRef.current = null
    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current)
      sourceUrlRef.current = null
    }
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = null
    }
    setSource(null)
    setResult(null)
    setError(null)
    setBusy(false)
    setReadingFile(false)
  }, [])

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) {
        resetAll()
        return
      }

      resetAll()
      const token = loadTokenRef.current
      const mime = resolveImageMime(file)

      if (mime === "image/svg+xml") {
        setError(
          "SVG is a vector format, so raster compression does not apply. Use the SVG optimizer instead."
        )
        return
      }
      if (!isSupportedInputMime(mime)) {
        setError(
          `Unsupported file type${file.type ? ` "${file.type}"` : ""}. Supported formats: PNG, JPEG, WebP, AVIF, GIF, BMP and TIFF.`
        )
        return
      }

      setReadingFile(true)
      setError(null)
      try {
        const [bitmap, buffer] = await Promise.all([
          decodeImageFile(file),
          file.arrayBuffer(),
        ])
        if (token !== loadTokenRef.current) {
          bitmap.close()
          return
        }
        const isAnimated = isAnimatedImage(new Uint8Array(buffer), mime)
        const hasAlpha = await bitmapHasAlpha(bitmap).catch(() => false)
        if (token !== loadTokenRef.current) {
          bitmap.close()
          return
        }

        const url = URL.createObjectURL(file)
        bitmapRef.current = bitmap
        sourceUrlRef.current = url
        setSource({
          file,
          url,
          mime,
          width: bitmap.width,
          height: bitmap.height,
          hasAlpha,
          isAnimated,
        })
      } catch (cause) {
        if (token === loadTokenRef.current) {
          const detail = cause instanceof Error && cause.message ? ` (${cause.message})` : ""
          setError(
            `Couldn't read this image${detail}. It may be corrupt, animated in an unsupported way, or use a codec this browser cannot decode.`
          )
        }
      } finally {
        if (token === loadTokenRef.current) setReadingFile(false)
      }
    },
    [resetAll]
  )

  const targetDimensions = useMemo(() => {
    if (!source) return null
    const widthLimit = resizeEnabled ? Number.parseInt(maxWidthInput, 10) : 0
    const heightLimit = resizeEnabled ? Number.parseInt(maxHeightInput, 10) : 0
    return getTargetDimensions(source.width, source.height, widthLimit, heightLimit)
  }, [source, resizeEnabled, maxWidthInput, maxHeightInput])

  const settingsSignature = useMemo(
    () =>
      `${format}|${quality}|${resizeEnabled ? maxWidthInput || 0 : 0}x${
        resizeEnabled ? maxHeightInput || 0 : 0
      }|${background}`,
    [format, quality, resizeEnabled, maxWidthInput, maxHeightInput, background]
  )

  const targetTooLarge = Boolean(
    targetDimensions &&
      exceedsCanvasLimits(targetDimensions.width, targetDimensions.height)
  )

  const avifSupported = encoderSupport["image/avif"] === true
  const losslessOutput =
    format === "png" || (format === "original" && source?.mime === "image/png")
  const showBackground =
    format === "jpeg" && Boolean(source?.hasAlpha)
  const isStale = Boolean(
    result && source && result.signature !== settingsSignature
  )

  const applyKeptOriginal = useCallback(
    (current: SourceImage, signature: string, reason: string) => {
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current)
        resultUrlRef.current = null
      }
      setResult({
        url: current.url,
        keptOriginal: true,
        mime: current.mime,
        width: current.width,
        height: current.height,
        size: current.file.size,
        fileName: current.file.name,
        signature,
        reason,
      })
    },
    []
  )

  const compress = useCallback(async () => {
    const current = source
    const bitmap = bitmapRef.current
    if (!current || !bitmap || !targetDimensions) return

    if (exceedsCanvasLimits(targetDimensions.width, targetDimensions.height)) {
      setError(
        `${targetDimensions.width} × ${targetDimensions.height} px is too large for an in-browser canvas. ${
          resizeEnabled ? "Choose smaller maximum dimensions." : "Enable resizing and choose smaller maximum dimensions."
        }`
      )
      return
    }

    const operationToken = operationTokenRef.current + 1
    operationTokenRef.current = operationToken
    setBusy(true)
    setError(null)
    const signature = settingsSignature

    try {
      const candidates = buildCandidateMimes(
        format,
        current.mime,
        current.hasAlpha,
        encoderSupport
      )

      if (candidates.length === 0) {
        const reason =
          format === "original" || format === "auto"
            ? `${formatLabel(current.mime)} can't be re-encoded in this browser, so the original is kept.`
            : `${formatLabel(ENCODABLE_MIME_BY_FORMAT[format])} encoding isn't available in this browser, so the original is kept.`
        applyKeptOriginal(current, signature, reason)
        return
      }

      let best: { blob: Blob; mime: string } | null = null
      for (const mime of candidates) {
        // JPEG output has no alpha channel: flatten onto the chosen colour.
        const flatten = mime === "image/jpeg" && current.hasAlpha
        const blob = await encodeBitmapToBlob(bitmap, {
          width: targetDimensions.width,
          height: targetDimensions.height,
          mime,
          quality,
          background: flatten ? background : undefined,
        })
        if (operationToken !== operationTokenRef.current) return
        if (!best || blob.size < best.blob.size) best = { blob, mime }
      }

      // Never hand back something larger than what the user already has.
      if (!best || best.blob.size >= current.file.size) {
        applyKeptOriginal(
          current,
          signature,
          format === "auto"
            ? "Already optimized — re-encoding would not make this file smaller, so the original is kept."
            : `${formatLabel(best?.mime ?? current.mime)} output would be larger than the original, so the original is kept.`
        )
        return
      }

      const url = URL.createObjectURL(best.blob)
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = url
      setResult({
        url,
        keptOriginal: false,
        mime: best.mime,
        width: targetDimensions.width,
        height: targetDimensions.height,
        size: best.blob.size,
        fileName: outputFileName(current.file.name, best.mime),
        signature,
      })
    } catch (cause) {
      if (operationToken === operationTokenRef.current) {
        const detail = cause instanceof Error && cause.message ? cause.message : "Unknown error."
        setError(`Couldn't compress this image: ${detail}`)
      }
    } finally {
      if (operationToken === operationTokenRef.current) setBusy(false)
    }
  }, [
    source,
    targetDimensions,
    settingsSignature,
    format,
    quality,
    encoderSupport,
    background,
    resizeEnabled,
    applyKeptOriginal,
  ])

  const download = useCallback(() => {
    if (!result) return
    const link = document.createElement("a")
    link.href = result.url
    link.download = result.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }, [result])

  const downloadOriginal = useCallback(() => {
    if (!source) return
    const link = document.createElement("a")
    link.href = source.url
    link.download = source.file.name
    document.body.appendChild(link)
    link.click()
    link.remove()
  }, [source])

  const savingsPercent =
    source && result && !result.keptOriginal
      ? (1 - result.size / source.file.size) * 100
      : null
  const savingsLabel =
    savingsPercent === null
      ? null
      : savingsPercent >= 10
        ? `${Math.round(savingsPercent)}% smaller`
        : `${savingsPercent.toFixed(1)}% smaller`

  return (
    <div className="space-y-6">
      <Dropzone
        onFiles={handleFiles}
        selectedFiles={source ? [source.file] : null}
        accept={SUPPORTED_INPUT_ACCEPT}
        label="Drop an image here or click to browse (PNG, JPEG, WebP, AVIF, GIF, BMP, TIFF)"
      />

      {readingFile && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Reading image...
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {source && targetDimensions && (
        <div className="space-y-5">
          <div className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-medium text-foreground">{source.file.name}</span>
              <span className="text-muted-foreground">{formatLabel(source.mime)}</span>
              <span className="text-muted-foreground">
                {source.width} × {source.height} px
              </span>
              <span className="text-muted-foreground">{formatBytes(source.file.size)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              EXIF orientation is applied and EXIF/GPS metadata is removed from compressed output.
            </p>
            {source.hasAlpha && (
              <p className="text-xs text-emerald-400">
                Transparency detected — PNG, WebP and AVIF output keep it.
              </p>
            )}
            {source.isAnimated && (
              <p className="text-xs text-amber-400">
                Animated image — only the first frame is used.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="image-quality" className="mb-2 block text-sm font-medium text-foreground">
                Quality{" "}
                <span className="font-normal text-muted-foreground">({quality}%)</span>
              </label>
              <input
                id="image-quality"
                type="range"
                min={0}
                max={100}
                step={1}
                value={quality}
                disabled={losslessOutput}
                onChange={(event) => setQuality(Number(event.target.value))}
                aria-describedby="image-quality-hint"
                className="tool-slider min-h-[44px] w-full"
                style={{ "--slider-progress": `${quality}%` } as CSSProperties}
              />
              <p id="image-quality-hint" className="mt-1 text-xs text-muted-foreground">
                {losslessOutput
                  ? "Lossless output — quality is ignored."
                  : "Lower quality produces a smaller file."}
              </p>
            </div>

            <div>
              <label htmlFor="image-format" className="mb-2 block text-sm font-medium text-foreground">
                Output format
              </label>
              <Select
                id="image-format"
                value={format}
                onChange={(event) => setFormat(event.target.value as ImageOutputFormat)}
                className="min-h-[44px]"
              >
                {OUTPUT_FORMAT_OPTIONS.map((option) => {
                  const disabled = option.value === "avif" && !avifSupported
                  return (
                    <option key={option.value} value={option.value} disabled={disabled}>
                      {option.label}
                      {disabled ? " — unsupported in this browser" : ""}
                    </option>
                  )
                })}
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={resizeEnabled}
                onChange={(event) => setResizeEnabled(event.target.checked)}
                className="h-5 w-5 accent-primary"
              />
              Resize image
            </label>

            {resizeEnabled && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="image-max-width" className="mb-2 block text-sm font-medium text-foreground">
                      Max width (px)
                    </label>
                    <Input
                      id="image-max-width"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_CANVAS_DIMENSION}
                      placeholder="Original"
                      value={maxWidthInput}
                      onChange={(event) => setMaxWidthInput(event.target.value)}
                      className="min-h-[44px] [&_input]:min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="image-max-height" className="mb-2 block text-sm font-medium text-foreground">
                      Max height (px)
                    </label>
                    <Input
                      id="image-max-height"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_CANVAS_DIMENSION}
                      placeholder="Original"
                      value={maxHeightInput}
                      onChange={(event) => setMaxHeightInput(event.target.value)}
                      className="min-h-[44px] [&_input]:min-h-[44px]"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  Output size: {targetDimensions.width} × {targetDimensions.height} px
                  {targetDimensions.resized ? "" : " (no upscaling)"}
                </p>
              </div>
            )}
          </div>

          {showBackground && (
            <div className="space-y-2">
              <label htmlFor="image-background" className="block text-sm font-medium text-foreground">
                JPEG background colour
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="image-background"
                  type="color"
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                  className="h-[44px] w-16 cursor-pointer rounded-lg border border-border/50 bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  JPEG has no transparency; transparent areas become this colour.
                </p>
              </div>
            </div>
          )}

          {targetTooLarge && (
            <p role="alert" className="text-sm text-amber-400">
              {targetDimensions.width} × {targetDimensions.height} px is too large for an
              in-browser canvas.{" "}
              {resizeEnabled
                ? "Choose smaller maximum dimensions."
                : "Enable resizing and choose smaller maximum dimensions."}
            </p>
          )}

          <Button
            onClick={compress}
            disabled={busy || targetTooLarge}
            className="min-h-[44px] w-full"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Compressing...
              </>
            ) : (
              "Compress image"
            )}
          </Button>

          {isStale && (
            <p role="status" className="text-sm text-amber-400">
              Settings changed — compress again to apply them.
            </p>
          )}

          {result && source && (
            <section
              aria-live="polite"
              className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  Result
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    result.keptOriginal ? "text-amber-400" : "text-emerald-400"
                  )}
                >
                  {result.keptOriginal ? "Already optimized" : savingsLabel}
                </span>
              </div>

              {result.keptOriginal && result.reason && (
                <p className="text-sm text-amber-400">{result.reason}</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="overflow-hidden rounded-lg border border-border/50 bg-background/40">
                  <div className="flex max-h-56 items-center justify-center p-2">
                    <img
                      src={source.url}
                      alt={`Original preview: ${source.file.name}`}
                      className="max-h-52 w-auto max-w-full object-contain"
                    />
                  </div>
                  <figcaption className="space-y-1 border-t border-border/40 p-3 text-xs text-muted-foreground">
                    <span className="block font-medium text-foreground">Original</span>
                    <span className="block">
                      {formatLabel(source.mime)} · {source.width} × {source.height} px ·{" "}
                      {formatBytes(source.file.size)}
                    </span>
                  </figcaption>
                </figure>

                <figure className="overflow-hidden rounded-lg border border-border/50 bg-background/40">
                  <div className="flex max-h-56 items-center justify-center p-2">
                    <img
                      src={result.url}
                      alt={
                        result.keptOriginal
                          ? "Original kept preview"
                          : `Compressed preview (${formatLabel(result.mime)})`
                      }
                      className="max-h-52 w-auto max-w-full object-contain"
                    />
                  </div>
                  <figcaption className="space-y-1 border-t border-border/40 p-3 text-xs text-muted-foreground">
                    <span className="block font-medium text-foreground">
                      {result.keptOriginal ? "Original kept" : "Compressed"}
                    </span>
                    <span className="block">
                      {formatLabel(result.mime)} · {result.width} × {result.height} px ·{" "}
                      {formatBytes(result.size)}
                    </span>
                  </figcaption>
                </figure>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={download} className="min-h-[44px] w-full sm:w-auto">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {result.keptOriginal ? "Download original" : "Download compressed image"}
                </Button>
                {!result.keptOriginal && (
                  <Button
                    onClick={downloadOriginal}
                    variant="outline"
                    className="min-h-[44px] w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download original
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">Saves as {result.fileName}</p>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
