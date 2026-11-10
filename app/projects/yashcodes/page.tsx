import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import PageShell from "@/components/page-shell"
import { StructuredData } from "@/components/structured-data"
import { buildPageMetadata, absoluteUrl } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "YashCodes Developer Tools Case Study – 88 Browser Utilities",
  description:
    "How YashCodes combines 88 browser utilities in one static Next.js site: search, on-demand tool loading, a desktop filmstrip, mobile fallbacks, and the tradeoffs behind the design.",
  path: "/projects/yashcodes/",
  type: "article",
  imageAlt: "The YashCodes tools directory",
})

const caseStudyData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "YashCodes Developer Tools Case Study",
  description:
    "How YashCodes combines 88 browser utilities in one static Next.js site.",
  author: {
    "@type": "Person",
    name: "MD. Mohi Minul Islam Yash",
    url: absoluteUrl("/"),
  },
  mainEntityOfPage: absoluteUrl("/projects/yashcodes/"),
  image: absoluteUrl("/project-cards/yashcodes-tools.webp"),
  about: ["Developer tools", "Next.js", "Static site", "Web performance"],
}

const highlights = [
  "88 browser-based utilities across six categories, with search and tags.",
  "Each tool is a separate lazy-loaded chunk; the directory opens without shipping every widget.",
  "The grid stays mounted while a tool is open, so search state and measured sections survive.",
  "Browser history and exact scroll restoration are handled explicitly on the tools route.",
  "Desktop uses a pinned horizontal filmstrip; small screens and reduced-motion visitors get a stacked grid.",
]

export default function YashCodesCaseStudy() {
  return (
    <PageShell contentId="case-study-content" skipLabel="Skip to case study">
      <StructuredData data={caseStudyData} />
      <article className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/#projects"
                className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Projects
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              YashCodes
            </li>
          </ol>
        </nav>

        <header>
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">
            Personal project
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            YashCodes Developer Tools
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            88 browser utilities, one static site, and a directory that loads
            each tool only when someone opens it.
          </p>
        </header>

        <figure className="mt-8">
          <Image
            src="/project-cards/yashcodes-tools.webp"
            alt="Live YashCodes tools directory showing search, categories, and utility cards."
            width={1200}
            height={675}
            className="h-auto w-full rounded-2xl border border-border/50 shadow-xl"
          />
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">
            Live capture of the YashCodes tools directory.
          </figcaption>
        </figure>

        <div className="mt-10 max-w-3xl space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            Developer utilities are usually spread across sites built around
            advertising, sign-ups, or a single narrow task. YashCodes takes the
            opposite approach: one fast, dark, keyboard-friendly directory that
            hosts a broad set of small tools and loads only the code a visitor
            actually uses.
          </p>

          <h2 className="pt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            What I built
          </h2>
          <ul className="space-y-3">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <h2 className="pt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            The tradeoffs
          </h2>
          <p>
            The site is a Next.js static export, so there is no server runtime
            to depend on. Every tool component is imported dynamically, which
            keeps the initial directory lightweight but means opening a tool
            can fetch a chunk the first time. The grid is hidden with
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
              display:none
            </code>
            while a tool is open rather than unmounted, so search text, the
            active category, and the measured filmstrip survive a round trip.
          </p>
          <p>
            The desktop filmstrip divides categories into chunks and translates
            a horizontal card track as the page scrolls. That motion is
            deliberately skipped below 768px and when reduced motion is
            requested; those visitors get the same catalog as a normal stacked
            grid.
          </p>

          <h2 className="pt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            One verified example
          </h2>
          <p>
            The JSON Editor validates input as it changes.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
              {'{"active":true}'}
            </code>{" "}
            is valid and formats to a two-line object.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
              {'{"active":true,}'}
            </code>{" "}
            is invalid because JSON does not allow a trailing comma; the editor
            shows the browser&apos;s parser message instead of silently
            accepting it.
          </p>

          <h2 className="pt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Try it
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tools/"
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Browse all 88 tools
            </Link>
            <Link
              href="/tools/json-editor/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open the JSON Editor
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back to the portfolio
            </Link>
          </div>

          <p className="pt-2 text-sm text-muted-foreground">
            The project is built with Next.js, React, TypeScript, and Tailwind
            CSS, and deployed as a static export through GitHub Actions. The
            source is public at{" "}
            <a
              href="https://github.com/yash244466666/portfolio-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              github.com/yash244466666/portfolio-v2
            </a>
            .
          </p>
        </div>
      </article>
    </PageShell>
  )
}
