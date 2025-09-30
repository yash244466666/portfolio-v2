"use client"

import { useCallback, useMemo } from "react"
import { getSectionContent, getSkills } from "@/lib/content/utils"
import { useSectionVisibility } from "@/hooks/use-section-visibility"
import { useShouldRenderCanvas } from "@/hooks/use-should-render-canvas"
import { AboutSectionHeader } from "@/components/about-section/about-section-header"
import { AboutBackground } from "@/components/about-section/about-background"
import { SkillsGrid } from "@/components/about-section/skills-grid"
import { SkillIcon } from "@/components/about-section/skill-icon"

export default function AboutSection() {
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

  return (
    <section id="about" ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30 relative overflow-hidden">
      <AboutBackground shouldRenderCanvas={shouldRenderCanvas} />

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
