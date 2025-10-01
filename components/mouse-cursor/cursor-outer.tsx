"use client"

import type { RefObject } from "react"

interface CursorLayerProps {
    layerRef: RefObject<HTMLDivElement | null>
}

export function CursorOuter({ layerRef }: CursorLayerProps) {
    return (
        <div ref={layerRef} className="fixed pointer-events-none z-40 will-change-transform opacity-80">
            <div
                className="w-12 h-12 border-2 border-cyan-400/60 rounded-full animate-spin shadow-lg shadow-cyan-400/20"
                style={{ animationDuration: "4s" }}
            />
        </div>
    )
}

export default CursorOuter
