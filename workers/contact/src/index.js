/**
 * Contact form Worker — Brevo transactional email proxy.
 *
 * Deploy target: Cloudflare Workers (dashboard Quick Edit or `wrangler deploy`).
 *
 * Required Worker secrets (Settings → Variables and Secrets):
 *   BREVO_API_KEY          Brevo v3 API key
 *   TURNSTILE_SECRET_KEY   Cloudflare Turnstile secret key
 *
 * Optional KV binding for IP rate limiting:
 *   RATE_LIMIT             KV namespace binding (5 submissions / IP / hour)
 *
 * Request contract (POST, JSON):
 *   { name, email, message, turnstileToken, website }
 *   `website` is the honeypot and must be empty.
 *
 * Response: { ok: true, confirmationSent } or { ok: false, error }.
 */

const ALLOWED_ORIGINS = [
  "https://yashcodes.com",
  "https://www.yashcodes.com",
  "https://beta.yashcodes.com",
  "http://localhost:3000",
]

const OWNER_EMAIL = "info@yashcodes.com"
const SENDER_EMAIL = "info@yashcodes.com"
const SENDER_NAME = "Yash"

const MAX_BODY_BYTES = 32 * 1024
const LIMITS = { name: 100, email: 254, message: 5000 }

function corsHeaders(origin) {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowed,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  }
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  })
}

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]
  )
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

async function verifyTurnstile(token, secret, ip) {
  const form = new FormData()
  form.append("secret", secret)
  form.append("response", token)
  if (ip) form.append("remoteip", ip)

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  )
  if (!response.ok) return false
  const result = await response.json()
  return result.success === true
}

async function sendBrevo(apiKey, payload) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let detail = ""
    try {
      detail = (await response.text()).slice(0, 300)
    } catch {
      // ignore
    }
    throw new Error(`Brevo ${response.status}: ${detail}`)
  }

  return response.json().catch(() => ({}))
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin")
    const originAllowed = Boolean(origin && ALLOWED_ORIGINS.includes(origin))

    if (request.method === "OPTIONS") {
      if (!originAllowed) {
        return new Response(null, { status: 403, headers: corsHeaders(null) })
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405, origin)
    }

    // Browser requests must come from an allowed origin. Requests without an
    // Origin header (curl, server-to-server) are allowed for testing.
    if (origin && !originAllowed) {
      return json({ ok: false, error: "Origin not allowed" }, 403, origin)
    }

    const declaredLength = Number(request.headers.get("Content-Length") || "0")
    if (declaredLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: "Payload too large" }, 413, origin)
    }

    let data
    try {
      const body = await request.text()
      if (body.length > MAX_BODY_BYTES) {
        return json({ ok: false, error: "Payload too large" }, 413, origin)
      }
      data = JSON.parse(body)
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, 400, origin)
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return json({ ok: false, error: "Invalid payload" }, 400, origin)
    }

    // Honeypot: pretend success, send nothing.
    if (typeof data.website === "string" && data.website.trim() !== "") {
      return json({ ok: true, confirmationSent: false }, 200, origin)
    }

    const name = typeof data.name === "string" ? data.name.trim() : ""
    const email = typeof data.email === "string" ? data.email.trim() : ""
    const message =
      typeof data.message === "string" ? data.message.trim() : ""
    const token =
      typeof data.turnstileToken === "string" ? data.turnstileToken : ""

    if (!name || name.length > LIMITS.name) {
      return json({ ok: false, error: "Invalid name" }, 400, origin)
    }
    if (!email || email.length > LIMITS.email || !isEmail(email)) {
      return json({ ok: false, error: "Invalid email" }, 400, origin)
    }
    if (!message || message.length > LIMITS.message) {
      return json({ ok: false, error: "Invalid message" }, 400, origin)
    }
    if (!token) {
      return json({ ok: false, error: "Missing captcha" }, 400, origin)
    }

    const ip = request.headers.get("CF-Connecting-IP") || ""
    const human = await verifyTurnstile(
      token,
      env.TURNSTILE_SECRET_KEY,
      ip
    )
    if (!human) {
      return json({ ok: false, error: "Captcha failed" }, 403, origin)
    }

    // Optional KV rate limit: 5 submissions per IP per hour.
    if (env.RATE_LIMIT && ip) {
      const key = `rate:${ip}`
      const used = Number((await env.RATE_LIMIT.get(key)) || "0")
      if (used >= 5) {
        return json({ ok: false, error: "Too many requests" }, 429, origin)
      }
      await env.RATE_LIMIT.put(key, String(used + 1), {
        expirationTtl: 3600,
      })
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />")

    const ownerHtml = `
      <h2>New portfolio message</h2>
      <p><strong>Name:</strong> ${safeName}<br />
      <strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `

    const confirmationHtml = `
      <p>Hi ${safeName},</p>
      <p>Thanks for getting in touch. I received your message and will reply soon.</p>
      <p><strong>Your message:</strong></p>
      <p>${safeMessage}</p>
      <p>— Yash</p>
    `

    try {
      await sendBrevo(env.BREVO_API_KEY, {
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: OWNER_EMAIL, name: SENDER_NAME }],
        replyTo: { email, name },
        subject: `New portfolio message from ${name}`,
        htmlContent: ownerHtml,
        textContent: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      })
    } catch {
      return json({ ok: false, error: "Could not send message" }, 502, origin)
    }

    let confirmationSent = true
    try {
      await sendBrevo(env.BREVO_API_KEY, {
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email, name }],
        replyTo: { email: SENDER_EMAIL, name: SENDER_NAME },
        subject: "Thanks for contacting Yash",
        htmlContent: confirmationHtml,
        textContent: `Hi ${name},\n\nThanks for getting in touch. I received your message and will reply soon.\n\n${message}\n\n— Yash`,
      })
    } catch {
      confirmationSent = false
    }

    return json({ ok: true, confirmationSent }, 200, origin)
  },
}
