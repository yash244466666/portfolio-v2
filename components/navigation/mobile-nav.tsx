"use client"

import type { MouseEvent } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavigationItem } from "@/lib/content"
import { DownloadResumeButton } from "@/components/navigation/download-resume-button"

interface MobileNavProps {
    items: NavigationItem[]
    isOpen: boolean
    onNavigate: (target: string) => void
    activeSection?: string | null
}

export function MobileNav({ items, isOpen, onNavigate, activeSection }: MobileNavProps) {
    const pathname = usePathname()
    const isHome = pathname === "/"

    if (!isOpen) {
        return null
    }

    const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
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
        onNavigate(target)
    }

    return (
        <div id="mobile-navigation" className="md:hidden mt-4 pb-4 space-y-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl">
            {items.map((item) => {
                const isToolsPage = !!item.href
                const isToolsActive = isToolsPage && (pathname === item.href || pathname === item.href?.replace(/\/$/, ""))
                const isSectionActive = !isToolsPage && activeSection === item.target
                const isActive = isToolsActive || isSectionActive
                const linkClass = `block w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`

                if (item.href) {
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            aria-current={isToolsActive ? "page" : undefined}
                            className={linkClass}
                        >
                            {item.label}
                        </Link>
                    )
                }

                if (isHome) {
                    return (
                        <a
                            key={item.label}
                            href={`#${item.target}`}
                            aria-current={isSectionActive ? "true" : undefined}
                            onClick={(event) => handleSectionClick(event, item.target)}
                            className={linkClass}
                        >
                            {item.label}
                        </a>
                    )
                }

                return (
                    <Link
                        key={item.label}
                        href={`/#${item.target}`}
                        className={linkClass}
                    >
                        {item.label}
                    </Link>
                )
            })}
            <DownloadResumeButton className="w-full mt-2 min-h-11" />
        </div>
    )
}

export default MobileNav
