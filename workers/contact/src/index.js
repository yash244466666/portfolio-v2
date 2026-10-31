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
async function enforceGate(env, token, ip, origin, options = {}) {
  const { bucket = "submit", limit = 5 } = options

  if (!token) {
    return json({ ok: false, error: "Missing captcha" }, 400, origin)
  }

  const human = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip)
  if (!human) {
    return json({ ok: false, error: "Captcha failed" }, 403, origin)
  }

  // Optional KV rate limit, counted per bucket: presigning runs once per file,
  // so it needs a budget of its own or one five-file message would use up the
  // whole hour and every retry afterwards would fail.
  if (env.RATE_LIMIT && ip) {
    const key = `rate:${bucket}:${ip}`
    const used = Number((await env.RATE_LIMIT.get(key)) || "0")
    if (used >= limit) {
      return json(
        {
          ok: false,
          error: "rate-limited",
          message: "Too many attempts. Try again later.",
        },
        429,
        origin
      )
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
          .join("")}`
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
          .join("\n")}`
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

const STORAGE_MAX_BYTES = 100 * 1024 * 1024
const MAX_STORED_FILES = 5
const UPLOAD_URL_TTL_SECONDS = 1800
/** AWS caps presigned URL lifetime at 7 days; Garage follows the same rule. */
const DOWNLOAD_URL_TTL_SECONDS = 7 * 24 * 60 * 60
const STORAGE_PREFIX = "uploads/"

/** Keep the original file name in the object path; downloads use it. */
function safeFileName(name) {
  const base = String(name || "").split(/[\\/]/).pop() || "file"
  return (
    base
      .replace(/[\u0000-\u001f\u007f"]/g, "")
      .replace(/[^\w.\- ()]/g, "_")
      .trim()
      .slice(0, 100) || "file"
  )
}

const STORED_KEY_PATTERN = /^uploads\/[0-9a-f-]{36}\/[^/]{1,120}$/
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
async function presignS3(env, { method, key, expires, query }) {
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, "")
  const url = new URL(`${endpoint}/${env.S3_BUCKET}/${key}`)
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "")
  const dateStamp = amzDate.slice(0, 8)
  const scope = `${dateStamp}/${env.S3_REGION}/s3/aws4_request`

  // Every query parameter is part of the signature, and S3 requires the
  // canonical form to be sorted by name with RFC 3986 encoding (no `+` for
  // spaces). Stuffing `?list-type=2` into `key` silently dropped it, which made
  // a prefixed listing return the whole bucket.
  const params = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${env.S3_ACCESS_KEY}/${scope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expires)],
    ["X-Amz-SignedHeaders", "host"],
    ...(query ? [...new URLSearchParams(query).entries()] : []),
  ]
    .map(([name, value]) => [encodeURIComponent(name), encodeURIComponent(value)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  const canonicalQuery = params.map(([name, value]) => `${name}=${value}`).join("&")

  const canonicalRequest = [
    method,
    url.pathname,
    canonicalQuery,
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

  return `${url.origin}${url.pathname}?${canonicalQuery}&X-Amz-Signature=${signature}`
}

/** Delete objects older than the retention window. Best effort, never fatal. */
async function pruneStoredFiles(env, ctx) {
  const run = async () => {
    try {
      const listUrl = await presignS3(env, {
        method: "GET",
        key: "",
        expires: 300,
        query: `list-type=2&prefix=${encodeURIComponent(STORAGE_PREFIX)}`,
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
        if (!STORED_KEY_PATTERN.test(key)) continue
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

/**
 * Turnstile tokens are single-use: verifying one at presign time leaves nothing
 * for the form submit. Presigning therefore mints a short-lived ticket bound to
 * the object key, and the submit accepts valid tickets in place of a second
 * token.
 */
const UPLOAD_TICKET_TTL_SECONDS = 60 * 60

async function signUploadTicket(env, key) {
  const expires = Math.floor(Date.now() / 1000) + UPLOAD_TICKET_TTL_SECONDS
  const payload = `${key}:${expires}`
  const secret = env.TURNSTILE_SECRET_KEY || "ticket"
  return `${expires}.${toHex(await hmacSha256(secret, payload))}`
}

async function verifyUploadTicket(env, key, ticket) {
  if (typeof ticket !== "string") return false
  const [expiresRaw, signature] = ticket.split(".")
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || expires * 1000 < Date.now()) return false

  const secret = env.TURNSTILE_SECRET_KEY || "ticket"
  const expected = toHex(await hmacSha256(secret, `${key}:${expires}`))
  if (expected.length !== (signature ?? "").length) return false

  // Constant-time-ish comparison.
  let diff = 0
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ signature.charCodeAt(index)
  }
  return diff === 0
}

/**
 * `POST /upload-url` — validate files and hand back presigned PUTs.
 *
 * One call for the whole message: a Turnstile token authorises exactly one
 * request, so asking per file made every file after the first fail.
 */
async function handleUploadUrl(request, env, ctx, origin) {
  if (!storageConfigured(env)) {
    return json({ ok: false, error: "storage-unavailable" }, 501, origin)
  }

  let data
  try {
    data = await request.json()
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400, origin)
  }

  const requested = Array.isArray(data?.files)
    ? data.files
    : data?.name
      ? [{ name: data.name, size: data.size }]
      : []

  if (requested.length === 0) {
    return json({ ok: false, error: "Invalid file" }, 400, origin)
  }
  if (requested.length > MAX_STORED_FILES) {
    return json(
      { ok: false, error: "too-many-files", maxFiles: MAX_STORED_FILES },
      400,
      origin
    )
  }

  // Validate everything before signing anything.
  const plans = []
  for (const file of requested) {
    const name = typeof file?.name === "string" ? file.name.trim() : ""
    const size = Number(file?.size)
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
    plans.push({ name, size, extension })
  }

  const token = request.headers.get("X-Turnstile-Token") || ""
  const ip = request.headers.get("CF-Connecting-IP") || ""
  const blocked = await enforceGate(env, token, ip, origin, {
    bucket: "upload",
    limit: 24,
  })
  if (blocked) return blocked

  await pruneStoredFiles(env, ctx)

  const uploads = []
  for (const plan of plans) {
    const key = `${STORAGE_PREFIX}${crypto.randomUUID()}/${safeFileName(plan.name)}`
    uploads.push({
      name: plan.name,
      key,
      url: await presignS3(env, {
        method: "PUT",
        key,
        expires: UPLOAD_URL_TTL_SECONDS,
      }),
      ticket: await signUploadTicket(env, key),
    })
  }

  return json(
    {
      ok: true,
      uploads,
      maxBytes: STORAGE_MAX_BYTES,
      maxFiles: MAX_STORED_FILES,
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    },
    200,
    origin
  )
}


/* =============================================================================
   Admin page — browse, download and delete stored uploads
   =============================================================================
   A tiny management UI for the bucket. Garage has no web console of its own and
   MinIO cannot be installed on vps-2, so this lives here where the S3
   credentials and the SigV4 signer already are.

   Requires the ADMIN_PASSWORD Worker secret. Without it the page answers 503.
   ========================================================================== */

const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60
const ADMIN_COOKIE = "portfolio_admin"

function parseCookies(header) {
  const out = {}
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=")
    if (index === -1) continue
    out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim())
  }
  return out
}

async function adminSign(env, scope, expires) {
  return toHex(await hmacSha256(env.ADMIN_PASSWORD, `${scope}:${expires}`))
}

async function issueSession(env) {
  const expires = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS
  return { expires, token: `${expires}.${await adminSign(env, "session", expires)}` }
}

async function sessionValid(env, value) {
  if (typeof value !== "string") return false
  const [expiresRaw, signature] = value.split(".")
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || expires * 1000 < Date.now()) return false
  const expected = await adminSign(env, "session", expires)
  if (!signature || signature.length !== expected.length) return false
  let diff = 0
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ signature.charCodeAt(index)
  }
  return diff === 0
}

function passwordMatches(candidate, expected) {
  if (typeof candidate !== "string" || typeof expected !== "string") return false
  if (candidate.length !== expected.length) return false
  let diff = 0
  for (let index = 0; index < expected.length; index += 1) {
    diff |= candidate.charCodeAt(index) ^ expected.charCodeAt(index)
  }
  return diff === 0
}

async function listStoredObjects(env) {
  const url = await presignS3(env, {
    method: "GET",
    key: "",
    expires: 300,
    query: `list-type=2&prefix=${encodeURIComponent(STORAGE_PREFIX)}&max-keys=1000`,
  })
  const response = await fetch(url)
  if (!response.ok) {
    let body = ""
    try {
      body = (await response.text()).slice(0, 200)
    } catch {
      body = ""
    }
    return { error: `list ${response.status}: ${body}` }
  }
  const xml = await response.text()

  return {
    files: [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(([, entry]) => ({
      key: /<Key>([^<]+)<\/Key>/.exec(entry)?.[1] ?? "",
      size: Number(/<Size>(\d+)<\/Size>/.exec(entry)?.[1] ?? 0),
      modified: /<LastModified>([^<]+)<\/LastModified>/.exec(entry)?.[1] ?? "",
    })),
  }
}

function htmlPage(body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<title>Uploads · Yash</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0a0a0a; color: #fafafa; font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  main { max-width: 900px; margin: 0 auto; padding: 40px 16px 64px; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.02em; }
  p.sub { margin: 0 0 24px; color: #a3a3a3; font-size: 14px; }
  .card { background: #171717; border: 1px solid #262626; border-radius: 10px; padding: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 12px 8px; border-bottom: 1px solid #262626; font-size: 14px; }
  th { color: #a3a3a3; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
  tr:last-child td { border-bottom: 0; }
  .name { word-break: break-all; }
  .muted { color: #737373; font-size: 13px; }
  a { color: #fafafa; }
  button, input[type="password"] { font: inherit; }
  input[type="password"] { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #333; background: #0f0f0f; color: #fafafa; }
  .btn { display: inline-block; padding: 10px 18px; border-radius: 8px; border: 0; background: #fafafa; color: #0a0a0a; font-weight: 600; cursor: pointer; }
  .btn-ghost { background: transparent; color: #a3a3a3; border: 1px solid #333; font-weight: 500; }
  .btn-danger { background: transparent; color: #f87171; border: 1px solid #4a2020; font-weight: 500; }
  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .error { color: #fca5a5; font-size: 14px; margin: 0 0 12px; }
  form.inline { display: inline; }
</style></head><body><main>${body}</main></body></html>`
}

function escapeAdmin(value) {
  return escapeHtml(String(value ?? ""))
}

function loginPage(base, message = "") {
  return htmlPage(`
  <h1>Uploads</h1>
  <p class="sub">Sign in to manage the contact-form files.</p>
  <div class="card" style="max-width:420px">
    ${message ? `<p class="error">${escapeAdmin(message)}</p>` : ""}
    <form method="POST" action="${base}/login">
      <label for="password" class="muted">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />
      <div style="margin-top:14px"><button class="btn" type="submit">Sign in</button></div>
    </form>
  </div>`)
}

function storagePage({ files, csrf, totalBytes, base }) {
  const rows = files.length
    ? files
        .map((file) => {
          const name = file.key.split("/").pop() ?? file.key
          return `<tr>
      <td class="name">${escapeAdmin(name)}</td>
      <td class="muted">${formatBytes(file.size)}</td>
      <td class="muted">${escapeAdmin(file.modified.replace("T", " ").slice(0, 16))}</td>
      <td>
        <div class="row">
          <a class="btn btn-ghost" href="/file/${file.key.split("/").map(encodeURIComponent).join("/")}">Download</a>
          <form class="inline" method="POST" action="${base}/delete">
            <input type="hidden" name="key" value="${escapeAdmin(file.key)}" />
            <input type="hidden" name="csrf" value="${escapeAdmin(csrf)}" />
            <button class="btn btn-danger" type="submit">Delete</button>
          </form>
        </div>
      </td>
    </tr>`
        })
        .join("")
    : `<tr><td colspan="4" class="muted">No uploads yet.</td></tr>`

  return htmlPage(`
  <div class="row" style="justify-content:space-between;margin-bottom:6px">
    <h1 style="margin:0">Uploads</h1>
    <form class="inline" method="POST" action="${base}/logout"><button class="btn btn-ghost" type="submit">Sign out</button></form>
  </div>
  <p class="sub">${files.length} file${files.length === 1 ? "" : "s"} · ${formatBytes(totalBytes)} stored</p>
  <div class="card"><table>
    <thead><tr><th>File</th><th>Size</th><th>Uploaded</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`)
}

async function handleAdmin(request, env, origin) {
  if (!env.ADMIN_PASSWORD) {
    return new Response("Admin is not configured.", { status: 503 })
  }

  const url = new URL(request.url)
  // Served both at the Worker's /admin and, through Caddy, at
  // yashcodes.com/manage. Links and form actions follow the prefix in use.
  const base = url.pathname.startsWith("/manage") ? "/manage" : "/admin"
  const cookies = parseCookies(request.headers.get("Cookie"))
  const signedIn = await sessionValid(env, cookies[ADMIN_COOKIE])

  if (request.method === "GET") {
    if (!signedIn) {
      return new Response(loginPage(base), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    }

    const listing = await listStoredObjects(env)
    if (listing.error) {
      // Say what broke; "storage is unavailable" hid the status and body.
      return new Response(
        htmlPage(`<h1>Uploads</h1><p class="sub">Could not list the bucket.</p><div class="card"><pre style="white-space:pre-wrap;word-break:break-word;margin:0;color:#fca5a5;font-size:13px">${escapeAdmin(listing.error)}</pre></div>`),
        { status: 502, headers: { "Content-Type": "text/html; charset=utf-8" } }
      )
    }
    const files = listing.files
    const csrf = await adminSign(env, "csrf", cookies[ADMIN_COOKIE].split(".")[0])
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
    return new Response(storagePage({ files, csrf, totalBytes, base }), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    })
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const form = await request.formData()
  const ip = request.headers.get("CF-Connecting-IP") || ""

  if (url.pathname === `${base}/login`) {
    if (env.RATE_LIMIT && ip) {
      const key = `admin-login:${ip}`
      const used = Number((await env.RATE_LIMIT.get(key)) || "0")
      if (used >= 10) {
        return new Response(loginPage(base, "Too many attempts. Try again later."), {
          status: 429,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        })
      }
      await env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 3600 })
    }

    if (!passwordMatches(String(form.get("password") ?? ""), env.ADMIN_PASSWORD)) {
      return new Response(loginPage(base, "Wrong password."), {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    }

    const session = await issueSession(env)
    return new Response(null, {
      status: 303,
      headers: {
        Location: base,
        "Set-Cookie": `${ADMIN_COOKIE}=${session.token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ADMIN_SESSION_TTL_SECONDS}`,
      },
    })
  }

  if (!signedIn) return new Response("Sign in first.", { status: 403 })

  if (url.pathname === `${base}/logout`) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: base,
        "Set-Cookie": `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      },
    })
  }

  if (url.pathname === `${base}/delete`) {
    const expires = cookies[ADMIN_COOKIE].split(".")[0]
    const expected = await adminSign(env, "csrf", expires)
    if (!passwordMatches(String(form.get("csrf") ?? ""), expected)) {
      return new Response("Bad request.", { status: 400 })
    }

    const key = String(form.get("key") ?? "")
    if (!STORED_KEY_PATTERN.test(key)) {
      return new Response("Bad request.", { status: 400 })
    }

    const deleteUrl = await presignS3(env, { method: "DELETE", key, expires: 300 })
    const deleted = await fetch(deleteUrl, { method: "DELETE" })
    if (!deleted.ok && deleted.status !== 204) {
      return new Response("Could not delete.", { status: 502 })
    }

    return new Response(null, { status: 303, headers: { Location: "/admin" } })
  }

  return new Response("Not found", { status: 404 })
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin")
    const originAllowed = Boolean(origin && ALLOWED_ORIGINS.includes(origin))

    // Admin page: HTML, cookie sessions, no CORS involvement.
    if (request.url.includes("/admin") || request.url.includes("/manage")) {
      return handleAdmin(request, env, origin)
    }

    if (request.method === "OPTIONS") {
      if (!originAllowed) {
        return new Response(null, { status: 403, headers: corsHeaders(null) })
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    // Permanent download links: sign on demand so the emailed URL never
    // expires, and let the redirect carry the object's real filename.
    if (request.method === "GET") {
      const path = new URL(request.url).pathname
      if (path.startsWith("/file/")) {
        const key = decodeURIComponent(path.slice("/file/".length))
        if (!STORED_KEY_PATTERN.test(key) || !storageConfigured(env)) {
          return new Response("Not found", { status: 404 })
        }
        const signed = await presignS3(env, {
          method: "GET",
          key,
          expires: DOWNLOAD_URL_TTL_SECONDS,
        })
        return Response.redirect(signed, 302)
      }
      return new Response("Not found", { status: 404 })
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

    // A submission whose files all carry valid upload tickets was already
    // verified at presign time, because a Turnstile token is single-use.
    const submittedFiles = Array.isArray(data.files) ? data.files : []
    const ticketsValid =
      submittedFiles.length > 0 &&
      (
        await Promise.all(
          submittedFiles.map((file) =>
            verifyUploadTicket(
              env,
              typeof file?.key === "string" ? file.key : "",
              file?.ticket
            )
          )
        )
      ).every(Boolean)

    if (!ticketsValid) {
      const bodyToken =
        typeof data.turnstileToken === "string" ? data.turnstileToken : ""
      const gateToken = headerToken || bodyToken
      if (!gateToken) {
        return json(
          { ok: false, error: "Missing captcha" },
          400,
          origin
        )
      }
      const blocked = await enforceGate(env, gateToken, ip, origin)
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
        STORED_KEY_PATTERN.test(data.fileKey)
          ? { key: data.fileKey, name: data.fileName, size: data.fileSize }
          : null

      const candidates = (rawFiles.length ? rawFiles : legacyKey ? [legacyKey] : []).slice(
        0,
        MAX_STORED_FILES
      )

      for (const candidate of candidates) {
        const key = typeof candidate?.key === "string" ? candidate.key : ""
        if (!STORED_KEY_PATTERN.test(key)) {
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
          // Permanent link: the Worker mints a fresh signature when it is
          // opened, so the emailed URL never expires.
          url: `${new URL(request.url).origin}/file/${key
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`,
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
      ? `<p><strong>Files</strong>:</p><ul>${storedFiles
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
          .join("\n")}`
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
