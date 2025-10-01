"use client"

import { useEffect, useMemo, useRef, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { GRID_CONFIG, COLOR_PALETTES } from "./constants"
import { globalMouse } from "./interaction-state"

function generateHexGrid(n: number, radius: number) {
    const positions: THREE.Vector3[] = []
    const rotations: number[] = []
    const phases: number[] = []

    const hexWidth = Math.cos(Math.PI / 6) * radius * 2
    const hexHeight = 1.5 * radius

    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const x = (col - (n - 1) / 2) * hexWidth + (row % 2) * hexWidth / 2
            const y = (row - (n - 1) / 2) * hexHeight
            const z = 0

            positions.push(new THREE.Vector3(x, y, z))
            rotations.push(0)
            phases.push(Math.random() * Math.PI * 2)
        }
    }

    return { positions, rotations, phases }
}

function createHexTubeGeometry(radius: number, height: number) {
    const points = []
    points.push(new THREE.Vector2(radius, -height / 2))

    const cornerRadius = radius * 0.15
    const cornerSamples = 8

    for (let i = 0; i < cornerSamples; i++) {
        const angle = (i / (cornerSamples - 1)) * Math.PI / 2
        const x = radius - cornerRadius + Math.cos(angle) * cornerRadius
        const y = height / 2 - cornerRadius + Math.sin(angle) * cornerRadius
        points.push(new THREE.Vector2(x, y))
    }

    points.push(new THREE.Vector2(0, height / 2))

    const geometry = new THREE.LatheGeometry(points, 6)
    geometry.translate(0, -height / 2, 0)
    geometry.rotateX(Math.PI / 2)
    geometry.computeVertexNormals()

    return geometry
}

function HexagonalInstancedMesh() {
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null!)
    const colorAttributeRef = useRef<THREE.InstancedBufferAttribute | null>(null)
    const currentColorsRef = useRef<Float32Array>(new Float32Array(0))
    const startColorsRef = useRef<Float32Array>(new Float32Array(0))
    const targetColorsRef = useRef<Float32Array | null>(null)
    const colorTransitionProgressRef = useRef(1)

    const { positions, rotations, phases } = useMemo(
        () => generateHexGrid(GRID_CONFIG.n, GRID_CONFIG.radius),
        [],
    )

    const count = positions.length
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const tilt = useMemo(() => new THREE.Vector3(), [])
    const targetTilt = useMemo(() => new THREE.Vector3(), [])

    if (currentColorsRef.current.length !== count * 3) {
        currentColorsRef.current = new Float32Array(count * 3)
        startColorsRef.current = new Float32Array(count * 3)
    }

    useEffect(() => {
        const mesh = meshRef.current
        if (!mesh) return

        for (let i = 0; i < count; i++) {
            dummy.position.copy(positions[i])
            dummy.rotation.z = rotations[i]
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
        }

        const colors = currentColorsRef.current
        const palette = GRID_CONFIG.colors
        for (let i = 0; i < count; i++) {
            const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)])
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }
        startColorsRef.current.set(colors)

        const colorAttribute = new THREE.InstancedBufferAttribute(colors, 3)
        colorAttribute.setUsage(THREE.DynamicDrawUsage)
        mesh.geometry.setAttribute("color", colorAttribute)
        colorAttribute.needsUpdate = true
        colorAttributeRef.current = colorAttribute

        mesh.instanceMatrix.needsUpdate = true

        return () => {
            if (colorAttributeRef.current === colorAttribute) {
                mesh.geometry.deleteAttribute("color")
                colorAttributeRef.current = null
            }
        }
    }, [positions, rotations, count, dummy])

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.elapsedTime

        targetTilt.set(-globalMouse.y * 0.15, globalMouse.x * 0.15, 0)
        tilt.lerp(targetTilt, 0.1)

        for (let i = 0; i < count; i++) {
            dummy.position.copy(positions[i])

            const mouseWorldX = globalMouse.x * 100
            const mouseWorldY = globalMouse.y * 100
            const dx = positions[i].x - mouseWorldX
            const dy = positions[i].y - mouseWorldY
            const mouseDistance = Math.sqrt(dx * dx + dy * dy) / 20

            const mouseInfluence = Math.max(0, 1 - Math.min(mouseDistance, 1))
            const smoothInfluence = mouseInfluence * mouseInfluence * (3 - 2 * mouseInfluence)

            const depthWave = Math.sin(phases[i] + time * GRID_CONFIG.timeCoef) * 0.5
            const depthOffset = smoothInfluence * GRID_CONFIG.depthScale * 3
            dummy.position.z = depthWave * GRID_CONFIG.radius * 0.5 + depthOffset

            dummy.rotation.z = rotations[i]
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }

        meshRef.current.rotation.set(tilt.x, tilt.y, 0)

        const target = targetColorsRef.current
        if (target) {
            const start = startColorsRef.current
            const current = currentColorsRef.current
            const nextProgress = Math.min(colorTransitionProgressRef.current + 0.02, 1)
            colorTransitionProgressRef.current = nextProgress

            for (let i = 0; i < current.length; i++) {
                current[i] = start[i] + (target[i] - start[i]) * nextProgress
            }

            const colorAttribute = colorAttributeRef.current
            if (colorAttribute) {
                colorAttribute.needsUpdate = true
            }

            if (nextProgress >= 1) {
                targetColorsRef.current = null
            }
        }

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    const randomizeColors = useCallback(() => {
        const current = currentColorsRef.current
        if (!targetColorsRef.current || targetColorsRef.current.length !== current.length) {
            targetColorsRef.current = new Float32Array(current.length)
        }

        const target = targetColorsRef.current
        const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]
        for (let i = 0; i < count; i++) {
            const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)])
            target[i * 3] = color.r
            target[i * 3 + 1] = color.g
            target[i * 3 + 2] = color.b
        }

        startColorsRef.current.set(current)
        colorTransitionProgressRef.current = 0
    }, [count])

    useEffect(() => {
        window.updateHexColors = randomizeColors
        return () => {
            if (window.updateHexColors === randomizeColors) {
                delete window.updateHexColors
            }
        }
    }, [randomizeColors])

    const geometry = useMemo(() => createHexTubeGeometry(GRID_CONFIG.radius, GRID_CONFIG.radius * 5), [])

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
            <meshPhysicalMaterial
                ref={materialRef}
                metalness={GRID_CONFIG.metalness}
                roughness={GRID_CONFIG.roughness}
                clearcoat={GRID_CONFIG.clearcoat}
                clearcoatRoughness={GRID_CONFIG.clearcoatRoughness}
                vertexColors
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    )
}

export function HexagonalGrid() {
    const groupRef = useRef<THREE.Group>(null!)

    useFrame((state) => {
        if (!groupRef.current) return

        const { width, height } = state.size
        const aspect = width / height

        if (aspect > 1) {
            groupRef.current.scale.setScalar(width / 1000)
        } else {
            groupRef.current.scale.setScalar(height / 1000)
        }
    })

    return (
        <group ref={groupRef}>
            <HexagonalInstancedMesh />
        </group>
    )
}
