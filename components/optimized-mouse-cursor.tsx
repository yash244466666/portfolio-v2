"use client"

import { useEffect, useRef, useState } from "react"

export default function OptimizedMouseCursor() {
    const [isMobile, setIsMobile] = useState(false)
    const [isLowEnd, setIsLowEnd] = useState(false)
    const cursorRef = useRef<HTMLDivElement>(null)
    const positionRef = useRef({ x: 0, y: 0 })
    const targetRef = useRef({ x: 0, y: 0 })
    const rafRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        // Enhanced device detection
        const detectDevice = () => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)

            // Check for low-end device indicators
            const isLowEndDevice = navigator.hardwareConcurrency < 4 ||
                (navigator as any).deviceMemory < 4 ||
                window.innerWidth < 768

            return { isMobileDevice: !!isMobileDevice, isLowEndDevice }
        }

        const { isMobileDevice, isLowEndDevice } = detectDevice()
        setIsMobile(isMobileDevice)
        setIsLowEnd(isLowEndDevice)

        // Don't initialize cursor on mobile or low-end devices
        if (isMobileDevice || isLowEndDevice) {
            return
        }

        const animate = () => {
            if (!cursorRef.current) return

            // Smooth interpolation with reduced frequency
            positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.15
            positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.15

            // Use transform3d for GPU acceleration
            cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`

            rafRef.current = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e: MouseEvent) => {
            targetRef.current = { x: e.clientX, y: e.clientY }
        }

        // Start animation loop only once
        animate()
        window.addEventListener('mousemove', handleMouseMove, { passive: true })

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [])

    // Don't render anything on mobile or low-end devices
    if (isMobile || isLowEnd) {
        return null
    }

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed w-8 h-8 pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    left: '-16px',
                    top: '-16px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    transform: 'translate3d(0px, 0px, 0)',
                    willChange: 'transform'
                }}
            />
            <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
        </>
    )
}