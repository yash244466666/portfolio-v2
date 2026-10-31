"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import type { Project, ProjectModalContent } from "@/lib/content"
import { ProjectActions } from "./project-actions"

interface ProjectCardProps {
    project: Project
    buttonTexts: {
        code: string
        liveDemo: string
    }
    modalContent: ProjectModalContent
    /** Opens the detail modal; the trigger element is used to restore focus. */
    onSelect: (project: Project, trigger: HTMLElement | null) => void
    animationDelay?: number
    isVisible?: boolean
}

export function ProjectCard({
    project,
    buttonTexts,
    modalContent,
    onSelect,
    animationDelay = 0,
    isVisible = false,
}: ProjectCardProps) {
    const openLabel = modalContent.openLabelTemplate.split("{title}").join(project.title)

    return (
        <Card
            className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group backdrop-blur-sm bg-background/90 ${isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
            </div>

            <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">{project.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                        <span key={`${project.title}-${tech}-${techIndex}`} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                            {tech}
                        </span>
                    ))}
                </div>

                <ProjectActions
                    project={project}
                    buttonTexts={buttonTexts}
                    unavailableLabel={modalContent.unavailableLabel}
                    size="sm"
                    className="relative z-20"
                />
            </div>

            {/* Full-card control: keeps the action links above it, so nothing nests. */}
            <button
                type="button"
                onClick={(event) => onSelect(project, event.currentTarget)}
                aria-label={openLabel}
                aria-haspopup="dialog"
                className="absolute inset-0 z-10 cursor-pointer rounded-xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
            />
        </Card>
    )
}

export default ProjectCard
