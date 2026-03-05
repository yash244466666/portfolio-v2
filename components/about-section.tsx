"use client"

import { useCallback, useMemo } from "react"
import { getSectionContent, getSkills } from "@/lib/content/utils"
import { useSectionVisibility } from "@/hooks/use-section-visibility"
import { AboutSectionHeader } from "@/components/about-section/about-section-header"
import { AboutBackground } from "@/components/about-section/about-background"
import { SkillsGrid } from "@/components/about-section/skills-grid"
import { SkillIcon } from "@/components/about-section/skill-icon"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export default function AboutSection() {
  const shouldSkipVisibility = useCallback(() => {
    if (typeof window === "undefined") {
      return false
    }
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    return isSmallScreen || prefersReducedMotion
  }, [])

  const { sectionRef, isVisible } = useSectionVisibility<HTMLElement>({
    threshold: 0.25,
    rootMargin: "0px 0px -10%",
    shouldSkip: shouldSkipVisibility,
  })

  const sectionContent = getSectionContent("about")
  const skillsData = getSkills()

  const skillsWithIcons = useMemo(
    () =>
      skillsData.map((skill) => ({
        icon: <SkillIcon icon={skill.icon} />,
        title: skill.title,
        description: skill.description,
      })),
    [skillsData],
  )

  useComponentInstrumentation("AboutSection", {
    metricsSnapshot: () => ({
      isVisible,
      skillsCount: skillsData.length,
    }),
    trackValues: () => ({ isVisible }),
    throttleMs: 1500,
  })

  logComponentEvent("AboutSection", {
    event: "render",
    throttleMs: 3000,
  })

  return (
    <section id="about" ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30 relative overflow-hidden">
      <AboutBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <AboutSectionHeader
          heading={sectionContent.heading}
          description={sectionContent.description}
          isVisible={isVisible}
        />

        <SkillsGrid skills={skillsWithIcons} isVisible={isVisible} />
      </div>
    </section>
  )
}
