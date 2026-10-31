# Yash Sikdar — Portfolio & Browser Tools

Personal portfolio site and a catalog of **87 browser-based developer utilities**, built with Next.js App Router and exported as a fully static site.

- **Production:** https://yashcodes.com
- **Beta:** https://beta.yashcodes.com
- **Repository:** https://github.com/yash244466666/portfolio-v2

> **Deployment status (2026-10-31):** live on **vps-2** (`140.238.208.16`). `develop` deploys beta to `/opt/stacks/caddy/html/beta`; `main` deploys production to `/opt/stacks/caddy/html/production`. Both A records now point to vps-2 and Caddy has issued HTTPS certificates. DNS propagation is complete; clients that cached the old records may still see the old hosts until the TTL expires. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Contents

1. [Overview](#overview)
2. [Live sites and branch model](#live-sites-and-branch-model)
3. [Features](#features)
4. [Routes](#routes)
5. [Tech stack](#tech-stack)
6. [Tools catalog](#tools-catalog)
7. [Project structure](#project-structure)
8. [Local development](#local-development)
9. [Environment variables](#environment-variables)
10. [Build and static export](#build-and-static-export)
11. [CI/CD and deployment](#cicd-and-deployment)
12. [Verification](#verification)
13. [Telemetry](#telemetry)
14. [Security and privacy notes](#security-and-privacy-notes)
15. [Known issues and limitations](#known-issues-and-limitations)
16. [Conventions](#conventions)
17. [Contact](#contact)

## Overview

This repository contains one application with two public routes:

- **`/`** — an animated, dark-themed single-page portfolio with loading, navigation, hero, about, projects, contact, footer, and back-to-top sections.
- **`/tools/`** — a searchable catalog of 87 client-side utilities with category navigation, a cinematic horizontal desktop scroller, a normal stacked mobile layout, hash-addressable tool views, and lazy-loaded implementations.

The frontend is designed to be exported as static files. There is **no server runtime, API route, or backend in this repository**. The contact form opens the visitor's email client with a prefilled `mailto:` message.

The UI is animation-heavy and predominantly client-rendered. Reduced-motion behavior, keyboard navigation, mobile layouts, and static-export compatibility are first-class requirements.

## Live sites and branch model

| Branch | Role | Deploys to | URL |
|---|---|---|---|
| `develop` | Default development branch | `/opt/stacks/caddy/html/beta/` on vps-2 | https://beta.yashcodes.com |
| `main` | Stable / production branch | `/opt/stacks/caddy/html/production/` on vps-2 | https://yashcodes.com |

- `develop` is the default branch on GitHub. Day-to-day work happens on feature branches and is merged with a pull request.
- `main` receives release pull requests from `develop`.
- Both branches are protected: direct pushes are blocked (including for administrators), a pull request is required, and the `Build static site` check must pass. Force pushes and branch deletion are disabled.
- Every push to `develop` or `main` (including a PR merge) runs the deployment workflow.
- Pull requests run the build and type-check only; they never deploy.
- `main` merges are owner-only in practice because the repository owner is the only collaborator.

The old `master` branch was renamed to `main`; the remote `master` no longer exists.

## Features

### Portfolio (`/`)

- Full-screen loading screen with animated progress and a short fade.
- Fixed navigation with active-section tracking and mobile menu.
- Hero section with a cycling typewriter, CSS entrance animations, and scroll-to-section actions.
- About section with six skill groups and gradient background elements.
- Projects section with six featured project cards and image previews.
- Contact section with a `mailto:` form and contact detail cards.
- Footer with the computed current year.
- Back-to-top control.
- Custom cursor code exists but is intentionally disabled in `app/page.tsx`.

### Tools (`/tools/`)

- Search across labels, descriptions, categories, and tags.
- Category chips and grouped results.
- Cinematic pinned horizontal scrolling for desktop category sections.
- Normal stacked grid on screens below 768 px and for reduced-motion users.
- Hash-addressable tool views (`/tools/#<tool-id>`).
- Browser back restores the catalog scroll position.
- Lazy-loaded tool implementations with a loading spinner and an unavailable state.
- Reset remounts the active tool.
- Wide layout flag for tools that need more horizontal space.
- 44 px mobile touch targets, focus-visible rings, skip link, and semantic combobox/listbox/breadcrumb/progressbar roles.

### Backgrounds

There are 20 animated backgrounds. `NEXT_PUBLIC_BG_MODE` controls the mode:

- `switcher` — show the background selector; the choice persists in `localStorage` under `portfolio-bg`.
- `random` — pick a background on each page load.
- A valid background ID — lock the site to that background.

Available IDs: `aurora`, `particles`, `dotgrid`, `glass`, `waves`, `starfield`, `matrix`, `neural`, `fireflies`, `topography`, `rain`, `bokeh`, `vortex`, `ripple`, `neonrings`, `matrixrain`, `hexgrid`, `gradient`, `constellation`, `spotlight`.

Backgrounds use Canvas 2D, CSS, and anime.js. Reduced-motion users receive the static gradient fallback.

## Routes

| Route | Description |
|---|---|
| `/` | Animated portfolio |
| `/tools/` | Tools catalog and tool views |
| `/_not-found` | Static not-found page |

The site uses trailing slashes (`/tools/`, not `/tools`).

## Tech stack

### Core

| Package | Version | Purpose |
|---|---|---|
| `next` | 15.2.4 | App Router, static export |
| `react` / `react-dom` | ^19 | UI |
| `typescript` | ^5 | Strict type checking |
| `tailwindcss` | ^4.1.9 | Styling via the Tailwind PostCSS plugin |
| `tw-animate-css` | 1.3.3 | Tailwind animation utilities |
| `animejs` | ^4.3.6 | Selected background effects |
| `lucide-react` | ^0.454.0 | Icons |
| `@radix-ui/react-slot` | 1.1.1 | shadcn-style composition |
| `class-variance-authority` | ^0.7.1 | Variant styling |
| `clsx` + `tailwind-merge` | latest | Class composition through `cn` |

### Tool libraries

- CodeMirror 6 — JSON editor.
- `pdf-lib` and `pdfjs-dist` — PDF tools.
- `marked` + DOMPurify — sanitized Markdown rendering.
- DOMPurify — SVG sanitization.
- `mathjs` — calculator behavior.
- `diff` — text comparisons.
- `js-yaml` and `sql-formatter` — formatters.
- `qrcode` — QR generation.
- JSZip and `html-to-image` — export workflows.
- `js-sha1`, `js-sha256`, `js-sha512` — hashing.

There is no Three.js or React Three Fiber dependency in the current frontend.

### Package manager

- pnpm is the intended package manager (`pnpm-lock.yaml` and `pnpm-workspace.yaml`).
- CI uses Node 24 and pnpm 12.8.1.
- A `package-lock.json` also exists and can drift; do not regenerate either lockfile unless dependency work is explicitly in scope.

## Tools catalog

The catalog defines **87 tools** in `lib/content/tools/index.ts`:

| Category | Count |
|---|---:|
| Core | 7 |
| Developer | 45 |
| Text | 17 |
| Media | 3 |
| Security | 5 |
| Math and logic | 10 |
| **Total** | **87** |

Every catalog definition currently has a matching implementation under `components/tools/<category>/<tool-id>.tsx` or a directory entry such as the JSON editor.

Adding a tool requires:

1. Metadata in `lib/content/tools/index.ts`.
2. An icon mapping in `lib/content/tools/icon-map.ts` if the icon is new.
3. An implementation under `components/tools/<category>/`.
4. Shared primitives from `components/tools/shared` where appropriate.
5. Keyboard labels and reduced-motion handling.
6. A check of direct `/tools/#<id>` navigation, Reset, browser back, search, and mobile layout.

Some tools call external services:

- **Currency Converter** — Frankfurter exchange-rate API; caches rates.
- **DNS Lookup** — Cloudflare DNS-over-HTTPS.
- **YouTube Downloader** — sends the supplied URL to the Cobalt website and loads YouTube thumbnails.

The tools-page description saying everything runs locally is not universally accurate; use precise wording when editing it.

## Project structure

```text
portfolio-v2/
├── app/
│   ├── layout.tsx                 # Font, metadata, favicons, dark mode
│   ├── page.tsx                   # Home route orchestration and loading lifecycle
│   ├── globals.css                # Tailwind, tokens, keyframes, reduced motion
│   └── tools/
│       ├── page.tsx               # Tools route shell
│       └── loading.tsx
├── components/
│   ├── hero-section.tsx
│   ├── hero-section/
│   ├── about-section.tsx
│   ├── about-section/
│   ├── projects-section.tsx
│   ├── projects-section/
│   ├── contact-section.tsx
│   ├── contact-section/
│   ├── navigation.tsx
│   ├── navigation/
│   ├── backgrounds/
│   ├── tools/
│   │   ├── core/
│   │   ├── dev/
│   │   ├── text/
│   │   ├── media/
│   │   ├── security/
│   │   ├── math/
│   │   ├── shared/
│   │   ├── tool-view.tsx
│   │   ├── tools-grid.tsx
│   │   ├── tools-sections.tsx
│   │   ├── tools-toolbar.tsx
│   │   └── tools-page.tsx
│   └── ui/
├── hooks/
├── lib/
│   ├── content/
│   ├── tools/
│   ├── instrumentation.ts
│   ├── react-telemetry.ts
│   └── utils.ts
├── public/
│   ├── project images, favicons, placeholders
│   └── pdf.worker.min.mjs
├── docs/
│   └── DEPLOYMENT.md
├── .github/
│   └── workflows/
│       └── deploy.yml
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
└── tsconfig.json
```

Historical documents such as `BUG-REPORT.md`, `ANIMATION-MIGRATION-PLAN.md`, `SCROLL-DRIVEN-ANIMATION-GUIDE.md`, and `TESTING-GUIDE.md` describe earlier snapshots. Confirm their claims against current source before acting.

## Local development

### Prerequisites

- Node.js 24 or newer
- pnpm 12.8.1 (the version used by CI)

### Install and run

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The development server runs at `http://localhost:3000`.

### Useful commands

```bash
pnpm dev                              # Development server
pnpm build                            # Static export to out/
./node_modules/.bin/tsc --noEmit --incremental false   # Strict type check
```

`pnpm start` runs `next start`, which is not the normal production path for a static export. Serve or deploy `out/` instead.

### Tooling caveats

- The `lint` script runs `next lint`, while ESLint 9 expects a flat `eslint.config.*` file. Linting is currently not operational.
- `next.config.mjs` skips TypeScript and ESLint failures during `next build`. Run the standalone type check above; a successful build does not prove type correctness.
- `pnpm-workspace.yaml` allows build scripts for `sharp` and `unrs-resolver`. Keep the values as booleans; placeholder strings block frozen installs.
- The `postinstall` script copies the pdf.js worker into `public/pdf.worker.min.mjs`.

## Environment variables

The tracked template is `.env.example`. Local values belong in the gitignored `.env.local`.

All `NEXT_PUBLIC_*` variables are **public** and inlined at build time. Never put secrets in them.

| Variable | Values | Purpose |
|---|---|---|
| `NEXT_PUBLIC_BG_MODE` | `switcher`, `random`, or a background ID | Background selection mode |
| `NEXT_PUBLIC_DEFAULT_BG` | Background ID | Initial background for switcher mode and legacy lock |
| `NEXT_PUBLIC_BG_SWITCHER` | `false` | Legacy lock, used only when `NEXT_PUBLIC_BG_MODE` is unset |
| `NEXT_PUBLIC_ENABLE_LOGS` | `true` / `false` | Enable telemetry by default |

There is no contact endpoint. The contact form uses `mailto:info@yashcodes.com`.

## Build and static export

`next.config.mjs` configures:

- `output: 'export'`
- `distDir: 'out'`
- `trailingSlash: true`
- `images.unoptimized: true`
- `eslint.ignoreDuringBuilds: true`
- `typescript.ignoreBuildErrors: true`

```bash
NEXT_TELEMETRY_DISABLED=1 \
NEXT_PUBLIC_BG_MODE=random \
NEXT_PUBLIC_ENABLE_LOGS=false \
pnpm build
```

The export is written to `out/` (about 14 MB, including project images and the pdf.js worker). The exported routes are `/`, `/tools/`, and the not-found route.

Because there is no server runtime after deployment:

- Do not add route handlers, server actions, middleware-dependent features, or runtime-only Next image optimization without changing the hosting model.
- Production is a static file server behind Caddy.
- The site uses no service worker and no server-side contact endpoint.

## CI/CD and deployment

The workflow is `.github/workflows/deploy.yml`.

### Triggers

- Push to `develop` → build, then deploy beta.
- Push to `main` → build, then deploy production.
- Pull request to `develop` or `main` → build and type-check only.
- Manual run from **Actions → Build and deploy → Run workflow**.

### Branch protection

Both `develop` and `main` require:

- A pull request before merging.
- The `Build static site` status check (strict: the branch must be up to date).
- No force pushes and no branch deletion.
- Administrator bypass disabled, so direct pushes are rejected for everyone.

Workflow: create a feature branch from `develop`, open a PR into `develop`, wait
for `Build static site`, merge, then open a release PR from `develop` into
`main`. `main` merges are owner-only in practice because the owner is the only
collaborator. GitHub does not support per-user push restrictions on personal
repositories; if collaborators are added, they would be able to merge PRs
unless the repository moves to an organization or a stricter review flow is
added.

### Build job

1. Checkout.
2. Set up pnpm 12.8.1.
3. Set up Node 24 with pnpm caching.
4. `pnpm install --frozen-lockfile`.
5. `tsc --noEmit --incremental false`.
6. `pnpm build`, retrying up to three times on failure (covers transient `next/font` fetches).
7. Verify `out/index.html`, `out/_next`, and `out/tools/index.html`.
8. Upload the `site` artifact.

### Deploy jobs

The deploy jobs download the artifact, configure a dedicated SSH key, and run:

```bash
rsync -rlz --delete --delay-updates --chmod=D755,F644 \
  -e "ssh -i ~/.ssh/deploy_key -o IdentitiesOnly=yes" \
  out/ "$VPS_USER@$VPS_HOST:/opt/stacks/caddy/html/<environment>/"
```

Both deploy jobs verify the remote `index.html` on vps-2 and then request the public HTTPS URL.

### Required GitHub secrets

| Secret | Value |
|---|---|
| `VPS_HOST` | `140.238.208.16` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Private key of the deploy key |
| `VPS_KNOWN_HOSTS` | `ssh-keyscan -H 140.238.208.16` output |

The `deploy` user has no sudo, no docker access, and write access only under `/opt/stacks/caddy/html/beta` and `/opt/stacks/caddy/html/production`. The public key is restricted with `no-pty`, `no-agent-forwarding`, `no-port-forwarding`, and `no-X11-forwarding`.

### VPS layout

| Environment | Host path | Caddy root | Domain |
|---|---|---|---|
| Beta | `/opt/stacks/caddy/html/beta` | `/srv/beta` | beta.yashcodes.com |
| Production | `/opt/stacks/caddy/html/production` | `/srv/production` | yashcodes.com |

Caddy runs in Docker on vps-2. `/opt/stacks/caddy/html` is mounted read-only into the container as `/srv`.

### Production cutover

The cutover was completed on 2026-10-31:

1. Both A records now point to `140.238.208.16` (TTL 300).
2. The validated `beta.yashcodes.com` and `yashcodes.com` blocks are in `/opt/stacks/caddy/Caddyfile`.
3. Caddy issued Let's Encrypt certificates for both domains.
4. `/` and `/tools/` return 200 on both sites.

The previous vps-1 deployment (`/data/sites/beta`) remains as a **frozen** fallback — it no longer receives deploys and would need a manual sync plus re-pointing the `beta` A record. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the exact configuration, one-time server setup, manual deploy commands, rollback, and verification.

## Verification

### Source checks

```bash
pnpm install --frozen-lockfile
./node_modules/.bin/tsc --noEmit --incremental false
pnpm build
```

### Frontend smoke checks

Run the development server and verify:

- `/` returns successfully and the loading screen completes.
- `/tools/` returns successfully.
- Navigation scrolls to home sections.
- Tools search opens, filters, clears, and handles keyboard selection.
- Category chips scroll to the expected section.
- Desktop filmstrips advance and reverse without overlap.
- Mobile tools render as a normal stacked grid.
- A direct tool hash opens the expected tool.
- Reset remounts the active tool.
- Back restores the grid scroll position.
- Reduced-motion mode keeps all content usable.
- The browser console has no unexpected errors.

### Deployment checks

```bash
curl -I https://beta.yashcodes.com/
curl -I https://beta.yashcodes.com/tools/
curl -I https://yashcodes.com/          # after DNS cutover
```

## Telemetry

The home route imports `lib/react-telemetry.ts`, which patches `React.createElement` in the browser to wrap eligible components. Important components also call `useComponentInstrumentation` manually.

Telemetry records can include:

- Mount and unmount events
- Render counts and durations
- Sanitized prop and state snapshots
- Interaction events
- Aggregated animation and performance metrics
- Browser heap figures where available

Telemetry is off by default unless enabled by environment, saved localStorage state, or the browser bridge:

```js
window.__PORTFOLIO_TELEMETRY__.enable()
window.__PORTFOLIO_TELEMETRY__.disable()
window.__PORTFOLIO_TELEMETRY__.toggle()
window.__PORTFOLIO_TELEMETRY__.getEnabled()
```

The localStorage key is `portfolio:telemetry:enabled`.

Do not log contact message bodies, file contents, secrets, tokens, or other sensitive values.

## Security and privacy notes

- Sanitize untrusted Markdown HTML with DOMPurify.
- Sanitize SVG before rendering it.
- Do not use `eval` or `Function` for calculators or code-like input.
- JWT decoding is inspection only; do not imply signature verification.
- Treat file MIME and metadata as untrusted.
- Keep deployment credentials in GitHub Actions secrets; never commit them.
- Never put secrets in `NEXT_PUBLIC_*` variables.
- Preserve `rel` attributes on external `target="_blank"` links.
- The contact form opens the visitor's mail client; it does not submit to a server.

The deploy key is stored only in GitHub Actions. The `deploy` user has no sudo and no docker access. Rotate the key if it is exposed or if the repository's secret access changes.

## Known issues and limitations

### High priority

1. **Next.js 15.2.4 is flagged by pnpm as security-vulnerable.** Upgrade through a tested dependency change.
2. **ESLint 9 has no flat configuration.** The current `next lint` script is unusable.
3. **Next builds skip lint and TypeScript validation.** Run the standalone type check.

### Product and quality

1. There are no committed automated test files or Playwright configuration despite Playwright being installed.
2. The tools-page local-processing claim conflicts with the Currency Converter, DNS Lookup, and YouTube Downloader integrations.
3. Most project Code and Live Demo URLs remain `#` placeholders.
4. Both npm and pnpm lockfiles exist and can drift.
5. The frontend is heavily client-rendered, including many presentational components.
6. Global automatic telemetry wrapping increases complexity and may affect debugging or performance when enabled.
7. Dynamic tool import failures become a generic unavailable state, which can obscure the original loading error.
8. Historical planning and bug documents contain obsolete architecture claims.
9. The contact form is `mailto:`-only and depends on the visitor having a configured mail client; it provides no delivery confirmation.
10. The site has no analytics and no server-side form handling.
11. The build fetches DM Sans from Google Fonts through `next/font/google`. A transient fetch failure can fail the build; the workflow retries the build up to three times. Self-hosting the font with `next/font/local` is the durable fix.

## Conventions

- File names use kebab-case.
- React components use PascalCase.
- Hooks start with `use`.
- Section orchestrators usually use default exports.
- Presentational subcomponents commonly use named exports.
- Props and data contracts are typed.
- The `@/` path alias is used throughout.
- Portfolio copy belongs in `lib/content/index.ts`.
- Tool metadata belongs in `lib/content/tools/index.ts`.
- Shared tool datasets and pure algorithms belong in `lib/tools`.
- Generic tool UI belongs in `components/tools/shared`.
- Base UI primitives belong in `components/ui`.
- Use `cn` for conditional class composition.
- Preserve local formatting in touched files; the repository mixes semicolon and no-semicolon styles.
- Keep unrelated user changes intact.
- Avoid adding dependencies for behavior that platform APIs or installed packages already cover.

## Contact

- Email: [info@yashcodes.com](mailto:info@yashcodes.com)
- Website: https://yashcodes.com
- GitHub: https://github.com/yash244466666

This is a personal project by Yash Sikdar.
