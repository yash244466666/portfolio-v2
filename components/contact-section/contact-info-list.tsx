"use client"

import type { ContactInfoItemProps } from "./contact-info-item"
import { ContactInfoItem } from "./contact-info-item"

interface ContactInfoListProps {
    title: string
    description: string
    items: ContactInfoItemProps[]
    isVisible?: boolean
}

export function ContactInfoList({ title, description, items, isVisible = false }: ContactInfoListProps) {
    return (
        <div className={`space-y-8 transition-all duration-1000 delay-200 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">{title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8">{description}</p>
            </div>

            <div className="space-y-6">
                {items.map((item) => (
                    <ContactInfoItem key={item.type} {...item} isVisible={isVisible} />
                ))}
            </div>
        </div>
    )
}

export default ContactInfoList
