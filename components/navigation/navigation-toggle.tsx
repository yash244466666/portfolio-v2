"use client"

import { Menu, X } from "lucide-react"

interface NavigationToggleProps {
    isOpen: boolean
    onToggle: () => void
}

export function NavigationToggle({ isOpen, onToggle }: NavigationToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
        >
            {isOpen ? (
                <X size={24} aria-hidden="true" />
            ) : (
                <Menu size={24} aria-hidden="true" />
            )}
        </button>
    )
}

export default NavigationToggle
