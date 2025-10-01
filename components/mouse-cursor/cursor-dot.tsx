"use client"

import type { RefObject } from "react"

interface CursorLayerProps {
    layerRef: RefObject<HTMLDivElement | null>
}

export function CursorDot({ layerRef }: CursorLayerProps) {
    return (
        <div ref={layerRef} className="fixed pointer-events-none z-50 will-change-transform">
            <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse" />
        </div>
    )
}

export default CursorDot
