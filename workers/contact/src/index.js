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
 *   { name, email, message, turnstileToken, attachment, website }
 *   `turnstileToken` may instead be sent as the `X-Turnstile-Token` header,
 *   which lets the Worker verify it before reading the body.
 *   `attachment` is optional: { name, content } with base64 `content`.
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

/**
 * Where owner notifications are delivered. Any address works here — only the
 * sender must sit on the domain authenticated in Brevo.
 */
const OWNER_EMAIL = "md.mohi.minul.islam.yash@gmail.com"
const SENDER_EMAIL = "info@yashcodes.com"
const SENDER_NAME = "Yash"

/**
 * Body ceiling. Base64 inflates the file by ~33%, so this leaves room for a
 * 4 MB attachment plus the message and JSON overhead. Cloudflare's own limit
 * is far higher; the real constraint is Worker CPU time spent parsing.
 */
const MAX_BODY_BYTES = 6 * 1024 * 1024
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024
const LIMITS = { name: 100, email: 254, message: 5000, fileName: 120 }

/** Extensions Brevo accepts, kept narrow enough for a contact form. */
const ALLOWED_ATTACHMENT_EXTENSIONS = [
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
  "md",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
]

function corsHeaders(origin) {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowed,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Turnstile-Token",
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

/**
 * Validate an optional `{ name, content }` attachment.
 *
 * The browser's MIME type is ignored — it is attacker-controlled and often
 * wrong. The extension allowlist and the decoded byte count are what matter.
 * Returns `{ ok: true, attachment }` where `attachment` is `null` when the
 * field is absent, so callers can tell "no file" apart from "bad file".
 */
function parseAttachment(raw) {
  if (raw === undefined || raw === null) return { ok: true, attachment: null }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid attachment" }
  }

  const rawName = typeof raw.name === "string" ? raw.name : ""
  // Some encoders wrap base64 at 76 columns.
  const content =
    typeof raw.content === "string" ? raw.content.replace(/\s+/g, "") : ""
  if (!rawName || !content) return { ok: false, error: "Invalid attachment" }

  if (content.length > Math.ceil((MAX_ATTACHMENT_BYTES * 4) / 3) + 8) {
    return { ok: false, error: "Attachment too large" }
  }

  // Drop any path a client might have sent and control characters.
  const baseName = rawName.split(/[\\/]/).pop() || ""
  const name = baseName
    .replace(/[\u0000-\u001f\u007f"]/g, "")
    .trim()
    .slice(0, LIMITS.fileName)
  if (!name) return { ok: false, error: "Invalid attachment" }

  const extension = name.includes(".")
    ? name.split(".").pop().toLowerCase()
    : ""
  if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
    return { ok: false, error: "Attachment type not allowed" }
  }

  let size
  try {
    size = atob(content).length
  } catch {
    return { ok: false, error: "Invalid attachment" }
  }
  if (size === 0) return { ok: false, error: "Invalid attachment" }
  if (size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, error: "Attachment too large" }
  }

  return { ok: true, attachment: { name, content, size, extension } }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Turnstile + optional KV rate limit. Returns a `Response` when the request
 * must be rejected, or `null` when it may continue.
 */
async function enforceGate(env, token, ip, origin) {
  if (!token) {
    return json({ ok: false, error: "Missing captcha" }, 400, origin)
  }

  const human = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip)
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
    await env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 3600 })
  }

  return null
}

const BRAND = {
  siteUrl: "https://yashcodes.com",
  /**
   * Mirrors `personalInfo.resumeUrl` in `lib/content/index.ts`. This Worker is
   * a separate deployable and cannot import the Next content module, so this
   * is the one place to change the résumé link.
   */
  resumeUrl: "https://yashcodes.com/resume.pdf",
  resumeLabel: "Download my resume",
  wordmark: "Yash Sikdar",
  name: "Yash",
  accent: "#3ecf8e",
  background: "#0a0a0a",
  surface: "#171717",
  quoteSurface: "#141414",
  border: "#262626",
  foreground: "#fafafa",
  body: "#d4d4d4",
  muted: "#a3a3a3",
  faint: "#737373",
  font: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

/**
 * Visitor confirmation email.
 *
 * `name` and `message` must already be HTML-escaped; `message` keeps its
 * `<br />` line breaks. Written for email clients rather than browsers:
 * inline styles only, table layout, no external images or fonts, and an
 * explicit dark color-scheme so Gmail and iOS Mail do not invert the palette.
 */
function buildConfirmationHtml({ name, message, attachment, files }) {
  const { font, background, surface, quoteSurface, border, foreground, body, muted, faint, accent, siteUrl, wordmark, resumeUrl, resumeLabel } = BRAND

  // `attachment.name` is already stripped of path segments and control
  // characters; escape it anyway, it is still visitor-supplied text.
  const attachmentDetail = attachment
    ? ` <span style="color:${muted};">Attached:</span> <strong style="color:${foreground};">${escapeHtml(attachment.name)}</strong> <span style="color:${faint};">(${formatBytes(attachment.size)})</span>`
    : files && files.length
      ? ` <span style="color:${muted};">Files:</span><br />${files
          .map(
            (file) =>
              `<strong style="color:${foreground};">${escapeHtml(file.name)}</strong> <span style="color:${faint};">(${formatBytes(file.size)})</span> — <a href="${file.url}" style="color:${foreground};text-decoration:underline;">download</a><br />`
          )
          .join("")}<span style="color:${faint};">Links expire in ${files[0].days} days.</span>`
      : ""

  const attachmentRow = attachmentDetail
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 0 0;background-color:${quoteSurface};border:1px solid ${border};border-radius:10px;">
<tr>
<td style="padding:12px 16px;font-size:14px;line-height:1.6;color:${body};font-family:${font};word-break:break-word;">${attachmentDetail}</td>
</tr>
</table>`
    : ""

  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>Thanks for contacting ${wordmark}</title>
</head>
<body style="margin:0;padding:0;background-color:${background};color:${body};font-family:${font};">
<div style="display:none;font-size:1px;color:${background};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Your message reached me — here is a copy for your records.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${background};">
<tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${surface};border:1px solid ${border};border-radius:10px;overflow:hidden;">

<tr>
<td style="padding:28px 28px 20px 28px;">
<p style="margin:0;font-size:17px;font-weight:700;letter-spacing:-0.01em;color:${foreground};font-family:${font};">${wordmark}</p>
<p style="margin:4px 0 0 0;font-size:13px;color:${faint};font-family:${font};">Full Stack Software Engineer</p>
</td>
</tr>

<tr>
<td style="height:2px;line-height:2px;font-size:0;background-color:${foreground};background-image:linear-gradient(90deg,${foreground} 0%,${accent} 100%);">&nbsp;</td>
</tr>

<tr>
<td style="padding:28px;">
<h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.02em;color:${foreground};font-family:${font};">Message received</h1>
<p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:${muted};font-family:${font};">Hi ${name},</p>
<p style="margin:0 0 22px 0;font-size:15px;line-height:1.7;color:${body};font-family:${font};">Thanks for getting in touch. Your message reached me and I will reply soon — usually within a day or two.</p>

<p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${faint};font-family:${font};">Your message</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${quoteSurface};border:1px solid ${border};border-left:3px solid ${accent};border-radius:10px;">
<tr>
<td style="padding:16px 20px;font-size:15px;line-height:1.7;color:${body};font-family:${font};word-break:break-word;">${message}</td>
</tr>
</table>
${attachmentRow}

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0 0;">
<tr>
<td style="border-radius:10px;background-color:${foreground};">
<a href="${resumeUrl}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:${background};text-decoration:none;border-radius:10px;font-family:${font};">${resumeLabel}</a>
</td>
</tr>
</table>

<p style="margin:22px 0 0 0;font-size:14px;line-height:1.7;color:${muted};font-family:${font};">Need to add something? Just reply to this email and it comes straight to me.</p>
</td>
</tr>

<tr>
<td style="padding:0 28px;"><div style="height:1px;line-height:1px;font-size:0;background-color:${border};">&nbsp;</div></td>
</tr>

<tr>
<td style="padding:20px 28px 26px 28px;">
<p style="margin:0 0 6px 0;font-size:12px;line-height:1.6;color:${faint};font-family:${font};">You received this because you used the contact form at <a href="${siteUrl}" style="color:${muted};text-decoration:underline;">${siteUrl.replace(/^https?:\/\//, "")}</a>. Your address is only used to reply to you.</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:${faint};font-family:${font};">&copy; ${new Date().getUTCFullYear()} ${BRAND.name}</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`
}

/** Plain-text twin of the confirmation email. */
function buildConfirmationText({ name, message, attachment, files }) {
  const attachmentLine = attachment
    ? `\n\nAttached: ${attachment.name} (${formatBytes(attachment.size)})`
    : files && files.length
      ? `\n\nFiles:\n${files
          .map((file) => `- ${file.name} (${formatBytes(file.size)}): ${file.url}`)
          .join("\n")}\nThese links expire in ${files[0].days} days.`
      : ""

  return `Hi ${name},

Thanks for getting in touch. Your message reached me and I will reply soon — usually within a day or two.

Your message:
${message}${attachmentLine}

Need to add something? Just reply to this email and it comes straight to me.

${BRAND.resumeLabel}: ${BRAND.resumeUrl}

— ${BRAND.name}
${BRAND.siteUrl}`
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

/**
 * Patterns Brevo uses when it refuses an attachment. Matching these turns an
 * opaque `502` into a rejection the visitor can act on.
 */
const ATTACHMENT_REJECTION_HINTS = [
  "attachment",
  "file type",
  "extension",
  "unsupported file",
  "not allowed",
]

class BrevoError extends Error {
  constructor(status, detail) {
    super(`Brevo ${status}: ${detail}`)
    this.status = status
    this.detail = detail
    this.attachmentRejected = ATTACHMENT_REJECTION_HINTS.some((hint) =>
      detail.toLowerCase().includes(hint)
    )
  }
}

/**
 * Send one transactional email.
 *
 * Returns Brevo's `{ messageId }` so the caller can hand back a reference the
 * visitor can quote. A dropped-after-acceptance message (provider filtering,
 * recipient spam rules) is invisible from here — the API answer is all we get.
 */
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
    throw new BrevoError(response.status, detail)
  }

  return response.json().catch(() => ({}))
}

/* =============================================================================
   Object storage (S3-compatible, self-hosted Garage on vps-2)
   =============================================================================
   Files are uploaded straight from the browser with a presigned PUT, so no
   large body ever passes through the Worker. The Worker only signs URLs and
   puts them in the emails.

   Worker secrets/vars required for this path:
     S3_ENDPOINT    https://files.yashcodes.com
     S3_REGION      garage
     S3_BUCKET      contact-uploads
     S3_ACCESS_KEY / S3_SECRET_KEY

   Without them, `storageConfigured()` stays false and the form falls back to
   attaching small files to the emails as before.
   ========================================================================== */

const STORAGE_MAX_BYTES = 1024 * 1024 * 1024
const MAX_STORED_FILES = 5
const UPLOAD_URL_TTL_SECONDS = 1800
/** AWS caps presigned URL lifetime at 7 days; Garage follows the same rule. */
const DOWNLOAD_URL_TTL_SECONDS = 7 * 24 * 60 * 60
const STORAGE_PREFIX = "uploads/"
const STORAGE_RETENTION_DAYS = 30

function storageConfigured(env) {
  return Boolean(
    env.S3_ENDPOINT &&
      env.S3_REGION &&
      env.S3_BUCKET &&
      env.S3_ACCESS_KEY &&
      env.S3_SECRET_KEY
  )
}

async function hmacSha256(key, data) {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data))
  )
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function toHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * AWS Signature Version 4, query-string form. The payload is
 * `UNSIGNED-PAYLOAD`, which is what lets the browser stream the file without
 * the Worker ever seeing its bytes.
 */
async function presignS3(env, { method, key, expires }) {
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, "")
  const url = new URL(`${endpoint}/${env.S3_BUCKET}/${key}`)
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "")
  const dateStamp = amzDate.slice(0, 8)
  const scope = `${dateStamp}/${env.S3_REGION}/s3/aws4_request`

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${env.S3_ACCESS_KEY}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  })

  const canonicalRequest = [
    method,
    url.pathname,
    query.toString(),
    `host:${url.host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n")

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    await sha256Hex(canonicalRequest),
  ].join("\n")

  const signingKey = await hmacSha256(
    await hmacSha256(
      await hmacSha256(await hmacSha256(`AWS4${env.S3_SECRET_KEY}`, dateStamp), env.S3_REGION),
      "s3"
    ),
    "aws4_request"
  )
  const signature = toHex(await hmacSha256(signingKey, stringToSign))

  query.append("X-Amz-Signature", signature)
  return `${url.origin}${url.pathname}?${query.toString()}`
}

/** Delete objects older than the retention window. Best effort, never fatal. */
async function pruneStoredFiles(env, ctx) {
  const run = async () => {
    try {
      const listUrl = await presignS3(env, {
        method: "GET",
        key: `?list-type=2&prefix=${encodeURIComponent(STORAGE_PREFIX)}`,
        expires: 300,
      })
      const response = await fetch(listUrl)
      if (!response.ok) return
      const xml = await response.text()
      const cutoff = Date.now() - STORAGE_RETENTION_DAYS * 86400 * 1000

      const entries = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)]
      for (const [, entry] of entries) {
        const key = /<Key>([^<]+)<\/Key>/.exec(entry)?.[1]
        const modified = /<LastModified>([^<]+)<\/LastModified>/.exec(entry)?.[1]
        if (!key || !modified) continue
        if (new Date(modified).getTime() > cutoff) continue
        const deleteUrl = await presignS3(env, { method: "DELETE", key, expires: 300 })
        await fetch(deleteUrl, { method: "DELETE" })
      }
    } catch {
      // Cleanup is opportunistic; a failure must not affect the upload.
    }
  }

  if (ctx?.waitUntil) ctx.waitUntil(run())
  else await run()
}

function extensionOf(fileName) {
  const trimmed = String(fileName || "").trim().toLowerCase()
  const dot = trimmed.lastIndexOf(".")
  return dot === -1 ? "" : trimmed.slice(dot + 1)
}

/** `POST /upload-url` — validate a file and hand back a presigned PUT. */
async function handleUploadUrl(request, env, ctx, origin) {
  if (!storageConfigured(env)) {
    return json(
      { ok: false, error: "storage-unavailable" },
      501,
      origin
    )
  }

  let data
  try {
    data = await request.json()
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400, origin)
  }

  const name = typeof data?.name === "string" ? data.name.trim() : ""
  const size = Number(data?.size)
  const extension = extensionOf(name)

  if (!name || !Number.isFinite(size) || size <= 0) {
    return json({ ok: false, error: "Invalid file" }, 400, origin)
  }
  if (size > STORAGE_MAX_BYTES) {
    return json(
      { ok: false, error: "file-too-large", maxBytes: STORAGE_MAX_BYTES },
      413,
      origin
    )
  }
  if (!extension) {
    return json({ ok: false, error: "file-name-invalid" }, 400, origin)
  }

  const token = request.headers.get("X-Turnstile-Token") || ""
  const ip = request.headers.get("CF-Connecting-IP") || ""
  const blocked = await enforceGate(env, token, ip, origin)
  if (blocked) return blocked

  await pruneStoredFiles(env, ctx)

  const key = `${STORAGE_PREFIX}${crypto.randomUUID()}.${extension}`
  const url = await presignS3(env, {
    method: "PUT",
    key,
    expires: UPLOAD_URL_TTL_SECONDS,
  })

  return json(
    { ok: true, key, url, maxBytes: STORAGE_MAX_BYTES, expiresIn: UPLOAD_URL_TTL_SECONDS },
    200,
    origin
  )
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin")
    const originAllowed = Boolean(origin && ALLOWED_ORIGINS.includes(origin))

    if (request.method === "OPTIONS") {
      if (!originAllowed) {
        return new Response(null, { status: 403, headers: corsHeaders(null) })
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    // File uploads get their own presigned URL; everything else is the form.
    if (request.url.includes("/upload-url")) {
      if (!originAllowed && origin) {
        return json({ ok: false, error: "Origin not allowed" }, 403, origin)
      }
      return handleUploadUrl(request, env, ctx, origin)
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

    // When the client sends the token as a header, the gate runs before the
    // body is read, so an unauthenticated request cannot push megabytes
    // through the Worker. Bodies carrying the token inline fall back to the
    // legacy order further down.
    const ip = request.headers.get("CF-Connecting-IP") || ""
    const headerToken = request.headers.get("X-Turnstile-Token") || ""
    if (headerToken) {
      const blocked = await enforceGate(env, headerToken, ip, origin)
      if (blocked) return blocked
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

    if (!name || name.length > LIMITS.name) {
      return json({ ok: false, error: "Invalid name" }, 400, origin)
    }
    if (!email || email.length > LIMITS.email || !isEmail(email)) {
      return json({ ok: false, error: "Invalid email" }, 400, origin)
    }
    if (!message || message.length > LIMITS.message) {
      return json({ ok: false, error: "Invalid message" }, 400, origin)
    }

    if (!headerToken) {
      const bodyToken =
        typeof data.turnstileToken === "string" ? data.turnstileToken : ""
      const blocked = await enforceGate(env, bodyToken, ip, origin)
      if (blocked) return blocked
    }

    // Files arrive either as `files: [{ key, name, size }]` from direct uploads
    // to object storage, or as one inline base64 `attachment` on the fallback
    // path. Storage links are preferred: they carry no type or size ceiling.
    const storedFiles = []

    if (storageConfigured(env)) {
      const rawFiles = Array.isArray(data.files) ? data.files : []
      const legacyKey =
        typeof data.fileKey === "string" &&
        /^uploads\/[0-9a-f-]{36}\.[a-z0-9]{1,8}$/.test(data.fileKey)
          ? { key: data.fileKey, name: data.fileName, size: data.fileSize }
          : null

      const candidates = (rawFiles.length ? rawFiles : legacyKey ? [legacyKey] : []).slice(
        0,
        MAX_STORED_FILES
      )

      for (const candidate of candidates) {
        const key = typeof candidate?.key === "string" ? candidate.key : ""
        if (!/^uploads\/[0-9a-f-]{36}\.[a-z0-9]{1,8}$/.test(key)) {
          return json({ ok: false, error: "Invalid file reference" }, 400, origin)
        }
        const size = Number(candidate?.size)
        const fileName =
          typeof candidate?.name === "string"
            ? candidate.name.trim().slice(0, LIMITS.fileName)
            : "attachment"

        storedFiles.push({
          name: fileName || "attachment",
          size: Number.isFinite(size) && size > 0 ? size : 0,
          url: await presignS3(env, {
            method: "GET",
            key,
            expires: DOWNLOAD_URL_TTL_SECONDS,
          }),
          days: Math.round(DOWNLOAD_URL_TTL_SECONDS / 86400),
        })
      }
    }

    const parsedAttachment = parseAttachment(data.attachment)
    if (!parsedAttachment.ok) {
      return json({ ok: false, error: parsedAttachment.error }, 400, origin)
    }
    const attachment = storedFiles.length ? null : parsedAttachment.attachment

    // Archives are not accepted as attachments: Gmail bounces a .zip with a
    // 552 content block after Brevo has already answered 201, so the sender
    // would see a success that never arrives. Archives go through storage.
    const attachmentForEmail = attachment

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />")

    const storedFilesHtml = storedFiles.length
      ? `<p><strong>Files</strong> (links expire in ${storedFiles[0].days} days):</p><ul>${storedFiles
          .map(
            (file) =>
              `<li>${escapeHtml(file.name)} (${formatBytes(file.size)}) — <a href="${file.url}">download</a></li>`
          )
          .join("")}</ul>`
      : ""
    const fileHtml = storedFilesHtml
      ? storedFilesHtml
      : attachmentForEmail
        ? `<p><strong>Attachment:</strong> ${escapeHtml(attachmentForEmail.name)} (${formatBytes(attachmentForEmail.size)})</p>`
        : ""
    const attachmentText = storedFiles.length
      ? `\nFiles:\n${storedFiles
          .map((file) => `- ${file.name} (${formatBytes(file.size)}): ${file.url}`)
          .join("\n")}\nLinks expire in ${storedFiles[0].days} days.`
      : attachmentForEmail
        ? `\nAttachment: ${attachmentForEmail.name} (${formatBytes(attachmentForEmail.size)})`
        : ""

    const ownerHtml = `
      <h2>New portfolio message</h2>
      <p><strong>Name:</strong> ${safeName}<br />
      <strong>Email:</strong> ${safeEmail}</p>
      ${fileHtml}
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `

    const confirmationHtml = buildConfirmationHtml({
      name: safeName,
      message: safeMessage,
      attachment: attachmentForEmail,
      files: storedFiles,
    })
    const confirmationText = buildConfirmationText({
      name,
      message,
      attachment: attachmentForEmail,
      files: storedFiles,
    })

    let ownerMessageId = ""
    try {
      const sent = await sendBrevo(env.BREVO_API_KEY, {
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: OWNER_EMAIL, name: SENDER_NAME }],
        replyTo: { email, name },
        subject: `New portfolio message from ${name}`,
        htmlContent: ownerHtml,
        textContent: `Name: ${name}\nEmail: ${email}${attachmentText}\n\n${message}`,
        ...(attachmentForEmail
          ? { attachment: [{ name: attachmentForEmail.name, content: attachmentForEmail.content }] }
          : {}),
      })
      ownerMessageId = typeof sent?.messageId === "string" ? sent.messageId : ""
      // Reference only: never log names, addresses, or file contents.
      console.log(
        `contact owner send ok messageId=${ownerMessageId || "unknown"} attachment=${attachment ? "yes" : "no"}`
      )
    } catch (error) {
      console.log(
        `contact owner send failed status=${error?.status ?? "?"} attachment=${attachment ? "yes" : "no"} detail=${String(error?.detail ?? error?.message ?? "").slice(0, 120)}`
      )
      if (error instanceof BrevoError && error.attachmentRejected) {
        return json(
          {
            ok: false,
            error: "attachment-rejected",
            message: "The mail provider refused the attached file.",
          },
          415,
          origin
        )
      }
      return json({ ok: false, error: "Could not send message" }, 502, origin)
    }

    let confirmationSent = true
    try {
      const sent = await sendBrevo(env.BREVO_API_KEY, {
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email, name }],
        // Replies from the visitor must reach the owner's inbox, not the
        // no-reply sender address.
        replyTo: { email: OWNER_EMAIL, name: SENDER_NAME },
        subject: "Thanks for contacting Yash",
        htmlContent: confirmationHtml,
        textContent: confirmationText,
        // The visitor gets a copy of what they sent, including the file.
        ...(attachmentForEmail
          ? { attachment: [{ name: attachmentForEmail.name, content: attachmentForEmail.content }] }
          : {}),
      })
      const confirmationMessageId =
        typeof sent?.messageId === "string" ? sent.messageId : "unknown"
      console.log(`contact confirmation send ok messageId=${confirmationMessageId}`)
    } catch (error) {
      console.log(
        `contact confirmation send failed status=${error?.status ?? "?"} detail=${String(error?.detail ?? error?.message ?? "").slice(0, 120)}`
      )
      confirmationSent = false
    }

    return json(
      {
        ok: true,
        confirmationSent,
        // First 8 characters are enough to find the message in Brevo's log.
        reference: ownerMessageId
          ? ownerMessageId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)
          : "",
        attachmentSent: Boolean(storedFiles.length || attachment),
        fileCount: storedFiles.length,
        fileMode: storedFiles.length ? "link" : attachmentForEmail ? "attached" : "none",
      },
      200,
      origin
    )
  },
}
