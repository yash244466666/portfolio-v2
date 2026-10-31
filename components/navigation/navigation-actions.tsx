"use client"

import { DownloadResumeButton } from "@/components/navigation/download-resume-button"

export function NavigationActions() {
    return (
        <div className="hidden md:flex items-center gap-2">
            <DownloadResumeButton />
        </div>
    )
}

export default NavigationActions
