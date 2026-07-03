"use client"

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

    return (
        <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => {
                const isToolsPage = !!item.href
                const isToolsActive = isToolsPage && (pathname === item.href || pathname === item.href?.replace(/\/$/, ""))
                const isSectionActive = !isToolsPage && activeSection === item.target
                const isActive = isToolsActive || isSectionActive

                if (item.href) {
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`nav-link text-sm font-medium transition-colors active:scale-95 active:text-primary ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {item.label}
                        </Link>
                    )
                }

                const href = pathname !== "/" ? `/#${item.target}` : undefined

                if (href) {
                    return (
                        <Link
                            key={item.label}
                            href={href}
                            className={`nav-link text-sm font-medium transition-colors active:scale-95 active:text-primary ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {item.label}
                        </Link>
                    )
                }

                return (
                    <button
                        key={item.label}
                        onClick={() => onNavigate(item.target)}
                        className={`nav-link text-sm font-medium transition-colors active:scale-95 active:text-primary ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}

export default DesktopNavLinks