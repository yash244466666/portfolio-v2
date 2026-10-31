"use client"

import * as React from "react"
import Image from "next/image"

import { Dialog } from "@/components/ui/dialog"
import type { Project, ProjectModalContent } from "@/lib/content"
import { ProjectActions } from "./project-actions"

interface ProjectModalProps {
    project: Project
    /** Card button that opened the modal; focus returns here on close. */
    trigger: HTMLElement | null
    onClose: () => void
    buttonTexts: {
        code: string
        liveDemo: string
    }
    modalContent: ProjectModalContent
}

/**
 * Detail view for a single project. Every string comes from lib/content so
 * copy can be edited in one place. Optional fields (longDescription,
 * highlights, role, year) degrade gracefully when absent.
 */
export function ProjectModal({
    project,
    trigger,
    onClose,
    buttonTexts,
    modalContent,
}: ProjectModalProps) {
    const baseId = React.useId()
    const titleId = `${baseId}-title`
    const descriptionId = `${baseId}-description`
    const highlightsId = `${baseId}-highlights`

    const hasMeta = Boolean(project.role || project.year)
    const highlights =
        project.highlights && project.highlights.length > 0 ? project.highlights : null

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
            labelledBy={titleId}
            describedBy={descriptionId}
            closeLabel={modalContent.closeLabel}
            restoreFocusTo={trigger}
            className="max-w-3xl"
        >
            <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
                <div className="overflow-y-auto overscroll-contain">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        <Image
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 768px"
                        />
                    </div>

                    <div className="space-y-6 p-5 sm:p-8">
                        <header className="space-y-3">
                            <h2
                                id={titleId}
                                className="text-2xl font-semibold text-foreground sm:text-3xl"
                            >
                                {project.title}
                            </h2>
                            {hasMeta ? (
                                <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                                    {project.role ? (
                                        <div className="flex items-baseline gap-2">
                                            <dt className="text-muted-foreground">{modalContent.roleLabel}</dt>
                                            <dd className="font-medium text-foreground">{project.role}</dd>
                                        </div>
                                    ) : null}
                                    {project.year ? (
                                        <div className="flex items-baseline gap-2">
                                            <dt className="text-muted-foreground">{modalContent.yearLabel}</dt>
                                            <dd className="font-medium text-foreground">{project.year}</dd>
                                        </div>
                                    ) : null}
                                </dl>
                            ) : null}
                        </header>

                        <p id={descriptionId} className="leading-relaxed text-muted-foreground">
                            {project.description}
                        </p>

                        {project.longDescription &&
                        project.longDescription !== project.description ? (
                            <p className="leading-relaxed text-muted-foreground">
                                {project.longDescription}
                            </p>
                        ) : null}

                        {highlights ? (
                            <section aria-labelledby={highlightsId} className="space-y-3">
                                <h3
                                    id={highlightsId}
                                    className="text-sm font-semibold uppercase tracking-wide text-foreground/80"
                                >
                                    {modalContent.highlightsHeading}
                                </h3>
                                <ul className="space-y-2">
                                    {highlights.map((highlight, index) => (
                                        <li
                                            key={`${titleId}-highlight-${index}`}
                                            className="flex gap-3 leading-relaxed text-muted-foreground"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                                            />
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ) : null}

                        {project.tech.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {project.tech.map((tech, index) => (
                                    <span
                                        key={`${titleId}-tech-${index}`}
                                        className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        <ProjectActions
                            project={project}
                            buttonTexts={buttonTexts}
                            unavailableLabel={modalContent.unavailableLabel}
                            className="border-t border-border/60 pt-5"
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default ProjectModal
