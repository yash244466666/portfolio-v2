"use client"

import { instrumentComponent } from "@/hooks/use-instrumentation"

function BackgroundFallbackComponent() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 200%)",
                }}
            />
        </div>
    )
}

export const BackgroundFallback = instrumentComponent(BackgroundFallbackComponent, "BackgroundFallback")
