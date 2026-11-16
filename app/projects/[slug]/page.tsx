import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProjectDemo } from "@/components/projects-section/project-demo"
import PageShell from "@/components/page-shell"
import { projectPages, projectPagePath } from "@/lib/content/project-pages"
import { buildPageMetadata } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return projectPages.map(({ slug }) => ({ slug }))
}

export const dynamicParams = false

async function getPage(params: Props["params"]) {
  const { slug } = await params
  const page = projectPages.find((entry) => entry.slug === slug)
  if (!page) notFound()
  return page
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, project } = await getPage(params)
  return buildPageMetadata({
    title: `${project.title} Case Study | YashCodes`,
    description: project.description,
    path: projectPagePath(slug),
    type: "article",
    imagePath: project.image,
    imageAlt: project.imageAlt,
  })
}

export default async function ProjectCaseStudy({ params }: Props) {
  const { slug, project } = await getPage(params)
  return (
    <PageShell contentId="case-study-content" skipLabel="Skip to case study">
      <article className="mx-auto max-w-4xl space-y-6 px-4 pb-12 sm:px-6">
        <Link href="/#projects" className="underline underline-offset-4">All projects</Link>
        <header className="space-y-3">
          <p className="text-muted-foreground">{project.role}</p>
          <h1 className="text-3xl font-bold sm:text-5xl">{project.title}</h1>
          <p className="text-lg text-muted-foreground">{project.description}</p>
        </header>
        <figure>
          <Image src={project.image} alt={project.imageAlt ?? ""} width={1200} height={675} className="h-auto w-full rounded-2xl" />
          <figcaption className="mt-2 text-sm text-muted-foreground">{project.artworkLabel}</figcaption>
        </figure>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">My contribution</h2>
          {project.longDescription?.split("\n\n").map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-muted-foreground">{paragraph}</p>
          ))}
          <ul aria-label="Technologies and topics" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {project.tech.map((technology) => (
              <li key={technology} className="rounded-full border border-border px-3 py-1">{technology}</li>
            ))}
          </ul>
        </section>
        <ProjectDemo slug={slug} />
        {project.links?.filter((link) => link.external).map((link) => (
          <a key={link.href} href={link.href} className="block underline underline-offset-4">{link.label}</a>
        ))}
      </article>
    </PageShell>
  )
}
