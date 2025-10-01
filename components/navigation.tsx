"use client"

import { useCallback, useState } from "react"
import { getPersonalInfo, getButtonTexts } from "@/lib/content/utils"
import { navigationItems } from "@/lib/content"
import { useScrollThreshold } from "@/hooks/use-scroll-threshold"
import { DesktopNavLinks } from "@/components/navigation/desktop-nav-links"
import { NavigationActions } from "@/components/navigation/navigation-actions"
import { NavigationToggle } from "@/components/navigation/navigation-toggle"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export default function Navigation() {
  const isScrolled = useScrollThreshold(50)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const personalInfo = getPersonalInfo()
  const buttonTexts = getButtonTexts()

  useComponentInstrumentation("Navigation", {
    stateSnapshot: () => ({ isScrolled, isMobileMenuOpen }),
    trackValues: () => ({ isScrolled, isMobileMenuOpen }),
    throttleMs: 1200,
  })

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      logComponentEvent("Navigation", {
        event: "scroll-to",
        detail: { sectionId },
        throttleMs: 1500,
      })
    }
  }, [])

  const handleNavigate = useCallback(
    (target: string) => {
      scrollToSection(target)
      setIsMobileMenuOpen(false)
      logComponentEvent("Navigation", {
        event: "navigate",
        detail: { target },
        throttleMs: 1200,
      })
    },
    [scrollToSection],
  )

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => {
      const next = !prev
      logComponentEvent("Navigation", {
        event: "toggle-mobile",
        detail: { isOpen: next },
        throttleMs: 1200,
      })
      return next
    })
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xl text-foreground">{personalInfo.name}</div>

          <DesktopNavLinks items={navigationItems} onNavigate={handleNavigate} />

          <div className="flex items-center space-x-4">
            <NavigationActions
              contactLabel={buttonTexts.getInTouch}
              onContactClick={() => handleNavigate("contact")}
            />
            <NavigationToggle isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />
          </div>
        </div>

        <MobileNav
          items={navigationItems}
          isOpen={isMobileMenuOpen}
          onNavigate={handleNavigate}
          contactLabel={buttonTexts.getInTouch}
          onContactClick={() => handleNavigate("contact")}
        />
      </div>
    </nav>
  )
}
