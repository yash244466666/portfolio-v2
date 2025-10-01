"use client"

import { useCallback, useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { RootState } from "@react-three/fiber"
import * as THREE from "three"
import { clickWave, globalMouse } from "./interaction-state"
import { GRID_CONFIG } from "./constants"
import { useComponentInstrumentation, useFrameInstrumentation } from "@/hooks/use-instrumentation"
import { logComponentEvent } from "@/lib/instrumentation"

export function DynamicLights() {
    const light1Ref = useRef<THREE.PointLight>(null!)
    const light2Ref = useRef<THREE.PointLight>(null!)

    useComponentInstrumentation("DynamicLights", {
        metricsSnapshot: () => ({
            light1Intensity: light1Ref.current?.intensity ?? null,
            light2Intensity: light2Ref.current?.intensity ?? null,
            clickWaveActive: clickWave.active,
            clickWaveIntensity: Number(clickWave.intensity.toFixed(3)),
        }),
        trackValues: () => ({
            clickWaveActive: clickWave.active,
        }),
        throttleMs: 4800,
    })

    const animateLights = useFrameInstrumentation<[RootState]>(
        "DynamicLights",
        () => {
            if (!light1Ref.current || !light2Ref.current) return

            const screenScale = 100
            light1Ref.current.position.set(globalMouse.x * screenScale, globalMouse.y * screenScale, 5)
            light2Ref.current.position.set(globalMouse.x * screenScale, globalMouse.y * screenScale, -20)

            if (clickWave.active) {
                clickWave.intensity *= clickWave.decay
                if (clickWave.intensity < 0.01) {
                    clickWave.active = false
                    logComponentEvent("DynamicLights", {
                        event: "click-wave-complete",
                        detail: { intensity: clickWave.intensity },
                        throttleMs: 2000,
                    })
                }
            }
        },
        {
            metricName: "light-update",
            trackInterval: true,
            sampleSize: 180,
            throttleMs: 4800,
        },
    )

    useFrame(animateLights)

    const randomizeLights = useCallback(() => {
        if (light1Ref.current && light2Ref.current) {
            const randomColor1 = Math.random() * 0xffffff
            const randomColor2 = Math.random() * 0xffffff

            light1Ref.current.color.setHex(randomColor1)
            light1Ref.current.intensity = 500 + Math.random() * 1000

            light2Ref.current.color.setHex(randomColor2)
            light2Ref.current.intensity = 250 + Math.random() * 250

            logComponentEvent("DynamicLights", {
                event: "randomize-lights",
                detail: {
                    color1: randomColor1,
                    color2: randomColor2,
                    intensity1: light1Ref.current.intensity,
                    intensity2: light2Ref.current.intensity,
                },
                throttleMs: 2500,
            })
        }
    }, [])

    useEffect(() => {
        window.randomizeLights = randomizeLights
        return () => {
            if (window.randomizeLights === randomizeLights) {
                delete window.randomizeLights
            }
        }
    }, [randomizeLights])

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight
                ref={light1Ref}
                color={0xffffff}
                intensity={GRID_CONFIG.lightIntensity1}
                distance={200}
                decay={2}
            />
            <pointLight
                ref={light2Ref}
                color={0xff0000}
                intensity={GRID_CONFIG.lightIntensity2}
                distance={150}
                decay={2}
            />
        </>
    )
}
