"use client"

import type { MouseEvent } from "react"
import { ArrowDown } from "lucide-react"

interface ScrollIndicatorProps {
    href: string
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
    label?: string
}

export function ScrollIndicator({
    href,
    onClick,
    label = "Scroll to About",
}: ScrollIndicatorProps) {
    return (
        <div
            className="animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "600ms" }}
        >
            <a
                href={href}
                onClick={onClick}
                aria-label={label}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground transition-colors hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <ArrowDown size={24} aria-hidden="true" className="animate-bounce motion-reduce:animate-none" />
            </a>
        </div>
    )
}

export default ScrollIndicator
