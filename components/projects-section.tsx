"use client"

import { useCallback } from "react"
import { getSectionContent, getProjects, getButtonTexts, getAdditionalWork } from "@/lib/content/utils"
import { useSectionVisibility } from "@/hooks/use-section-visibility"
import { ProjectsBackground } from "@/components/projects-section/projects-background"
import { ProjectsSectionHeader } from "@/components/projects-section/projects-section-header"
import { ProjectsGrid } from "@/components/projects-section/projects-grid"
import { MoreEngineeringWork } from "@/components/projects-section/more-engineering-work"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export default function ProjectsSection() {
  const shouldSkipVisibility = useCallback(() => {
    if (typeof window === "undefined") {
      return false
    }
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    return isSmallScreen || prefersReducedMotion
  }, [])

  const { sectionRef, isVisible } = useSectionVisibility<HTMLElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -10%",
    shouldSkip: shouldSkipVisibility,
  })

  const sectionContent = getSectionContent("projects")
  const projects = getProjects()
  const buttonTexts = getButtonTexts()
  const additionalWork = getAdditionalWork()

  useComponentInstrumentation("ProjectsSection", {
    metricsSnapshot: () => ({
      isVisible,
      projectCount: projects.length,
      additionalWorkCount: additionalWork.length,
    }),
    trackValues: () => ({ isVisible }),
    throttleMs: 1500,
  })

  logComponentEvent("ProjectsSection", {
    event: "render",
    detail: { projects: projects.length },
    throttleMs: 2500,
  })

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      ref={sectionRef}
      className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden"
    >
      <ProjectsBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <ProjectsSectionHeader
          heading={sectionContent.heading}
          description={sectionContent.description}
          isVisible={isVisible}
        />

        <ProjectsGrid
          projects={projects}
          viewDetailsLabel={buttonTexts.viewDetails}
          isVisible={isVisible}
        />

        <MoreEngineeringWork
          heading={sectionContent.moreWorkHeading}
          items={additionalWork}
          isVisible={isVisible}
        />
      </div>
    </section>
  )
}
