export interface ContactAttachmentInput {
  name: string
  /** MIME type as reported by the browser; the Worker trusts the extension. */
  type: string
  /** Base64 payload, without a data-URL prefix. */
  content: string
  /** Decoded size in bytes, for client-side limits and messaging. */
  size: number
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
}

export interface ContactSendResult {
  ok: boolean
  error?: string
  confirmationSent?: boolean
  /** Short Brevo message id, for tracing a missing email. */
  reference?: string
  /** Whether the file was actually forwarded with the message. */
  attachmentSent?: boolean
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
    }
  } catch {
    return { ok: false, error: "network" }
  } finally {
    clearTimeout(timeout)
  }
}
