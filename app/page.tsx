"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import ProjectsSection from "@/components/projects-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import BackToTop from "@/components/back-to-top"

// Performance-optimized background loading
const LightweightBackground = dynamic(() => import("@/components/lightweight-background"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
    </div>
  ),
})

// Conditionally load the heavy 3D background only for high-end devices
const Smooth3DBackground = dynamic(() => import("@/components/smooth-3d-background"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
    </div>
  ),
})

// Optimized mouse cursor
const OptimizedMouseCursor = dynamic(() => import("@/components/optimized-mouse-cursor"), {
  ssr: false,
})

export default function OptimizedHome() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [useHeavyBackground, setUseHeavyBackground] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Performance check for device capabilities
    const checkDeviceCapabilities = () => {
      // Check various performance indicators
      const hasWebGL = (() => {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        return !!gl
      })()

      const isHighEndDevice = 
        navigator.hardwareConcurrency >= 4 && // At least 4 CPU cores
        hasWebGL && // WebGL support
        window.innerWidth >= 1024 && // Reasonable screen size
        !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) // Not mobile

      // Additional memory check if available
      const hasEnoughMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory >= 4 : true

      return isHighEndDevice && hasEnoughMemory
    }

    // Only use heavy 3D background for capable devices
    setUseHeavyBackground(checkDeviceCapabilities())
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-950 relative">
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      </main>
    )
  }

  const BackgroundComponent = useHeavyBackground ? Smooth3DBackground : LightweightBackground

  return (
    <main className="min-h-screen bg-gray-950 relative">
      <OptimizedMouseCursor />
      <BackgroundComponent />
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