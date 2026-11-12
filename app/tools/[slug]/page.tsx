import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import PageShell from "@/components/page-shell"
import { StructuredData } from "@/components/structured-data"
import ToolPlayground from "@/components/tools/tool-playground"
import { getToolPage, TOOL_PAGE_SLUGS } from "@/lib/content/tool-pages"
import { buildPageMetadata, buildToolPageStructuredData } from "@/lib/seo"

interface ToolPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return TOOL_PAGE_SLUGS.map((slug) => ({ slug }))
}

// Only the four published tool pages exist. Every other /tools/<slug> path is
// a real 404 from the static host.
export const dynamicParams = false

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getToolPage(slug)
  if (!page) return {}

  return buildPageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/tools/${page.slug}/`,
    imageAlt: `${page.label} — YashCodes developer tool`,
  })
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params
  const page = getToolPage(slug)
  if (!page) notFound()

  return (
    <PageShell contentId="tool-page-content" skipLabel="Skip to tool content">
      <StructuredData data={buildToolPageStructuredData(page)} />
      <article className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/tools/"
                className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Developer tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {page.label}
            </li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {page.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {page.intro}
          </p>
        </header>

        <div className="mt-8 max-w-3xl space-y-4">
          {page.answer.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
          <p className="text-sm text-muted-foreground/80">
            This page is part of the YashCodes developer tools collection. The
            widget below runs in your browser.
          </p>
        </div>

        <section
          aria-labelledby="worked-example-heading"
          className="mt-10 max-w-3xl rounded-2xl border border-border/50 bg-muted/20 p-5 sm:p-6"
        >
          <h2
            id="worked-example-heading"
            className="text-xl font-semibold text-foreground sm:text-2xl"
          >
            {page.example.title}
          </h2>

          {page.example.rows ? (
            <dl className="mt-5 divide-y divide-border/40 rounded-xl border border-border/40 bg-background/40">
              {page.example.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-baseline sm:gap-6"
                >
                  <dt className="text-sm font-medium text-foreground/80">{row.label}</dt>
                  <dd className="break-words font-mono text-sm text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {page.example.code ? (
            <div className="mt-5 space-y-4">
              {page.example.code.map((block) => (
                <div key={block.label}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {block.label}
                  </p>
                  <pre className="overflow-x-auto rounded-xl border border-border/40 bg-background/60 p-4 text-sm text-foreground">
                    <code className="whitespace-pre-wrap break-words font-mono">{block.value}</code>
                  </pre>
                </div>
              ))}
            </div>
          ) : null}

          {page.example.note ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {page.example.note}
            </p>
          ) : null}
        </section>

        <ToolPlayground toolId={page.toolId} />

        <nav
          aria-labelledby="related-tools-heading"
          className="mx-auto mt-12 max-w-5xl px-4 pb-4 sm:px-6"
        >
          <h2
            id="related-tools-heading"
            className="text-xl font-semibold text-foreground sm:text-2xl"
          >
            Related tools
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {page.related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-border/60 bg-muted/40 px-4 text-sm font-medium text-foreground/90 transition-colors hover:border-border hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </PageShell>
  )
}
