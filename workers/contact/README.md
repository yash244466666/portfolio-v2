# Contact Worker

Cloudflare Worker that accepts the portfolio contact form, verifies a Turnstile
token, rate-limits by IP, and sends two emails through Brevo:

1. an owner notification to `info@yashcodes.com` with `Reply-To` set to the
   visitor, and
2. a confirmation to the visitor with `Reply-To` set to the owner.

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
  "website": ""
}
```

`website` is the honeypot and must stay empty. Extra fields are ignored.

```json
{ "ok": true, "confirmationSent": true }
{ "ok": false, "error": "Invalid message" }
```

Statuses: `200` success, `400` invalid payload, `403` CORS/Turnstile failure,
`413` body over 32KB, `429` rate limited, `502` Brevo failure.

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
