"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getButtonTexts, getPersonalInfo, isPlaceholderLink } from "@/lib/content/utils"
import { logComponentEvent } from "@/lib/instrumentation"
import { cn } from "@/lib/utils"

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i

function isCrossOriginUrl(url: string) {
    try {
        return new URL(url, window.location.href).origin !== window.location.origin
    } catch {
        return true
    }
}

interface DownloadResumeButtonProps {
    className?: string
}

/**
 * Content-driven resume download for the navigation.
 *
 * Same-origin files use the `download` attribute; cross-origin files open in a
 * new tab with a safe rel. Renders nothing when no usable resume URL is set.
 */
export function DownloadResumeButton({ className }: DownloadResumeButtonProps) {
    const { resumeUrl, resumeFileName } = getPersonalInfo()
    const label = getButtonTexts().downloadResume || "Download Resume"
    // A pure initial value keeps the server render and first hydration render
    // identical; the effect then resolves absolute same-origin URLs.
    const [isExternal, setIsExternal] = useState(() =>
        ABSOLUTE_URL_PATTERN.test(resumeUrl ?? "")
    )

    useEffect(() => {
        setIsExternal(resumeUrl ? isCrossOriginUrl(resumeUrl) : false)
    }, [resumeUrl])

    if (!resumeUrl || resumeUrl.trim() === "" || isPlaceholderLink(resumeUrl)) {
        return null
    }

    return (
        <Button asChild className={cn(className)}>
            <a
                href={resumeUrl}
                {...(isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : { download: resumeFileName || "" })}
                onClick={() =>
                    logComponentEvent("Navigation", {
                        event: "download-resume",
                        detail: { url: resumeUrl },
                        throttleMs: 0,
                    })
                }
            >
                <Download aria-hidden="true" />
                <span>{label}</span>
            </a>
        </Button>
    )
}

export default DownloadResumeButton
