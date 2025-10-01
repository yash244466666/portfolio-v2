"use client"

import { Mail, MapPin, Phone } from "lucide-react"

export interface ContactInfoItemProps {
    type: "email" | "phone" | "location" | string
    label: string
    value: string
    link?: string | null
    isVisible?: boolean
}

const iconMap = {
    email: Mail,
    phone: Phone,
    location: MapPin,
}

export function ContactInfoItem({ type, label, value, link, isVisible = false }: ContactInfoItemProps) {
    const IconComponent = iconMap[type as keyof typeof iconMap] ?? Mail

    return (
        <div className={`flex items-center space-x-4 transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div>
                <p className="font-medium text-foreground">{label}</p>
                {link ? (
                    <a href={link} className="text-muted-foreground hover:text-primary transition-colors">
                        {value}
                    </a>
                ) : (
                    <p className="text-muted-foreground">{value}</p>
                )}
            </div>
        </div>
    )
}

export default ContactInfoItem
