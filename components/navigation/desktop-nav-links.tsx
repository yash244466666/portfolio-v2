"use client"

import type { MouseEvent } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavigationItem } from "@/lib/content"

interface DesktopNavLinksProps {
    items: NavigationItem[]
    onNavigate: (target: string) => void
    activeSection?: string | null
}

export function DesktopNavLinks({ items, onNavigate, activeSection }: DesktopNavLinksProps) {
    const pathname = usePathname()
    const isHome = pathname === "/"

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
        <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => {
                const isToolsPage = !!item.href
                const isToolsActive = isToolsPage && (pathname === item.href || pathname === item.href?.replace(/\/$/, ""))
                const isSectionActive = !isToolsPage && activeSection === item.target
                const isActive = isToolsActive || isSectionActive
                const linkClass = `nav-link text-sm font-medium transition-colors active:scale-95 active:text-primary ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`

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
        </div>
    )
}

export default DesktopNavLinks
