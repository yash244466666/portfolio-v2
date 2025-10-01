"use client"

import type { NavigationItem } from "@/lib/content"

interface DesktopNavLinksProps {
    items: NavigationItem[]
    onNavigate: (target: string) => void
}

export function DesktopNavLinks({ items, onNavigate }: DesktopNavLinksProps) {
    return (
        <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
                <button
                    key={item.label}
                    onClick={() => onNavigate(item.target)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    {item.label}
                </button>
            ))}
        </div>
    )
}

export default DesktopNavLinks
