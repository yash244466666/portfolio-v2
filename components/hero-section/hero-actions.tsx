"use client"

import { Button } from "@/components/ui/button"

interface HeroActionsProps {
    primaryLabel: string
    secondaryLabel: string
    onPrimaryClick: () => void
    onSecondaryClick: () => void
    isVisible?: boolean
}

export function HeroActions({
    primaryLabel,
    secondaryLabel,
    onPrimaryClick,
    onSecondaryClick,
    isVisible = false,
}: HeroActionsProps) {
    return (
        <div className={`transition-all duration-1000 delay-400 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
                <Button
                    size="lg"
                    onClick={onPrimaryClick}
                    className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold px-6 sm:px-8 py-3 shadow-lg shadow-yellow-400/15 hover:shadow-xl hover:shadow-yellow-400/25 transition-all transform hover:scale-105"
                >
                    {primaryLabel}
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onSecondaryClick}
                    className="w-full sm:w-auto border-zinc-700 text-zinc-200 hover:bg-zinc-800/80 hover:border-yellow-400/50 hover:text-yellow-300 px-6 sm:px-8 py-3 transition-all transform hover:scale-105"
                >
                    {secondaryLabel}
                </Button>
            </div>
        </div>
    )
}

export default HeroActions
