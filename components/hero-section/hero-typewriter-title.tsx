"use client"

interface HeroTypewriterTitleProps {
    title: string
    loadingComplete: boolean
    isVisible?: boolean
}

export function HeroTypewriterTitle({ title, loadingComplete, isVisible = false }: HeroTypewriterTitleProps) {
    return (
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight min-h-[60px] sm:min-h-[80px] md:min-h-[120px]">
                {loadingComplete && (
                    <>
                        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{title}</span>
                        <span className="animate-pulse text-purple-400 ml-1">|</span>
                    </>
                )}
            </h1>
        </div>
    )
}

export default HeroTypewriterTitle
