"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface NavigationActionsProps {
    onContactClick: () => void
    contactLabel: string
}

export function NavigationActions({ onContactClick, contactLabel }: NavigationActionsProps) {
    const pathname = usePathname()

    if (pathname !== "/") {
        return (
            <Link href="/#contact">
                <Button className="hidden sm:block bg-primary hover:bg-primary/90 text-primary-foreground">
                    {contactLabel}
                </Button>
            </Link>
        )
    }

    return (
        <Button
            onClick={onContactClick}
            className="hidden sm:block bg-primary hover:bg-primary/90 text-primary-foreground"
        >
            {contactLabel}
        </Button>
    )
}

export default NavigationActions