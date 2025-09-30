"use client"

import { useEffect, useState } from "react"

// Performance-optimized lightweight background component
export default function LightweightBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Detect low-end devices and disable heavy animations
        const isLowEndDevice = () => {
            // Check for mobile devices
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

            // Check for hardware acceleration support
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            const hasWebGL = !!gl

            // Check memory (rough estimate)
            const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
            const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')

            return isMobile || !hasWebGL || isSlowConnection || navigator.hardwareConcurrency < 4
        }

        // Disable heavy background on low-end devices
        if (isLowEndDevice()) {
            setIsVisible(false)
            return
        }

        let animationFrame: number

        const handleMouseMove = (e: MouseEvent) => {
            // Throttle mouse updates to reduce CPU usage
            if (animationFrame) return

            animationFrame = requestAnimationFrame(() => {
                setMousePosition({
                    x: (e.clientX / window.innerWidth) * 100,
                    y: (e.clientY / window.innerHeight) * 100
                })
                animationFrame = 0
            })
        }

        // Use passive listeners for better performance
        window.addEventListener('mousemove', handleMouseMove, { passive: true })

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }
        }
    }, [])

    if (!isVisible) {
        // Fallback static background for low-end devices
        return (
            <div className="fixed inset-0 pointer-events-none z-[1]">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
            {/* Static gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-80" />

            {/* Dynamic gradient following mouse - CSS only, no JS animations */}
            <div
                className="absolute inset-0 transition-all duration-1000 ease-out opacity-30"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 25%, transparent 50%)`
                }}
            />

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(139,92,246,0.05),transparent_50%)] opacity-50" />
        </div>
    )
}