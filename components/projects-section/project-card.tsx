"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

interface ProjectCardProps {
    project: {
        title: string
        description: string
        tech: string[]
        image?: string | null
        github: string
        live: string
    }
    animationDelay?: number
    buttonTexts: {
        code: string
        liveDemo: string
    }
    isVisible?: boolean
}

export function ProjectCard({ project, animationDelay = 0, buttonTexts, isVisible = false }: ProjectCardProps) {
    return (
        <Card
            className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group backdrop-blur-sm bg-background/90 ${isVisible ? "animate-fade-in-up" : "opacity-0"
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
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

                <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            {buttonTexts.code}
                        </a>
                    </Button>
                    <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                        <a href={project.live} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {buttonTexts.liveDemo}
                        </a>
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default ProjectCard
