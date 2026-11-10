"use client"

import type { LucideIcon } from "lucide-react"
import { Facebook, Github, Linkedin, Twitter, Mail } from "lucide-react"

export interface SocialLink {
    name: string
    url: string
    icon: string
    label: string
}

interface HeroSocialLinksProps {
    links: SocialLink[]
}

const iconMap: Record<string, LucideIcon> = {
    Github,
    Linkedin,
    Twitter,
    Facebook,
    Mail,
}

const hoverColorMap: Record<string, string> = {
    LinkedIn: "hover:text-cyan-400",
    GitHub: "hover:text-purple-400",
    X: "hover:text-purple-400",
    Facebook: "hover:text-cyan-400",
    Email: "hover:text-cyan-400",
}

export function HeroSocialLinks({ links }: HeroSocialLinksProps) {
    return (
        <div
            className="animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "480ms" }}
        >
            <div className="mb-8 flex items-center justify-center space-x-4 sm:mb-12 sm:space-x-6">
                {links.map((link) => {
                    const IconComponent = iconMap[link.icon] ?? Github
                    const hoverColor = hoverColorMap[link.name] ?? "hover:text-purple-400"
                    const isMail = link.url.startsWith("mailto:")
                    return (
                        <a
                            key={link.name}
                            href={link.url}
                            aria-label={link.label}
                            {...(isMail
                                ? {}
                                : { target: "_blank", rel: "noopener noreferrer" })}
                            className={`transform p-2 text-gray-400 transition-all hover:scale-110 ${hoverColor}`}
                        >
                            <IconComponent size={20} aria-hidden="true" className="sm:h-6 sm:w-6" />
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

export default HeroSocialLinks
