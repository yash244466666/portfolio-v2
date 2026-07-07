"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import BackToTop from "@/components/back-to-top"
import ToolsPage from "@/components/tools/tools-page"

const AnimatedBackground = dynamic(() => import("@/components/backgrounds"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
    </div>
  ),
})

export default function Tools() {
  // Keep --toolbar-offset in sync with the actual rendered nav + toolbar height
  // on every viewport. The ToolsSections hook only writes this on desktop (it
  // short-circuits below 768px), so on mobile we measure the toolbar directly
  // and ensure the page never renders content under the sticky header.
  useEffect(() => {
    const write = () => {
      const nav = document.querySelector("[data-nav-root]") as HTMLElement | null
      const toolbar = document.querySelector("[data-tools-toolbar]") as HTMLElement | null
      if (!nav || !toolbar) return
      const total = nav.offsetHeight + toolbar.offsetHeight
      document.documentElement.style.setProperty("--toolbar-offset", `${total}px`)
    }
    write()
    const ro = new ResizeObserver(write)
    const nav = document.querySelector("[data-nav-root]")
    const toolbar = document.querySelector("[data-tools-toolbar]")
    if (nav) ro.observe(nav)
    if (toolbar) ro.observe(toolbar)
    window.addEventListener("resize", write)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", write)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 relative">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <a
          href="#tools-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Skip to tools content
        </a>
        <Navigation />
        <div id="tools-content" className="tools-page-content pt-[calc(var(--nav-height,4.25rem)+0.5rem)] sm:pt-[calc(var(--toolbar-offset,8.5rem)+1rem)] pb-16 flex-grow">
          <ToolsPage />
        </div>
        <Footer />
        <BackToTop />
      </div>
    </main>
  )
}