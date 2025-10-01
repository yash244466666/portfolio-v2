"use client"

import { useCallback, useEffect, useState } from "react"
import { getPersonalInfo, getSocialLinks, getButtonTexts } from "@/lib/content/utils"
import { useCyclingTypewriter } from "@/hooks/use-cycling-typewriter"
import { HeroHeading } from "@/components/hero-section/hero-heading"
import { HeroTypewriterTitle } from "@/components/hero-section/hero-typewriter-title"
import { HeroDescription } from "@/components/hero-section/hero-description"
import { HeroActions } from "@/components/hero-section/hero-actions"
import { HeroSocialLinks } from "@/components/hero-section/hero-social-links"
import { ScrollIndicator } from "@/components/hero-section/scroll-indicator"

export default function HeroSection({ loadingComplete }: { loadingComplete: boolean }) {
  const [isVisible, setIsVisible] = useState(false)

  const personalInfo = getPersonalInfo()
  const socialLinks = getSocialLinks()
  const buttonTexts = getButtonTexts()

  const title = useCyclingTypewriter(personalInfo.typingTitles, {
    typingSpeed: 80,
    deletingSpeed: 50,
    pauseDuration: 2000,
    startDelay: 800,
  })

  useEffect(() => {
    if (!loadingComplete) {
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [loadingComplete])

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 relative overflow-hidden bg-gray-950">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <HeroHeading greeting={personalInfo.greeting} name={personalInfo.name} isVisible={isVisible} />
        <HeroTypewriterTitle title={title} loadingComplete={loadingComplete} isVisible={isVisible} />
        <HeroDescription tagline={personalInfo.tagline} isVisible={isVisible} />
        <HeroActions
          primaryLabel={buttonTexts.viewMyWork}
          secondaryLabel={buttonTexts.letsTalk}
          onPrimaryClick={() => scrollToSection("projects")}
          onSecondaryClick={() => scrollToSection("contact")}
          isVisible={isVisible}
        />
        <HeroSocialLinks links={socialLinks} isVisible={isVisible} />
        <ScrollIndicator onClick={() => scrollToSection("about")} isVisible={isVisible} />
      </div>
    </section>
  )
}
