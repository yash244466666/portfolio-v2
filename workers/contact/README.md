# Contact Worker

Cloudflare Worker that accepts the portfolio contact form, verifies a Turnstile
token, rate-limits by IP, and sends two emails through Brevo:

1. an owner notification to `md.mohi.minul.islam.yash@gmail.com` with `Reply-To`
   set to the visitor, and
2. a confirmation to the visitor with `Reply-To` set to the owner address.

Only the recipient is the owner's Gmail. The `From` address stays
`info@yashcodes.com`, because Brevo can only send on behalf of the domain
authenticated there (SPF/DKIM/DMARC).

It is separate from the Next.js static export. The site only knows the Worker's
public URL (`NEXT_PUBLIC_CONTACT_ENDPOINT`) and the Turnstile site key
(`NEXT_PUBLIC_TURNSTILE_SITE_KEY`); no secrets are shipped to the browser.

## Endpoint

Deployed at `https://portfolio.fancy-smoke-21db.workers.dev`.

`POST` is accepted on any path, so `https://portfolio.fancy-smoke-21db.workers.dev`
works as the endpoint. `OPTIONS` handles CORS preflight.

## Request and response

`POST` with `Content-Type: application/json`:

```json
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "message": "Hello...",
  "turnstileToken": "...",
  "attachment": { "name": "brief.pdf", "content": "<base64>" },
  "website": ""
}
```

`website` is the honeypot and must stay empty. Extra fields are ignored.

`turnstileToken` may also be sent as the `X-Turnstile-Token` header, which the
site does: the Worker then verifies it *before* reading the body, so an
unauthenticated request cannot push megabytes through the Worker. The inline
field is still accepted for older clients.

`attachment` is optional and carries one file:

- `content` is base64, without a `data:` prefix. The Worker strips whitespace,
  so wrapped base64 is fine.
- 4 MB maximum decoded (`MAX_ATTACHMENT_BYTES`); the whole body is capped at
  6 MB (`MAX_BODY_BYTES`).
- Extensions: `pdf, doc, docx, odt, txt, csv, md, xls, xlsx, ppt, pptx, png,
  jpg, jpeg, gif, webp`. The browser's MIME type is ignored. Archives are not
  accepted: Gmail bounces a `.zip` with a 552 content block after Brevo has
  already answered `201`, so the sender would see a success that never
  arrives.
- The file is attached to both emails: the owner notification and the
  visitor confirmation, so the sender keeps a copy of what they sent. Each
  submission with a file therefore costs two Brevo sends with a payload.

Keep `lib/contact/attachment.ts` in sync with those limits, or a file will pass
the client check and be rejected after the upload.

```json
{ "ok": true, "confirmationSent": true, "reference": "20261101", "attachmentSent": true }
{ "ok": false, "error": "Invalid message" }
```

`reference` is the first eight characters of Brevo's `messageId` — the value to
search for in **Transactional → Logs** when a message does not arrive.

Statuses: `200` success, `400` invalid payload or attachment, `403`
CORS/Turnstile failure, `413` body over 6 MB, `415` attachment refused by the
provider, `429` rate limited, `502` Brevo failure.

Cloudflare's free plan allows 10 ms of CPU per invocation. Parsing a body near
the 6 MB ceiling can approach that, so very large attachments may fail on the
free plan; a paid plan raises the limit.

## CORS

Only `https://yashcodes.com`, `https://www.yashcodes.com`,
`https://beta.yashcodes.com`, and `http://localhost:3000` are allowed. Other
`OPTIONS` requests get `403`.

## Secrets (Worker settings, never in git)

Set these in the Cloudflare dashboard under **Workers & Pages → portfolio →
Settings → Variables and Secrets**, or with `wrangler secret put`:

- `BREVO_API_KEY` — Brevo API v3 key.
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret key.

## KV rate limit

The Worker uses the optional `RATE_LIMIT` KV binding for 5 submissions per IP
per hour. Bind a KV namespace with the variable name `RATE_LIMIT` in the Worker
settings. Without the binding, rate limiting is skipped.


## Email templates

The visitor confirmation is rendered by `buildConfirmationHtml({ name, message })`
and `buildConfirmationText({ name, message })` in `src/index.js`, with the brand
palette in the `BRAND` constant above them.

They are written for email clients, not browsers: inline styles only, table
layout, 600 px shell, no external images or web fonts, and an explicit dark
`color-scheme`. Keep both builders in sync — every send carries the HTML and
the plain-text twin. `name` and `message` arrive already HTML-escaped, and
`message` keeps its `<br />` line breaks.

## Deploy

The production Worker is deployed from this file through the dashboard's Quick
Edit. When the source changes, paste `src/index.js` into the dashboard editor and
deploy. A `wrangler deploy` setup can be added later.

Do not log message bodies or email addresses in Worker logs; the source avoids
logging request content.

## Local checks

These requests are safe (no email is sent):

```bash
BASE=https://portfolio.fancy-smoke-21db.workers.dev

curl -i "$BASE"                                   # 405
curl -i -X OPTIONS -H "Origin: https://beta.yashcodes.com" \
  -H "Access-Control-Request-Method: POST" "$BASE" # 204
curl -i -X OPTIONS -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: POST" "$BASE" # 403
curl -i -X POST -H "Content-Type: application/json" \
  --data '{"name":"","email":"x","message":""}' "$BASE" # 400
```

A valid end-to-end test needs a real Turnstile token and sends two emails; run it
only with an inbox you control.
