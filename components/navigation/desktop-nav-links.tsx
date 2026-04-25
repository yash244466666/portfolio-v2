"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavigationItem } from "@/lib/content"

interface DesktopNavLinksProps {
    items: NavigationItem[]
    onNavigate: (target: string) => void
}

export function DesktopNavLinks({ items, onNavigate }: DesktopNavLinksProps) {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => {
                if (item.href) {
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-muted-foreground hover:text-foreground transition-colors"
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
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    )
                }

                return (
                    <button
                        key={item.label}
                        onClick={() => onNavigate(item.target)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}

export default DesktopNavLinks