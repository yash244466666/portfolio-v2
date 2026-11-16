"use client"

import type { ContactInfoItemProps } from "./contact-info-item"
import { ContactInfoItem } from "./contact-info-item"

interface ContactInfoListProps {
    title: string
    description: string
    items: ContactInfoItemProps[]
}

export function ContactInfoList({ title, description, items }: ContactInfoListProps) {
    return (
        <section
            aria-labelledby="contact-direct-heading"
            className="grid gap-4 rounded-b-2xl border-t border-border/70 bg-muted/25 p-5 sm:px-8 sm:py-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-center lg:gap-6"
        >
            <div>
                <h3 id="contact-direct-heading" className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>

            <ul className="grid gap-2 md:grid-cols-3 md:gap-3">
                {items.map((item) => (
                    <ContactInfoItem key={item.type} {...item} />
                ))}
            </ul>
        </section>
    )
}

export default ContactInfoList
