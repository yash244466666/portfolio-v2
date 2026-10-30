# Repository Context for Coding Agents

> Last verified: 2026-10-31
> Applies to: AGENT.md and CLAUDE.md
> These two files intentionally contain the same repository guidance. Keep them synchronized.

## 1. Project summary

This repository contains Yash Sikdar's personal portfolio and a large collection of browser-based developer utilities.

The application has two public routes:

- **/** — an animated single-page portfolio with loading, navigation, hero, about, projects, contact, footer, and back-to-top sections.
- **/tools/** — a searchable catalog of 87 utilities with category navigation, cinematic desktop scrolling, mobile fallbacks, hash-addressable tool views, and lazy-loaded implementations.

The frontend is a Next.js App Router application configured as a static export. The site is fully static: there is no server runtime, API route, or backend in this repository. The contact form opens the visitor's email client with a prefilled `mailto:` message.

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
- **components/contact-section.tsx** — frontend contact workflow.
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

There is no Three.js or React Three Fiber dependency in the current frontend. There is no server-side contact backend.

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

Never put secrets in NEXT_PUBLIC variables.

There is no private runtime configuration and no contact backend. The contact form uses `mailto:info@yashcodes.com`. Deployment credentials live only in GitHub Actions secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`); never commit them or place them in `NEXT_PUBLIC_*` variables.

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
      use-cycling-typewriter.ts
      use-custom-cursor.ts
      use-instrumentation.ts
      use-mobile.ts
      use-scroll-threshold.ts
      use-section-visibility.ts
      use-sticky-offset.ts

    lib/
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
4. LoadingScreen advances its percentage every 40 ms.
5. At approximately 2.5 seconds it begins a 500 ms fade.
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
- Six skill groups
- Six featured projects
- Navigation items
- Button text
- Section copy
- Contact-form labels and placeholders
- Footer copy and computed current year
- Site metadata

Components normally access this data through **lib/content/utils.ts**. Prefer editing centralized content rather than embedding new portfolio copy in component markup.

Known content gap: most project GitHub and live-demo values are still **#** placeholders. Ensure cards do not claim a working external link when the value is a placeholder.

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

- Currency Converter calls the Frankfurter exchange-rate API and caches results.
- DNS Lookup calls Cloudflare's DNS-over-HTTPS API.
- YouTube Downloader sends the supplied URL to the Cobalt website and loads YouTube thumbnail images.
- The contact form opens the visitor's email client via `mailto:info@yashcodes.com`; it makes no network request from the site.
- Fonts are integrated through next/font/google during the build process.

Do not add external calls without clear user-facing disclosure, reasonable error handling, and privacy-conscious behavior. Update the tools-page claim so it remains truthful when working on content.

## 13. Contact form flow

**components/contact-section.tsx** is a client-only contact form. On submit it builds a `mailto:info@yashcodes.com` URL containing the sender's name, email, and message, then sets `window.location.href`. It does not call an API, upload files, or store submissions.

- The form fields are name, email, and message.
- The form uses `noValidate`; the visitor's email client is responsible for delivery.
- There is no file upload, honeypot, rate limiting, presign, or backend validation in this repository.
- If no mail client is configured, the browser may do nothing; the contact details are also listed in the contact section.
- Do not claim that the form submits to a server or guarantees delivery.

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

Do not log contact message bodies, file contents, secrets, tokens, or other sensitive values.

## 15. Hooks and shared utilities

- **use-section-visibility.ts** — IntersectionObserver with once, fallback, and skip behavior.
- **use-scroll-threshold.ts** — passive scroll listener returning a boolean threshold state.
- **use-cycling-typewriter.ts** — timeout-based typing, pause, deletion, and phrase cycling.
- **use-sticky-offset.ts** — measures fixed navigation and tools toolbar heights.
- **use-mobile.ts** — matchMedia-backed 768 px breakpoint.
- **use-anime-scope.ts** — scoped anime.js lifecycle and cleanup.
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
- The contact form is `mailto:`-only; do not reintroduce a server endpoint without updating the deployment model and docs.

Deployment credentials are stored only in GitHub Actions secrets. The VPS deploy user (`deploy`) has no sudo and no docker access and can write only under `/opt/stacks/caddy/html/beta` and `/opt/stacks/caddy/html/production`. Never commit the deploy key, host keys, or any other credential.

## 18. Known issues and technical debt

### High priority

1. Next.js 15.2.4 is flagged by pnpm as a security-vulnerable release and should be upgraded through a tested dependency change.
2. ESLint 9 cannot find a flat configuration; the current lint script is unusable.
3. Next builds explicitly skip lint and TypeScript validation.
4. `beta.yashcodes.com` still points at `152.67.67.128` (vps-1) and `yashcodes.com` still points at `103.65.138.220`. Deploys now target vps-2 (`140.238.208.16`), but both A records must change to `140.238.208.16` before Caddy can serve the sites and issue certificates.

### Product and quality

1. There are no committed automated test files or Playwright configuration despite Playwright being a development dependency.
2. The tools-page local-processing claim conflicts with several external API integrations.
3. Most project Code and Live Demo URLs remain placeholders.
4. The repository has both npm and pnpm lockfiles.
5. The frontend is heavily client-rendered, including many purely presentational components.
6. Global automatic telemetry wrapping increases complexity and may affect debugging or performance when enabled.
7. Dynamic tool import failures are converted into a generic unavailable state, which can obscure the original loading error.
8. The contact form is `mailto:`-only and depends on the visitor having a configured mail client; there is no delivery confirmation.
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

The contact form only opens the visitor's email client:

- Submitting with a valid name, email, and message builds a `mailto:info@yashcodes.com` link.
- No network request is made by the site.
- The visible contact details remain available if no mail client is configured.

Do not send live email or deploy external changes without explicit user authorization.

### Build notes

At the last documentation update (2026-10-31):

- Strict TypeScript checking passed.
- Static production build passed.
- The exported routes were **/**, **/tools/**, and the not-found route.
- ESLint was blocked by missing flat configuration.
- No automated tests were discovered.
- GitHub Actions runs passed for `develop` (beta) and `main` (production) on 2026-10-30; the first attempts were queued during a GitHub Actions incident.
- The deployment target was switched to vps-2 on 2026-10-31. The vps-2 deploy user, directories, SSH key, and secrets are configured; both vps-2 deploy runs passed. The DNS cutover for `beta.yashcodes.com` and `yashcodes.com` is still pending.
- The vps-2 Caddy blocks are staged in `/opt/stacks/caddy/Caddyfile.next` and validated; they are not applied until DNS points to vps-2.

These are observations, not permanent guarantees. Re-run relevant checks after changes.

## 21. Completion checklist for agents

Before handing off implementation work:

1. Confirm the working tree before editing.
2. Read the source files that own the affected behavior.
3. Preserve static-export constraints.
4. Preserve desktop, mobile, keyboard, and reduced-motion behavior.
5. Update centralized content or tool metadata rather than duplicating it.
6. Validate direct hash navigation when touching tools.
7. Validate the `mailto:` contact form when touching the contact section.
8. Run strict TypeScript independently from the Next build.
9. Report skipped or blocked checks clearly.
10. Check the final Git diff for unrelated or generated files.
11. Update both **AGENT.md** and **CLAUDE.md** together whenever repository context changes.
12. Run the CI-equivalent checks (`pnpm install --frozen-lockfile`, `tsc --noEmit`, `pnpm build`) before pushing.
13. Update **README.md** and **docs/DEPLOYMENT.md** when branches, secrets, VPS paths, or deployment behavior change.
