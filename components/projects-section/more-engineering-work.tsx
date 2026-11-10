"use client"

import type { AdditionalWorkItem } from "@/lib/content"

interface MoreEngineeringWorkProps {
    heading: string
    items: AdditionalWorkItem[]
    isVisible?: boolean
}

/**
 * Compact, text-only list of additional engineering work. It sits directly
 * below the six featured cards and uses the section's existing typography.
 */
export function MoreEngineeringWork({
    heading,
    items,
    isVisible = false,
}: MoreEngineeringWorkProps) {
    const headingId = "more-engineering-work-heading"

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
        </section>
    )
}

export default MoreEngineeringWork
