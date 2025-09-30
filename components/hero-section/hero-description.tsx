"use client"

interface HeroDescriptionProps {
    tagline: string
    isVisible?: boolean
}

export function HeroDescription({ tagline, isVisible = false }: HeroDescriptionProps) {
    return (
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                {tagline}
            </p>
        </div>
    )
}

export default HeroDescription
