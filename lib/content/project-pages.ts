import { projects } from "@/lib/content"

export const aiWorkPath = "/projects/ai-agents/"

export function projectPagePath(slug: string) {
  return `/projects/${slug}/`
}

export const projectPages = projects.flatMap((project) => {
  const caseStudy = project.links?.find((link) => link.href.startsWith("/projects/"))
  if (!caseStudy) return []
  const slug = caseStudy.href.split("/")[2]
  return [{ slug, project }]
})
