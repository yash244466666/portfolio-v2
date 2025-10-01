"use client"

interface ProjectsSectionHeaderProps {
    heading: string
    description: string
    isVisible?: boolean
}

export function ProjectsSectionHeader({ heading, description, isVisible = false }: ProjectsSectionHeaderProps) {
    return (
        <div
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
        >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">{heading}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                {description}
            </p>
        </div>
    )
}

export default ProjectsSectionHeader
