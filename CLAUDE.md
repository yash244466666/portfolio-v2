# Repository Context for Coding Agents

> Last verified: 2026-11-01
> Applies to: AGENT.md and CLAUDE.md
> These two files intentionally contain the same repository guidance. Keep them synchronized.

## 1. Project summary

This repository contains MD. Mohi Minul Islam Yash's personal portfolio (display name: Yash Sikdar) and a large collection of browser-based developer utilities.

The application has two public routes:

- **/** — an animated single-page portfolio with loading, navigation, hero, about, projects, contact, footer, and back-to-top sections.
- **/tools/** — a searchable catalog of 87 utilities with category navigation, cinematic desktop scrolling, mobile fallbacks, hash-addressable tool views, and lazy-loaded implementations.

The frontend is a Next.js App Router application configured as a static export. The site is fully static: there is no Next.js server runtime or API route. The only backend is the separate Cloudflare Worker in **workers/contact**, which the contact form POSTs to; it sends an owner notification and a visitor confirmation through Brevo, with a prefilled `mailto:` link as the fallback.

The UI is dark-themed, animation-heavy, and predominantly client-rendered. Preserve reduced-motion behavior, keyboard navigation, mobile layouts, and static-export compatibility when making changes.

## 2. Sources of truth

Use source code as the authority when documentation disagrees with implementation.

Important source-of-truth files:

- **package.json** — installed packages and scripts.
- **next.config.mjs** — static-export and development-proxy behavior.
- **app/page.tsx** — home-page composition and loading lifecycle.
- **app/tools/page.tsx** — tools route shell.
- **components/backgrounds/index.tsx** — available backgrounds and environment-controlled mode.
- **lib/content/index.ts** — portfolio copy, navigation, skills, projects, contact details, and labels.
- **lib/content/tools/index.ts** — tool categories and all tool definitions.
- **components/tools/tools-page.tsx** — tools hash/history state.
- **components/tools/tools-sections.tsx** — pinned horizontal desktop scrolling.
- **components/contact-section.tsx** — frontend contact workflow (statuses, honeypot, Turnstile, mailto fallback).
- **lib/contact/send-contact.ts** — client POST helper with timeout and endpoint normalization.
- **components/contact-section/turnstile-widget.tsx** — Cloudflare Turnstile loader and widget.
- **workers/contact/src/index.js** — Cloudflare Worker that verifies Turnstile, rate-limits, and sends the Brevo emails.
- **workers/contact/README.md** — Worker secrets, KV binding, CORS, and deploy notes.
- **.github/workflows/deploy.yml** — CI/CD: build, type-check, and deploy the static export to the VPS.
- **docs/DEPLOYMENT.md** — branch model, VPS paths, secrets, Caddy, DNS cutover, and rollback.

Historical documents such as **BUG-REPORT.md**, **ANIMATION-MIGRATION-PLAN.md**, **SCROLL-DRIVEN-ANIMATION-GUIDE.md**, and **TESTING-GUIDE.md** may describe earlier snapshots. Confirm their claims against current source before acting.

## 3. Current technology stack

### Frontend

- Next.js 15.2.4 with App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4 through the Tailwind PostCSS plugin
- tw-animate-css and project-defined CSS animations
- anime.js 4 for selected background effects
- Lucide React icons
- shadcn-style local UI primitives using Radix Slot, CVA, clsx, and tailwind-merge

### Tool-specific libraries

- CodeMirror 6 for the JSON editor
- pdf-lib and pdfjs-dist for PDF tools
- marked plus DOMPurify for sanitized Markdown rendering
- DOMPurify for SVG sanitization
- mathjs for calculator behavior
- diff for text comparisons
- js-yaml and sql-formatter for formatters
- qrcode for QR generation
- JSZip and html-to-image for export workflows
- js-sha1, js-sha256, and js-sha512 for hashing

### Deployment

- GitHub Actions workflow in `.github/workflows/deploy.yml`
- VPS-hosted static files served by Caddy in Docker
- `rsync` over SSH from the workflow to the VPS
- Branch mapping: `develop` → `/opt/stacks/caddy/html/beta` (beta.yashcodes.com); `main` → `/opt/stacks/caddy/html/production` (yashcodes.com)
- The contact form is handled by a separate Cloudflare Worker in `workers/contact` that sends email through Brevo; it is deployed independently of the static site.

There is no Three.js or React Three Fiber dependency in the current frontend. The contact backend is that external Worker, not a Next.js server route.

## 4. Package management and commands

The repository contains both **pnpm-lock.yaml** and **package-lock.json**, but **pnpm-workspace.yaml** indicates pnpm is intended.

Common commands:

    pnpm install --frozen-lockfile
    pnpm dev
    pnpm build
    ./node_modules/.bin/tsc --noEmit --incremental false

CI uses Node 24 and pnpm 12.8.1. The deployment workflow runs the frozen install, strict TypeScript, and the static build before deploying.

Current tooling caveats:

- **pnpm-workspace.yaml** allows build scripts for `sharp` and `unrs-resolver`. Keep these values as booleans; placeholder strings block frozen installs.
- The lint script still runs **next lint**, while the installed ESLint 9 expects an **eslint.config.js**, **eslint.config.mjs**, or **eslint.config.cjs** flat configuration. Linting is currently not operational.
- Both lockfiles can drift. Do not regenerate or rewrite either lockfile unless dependency work is explicitly in scope.
- The postinstall script copies the pdfjs worker into **public/pdf.worker.min.mjs**.
- The build fetches DM Sans from Google Fonts through `next/font/google`. A transient fetch failure can fail the build; the workflow retries the build up to three times. Self-hosting the font with `next/font/local` is the durable fix.
- Do not run package installation merely to inspect the repository; it can rewrite lockfile resolution metadata.

When dependency state is already installed but pnpm's policy check blocks an unrelated validation, direct local binaries can be used for read-only verification.

## 5. Environment variables

The tracked template is **.env.example**. Local values belong in the gitignored **.env.local**.

Frontend variables are public and inlined at build time:

- **NEXT_PUBLIC_BG_MODE**
  - **switcher** shows the background selector.
  - **random** selects a background on each page load.
  - A valid background ID locks the site to that background.
- **NEXT_PUBLIC_DEFAULT_BG** selects the initial or legacy locked background.
- **NEXT_PUBLIC_BG_SWITCHER=false** is a legacy lock mechanism used only when BG_MODE is not explicitly set.
- **NEXT_PUBLIC_ENABLE_LOGS=true** enables telemetry by default.
- **NEXT_PUBLIC_CONTACT_ENDPOINT** is the public Cloudflare Worker URL for the contact form; when unset, the form only offers the `mailto:` fallback.
- **NEXT_PUBLIC_TURNSTILE_SITE_KEY** is the public Turnstile site key; when unset, the form only offers the `mailto:` fallback.

Never put secrets in NEXT_PUBLIC variables.

There is no private Next.js runtime configuration. The contact form posts to the separate Cloudflare Worker; its `BREVO_API_KEY` and `TURNSTILE_SECRET_KEY` are Worker secrets, never frontend variables. Deployment credentials live only in GitHub Actions secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`); never commit them or place them in `NEXT_PUBLIC_*` variables.

## 6. Rendering and deployment model

**next.config.mjs** configures:

- Static export through output: export
- Output directory **out/**
- Trailing slashes
- Unoptimized Next images
- Ignored TypeScript and ESLint failures during Next builds

Consequences:

- No Next.js server runtime is available after deployment.
- Do not add route handlers, server actions, middleware-dependent features, or runtime-only Next image optimization without changing the hosting model.
- Deployment is handled by GitHub Actions: pushes to `develop` deploy to beta; pushes to `main` deploy to production. See **docs/DEPLOYMENT.md**.
- `main` is the GitHub default branch; `develop` is the beta/integration branch. For beta work, open PRs against `develop` explicitly because GitHub defaults new PRs to `main`.
- Both `develop` and `main` are protected: direct pushes are blocked (administrators included), a PR is required, and the `Build static site` check must pass. Work on feature branches and merge via PR. `main` merges are owner-only because the owner is the only collaborator.
- A successful Next build does not prove type or lint correctness because both checks are skipped in build configuration.
- The **start** script is not the normal production path for the exported site. Serve or deploy **out/** using the existing static host.

## 7. Repository structure

    app/
      layout.tsx
      page.tsx
      globals.css
      tools/
        page.tsx
        loading.tsx

    components/
      hero-section.tsx
      hero-section/
      about-section.tsx
      about-section/
      projects-section.tsx
      projects-section/
      contact-section.tsx
      contact-section/
      navigation.tsx
      navigation/
      backgrounds/
      tools/
        core/
        dev/
        text/
        media/
        security/
        math/
        shared/
      ui/

    hooks/
      use-anime-scope.ts
      use-body-scroll-lock.ts
      use-cycling-typewriter.ts
      use-custom-cursor.ts
      use-hash-scroll.ts
      use-instrumentation.ts
      use-mobile.ts
      use-scroll-threshold.ts
      use-section-visibility.ts
      use-sticky-offset.ts

    lib/
      contact/
      content/
      tools/
      instrumentation.ts
      react-telemetry.ts
      utils.ts

    .github/
      workflows/
        deploy.yml

    docs/
      DEPLOYMENT.md

    workers/
      contact/
        src/index.js
        README.md

    public/
      project images, favicons, placeholders, and pdf.worker.min.mjs

    scratch/
      historical refactor helpers

## 8. Home route architecture

**app/layout.tsx** provides:

- DM Sans via next/font/google
- Dark mode on the root html element
- Global metadata and favicons
- Global CSS

**app/page.tsx** is a client component and orchestrates the home route.

Lifecycle:

1. The first client render shows LoadingScreen.
2. A mount effect enables the full client tree.
3. AnimatedBackground loads dynamically with SSR disabled.
4. LoadingScreen advances its percentage every 15 ms by 7 points, reaching 100% in about 0.22 seconds.
5. At approximately 0.25 seconds it begins a 150 ms fade, so first-load content appears roughly 0.4 seconds after hydration (about 0.5–0.75 seconds from first paint).
6. After completion, Navigation, HeroSection, AboutSection, ProjectsSection, ContactSection, Footer, and BackToTop render.
7. Hero content becomes visible after a short delay and its typewriter cycles continuously.
8. About, projects, and contact use IntersectionObserver-driven visibility.
9. Small screens and reduced-motion users bypass selected entrance animations.

The custom mouse cursor remains disabled in **app/page.tsx**. Do not enable it incidentally.

About and projects use simple gradient background elements. Older documentation referring to empty Three.js canvases is obsolete.

## 9. Background system

**components/backgrounds/index.tsx** is the controller for 20 backgrounds:

- aurora
- particles
- dotgrid
- glass
- waves
- starfield
- matrix
- neural
- fireflies
- topography
- rain
- bokeh
- vortex
- ripple
- neonrings
- matrixrain
- hexgrid
- gradient
- constellation
- spotlight

Implementation characteristics:

- Components are conditionally lazy-loaded.
- Switcher and random modes need all possible background modules.
- A locked mode can exclude unrelated background modules from the bundle.
- Switcher selections persist in localStorage under **portfolio-bg**.
- The system falls back to a static gradient.
- Reduced-motion preference renders the fallback instead of continuous animation.
- The background wrapper is fixed, pointer-safe, and sits behind route content.
- Backgrounds use a mixture of Canvas 2D, CSS, and anime.js. Do not assume a single animation engine.

Any new background must update all of the following:

1. Lazy import in **components/backgrounds/index.tsx**
2. BACKGROUND_OPTIONS
3. BackgroundRenderer
4. The valid-ID documentation in **.env.example**
5. Reduced-motion behavior and cleanup for animation frames, listeners, scopes, and observers

## 10. Portfolio content model

Static portfolio content lives in **lib/content/index.ts** and typed contracts live in **lib/content/types.ts**.

It contains:

- Personal identity and typewriter titles
- Social links
- Contact information
- Optional resume download URL and suggested file name
- Six skill groups
- Six featured projects
- Navigation items
- Button text
- Section copy
- Contact-form labels, placeholders, status messages, and privacy copy
- Footer copy and computed current year
- Site metadata

Components normally access this data through **lib/content/utils.ts**. Prefer editing centralized content rather than embedding new portfolio copy in component markup.

Known content gap: most project GitHub and live-demo values are still **#** placeholders. Ensure cards do not claim a working external link when the value is a placeholder.

Each project may also define optional **longDescription**, **highlights**, **role**, and **year** fields used only by the project detail modal; missing fields are omitted from the modal, which falls back to **description**. Modal labels and accessible names live in **projectModalContent** in the same file.

The navigation resume button reads **personalInfo.resumeUrl** and **personalInfo.resumeFileName**, with its label in **buttonTexts.downloadResume**. It is hidden when the URL is missing, empty, or a **#** placeholder; same-origin URLs download via the **download** attribute, while cross-origin URLs open in a new tab with **rel="noopener noreferrer"**. A placeholder file ships at **public/resume.pdf**.

## 11. Tools route architecture

### Catalog

**lib/content/tools/index.ts** currently defines 87 tools:

- Core: 7
- Dev: 45
- Text: 17
- Media: 3
- Security: 5
- Math and logic: 10

All 87 definitions currently have matching implementations.

A tool definition contains:

- id
- label
- description
- Lucide icon name
- category
- search tags
- optional wide layout flag

Tool IDs map to implementation paths:

    components/tools/<category>/<tool-id>.tsx

Directory implementations such as the JSON editor may expose an **index.ts** instead.

### Route shell

**app/tools/page.tsx** renders:

- The shared animated background
- A skip link
- Navigation
- ToolsPage
- Footer
- BackToTop

It measures navigation and toolbar heights with ResizeObserver and writes CSS custom properties used by sticky content.

### Grid and search

**components/tools/tools-grid.tsx** owns the visible catalog mode:

- ToolsToolbar provides the combobox and category chips.
- Empty search shows cinematic category sections.
- Active search shows normal grouped grid results.
- Popular suggestions appear for empty results.
- Tool filtering matches labels, descriptions, categories, and tags through content utilities.

### Cinematic category sections

**components/tools/tools-sections.tsx** implements desktop filmstrip scrolling:

- Categories are divided into chunks of at most 12 cards.
- Each chunk becomes a sticky scene.
- Vertical page progress translates a horizontal card track.
- A release interval crossfades to the next scene.
- Scroll work is requestAnimationFrame-throttled.
- ResizeObserver recalculates overflow and section heights.
- Active category state feeds the toolbar.
- Narrow screens below 768 px and reduced-motion users receive a normal stacked grid instead.

When editing this subsystem, preserve:

- Exact scroll restoration
- Dynamic navigation and toolbar offsets
- Reverse scrolling
- Search-to-category transitions
- Mobile non-sticky layout
- Reduced-motion non-transformed layout
- Resize and observer cleanup

### Tool navigation and state

**components/tools/tools-page.tsx** keeps the grid mounted while a tool is open, hiding it with display:none so search state and measured sections survive.

Navigation behavior:

1. Selecting a card records the grid scroll position in a dedicated history entry.
2. A tool history entry is pushed with **#<tool-id>**.
3. The selected tool view scrolls to the top.
4. Browser back restores the grid and its recorded vertical position.
5. Category breadcrumbs queue a category scroll after the grid returns.
6. Direct hash loads open the matching tool.
7. Unknown IDs render the Tool Not Found state.

Do not casually replace this with router navigation. Browser history and scroll restoration are deliberate and tightly coupled.

### Tool loading

**components/tools/tool-view.tsx**:

- Looks up metadata by ID.
- Dynamically imports the tool implementation.
- Caches lazy components by module path.
- Shows a Suspense spinner during chunk loading.
- Shows ToolUnavailable if the dynamic import rejects.
- Remounts the current tool when Reset is selected.
- Uses a wider content shell for definitions marked wide.

When adding a tool:

1. Add metadata to **lib/content/tools/index.ts**.
2. Add its icon to **lib/content/tools/icon-map.ts** if not already mapped.
3. Create the matching implementation file or directory entry.
4. Use local shared primitives where appropriate.
5. Keep processing client-side unless the UI clearly discloses an external service.
6. Add keyboard labels and reduced-motion handling where relevant.
7. Verify direct navigation to **/tools/#<id>**, reset, browser back, search, and mobile layout.

## 12. External network behavior

The statement in the tools-page description that everything runs locally is not universally accurate.

Known networked features include:

- Currency Converter calls the open.er-api.com exchange-rate API and caches rates in a versioned 24-hour cache.
- DNS Lookup calls Cloudflare's DNS-over-HTTPS API.
- YouTube Downloader sends the supplied URL to the Cobalt website and loads YouTube thumbnail images.
- The contact form POSTs to the Cloudflare Worker at `NEXT_PUBLIC_CONTACT_ENDPOINT`; the Worker verifies Turnstile and sends two emails through Brevo. A prefilled `mailto:` fallback remains available on failure.
- Fonts are integrated through next/font/google during the build process.

Do not add external calls without clear user-facing disclosure, reasonable error handling, and privacy-conscious behavior. Update the tools-page claim so it remains truthful when working on content.

## 13. Contact form flow

**components/contact-section.tsx** is a client-only contact form backed by the separate Worker in **workers/contact**.

Primary flow:

- The fields are name, email, message, and an optional single attachment; the first three are `required`.
- A hidden `website` honeypot must stay empty.
- Turnstile renders with `appearance: "interaction-only"`, so the widget stays out of the layout unless Cloudflare needs a challenge; a small "Protected by Cloudflare" link carries the attribution instead.
- **lib/contact/send-contact.ts** POSTs `{ name, email, message, turnstileToken, attachment, website }` to `NEXT_PUBLIC_CONTACT_ENDPOINT`, with the token also in `X-Turnstile-Token` so the Worker can verify it before parsing the body. The timeout is 15 seconds, or 30 with an attachment.
- **lib/contact/attachment.ts** owns the client rules: a 4 MB ceiling, the Brevo extension allowlist, the `accept` attribute, chunked base64 reading, and the size formatter. Keep it in sync with the Worker.
- The Worker verifies Turnstile, rate-limits through the `RATE_LIMIT` KV binding when it is configured (5 per IP per hour), and calls Brevo twice: the owner notification at `md.mohi.minul.islam.yash@gmail.com` (`Reply-To` = visitor, carrying the attachment) and the visitor confirmation (`Reply-To` = owner). Sender stays `info@yashcodes.com`; only the recipient is the Gmail address.
- The confirmation is a branded dark template built by `buildConfirmationHtml` / `buildConfirmationText` in the Worker, with inline styles, table layout, and no external assets.
- Success resets the fields, the attachment, and the Turnstile widget; failure keeps the fields and the file, shows a generic error, and offers a prefilled `mailto:info@yashcodes.com` fallback that states the file must be re-attached.

Constraints:

- No secrets in the browser; only the Worker URL and the Turnstile site key are public.
- Do not log message bodies, email addresses, or Turnstile tokens in telemetry or console output.
- Do not store submissions in localStorage or a database.
- If `NEXT_PUBLIC_CONTACT_ENDPOINT` or `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, the form falls back to `mailto:`.
- The Worker is not part of the Next.js build; keep it in `workers/contact` and out of Next imports.

## 14. Telemetry

The home route imports **lib/react-telemetry.ts**, which patches React.createElement in the browser to wrap eligible components. Important components also call **useComponentInstrumentation** manually.

Telemetry records can include:

- Mount and unmount events
- Render counts and durations
- Sanitized prop and state snapshots
- Interaction events
- Aggregated animation and performance metrics
- Browser heap figures where available

Telemetry is off by default unless enabled by environment, saved localStorage state, or the browser bridge:

    window.__PORTFOLIO_TELEMETRY__.enable()
    window.__PORTFOLIO_TELEMETRY__.disable()
    window.__PORTFOLIO_TELEMETRY__.toggle()
    window.__PORTFOLIO_TELEMETRY__.getEnabled()

The localStorage key is **portfolio:telemetry:enabled**.

Do not log contact message bodies, email addresses, Turnstile tokens, file contents, secrets, or other sensitive values. The ContactSection snapshots report only lengths/booleans, and the `Textarea` primitive is manually instrumented so its value is never captured.

## 15. Hooks and shared utilities

- **use-section-visibility.ts** — IntersectionObserver with once, fallback, and skip behavior.
- **use-scroll-threshold.ts** — passive scroll listener returning a boolean threshold state.
- **use-cycling-typewriter.ts** — timeout-based typing, pause, deletion, and phrase cycling.
- **use-hash-scroll.ts** — retries the home route's URL hash after the loading screen mounts the sections, and on later hash changes; smooth unless reduced motion is requested.
- **use-sticky-offset.ts** — measures fixed navigation and tools toolbar heights.
- **use-mobile.ts** — matchMedia-backed 768 px breakpoint.
- **use-anime-scope.ts** — scoped anime.js lifecycle wrapper; currently unused by the home sections. The backgrounds use their own `createScope` calls.
- **use-body-scroll-lock.ts** — locks page scrolling for overlays and restores the scroll offset; pairs with the `data-scroll-locked` root attribute in **app/globals.css**.
- **use-instrumentation.ts** — component and frame telemetry helpers.
- **use-custom-cursor.ts** — currently unused because the custom cursor is disabled.
- **lib/utils.ts** — the cn class-merging helper.

Clean up every timer, event listener, observer, animation frame, object URL, media stream, and anime.js scope introduced by a component.

## 16. Styling and accessibility

**app/globals.css** contains:

- Tailwind CSS 4 import
- tw-animate-css import
- Dark theme and shadcn-compatible design tokens
- Keyframes for fade, slide, glow, float, and pulse effects
- Navigation link styling
- Range input styling
- Mobile typography and minimum touch-target rules
- Reduced-motion behavior
- Tools-page layout support

Local UI primitives live under **components/ui** and follow the New York shadcn style.

Accessibility requirements:

- Preserve the tools skip link.
- Keep interactive tool cards as real anchors or buttons.
- Keep focus-visible rings.
- Maintain 44 px mobile touch targets.
- Label icon-only controls.
- Preserve combobox, listbox, option, progressbar, and breadcrumb semantics.
- Avoid hiding content behind opacity when motion is disabled.
- Test keyboard navigation and Escape behavior in search.
- Keep decorative icons and backgrounds hidden from assistive technology.
- Preserve the project detail dialog's `role="dialog"` semantics, focus trap, Escape handling, and focus restoration to the card that opened it.
- Never rely on hover alone.

## 17. Security rules

- Sanitize untrusted Markdown HTML with DOMPurify.
- Sanitize SVG before rendering it.
- Do not use eval or Function for calculators or code-like input.
- JWT decoding is inspection only; do not imply signature verification.
- Treat file MIME and metadata as untrusted in tools that accept files.
- Keep deployment credentials in GitHub Actions secrets; never commit them.
- Do not log sensitive form content.
- Preserve rel attributes on external target-blank links.
- The contact form uses the external Cloudflare Worker. Keep Brevo/Turnstile secrets on the Worker, never in `NEXT_PUBLIC_*` or the repo, validate all Worker input, HTML-escape email content, and never log message bodies.

Deployment credentials are stored only in GitHub Actions secrets. The VPS deploy user (`deploy`) has no sudo and no docker access and can write only under `/opt/stacks/caddy/html/beta` and `/opt/stacks/caddy/html/production`. Never commit the deploy key, host keys, or any other credential.

## 18. Known issues and technical debt

### High priority

1. Next.js 15.2.4 is flagged by pnpm as a security-vulnerable release and should be upgraded through a tested dependency change.
2. ESLint 9 cannot find a flat configuration; the current lint script is unusable.
3. Next builds explicitly skip lint and TypeScript validation.

### Product and quality

1. There are no committed automated test files or Playwright configuration despite Playwright being a development dependency.
2. The tools-page local-processing claim conflicts with several external API integrations.
3. Most project Code and Live Demo URLs remain placeholders.
4. The repository has both npm and pnpm lockfiles.
5. The frontend is heavily client-rendered, including many purely presentational components.
6. Global automatic telemetry wrapping increases complexity and may affect debugging or performance when enabled.
7. Dynamic tool import failures are converted into a generic unavailable state, which can obscure the original loading error.
8. The contact Worker's live Brevo delivery, Worker secrets, and KV rate limiting still need an end-to-end confirmation; the form falls back to `mailto:` when the Worker is unset or fails.
9. Historical planning and bug documents contain obsolete architecture claims.
10. Scratch scripts and empty legacy directories should not be assumed to participate in production.

## 19. Coding conventions

Follow the existing patterns unless a task explicitly includes a refactor:

- File names use kebab-case.
- React components use PascalCase.
- Hooks start with use.
- Section orchestrators usually use default exports.
- Presentational subcomponents commonly use named exports.
- Props and data contracts are typed.
- The project uses the **@/** path alias.
- Portfolio copy belongs in **lib/content/index.ts**.
- Tool metadata belongs in **lib/content/tools/index.ts**.
- Shared tool datasets and pure algorithms belong in **lib/tools**.
- Generic tool UI belongs in **components/tools/shared**.
- Base UI primitives belong in **components/ui**.
- Use the cn helper for conditional class composition.
- Preserve local formatting in touched files; the repository currently mixes semicolon and no-semicolon styles.
- Keep unrelated user changes intact.
- Avoid adding dependencies for behavior that current platform APIs or installed packages already cover.

## 20. Verification workflow

Choose checks proportional to the change.

### Baseline source checks

    pnpm install --frozen-lockfile
    ./node_modules/.bin/tsc --noEmit --incremental false
    pnpm build

Do not commit generated `out/` or `.next/` files; check the final diff for them.

### Frontend smoke checks

Run the development server and verify:

- **/** returns successfully.
- **/tools/** returns successfully.
- Loading completes and home content appears.
- Navigation scrolls to home sections.
- Tools search opens, filters, clears, and handles keyboard selection.
- Category chips move to the expected section.
- Desktop filmstrips advance and reverse without overlap.
- Mobile tools render as a normal stacked grid.
- A direct tool hash opens the expected tool.
- Reset remounts the active tool.
- Back restores the grid scroll position.
- Reduced-motion mode keeps all content usable.
- Browser console has no unexpected errors.

### Contact checks

The contact form uses the Worker with a `mailto:` fallback:

- With the public endpoint and Turnstile site key set, submitting valid fields POSTs the expected JSON and shows sending, success, and reset states.
- A failure keeps the entered values, shows a generic error, and renders a working `mailto:info@yashcodes.com` fallback.
- The Turnstile widget is present, the `website` honeypot is hidden, and `aria-live` announces the status.
- Telemetry contains only lengths/booleans: never the name, email, message, or token.
- With the endpoint/site key unset, the form offers the `mailto:` fallback.

Do not send live email or deploy external changes without explicit user authorization.

### Build notes

At the last documentation update (2026-10-31):

- Strict TypeScript checking passed.
- Static production build passed.
- The exported routes were **/**, **/tools/**, and the not-found route.
- ESLint was blocked by missing flat configuration.
- No automated tests were discovered.
- The latest `develop` (beta) and `main` (production) runs, including HTTPS verification, passed on 2026-10-30 UTC; the first attempts were queued during a GitHub Actions incident.
- The deployment target is vps-2. The vps-2 deploy user, directories, SSH key, and secrets are configured; both deploy runs passed, both A records now point to vps-2, and Caddy issued certificates on 2026-10-31.
- The vps-2 Caddy blocks are applied in the live Caddyfile. The pre-cutover backup is `/opt/stacks/caddy/Caddyfile.bak-20261030-185633`; `/opt/stacks/caddy/Caddyfile.next` remains as the staged copy.

These are observations, not permanent guarantees. Re-run relevant checks after changes.

## 21. Completion checklist for agents

Before handing off implementation work:

1. Confirm the working tree before editing.
2. Read the source files that own the affected behavior.
3. Preserve static-export constraints.
4. Preserve desktop, mobile, keyboard, and reduced-motion behavior.
5. Update centralized content or tool metadata rather than duplicating it.
6. Validate direct hash navigation when touching tools.
7. Validate the contact form's Worker submission, fallback, labels, honeypot, Turnstile, and telemetry non-disclosure when touching the contact section.
8. Run strict TypeScript independently from the Next build.
9. Report skipped or blocked checks clearly.
10. Check the final Git diff for unrelated or generated files.
11. Update both **AGENT.md** and **CLAUDE.md** together whenever repository context changes.
12. Run the CI-equivalent checks (`pnpm install --frozen-lockfile`, `tsc --noEmit`, `pnpm build`) before pushing.
13. Update **README.md** and **docs/DEPLOYMENT.md** when branches, secrets, VPS paths, or deployment behavior change.
14. Never push directly to `develop` or `main`; open a PR and wait for the `Build static site` check.
