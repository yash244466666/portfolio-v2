"use client"

import type { Project } from "@/lib/content"
import { ProjectCard } from "./project-card"

interface ProjectsGridProps {
    projects: Project[]
    buttonTexts: {
        code: string
        liveDemo: string
    }
    isVisible?: boolean
}

export function ProjectsGrid({ projects, buttonTexts, isVisible = false }: ProjectsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {projects.map((project, index) => (
                <ProjectCard
                    key={`${project.title}-${index}`}
                    project={project}
                    buttonTexts={buttonTexts}
                    animationDelay={index * 200}
                    isVisible={isVisible}
                />
            ))}
        </div>
    )
}

export default ProjectsGrid
