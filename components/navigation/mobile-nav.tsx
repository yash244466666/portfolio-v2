"use client"

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

    if (!isOpen) {
        return null
    }

    return (
        <div className="md:hidden mt-4 pb-4 space-y-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl">
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
                            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
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
                            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                        >
                            {item.label}
                        </Link>
                    )
                }

                return (
                    <button
                        key={item.label}
                        onClick={() => onNavigate(item.target)}
                        className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                    >
                        {item.label}
                    </button>
                )
            })}
            <DownloadResumeButton className="w-full mt-2 min-h-11" />
        </div>
    )
}

export default MobileNav