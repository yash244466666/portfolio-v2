"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { aiWorkPath } from "@/lib/content/project-pages"
import type { AdditionalWorkItem } from "@/lib/content"

interface MoreEngineeringWorkProps {
    heading: string
    items: AdditionalWorkItem[]
    toolsPrompt: string
    toolsLinkLabel: string
    caseStudyLinkLabel: string
    isVisible?: boolean
}

/**
 * Compact, text-only list of additional engineering work. It sits directly
 * below the six featured cards and uses the section's existing typography.
 */
export function MoreEngineeringWork({
    heading,
    items,
    toolsPrompt,
    toolsLinkLabel,
    caseStudyLinkLabel,
    isVisible = false,
}: MoreEngineeringWorkProps) {
    const headingId = "more-engineering-work-heading"
    const linkClass =
        "inline-flex min-h-[44px] items-center gap-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"

    return (
        <section
            aria-labelledby={headingId}
            className={`mt-12 sm:mt-16 border-t border-border/40 pt-10 sm:pt-12 transition-all duration-1000 motion-reduce:animate-none ${isVisible ? "animate-fade-in-up" : "reveal-pending"}`}
        >
            <h3
                id={headingId}
                className="text-xl sm:text-2xl font-semibold text-foreground mb-6"
            >
                {heading}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                {items.map((item) => (
                    <div key={item.title}>
                        <h4 className="text-base font-semibold text-foreground mb-1.5">
                            {item.title}
                        </h4>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/30 pt-6 text-sm text-muted-foreground">
                <span>{toolsPrompt}</span>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <Link href={aiWorkPath} className={linkClass}>
                        AI agents and automation projects
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link href="/tools/" className={`${linkClass} text-primary`}>
                        {toolsLinkLabel}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link href="/projects/yashcodes/" className={`${linkClass} text-foreground/85 hover:text-foreground`}>
                        {caseStudyLinkLabel}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default MoreEngineeringWork
