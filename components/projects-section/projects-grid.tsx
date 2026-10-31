"use client"

import { useCallback, useState } from "react"
import type { Project } from "@/lib/content"
import { getProjectModalContent } from "@/lib/content/utils"
import { ProjectCard } from "./project-card"
import { ProjectModal } from "./project-modal"

interface ProjectsGridProps {
    projects: Project[]
    buttonTexts: {
        code: string
        liveDemo: string
    }
    isVisible?: boolean
}

interface ActiveProject {
    project: Project
    trigger: HTMLElement | null
}

export function ProjectsGrid({ projects, buttonTexts, isVisible = false }: ProjectsGridProps) {
    const modalContent = getProjectModalContent()
    const [activeProject, setActiveProject] = useState<ActiveProject | null>(null)

    const handleSelect = useCallback((project: Project, trigger: HTMLElement | null) => {
        setActiveProject({ project, trigger })
    }, [])

    const handleClose = useCallback(() => {
        setActiveProject(null)
    }, [])

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {projects.map((project, index) => (
                    <ProjectCard
                        key={`${project.title}-${index}`}
                        project={project}
                        buttonTexts={buttonTexts}
                        modalContent={modalContent}
                        onSelect={handleSelect}
                        animationDelay={index * 200}
                        isVisible={isVisible}
                    />
                ))}
            </div>
            {activeProject ? (
                <ProjectModal
                    project={activeProject.project}
                    trigger={activeProject.trigger}
                    onClose={handleClose}
                    buttonTexts={buttonTexts}
                    modalContent={modalContent}
                />
            ) : null}
        </>
    )
}

export default ProjectsGrid
