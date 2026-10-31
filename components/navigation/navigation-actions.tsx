"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DownloadResumeButton } from "@/components/navigation/download-resume-button"

interface NavigationActionsProps {
    onContactClick: () => void
    contactLabel: string
}

export function NavigationActions({ onContactClick, contactLabel }: NavigationActionsProps) {
    const pathname = usePathname()

    const contactButton =
        pathname !== "/" ? (
            <Link href="/#contact">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {contactLabel}
                </Button>
            </Link>
        ) : (
            <Button
                onClick={onContactClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
                {contactLabel}
            </Button>
        )

    return (
        <div className="hidden sm:flex items-center gap-2">
            {contactButton}
            <DownloadResumeButton className="hidden md:inline-flex" />
        </div>
    )
}

export default NavigationActions
