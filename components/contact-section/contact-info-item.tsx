"use client"

import { Mail, MapPin, Phone } from "lucide-react"

export interface ContactInfoItemProps {
    type: "email" | "phone" | "location" | string
    label: string
    value: string
    link?: string | null
}

const iconMap = {
    email: Mail,
    phone: Phone,
    location: MapPin,
}

const tileClassName = "flex h-full min-h-14 min-w-0 items-center gap-2 rounded-xl border border-border/60 bg-background/35 px-2 py-2"

export function ContactInfoItem({ type, label, value, link }: ContactInfoItemProps) {
    const IconComponent = iconMap[type as keyof typeof iconMap] ?? Mail
    const content = (
        <>
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <IconComponent className="size-4" />
            </span>
            <span className="min-w-0">
                <span className="block text-xs font-medium text-muted-foreground">{label}</span>
                <span className="block break-words text-sm font-medium text-foreground">{value}</span>
            </span>
        </>
    )

    return (
        <li className="min-w-0">
            {link ? (
                <a href={link} className={`${tileClassName} transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}>
                    {content}
                </a>
            ) : (
                <div className={tileClassName}>{content}</div>
            )}
        </li>
    )
}

export default ContactInfoItem
