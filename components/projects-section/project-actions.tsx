"use client"

import type { ReactNode } from "react"
import { ExternalLink, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/content"
import { getProjectActionVisibility, isPlaceholderLink } from "@/lib/content/utils"
import { cn } from "@/lib/utils"

interface ProjectActionsProps {
    project: Project
    buttonTexts: {
        code: string
        liveDemo: string
    }
    /** Hint appended for assistive tech when a link is still a placeholder. */
    unavailableLabel: string
    size?: "sm" | "default"
    className?: string
}

interface ProjectActionProps {
    href: string
    label: string
    icon: ReactNode
    unavailableLabel: string
    variant: "outline" | "default"
    size: "sm" | "default"
    className?: string
}

function ProjectAction({
    href,
    label,
    icon,
    unavailableLabel,
    variant,
    size,
    className,
}: ProjectActionProps) {
    if (isPlaceholderLink(href)) {
        return (
            <Button variant={variant} size={size} className={className} disabled>
                {icon}
                {label}
                <span className="sr-only">, {unavailableLabel}</span>
            </Button>
        )
    }

    return (
        <Button variant={variant} size={size} asChild className={className}>
            <a href={href} target="_blank" rel="noopener noreferrer">
                {icon}
                {label}
            </a>
        </Button>
    )
}

/**
 * Code / Live Demo actions shared by the project card and its detail modal.
 * Per-project `showCode` / `showLiveDemo` flags hide an action, and links that
 * are still "#" placeholders render as visibly disabled buttons.
 */
export function ProjectActions({
    project,
    buttonTexts,
    unavailableLabel,
    size = "default",
    className,
}: ProjectActionsProps) {
    const { showCode, showLiveDemo } = getProjectActionVisibility(project)

    if (!showCode && !showLiveDemo) {
        return null
    }

    return (
        <div className={cn("flex flex-wrap gap-3", className)}>
            {showCode ? (
                <ProjectAction
                    href={project.github}
                    label={buttonTexts.code}
                    icon={<Github className="w-4 h-4 mr-2" aria-hidden="true" />}
                    unavailableLabel={unavailableLabel}
                    variant="outline"
                    size={size}
                />
            ) : null}
            {showLiveDemo ? (
                <ProjectAction
                    href={project.live}
                    label={buttonTexts.liveDemo}
                    icon={<ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />}
                    unavailableLabel={unavailableLabel}
                    variant="default"
                    size={size}
                    className="bg-primary hover:bg-primary/90"
                />
            ) : null}
        </div>
    )
}

export default ProjectActions
