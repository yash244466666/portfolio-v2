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

## Files

Files are **not** attached to the emails. They follow a different path:

1. `POST /upload-url` with `{ name, size, type }` and the `X-Turnstile-Token`
   header. The Worker validates the size, applies the rate limit, and returns a
   presigned `PUT` valid for 30 minutes.
2. The browser `PUT`s the file straight to object storage. Nothing large passes
   through a Cloudflare Worker, so neither the body limit nor the CPU budget
   applies.
3. The form posts `files: [{ key, name, size }]` (up to five). The Worker signs a
   7-day `GET` for each and puts the links in both emails.

Storage limits: **1 GB per file, 5 files per message, any extension**. That is
the Worker's ceiling; the practical limit is the VPS disk and bandwidth.

Without the `S3_*` variables the endpoint answers `501` and the form falls back
to attaching one small file inline, which is why `attachment` still exists in
the payload:

```json
{ "ok": true, "confirmationSent": true, "reference": "20261101", "attachmentSent": true }
{ "ok": false, "error": "Invalid message" }
```

`reference` is the first eight characters of Brevo's `messageId` — the value to
search for in **Transactional → Logs** when a message does not arrive.

Statuses: `200` success, `400` invalid payload or attachment, `403`
CORS/Turnstile failure, `413` body over 6 MB, `415` attachment refused by the
provider, `429` rate limited, `501` storage not configured, `502` Brevo
failure.

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

## Object storage

Files live in **Garage** (S3-compatible) on vps-2, served at
`https://files.yashcodes.com`. Setup notes:

- `/opt/stacks/garage/docker-compose.yml` + `garage.toml`; S3 API bound to
  `127.0.0.1:3900`, admin API `127.0.0.1:3903`.
- Bucket `contact-uploads`, key `contact-uploader` with read/write on that
  bucket only.
- Caddy's `files.yashcodes.com` block proxies to `127.0.0.1:3900`, passes the
  original `Host` so SigV4 signatures match, answers CORS preflights for the
  site origins, caps request bodies at 2 GB, and forces
  `Content-Disposition: attachment` on every download so an uploaded `.html`
  can never render on that origin.

Worker variables needed for this path (Settings → Variables and Secrets):

| Name | Value |
|---|---|
| `S3_ENDPOINT` | `https://files.yashcodes.com` |
| `S3_REGION` | `garage` |
| `S3_BUCKET` | `contact-uploads` |
| `S3_ACCESS_KEY` | Garage key id |
| `S3_SECRET_KEY` | Garage secret |

Links expire after 7 days (AWS's presigned ceiling). Objects are deleted after
30 days by a best-effort prune that runs when a new upload URL is issued.

## Admin page

`GET /admin` is a small management UI for the bucket: sign in, then list every
stored upload with its name, size and date, download it again under its original
name, or delete it.

- Requires the `ADMIN_PASSWORD` Worker secret. With it unset the page answers
  `503` and does nothing else.
- The session cookie is `expiry.HMAC(password, expiry)`, HttpOnly, Secure,
  SameSite=Lax, valid for 12 hours.
- Deletes are `POST /admin/delete` with a CSRF token derived from the same
  secret, and only keys matching `uploads/<uuid>/<name>` are accepted.
- Failed logins are counted per IP through the `RATE_LIMIT` KV when it is bound
  (10 per hour).

The page lives here because Garage 2.1 ships no web console and MinIO cannot be
installed on vps-2 (Docker Hub no longer serves `minio/minio`, `dl.min.io`
returns 410).
