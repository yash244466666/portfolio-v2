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
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-6 sm:px-8 py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                    {primaryLabel}
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onSecondaryClick}
                    className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-6 sm:px-8 py-3 transition-all transform hover:scale-105"
                >
                    {secondaryLabel}
                </Button>
            </div>
        </div>
    )
}

export default HeroActions
