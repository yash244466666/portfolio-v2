"use client"

import type { NavigationItem } from "@/lib/content"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
    items: NavigationItem[]
    isOpen: boolean
    onNavigate: (target: string) => void
    contactLabel: string
    onContactClick: () => void
}

export function MobileNav({ items, isOpen, onNavigate, contactLabel, onContactClick }: MobileNavProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div className="md:hidden mt-4 pb-4 space-y-4">
            {items.map((item) => (
                <button
                    key={item.label}
                    onClick={() => onNavigate(item.target)}
                    className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {item.label}
                </button>
            ))}
            <Button onClick={onContactClick} className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                {contactLabel}
            </Button>
        </div>
    )
}

export default MobileNav
