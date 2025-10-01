"use client"

import { useCallback } from "react"
import { getSectionContent, getProjects, getButtonTexts } from "@/lib/content/utils"
import { useSectionVisibility } from "@/hooks/use-section-visibility"
import { useShouldRenderCanvas } from "@/hooks/use-should-render-canvas"
import { ProjectsBackground } from "@/components/projects-section/projects-background"
import { ProjectsSectionHeader } from "@/components/projects-section/projects-section-header"
import { ProjectsGrid } from "@/components/projects-section/projects-grid"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export default function ProjectsSection() {
  const shouldRenderCanvas = useShouldRenderCanvas()

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
  const projectButtonTexts = {
    code: buttonTexts.code,
    liveDemo: buttonTexts.liveDemo,
  }

  useComponentInstrumentation("ProjectsSection", {
    metricsSnapshot: () => ({
      shouldRenderCanvas,
      isVisible,
      projectCount: projects.length,
    }),
    trackValues: () => ({ isVisible, shouldRenderCanvas }),
    throttleMs: 1500,
  })

  logComponentEvent("ProjectsSection", {
    event: "render",
    detail: { projects: projects.length },
    throttleMs: 2500,
  })

  return (
    <section id="projects" ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      <ProjectsBackground shouldRenderCanvas={shouldRenderCanvas} />

      <div className="max-w-6xl mx-auto relative z-10">
        <ProjectsSectionHeader
          heading={sectionContent.heading}
          description={sectionContent.description}
          isVisible={isVisible}
        />

        <ProjectsGrid projects={projects} buttonTexts={projectButtonTexts} isVisible={isVisible} />
      </div>
    </section>
  )
}
