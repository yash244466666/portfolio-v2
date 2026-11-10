"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import BackToTop from "@/components/back-to-top"

const AnimatedBackground = dynamic(() => import("@/components/backgrounds"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
    </div>
  ),
})

interface PageShellProps {
  children: ReactNode
  contentId?: string
  skipLabel?: string
}

/**
 * Shared shell for content pages (standalone tools, case study). The content
 * passed as children is server-rendered; only this frame is interactive.
 */
export default function PageShell({
  children,
  contentId = "page-content",
  skipLabel = "Skip to content",
}: PageShellProps) {
  return (
    <main className="min-h-screen bg-gray-950 relative">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <a
          href={`#${contentId}`}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {skipLabel}
        </a>
        <Navigation />
        <div
          id={contentId}
          className="flex-grow pb-16 pt-[calc(var(--nav-height,4.25rem)+1.5rem)]"
        >
          {children}
        </div>
        <Footer />
        <BackToTop />
      </div>
    </main>
  )
}
