"use client"

import type { JSX } from "react"
import { Code, Server, Database, Smartphone, Globe, Zap } from "lucide-react"

export type SkillIconName = "Code" | "Server" | "Database" | "Smartphone" | "Globe" | "Zap" | string

export function SkillIcon({ icon }: { icon: SkillIconName }) {
    const iconMap = {
        Code: <Code className="w-8 h-8 text-primary" />,
        Server: <Server className="w-8 h-8 text-primary" />,
        Database: <Database className="w-8 h-8 text-primary" />,
        Smartphone: <Smartphone className="w-8 h-8 text-primary" />,
        Globe: <Globe className="w-8 h-8 text-primary" />,
        Zap: <Zap className="w-8 h-8 text-primary" />,
    } satisfies Record<string, JSX.Element>

    if (icon in iconMap) {
        return iconMap[icon as keyof typeof iconMap]
    }

    return iconMap.Code
}

export default SkillIcon
