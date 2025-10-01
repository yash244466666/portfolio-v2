"use client"

import type { ReactNode } from "react"
import { SkillCard } from "./skill-card"

export interface SkillItem {
    icon: ReactNode
    title: string
    description: string
}

interface SkillsGridProps {
    skills: SkillItem[]
    isVisible?: boolean
}

export function SkillsGrid({ skills, isVisible = false }: SkillsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {skills.map((skill, index) => (
                <SkillCard
                    key={`${skill.title}-${index}`}
                    icon={skill.icon}
                    title={skill.title}
                    description={skill.description}
                    animationDelay={index * 200}
                    isVisible={isVisible}
                />
            ))}
        </div>
    )
}

export default SkillsGrid
