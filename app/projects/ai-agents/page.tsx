import Link from "next/link"
import PageShell from "@/components/page-shell"
import { buildPageMetadata } from "@/lib/seo"
import { aiWorkPath, projectPagePath, projectPages } from "@/lib/content/project-pages"

const description =
  "AI engineering work by MD. Mohi Minul Islam Yash, including a vision-driven desktop prototype, marketplace voice workflows, and social media automation."

const aiProjectSlugs = [
  "vision-desktop-agent",
  "provider-scheduling-marketplace",
  "ai-social-media-automation",
]

export const metadata = buildPageMetadata({
  title: "AI Agents and Automation Projects | YashCodes",
  description,
  path: aiWorkPath,
})

export default function AIWorkPage() {
  const aiProjects = aiProjectSlugs.flatMap((slug) =>
    projectPages.filter((entry) => entry.slug === slug)
  )

  return (
    <PageShell contentId="ai-work-content" skipLabel="Skip to AI project work">
      <article className="mx-auto max-w-4xl space-y-8 px-4 pb-12 sm:px-6">
        <Link href="/#projects" className="underline underline-offset-4">All projects</Link>
        <header className="space-y-4">
          <h1 className="text-3xl font-bold sm:text-5xl">AI Agents and Automation Projects</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>
        </header>
        <ul className="space-y-5">
          {aiProjects.map(({ slug, project }) => (
            <li key={slug} className="space-y-3 rounded-2xl border border-border/60 p-5 sm:p-6">
              <h2 className="text-xl font-semibold">
                <Link href={projectPagePath(slug)} className="underline underline-offset-4">
                  {project.title}
                </Link>
              </h2>
              <Link href={projectPagePath(slug) + "#demo"} className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4">
                Try the {project.title} demo
              </Link>
              {(project.longDescription ?? project.description).split("\n\n").map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-muted-foreground">{paragraph}</p>
              ))}
            </li>
          ))}
        </ul>
      </article>
    </PageShell>
  )
}
