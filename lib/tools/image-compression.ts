// Browser image compression helpers for the Image Compressor tool.
//
// Inputs are decoded with createImageBitmap so EXIF orientation is applied and
// metadata (EXIF/GPS) is never carried into the output. Encoding uses the
// platform canvas encoders only, so no WASM codecs or extra bundle weight are
// required. A caller should treat an encoder as unavailable when
// `canEncodeMime` returns false and offer the original file instead.

export type ImageOutputFormat = "auto" | "webp" | "jpeg" | "png" | "avif" | "original"

export const OUTPUT_FORMAT_OPTIONS: { value: ImageOutputFormat; label: string }[] = [
  { value: "auto", label: "Auto (smallest)" },
  { value: "webp", label: "WebP" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG (lossless)" },
  { value: "avif", label: "AVIF" },
  { value: "original", label: "Keep original format" },
]

export const ENCODABLE_MIME_BY_FORMAT: Record<"webp" | "jpeg" | "png" | "avif", string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
}

/** Formats the browser can decode for this tool (SVG is rejected separately). */
export const SUPPORTED_INPUT_ACCEPT =
  "image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp,image/tiff"

const SUPPORTED_INPUT_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/bmp",
  "image/tiff",
])

const ENCODABLE_INPUT_MIMES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"])

const MIME_LABELS: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/avif": "AVIF",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/tiff": "TIFF",
  "image/svg+xml": "SVG",
}

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
}

const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  svg: "image/svg+xml",
}

/** Canvas dimensions above this are rejected by every mainstream browser. */
export const MAX_CANVAS_DIMENSION = 16384
/** Keeps a single canvas comfortably below common per-context memory limits. */
export const MAX_SAFE_PIXEL_AREA = 80_000_000

export function resolveImageMime(file: File): string {
  if (file.type) return file.type.toLowerCase()
  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  return MIME_BY_EXTENSION[extension] ?? ""
}

export function isSupportedInputMime(mime: string): boolean {
  return SUPPORTED_INPUT_MIMES.has(mime)
}

export function isEncodableInputMime(mime: string): boolean {
  return ENCODABLE_INPUT_MIMES.has(mime)
}

export function formatLabel(mime: string): string {
  if (MIME_LABELS[mime]) return MIME_LABELS[mime]
  const suffix = mime.replace(/^image\//, "").toUpperCase()
  return suffix || "Unknown"
}

export function extensionForMime(mime: string): string {
  return EXTENSION_BY_MIME[mime] ?? "bin"
}

export function outputFileName(fileName: string, mime: string): string {
  const base = fileName.replace(/\.[^./\\]+$/, "").trim() || "image"
  return `compressed-${base}.${extensionForMime(mime)}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

export interface TargetDimensions {
  width: number
  height: number
  /** False when the requested limits do not shrink the image. */
  resized: boolean
}

/**
 * Scale an image to fit optional maximum dimensions. Never upscales; a zero or
 * non-finite limit means "no limit on this axis".
 */
export function getTargetDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): TargetDimensions {
  const widthLimit = Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : Number.POSITIVE_INFINITY
  const heightLimit = Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : Number.POSITIVE_INFINITY
  const scale = Math.min(1, widthLimit / width, heightLimit / height)
  if (!Number.isFinite(scale) || scale >= 1) {
    return { width, height, resized: false }
  }
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    resized: true,
  }
}

export function exceedsCanvasLimits(width: number, height: number): boolean {
  return (
    width > MAX_CANVAS_DIMENSION ||
    height > MAX_CANVAS_DIMENSION ||
    width * height > MAX_SAFE_PIXEL_AREA
  )
}

/**
 * Decode a file into an ImageBitmap. Passing `imageOrientation: "from-image"`
 * applies EXIF rotation, so a portrait phone photo is encoded upright.
 */
export async function decodeImageFile(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== "function") {
    throw new Error("This browser cannot decode images.")
  }
  return createImageBitmap(file, {
    imageOrientation: "from-image",
    premultiplyAlpha: "default",
    colorSpaceConversion: "default",
  })
}

/**
 * Whether the image has any transparency. Checks a downscaled sample, which is
 * cheap even for large photos and still reports fully transparent regions.
 */
export async function bitmapHasAlpha(bitmap: ImageBitmap): Promise<boolean> {
  const maxSample = 128
  const scale = Math.min(1, maxSample / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return false
  context.drawImage(bitmap, 0, 0, width, height)
  const data = context.getImageData(0, 0, width, height).data
  canvas.width = 0
  canvas.height = 0
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) return true
  }
  return false
}

/** Probe whether this browser can actually encode a MIME type. */
export async function canEncodeMime(mime: string): Promise<boolean> {
  if (typeof document === "undefined") return false
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mime, 0.8)
  })
  canvas.width = 0
  canvas.height = 0
  return Boolean(blob && blob.type === mime && blob.size > 0)
}

export interface EncodeBitmapOptions {
  width: number
  height: number
  mime: string
  /** 1–100. Ignored by lossless encoders such as PNG. */
  quality: number
  /** Fill colour drawn under the image, e.g. white when flattening to JPEG. */
  background?: string
}

export async function encodeBitmapToBlob(
  bitmap: ImageBitmap,
  { width, height, mime, quality, background }: EncodeBitmapOptions
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.min(MAX_CANVAS_DIMENSION, Math.round(width)))
  canvas.height = Math.max(1, Math.min(MAX_CANVAS_DIMENSION, Math.round(height)))
  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Canvas 2D is not available in this browser.")
  }
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = "high"
  if (background) {
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mime, Math.min(1, Math.max(0, quality / 100)))
  })
  // Release the backing store promptly; large canvases are memory heavy.
  canvas.width = 0
  canvas.height = 0
  if (!blob || blob.size === 0) {
    throw new Error(`This browser could not encode ${formatLabel(mime)} output.`)
  }
  return blob
}

/** Detect animation for the formats where a still frame would surprise users. */
export function isAnimatedImage(bytes: Uint8Array, mime: string): boolean {
  switch (mime) {
    case "image/gif":
      return isAnimatedGif(bytes)
    case "image/webp":
      return hasWebpAnimation(bytes)
    case "image/png":
      // APNG marks itself with an acTL chunk before the image data.
      return containsAscii(bytes, "acTL", 65536)
    case "image/avif":
      return false
    default:
      return false
  }
}

function containsAscii(bytes: Uint8Array, text: string, limit = bytes.length): boolean {
  const end = Math.min(bytes.length, limit) - text.length
  for (let offset = 0; offset <= end; offset += 1) {
    let match = true
    for (let index = 0; index < text.length; index += 1) {
      if (bytes[offset + index] !== text.charCodeAt(index)) {
        match = false
        break
      }
    }
    if (match) return true
  }
  return false
}

function hasWebpAnimation(bytes: Uint8Array): boolean {
  if (bytes.length < 21) return false
  // Extended WebP files start with a VP8X chunk whose flags byte marks
  // animation (0x02) and alpha (0x10): "RIFF" size "WEBP" "VP8X" size flags.
  if (containsAscii(bytes, "VP8X", 32)) {
    return (bytes[20] & 0x02) !== 0
  }
  return containsAscii(bytes, "ANIM") || containsAscii(bytes, "ANMF")
}

function skipGifSubBlocks(bytes: Uint8Array, start: number): number {
  let offset = start
  while (offset < bytes.length) {
    const size = bytes[offset]
    offset += 1
    if (size === 0) break
    offset += size
  }
  return offset
}

function isAnimatedGif(bytes: Uint8Array): boolean {
  if (bytes.length < 13) return false
  const packed = bytes[10]
  let offset = 13
  if (packed & 0x80) {
    offset += 3 * 2 ** ((packed & 0x07) + 1)
  }
  let frames = 0
  while (offset < bytes.length) {
    const marker = bytes[offset]
    if (marker === 0x3b) return false // trailer reached with one frame
    if (marker === 0x21) {
      offset = skipGifSubBlocks(bytes, offset + 2)
      continue
    }
    if (marker === 0x2c) {
      frames += 1
      if (frames > 1) return true
      const imagePacked = bytes[offset + 9]
      offset += 10
      if (imagePacked & 0x80) {
        offset += 3 * 2 ** ((imagePacked & 0x07) + 1)
      }
      offset += 1 // LZW minimum code size
      offset = skipGifSubBlocks(bytes, offset)
      continue
    }
    return false
  }
  return false
}
