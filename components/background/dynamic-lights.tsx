"use client"

import { useCallback, useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { clickWave, globalMouse } from "./interaction-state"
import { GRID_CONFIG } from "./constants"

export function DynamicLights() {
    const light1Ref = useRef<THREE.PointLight>(null!)
    const light2Ref = useRef<THREE.PointLight>(null!)

    useFrame(() => {
        if (!light1Ref.current || !light2Ref.current) return

        const screenScale = 100
        light1Ref.current.position.set(globalMouse.x * screenScale, globalMouse.y * screenScale, 5)
        light2Ref.current.position.set(globalMouse.x * screenScale, globalMouse.y * screenScale, -20)

        if (clickWave.active) {
            clickWave.intensity *= clickWave.decay
            if (clickWave.intensity < 0.01) {
                clickWave.active = false
            }
        }
    })

    const randomizeLights = useCallback(() => {
        if (light1Ref.current && light2Ref.current) {
            const randomColor1 = Math.random() * 0xffffff
            const randomColor2 = Math.random() * 0xffffff

            light1Ref.current.color.setHex(randomColor1)
            light1Ref.current.intensity = 500 + Math.random() * 1000

            light2Ref.current.color.setHex(randomColor2)
            light2Ref.current.intensity = 250 + Math.random() * 250
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
