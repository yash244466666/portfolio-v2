"use client"

import type { LucideIcon } from "lucide-react"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"

export interface SocialLink {
    name: string
    url: string
    icon: string
}

interface HeroSocialLinksProps {
    links: SocialLink[]
    isVisible?: boolean
}

const iconMap: Record<string, LucideIcon> = {
    Github,
    Linkedin,
    Twitter,
    Mail,
}

const hoverColorMap: Record<string, string> = {
    GitHub: "hover:text-purple-400",
    LinkedIn: "hover:text-cyan-400",
    Twitter: "hover:text-purple-400",
    Email: "hover:text-cyan-400",
}

export function HeroSocialLinks({ links, isVisible = false }: HeroSocialLinksProps) {
    return (
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="flex items-center justify-center space-x-4 sm:space-x-6 mb-8 sm:mb-12">
                {links.map((link) => {
                    const IconComponent = iconMap[link.icon] ?? Github
                    const hoverColor = hoverColorMap[link.name] ?? "hover:text-purple-400"
                    return (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-gray-400 ${hoverColor} transition-all hover:scale-110 transform p-2`}
                        >
                            <IconComponent size={20} className="sm:w-6 sm:h-6" />
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

export default HeroSocialLinks
