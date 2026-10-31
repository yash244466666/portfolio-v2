/**
 * Client-side rules for the optional contact-form attachment.
 *
 * These mirror the Worker (`workers/contact/src/index.js`): keep the size
 * ceiling and the extension list in sync, or a file will pass here and be
 * rejected on the server after the visitor has waited through an upload.
 */

/** 4 MB decoded. Base64 adds ~33% on the wire. */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024

export const ACCEPTED_ATTACHMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "odt",
  "txt",
  "csv",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
] as const

/** `accept` attribute for the file input. */
export const ATTACHMENT_ACCEPT = ACCEPTED_ATTACHMENT_EXTENSIONS.map(
  (extension) => `.${extension}`
).join(",")

export type AttachmentRejection = "too-large" | "unsupported"

export type AttachmentValidation =
  | { ok: true }
  | { ok: false; reason: AttachmentRejection }

function getExtension(fileName: string): string {
  const trimmed = fileName.trim().toLowerCase()
  const dot = trimmed.lastIndexOf(".")
  return dot === -1 ? "" : trimmed.slice(dot + 1)
}

/**
 * Validate a picked file. The browser's `File.type` is advisory and often
 * empty on Linux desktops, so the extension is what decides the type.
 */
export function validateAttachmentFile(file: File): AttachmentValidation {
  const extension = getExtension(file.name)
  if (
    !extension ||
    !(ACCEPTED_ATTACHMENT_EXTENSIONS as readonly string[]).includes(extension)
  ) {
    return { ok: false, reason: "unsupported" }
  }
  if (file.size === 0) {
    return { ok: false, reason: "unsupported" }
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, reason: "too-large" }
  }
  return { ok: true }
}

/**
 * Read a file as bare base64 (no `data:` prefix).
 *
 * Chunked so the spread operator never receives a multi-megabyte array.
 */
export async function readFileAsBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const chunkSize = 0x8000
  let binary = ""

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length))
    )
  }

  return btoa(binary)
}

/** Compact, locale-independent size label for the selected-file row. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
