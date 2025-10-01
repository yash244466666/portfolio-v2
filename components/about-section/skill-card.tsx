"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

export interface SkillCardProps {
    icon: ReactNode
    title: string
    description: string
    animationDelay?: number
    isVisible?: boolean
}

export function SkillCard({ icon, title, description, animationDelay = 0, isVisible = false }: SkillCardProps) {
    return (
        <Card
            className={`p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm bg-background/80 ${isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="flex justify-center mb-4">{icon}</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">{title}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>
        </Card>
    )
}

export default SkillCard
