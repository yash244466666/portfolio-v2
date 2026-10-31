export interface ContactMessageInput {
  name: string
  email: string
  message: string
  turnstileToken: string
  /** Honeypot field; must stay empty. */
  website?: string
}

export interface ContactSendResult {
  ok: boolean
  error?: string
  confirmationSent?: boolean
}

const REQUEST_TIMEOUT_MS = 15_000

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
 * POST the contact payload to the Cloudflare Worker with a 15-second timeout.
 * Never throws; network, timeout, and non-2xx responses become `{ ok: false }`.
 */
export async function sendContactMessage(
  input: ContactMessageInput,
  endpoint: string | undefined
): Promise<ContactSendResult> {
  const url = normalizeContactEndpoint(endpoint)
  if (!url) return { ok: false, error: "not-configured" }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        message: input.message,
        turnstileToken: input.turnstileToken,
        website: input.website ?? "",
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      return { ok: false, error: `http-${response.status}` }
    }

    const data = (await response.json()) as {
      ok?: boolean
      error?: string
      confirmationSent?: boolean
    }

    if (data.ok !== true) {
      return { ok: false, error: data.error ?? "unknown" }
    }

    return { ok: true, confirmationSent: data.confirmationSent !== false }
  } catch {
    return { ok: false, error: "network" }
  } finally {
    clearTimeout(timeout)
  }
}
