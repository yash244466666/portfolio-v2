"use client"

import { Menu, X } from "lucide-react"

interface NavigationToggleProps {
    isOpen: boolean
    onToggle: () => void
}

export function NavigationToggle({ isOpen, onToggle }: NavigationToggleProps) {
    return (
        <button onClick={onToggle} className="md:hidden text-foreground p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
    )
}

export default NavigationToggle
