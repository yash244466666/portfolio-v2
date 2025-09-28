"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { getPersonalInfo, getButtonTexts } from "@/lib/content/utils"
import { navigationItems } from "@/lib/content"

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const personalInfo = getPersonalInfo()
  const buttonTexts = getButtonTexts()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xl text-foreground">{personalInfo.name}</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.target)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => scrollToSection("contact")}
              className="hidden sm:block bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {buttonTexts.getInTouch}
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-foreground p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  scrollToSection(item.target)
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => {
                scrollToSection("contact")
                setIsMobileMenuOpen(false)
              }}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {buttonTexts.getInTouch}
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
