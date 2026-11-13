"use client"

interface HeroTypewriterTitleProps {
    title: string
    loadingComplete: boolean
    isVisible?: boolean
}

export function HeroTypewriterTitle({ title, loadingComplete, isVisible = false }: HeroTypewriterTitleProps) {
    return (
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight min-h-[60px] sm:min-h-[80px] md:min-h-[120px]">
                {loadingComplete && (
                    <>
                        <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{title}</span>
                        <span className="animate-pulse text-yellow-400 ml-1">|</span>
                    </>
                )}
            </h1>
        </div>
    )
}

export default HeroTypewriterTitle
