"use client"

import type { MouseEvent } from "react"
import { Button } from "@/components/ui/button"

interface HeroActionsProps {
    primaryLabel: string
    secondaryLabel: string
    primaryHref: string
    secondaryHref: string
    onPrimaryClick?: (event: MouseEvent<HTMLAnchorElement>) => void
    onSecondaryClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function HeroActions({
    primaryLabel,
    secondaryLabel,
    primaryHref,
    secondaryHref,
    onPrimaryClick,
    onSecondaryClick,
}: HeroActionsProps) {
    return (
        <div
            className="animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "360ms" }}
        >
            <div className="mb-8 flex flex-col items-center justify-center gap-3 px-4 sm:mb-12 sm:flex-row sm:gap-4 sm:px-0">
                <Button
                    asChild
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 text-white shadow-lg transition-all hover:from-purple-700 hover:to-cyan-700 hover:shadow-xl sm:w-auto sm:px-8"
                >
                    <a href={primaryHref} onClick={onPrimaryClick}>
                        {primaryLabel}
                    </a>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full border-gray-600 px-6 py-3 text-gray-300 transition-all hover:bg-gray-800 hover:text-white sm:w-auto sm:px-8"
                >
                    <a href={secondaryHref} onClick={onSecondaryClick}>
                        {secondaryLabel}
                    </a>
                </Button>
            </div>
        </div>
    )
}

export default HeroActions
