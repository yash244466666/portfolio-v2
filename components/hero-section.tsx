"use client"

import { useCallback, type MouseEvent } from "react"
import { getPersonalInfo, getSocialLinks, getButtonTexts } from "@/lib/content/utils"
import { useCyclingTypewriter } from "@/hooks/use-cycling-typewriter"
import { HeroHeading } from "@/components/hero-section/hero-heading"
import { HeroTypewriterTitle } from "@/components/hero-section/hero-typewriter-title"
import { HeroDescription } from "@/components/hero-section/hero-description"
import { HeroActions } from "@/components/hero-section/hero-actions"
import { HeroSocialLinks } from "@/components/hero-section/hero-social-links"
import { ScrollIndicator } from "@/components/hero-section/scroll-indicator"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export default function HeroSection() {
  const personalInfo = getPersonalInfo()
  const socialLinks = getSocialLinks()
  const buttonTexts = getButtonTexts()

  const title = useCyclingTypewriter(personalInfo.typingTitles, {
    typingSpeed: 80,
    deletingSpeed: 50,
    pauseDuration: 2000,
    startDelay: 800,
  })

  useComponentInstrumentation("HeroSection", {
    stateSnapshot: () => ({ currentTitle: title }),
    trackValues: () => ({ title }),
    throttleMs: 1500,
  })

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (!element) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" })
    logComponentEvent("HeroSection", {
      event: "scroll-to",
      detail: { sectionId },
      throttleMs: 1500,
    })
  }, [])

  // Plain left clicks use the animated scroll. Modified clicks keep native
  // anchor behaviour so "Open in new tab", copy link, and keyboard activation
  // all continue to work.
  const handleAnchorClick = useCallback(
    (sectionId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      event.preventDefault()
      scrollToSection(sectionId)
    },
    [scrollToSection]
  )

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20 sm:px-6">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <HeroHeading
          greeting={personalInfo.greeting}
          firstLine={personalInfo.nameFirstLine}
          emphasis={personalInfo.nameEmphasis}
          fullName={personalInfo.fullName}
        />
        <HeroTypewriterTitle title={title} />
        <HeroDescription tagline={personalInfo.tagline} />
        <HeroActions
          primaryLabel={buttonTexts.viewMyWork}
          secondaryLabel={buttonTexts.letsTalk}
          primaryHref="#projects"
          secondaryHref="#contact"
          onPrimaryClick={handleAnchorClick("projects")}
          onSecondaryClick={handleAnchorClick("contact")}
        />
        <HeroSocialLinks links={socialLinks} />
        <ScrollIndicator href="#about" onClick={handleAnchorClick("about")} />
      </div>
    </section>
  )
}
