/**
 * Client-side rules for the optional contact-form attachment.
 *
 * The file goes straight to object storage with a presigned URL, so these
 * limits follow the Worker's storage rules (`workers/contact/src/index.js`)
 * rather than the much narrower set an email attachment allows.
 */

/** 100 MB per file. */
export const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024

/** How many files one message may carry. */
export const MAX_ATTACHMENT_COUNT = 5

/**
 * The picker accepts anything: files are uploaded to object storage, which has
 * no extension list. An empty `accept` means "all files".
 */
export const ATTACHMENT_ACCEPT = ""

export type AttachmentRejection = "too-large" | "unsupported"

export type AttachmentValidation =
  | { ok: true }
  | { ok: false; reason: AttachmentRejection }

function getExtension(fileName: string): string {
  const trimmed = fileName.trim().toLowerCase()
  const dot = trimmed.lastIndexOf(".")
  return dot === -1 ? "" : trimmed.slice(dot + 1)
}

/** Validate a picked file before any network call. */
export function validateAttachmentFile(file: File): AttachmentValidation {
  if (!getExtension(file.name) || file.size === 0) {
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
 * Only the fallback path needs this, when object storage is not configured and
 * the file has to ride inside the email instead.
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
