"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Github, Linkedin, Mail, Twitter } from "lucide-react"

function useCyclingTypewriter(
  phrases: string[],
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
  startDelay = 0,
) {
  const [displayText, setDisplayText] = useState("")
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [shouldStart, setShouldStart] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldStart(true)
    }, startDelay)
    return () => clearTimeout(timer)
  }, [startDelay])

  useEffect(() => {
    if (!shouldStart) return

    const currentPhrase = phrases[currentPhraseIndex]

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentPhrase.length) {
            setDisplayText(currentPhrase.slice(0, displayText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), pauseDuration)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    )

    return () => clearTimeout(timeout)
  }, [displayText, currentPhraseIndex, isDeleting, phrases, typingSpeed, deletingSpeed, pauseDuration, shouldStart])

  return displayText
}

export default function HeroSection({ loadingComplete }: { loadingComplete: boolean }) {
  const [isVisible, setIsVisible] = useState(false)

  const typingPhrases = [
    "Full Stack Software Engineer",
    "Web Developer",
    "Frontend Specialist",
    "Backend Expert",
    "React Developer",
    "Ruby on Rails Developer",
  ]

  const title = useCyclingTypewriter(typingPhrases, 80, 50, 2000, 800)

  useEffect(() => {
    if (loadingComplete) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [loadingComplete])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 relative overflow-hidden bg-gray-950">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="mb-4 sm:mb-6">
            <h2 className="font-medium text-gray-400 mb-2 text-base sm:text-lg md:text-xl">Hi, I'm</h2>
            <h2 className="font-bold text-white mb-4 text-3xl sm:text-4xl md:text-5xl">Yash</h2>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight min-h-[60px] sm:min-h-[80px] md:min-h-[120px]">
            {loadingComplete && (
              <>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {title}
                </span>
                <span className="animate-pulse text-purple-400 ml-1">|</span>
              </>
            )}
          </h1>
        </div>

        <div className={`transition-all duration-1000 delay-200 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            I'm a software builder who loves coding and making things work faster and efficiently. I create scalable web
            applications using JavaScript, React, Ruby on Rails, and modern tech stacks.
          </p>
        </div>

        <div className={`transition-all duration-1000 delay-400 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
            <Button
              size="lg"
              onClick={() => scrollToSection("projects")}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-6 sm:px-8 py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              View My Work
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection("contact")}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-6 sm:px-8 py-3 transition-all transform hover:scale-105"
            >
              Let's Talk
            </Button>
          </div>
        </div>

        <div className={`transition-all duration-1000 delay-600 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 mb-8 sm:mb-12">
            <a
              href="https://github.com/yashcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-all hover:scale-110 transform p-2"
            >
              <Github size={20} className="sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://linkedin.com/in/yashcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-all hover:scale-110 transform p-2"
            >
              <Linkedin size={20} className="sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://twitter.com/yashcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-all hover:scale-110 transform p-2"
            >
              <Twitter size={20} className="sm:w-6 sm:h-6" />
            </a>
            <a
              href="mailto:info@yashcodes.com"
              className="text-gray-400 hover:text-cyan-400 transition-all hover:scale-110 transform p-2"
            >
              <Mail size={20} className="sm:w-6 sm:h-6" />
            </a>
          </div>
        </div>

        <div className={`transition-all duration-1000 delay-800 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
          <button
            onClick={() => scrollToSection("about")}
            className="text-gray-400 hover:text-purple-400 transition-colors animate-bounce"
          >
            <ArrowDown size={24} />
          </button>
        </div>
      </div>
    </section>
  )
}
