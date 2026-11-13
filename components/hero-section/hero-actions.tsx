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
                    className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold px-6 sm:px-8 py-3 shadow-lg shadow-yellow-400/15 hover:shadow-xl hover:shadow-yellow-400/25 transition-all"
                >
                    <a href={primaryHref} onClick={onPrimaryClick}>
                        {primaryLabel}
                    </a>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-zinc-700 text-zinc-200 hover:bg-zinc-800/80 hover:border-yellow-400/50 hover:text-yellow-300 px-6 sm:px-8 py-3 transition-all"
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
