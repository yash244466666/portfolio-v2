"use client"

import { Button } from "@/components/ui/button"

interface NavigationActionsProps {
    onContactClick: () => void
    contactLabel: string
}

export function NavigationActions({ onContactClick, contactLabel }: NavigationActionsProps) {
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
