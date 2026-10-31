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
  "zip",
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
 * Extensions Gmail reliably rejects as email attachments with a 552 "content
 * presents a potential security issue" bounce. Brevo has already accepted the
 * send at that point, so the failure is invisible unless the file travels as a
 * link instead.
 */
const ARCHIVE_EXTENSIONS = ["zip"]

/** How long a link-hosted file stays downloadable. */
const FILE_TTL_SECONDS = 7 * 24 * 60 * 60

function makeFileToken() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Stash the file in the optional `FILES` KV namespace and return a link.
 * Returns `null` when no binding is configured, so the caller can fall back
 * to attaching the file.
 */
async function storeFile(env, request, attachment) {
  if (!env.FILES) return null

  const token = makeFileToken()
  await env.FILES.put(
    `file:${token}`,
    JSON.stringify({ name: attachment.name, content: attachment.content }),
    { expirationTtl: FILE_TTL_SECONDS }
  )

  return {
    name: attachment.name,
    size: attachment.size,
    url: `${new URL(request.url).origin}/download/${token}`,
    days: Math.round(FILE_TTL_SECONDS / 86400),
  }
}

function base64ToBytes(content) {
  const binary = atob(content)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

/**
 * Serve a stored file. Always `application/octet-stream` with an attachment
 * disposition: the stored type is visitor-supplied and must never render
 * inline in the browser.
 */
async function serveFile(env, token) {
  const notFound = () =>
    new Response("This file has expired or does not exist.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })

  if (!env.FILES || !/^[a-f0-9]{32}$/.test(token)) return notFound()

  const raw = await env.FILES.get(`file:${token}`)
  if (!raw) return notFound()

  let stored
  try {
    stored = JSON.parse(raw)
  } catch {
    return notFound()
  }
  if (!stored || typeof stored.content !== "string") return notFound()

  const bytes = base64ToBytes(stored.content)
  const fileName = String(stored.name || "attachment").replace(/[^\w.\- ]/g, "_")

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
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
function buildConfirmationHtml({ name, message, attachment, fileLink }) {
  const { font, background, surface, quoteSurface, border, foreground, body, muted, faint, accent, siteUrl, wordmark, resumeUrl, resumeLabel } = BRAND

  // `attachment.name` is already stripped of path segments and control
  // characters; escape it anyway, it is still visitor-supplied text.
  const attachmentDetail = attachment
    ? ` <span style="color:${muted};">Attached:</span> <strong style="color:${foreground};">${escapeHtml(attachment.name)}</strong> <span style="color:${faint};">(${formatBytes(attachment.size)})</span>`
    : fileLink
      ? ` <span style="color:${muted};">File:</span> <strong style="color:${foreground};">${escapeHtml(fileLink.name)}</strong> <span style="color:${faint};">(${formatBytes(fileLink.size)})</span><br /><a href="${fileLink.url}" style="color:${foreground};text-decoration:underline;">Download your file</a> <span style="color:${faint};">— link expires in ${fileLink.days} days.</span>`
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
function buildConfirmationText({ name, message, attachment, fileLink }) {
  const attachmentLine = attachment
    ? `\n\nAttached: ${attachment.name} (${formatBytes(attachment.size)})`
    : fileLink
      ? `\n\nFile: ${fileLink.name} (${formatBytes(fileLink.size)})\nDownload your file: ${fileLink.url}\nThis link expires in ${fileLink.days} days.`
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

    // File links are opened top-level from an email, so they are a plain GET
    // with no CORS involvement.
    if (request.method === "GET") {
      const path = new URL(request.url).pathname
      if (path.startsWith("/download/")) {
        return serveFile(env, path.slice("/download/".length))
      }
      return new Response("Not found", { status: 404 })
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

    const parsedAttachment = parseAttachment(data.attachment)
    if (!parsedAttachment.ok) {
      return json({ ok: false, error: parsedAttachment.error }, 400, origin)
    }
    const attachment = parsedAttachment.attachment

    // Gmail bounces messages whose attachments trip its content scan (552),
    // archives included, and Brevo has already accepted the send by then — so
    // the failure never surfaces. Archives therefore travel as a link when a
    // FILES binding exists; everything else is still attached as before.
    let attachmentForEmail = attachment
    let fileLink = null
    if (attachment && ARCHIVE_EXTENSIONS.includes(attachment.extension)) {
      fileLink = await storeFile(env, request, attachment)
      if (fileLink) {
        attachmentForEmail = null
      } else {
        return json(
          {
            ok: false,
            error: "attachment-rejected",
            message:
              "Archives cannot be sent as attachments. Upload a PDF or image instead.",
          },
          415,
          origin
        )
      }
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />")

    const fileHtml = attachmentForEmail
      ? `<p><strong>Attachment:</strong> ${escapeHtml(attachmentForEmail.name)} (${formatBytes(attachmentForEmail.size)})</p>`
      : fileLink
        ? `<p><strong>File:</strong> ${escapeHtml(fileLink.name)} (${formatBytes(fileLink.size)})<br />
      <a href="${fileLink.url}">${fileLink.url}</a> — expires in ${fileLink.days} days.</p>`
        : ""
    const attachmentText = attachmentForEmail
      ? `\nAttachment: ${attachmentForEmail.name} (${formatBytes(attachmentForEmail.size)})`
      : fileLink
        ? `\nFile: ${fileLink.name} (${formatBytes(fileLink.size)})\nDownload: ${fileLink.url} (expires in ${fileLink.days} days)`
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
      fileLink,
    })
    const confirmationText = buildConfirmationText({
      name,
      message,
      attachment: attachmentForEmail,
      fileLink,
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
        attachmentSent: Boolean(attachment),
        attachmentMode: attachmentForEmail ? "attached" : fileLink ? "link" : "none",
      },
      200,
      origin
    )
  },
}
