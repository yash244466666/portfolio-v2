"use client"

import { ArrowDown } from "lucide-react"

interface ScrollIndicatorProps {
    onClick: () => void
    isVisible?: boolean
}

export function ScrollIndicator({ onClick, isVisible = false }: ScrollIndicatorProps) {
    return (
        <div className={`transition-all duration-1000 delay-800 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
            <button onClick={onClick} className={`text-muted-foreground hover:text-yellow-400 transition-colors ${isVisible ? "animate-bounce" : ""}`}>
                <ArrowDown size={24} />
            </button>
        </div>
    )
}

export default ScrollIndicator
