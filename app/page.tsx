"use client"

import "@/lib/react-telemetry"
import { useState, useEffect } from "react"
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

const Smooth3DBackground = dynamic(() => import("@/components/background"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
    </div>
  ),
})

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [mounted, setMounted] = useState(false)

  useComponentInstrumentation("Home", {
    stateSnapshot: () => ({
      loadingComplete,
      mounted,
    }),
    trackValues: () => ({
      loadingComplete,
      mounted,
    }),
    throttleMs: 1500,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-950 relative">
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 relative">
      {/* <MouseCursor /> */}
      <Smooth3DBackground />
      {!loadingComplete && <LoadingScreen onComplete={() => setLoadingComplete(true)} />}
      {loadingComplete && (
        <div className="relative z-10">
          <Navigation />
          <HeroSection loadingComplete={loadingComplete} />
          <AboutSection />
          <ProjectsSection />
          <ContactSection />
          <Footer />
          <BackToTop />
        </div>
      )}
    </main>
  )
}
