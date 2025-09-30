"use client"

interface HeroHeadingProps {
    greeting: string
    name: string
    isVisible?: boolean
}

export function HeroHeading({ greeting, name, isVisible = false }: HeroHeadingProps) {
    return (
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="mb-4 sm:mb-6">
                <h2 className="font-medium text-gray-400 mb-2 text-base sm:text-lg md:text-xl">{greeting}</h2>
                <h2 className="font-bold text-white mb-4 text-3xl sm:text-4xl md:text-5xl">{name}</h2>
            </div>
        </div>
    )
}

export default HeroHeading
