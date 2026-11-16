"use client"

import "@/lib/react-telemetry"
import { useState } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import ProjectsSection from "@/components/projects-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
// import MouseCursor from "@/components/mouse-cursor"
import BackToTop from "@/components/back-to-top"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { useHashScroll } from "@/hooks/use-hash-scroll"

const AnimatedBackground = dynamic(() => import("@/components/backgrounds"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-background to-black opacity-50" />
    </div>
  ),
})

/**
 * The portfolio content is rendered immediately and stays in the exported
 * HTML. The loading screen is a decorative overlay on top of it; it fades out
 * on its own (and is hidden entirely without JavaScript or with reduced
 * motion) so it can never trap a visitor.
 */
export default function HomePage() {
  const [loadingComplete, setLoadingComplete] = useState(false)

  useComponentInstrumentation("Home", {
    stateSnapshot: () => ({ loadingComplete }),
    trackValues: () => ({ loadingComplete }),
    throttleMs: 1500,
  })

  useHashScroll(true)

  return (
    <div className="min-h-screen bg-background relative">
      {/* <MouseCursor /> */}
      <AnimatedBackground />
      <div className="relative z-10">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Skip to main content
        </a>
        <Navigation />
        <main id="main-content">
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <ContactSection />
        </main>
        <Footer />
        <BackToTop />
      </div>
      {!loadingComplete && <LoadingScreen onComplete={() => setLoadingComplete(true)} />}
    </div>
  )
}
