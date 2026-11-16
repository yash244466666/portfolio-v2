"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Project, ProjectModalContent } from "@/lib/content"

interface ProjectCardProps {
    project: Project
    /** Visible label for the card's detail action. */
    viewDetailsLabel: string
    modalContent: ProjectModalContent
    /** Opens the detail modal; the trigger element is used to restore focus. */
    onSelect: (project: Project, trigger: HTMLElement | null) => void
    animationDelay?: number
    isVisible?: boolean
}

export function ProjectCard({
    project,
    viewDetailsLabel,
    modalContent,
    onSelect,
    animationDelay = 0,
    isVisible = false,
}: ProjectCardProps) {
    const openLabel = modalContent.openLabelTemplate.split("{title}").join(project.title)
    const cardLinks = project.links?.filter((link) => link.showOnCard) ?? []

    return (
        <Card
            className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group backdrop-blur-sm bg-background/90 motion-reduce:animate-none ${isVisible ? "animate-fade-in-up" : "reveal-pending"
                }`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.imageAlt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {project.artworkLabel ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                        {project.artworkLabel}
                    </span>
                ) : null}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
            </div>

            <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">{project.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{project.description}</p>

                {project.role ? (
                    <p className="mb-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">{modalContent.roleLabel}:</span>{" "}
                        {project.role}
                    </p>
                ) : null}

                <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                        <span key={`${project.title}-${tech}-${techIndex}`} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="pointer-events-none relative z-20 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span aria-hidden="true" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        {viewDetailsLabel}
                        <ArrowRight className="h-4 w-4" />
                    </span>
                    {cardLinks.map((link) => {
                        const classes = "pointer-events-auto inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                        if (link.external) {
                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes}
                                >
                                    {link.label}
                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                            )
                        }
                        return (
                            <Link key={link.href} href={link.href} className={classes}>
                                {link.label}
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* The detail label passes clicks to this button. Separate links
                stay interactive above it. */}
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
