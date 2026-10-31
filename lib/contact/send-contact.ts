export interface ContactAttachmentInput {
  name: string
  /** MIME type as reported by the browser; the Worker trusts the extension. */
  type: string
  /** Base64 payload, without a data-URL prefix. */
  content: string
  /** Decoded size in bytes, for client-side limits and messaging. */
  size: number
}

export interface PresignedUpload {
  key: string
  url: string
  /** Short-lived proof that this key was authorised; reused at submit time. */
  ticket: string
  maxBytes: number
  expiresIn: number
}

export interface UploadTicketInput {
  files: { name: string; size: number; type: string }[]
  turnstileToken: string
}

export type UploadUrlResult =
  | { ok: true; uploads: PresignedUpload[] }
  | { ok: false; reason: "unavailable" | "rate-limited" | "verification" | "too-large" | "error" }

/**
 * Ask the Worker for a presigned PUT.
 *
 * `unavailable` means object storage is not configured, which is the only case
 * that should fall back to an email attachment — every other reason has to be
 * reported, or the visitor is told the wrong thing.
 */
export async function requestUploadUrl(
  input: UploadTicketInput,
  endpoint: string | undefined
): Promise<UploadUrlResult> {
  const base = normalizeContactEndpoint(endpoint)
  if (!base) return { ok: false, reason: "unavailable" }

  const url = new URL("upload-url", base.endsWith("/") ? base : `${base}/`)

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Turnstile-Token": input.turnstileToken,
      },
      body: JSON.stringify({
        files: input.files,
        turnstileToken: input.turnstileToken,
      }),
    })

    if (response.status === 501) return { ok: false, reason: "unavailable" }

    let data:
      | {
          ok?: boolean
          error?: string
          maxBytes?: number
          expiresIn?: number
          uploads?: { key?: string; url?: string; ticket?: string }[]
        }
      | null = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (response.status === 429) return { ok: false, reason: "rate-limited" }
    if (response.status === 413) return { ok: false, reason: "too-large" }
    if (response.status === 403) return { ok: false, reason: "verification" }
    if (!response.ok || data?.ok !== true || !Array.isArray(data.uploads)) {
      return { ok: false, reason: "error" }
    }

    const uploads: PresignedUpload[] = []
    for (const entry of data.uploads) {
      if (!entry?.key || !entry?.url) return { ok: false, reason: "error" }
      uploads.push({
        key: entry.key,
        url: entry.url,
        ticket: typeof entry.ticket === "string" ? entry.ticket : "",
        maxBytes: data.maxBytes ?? 0,
        expiresIn: data.expiresIn ?? 0,
      })
    }

    return { ok: true, uploads }
  } catch {
    return { ok: false, reason: "error" }
  }
}

/**
 * PUT the file straight to object storage. Never routed through the Worker, so
 * neither its body limit nor its CPU budget applies.
 *
 * `XMLHttpRequest` rather than `fetch`: upload progress is only observable
 * through XHR's `upload.onprogress`, and a 1 GB file needs a real progress bar.
 */
export function uploadFileToStorage(
  upload: PresignedUpload,
  file: File,
  onProgress?: (fraction: number) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest()
    request.open("PUT", upload.url, true)
    request.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    )

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total)
      }
    })

    request.addEventListener("load", () => {
      onProgress?.(1)
      resolve(request.status >= 200 && request.status < 300)
    })
    request.addEventListener("error", () => resolve(false))
    request.addEventListener("abort", () => resolve(false))

    request.send(file)
  })
}

export interface ContactMessageInput {
  name: string
  email: string
  message: string
  turnstileToken: string
  /** Honeypot field; must stay empty. */
  website?: string
  /** Optional single file forwarded to the owner by email. */
  attachment?: ContactAttachmentInput
  /** Stored files from `requestUploadUrl`; preferred over `attachment`. */
  files?: { key: string; name: string; size: number; ticket: string }[]
  /** Object-storage key from `requestUploadUrl`; preferred over `attachment`. */
  fileKey?: string
  fileName?: string
  fileSize?: number
}

export interface ContactSendResult {
  ok: boolean
  error?: string
  confirmationSent?: boolean
  /** Short Brevo message id, for tracing a missing email. */
  reference?: string
  /** Whether the file was actually forwarded with the message. */
  attachmentSent?: boolean
  /** `link` when the file was stored and shared by URL, `attached` otherwise. */
  fileMode?: "link" | "attached" | "none"
}

const REQUEST_TIMEOUT_MS = 15_000
/** Uploading a file needs a longer budget than a text-only message. */
const ATTACHMENT_TIMEOUT_MS = 30_000

/**
 * Accept a full URL or a bare worker host. The deployed Worker accepts POST on
 * any path, so no `/contact` suffix is required.
 */
export function normalizeContactEndpoint(value: string | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(withScheme)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    return url.toString()
  } catch {
    return null
  }
}

/**
 * POST the contact payload to the Cloudflare Worker.
 *
 * The Turnstile token travels in the `X-Turnstile-Token` header so the Worker
 * can verify it before parsing the body; inline `turnstileToken` stays for
 * older Workers. Never throws; network, timeout, and non-2xx responses become
 * `{ ok: false }`.
 */
export async function sendContactMessage(
  input: ContactMessageInput,
  endpoint: string | undefined
): Promise<ContactSendResult> {
  const url = normalizeContactEndpoint(endpoint)
  if (!url) return { ok: false, error: "not-configured" }

  const hasAttachment = Boolean(input.attachment)
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    hasAttachment ? ATTACHMENT_TIMEOUT_MS : REQUEST_TIMEOUT_MS
  )

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Turnstile-Token": input.turnstileToken,
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        message: input.message,
        turnstileToken: input.turnstileToken,
        website: input.website ?? "",
        ...(input.files?.length ? { files: input.files } : {}),
        ...(input.fileKey
          ? {
              fileKey: input.fileKey,
              fileName: input.fileName ?? "",
              fileSize: input.fileSize ?? 0,
            }
          : {}),
        ...(input.attachment
          ? {
              attachment: {
                name: input.attachment.name,
                type: input.attachment.type,
                content: input.attachment.content,
              },
            }
          : {}),
      }),
      signal: controller.signal,
    })

    // The Worker answers failures with `{ ok: false, error }` too — read the
    // body first, or a specific reason ("attachment-rejected") is lost and the
    // visitor only ever sees the generic message.
    let data: {
      ok?: boolean
      error?: string
      confirmationSent?: boolean
      reference?: string
      attachmentSent?: boolean
      fileMode?: string
    } | null = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok && data?.ok !== false) {
      return { ok: false, error: `http-${response.status}` }
    }

    if (!data) {
      return { ok: false, error: `http-${response.status}` }
    }

    if (data.ok !== true) {
      return { ok: false, error: data.error ?? "unknown" }
    }

    return {
      ok: true,
      confirmationSent: data.confirmationSent !== false,
      reference: typeof data.reference === "string" ? data.reference : undefined,
      attachmentSent: data.attachmentSent === true,
      fileMode:
        data.fileMode === "link" || data.fileMode === "attached"
          ? data.fileMode
          : "none",
    }
  } catch {
    return { ok: false, error: "network" }
  } finally {
    clearTimeout(timeout)
  }
}
