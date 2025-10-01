"use client"

import { Float, Box, MeshDistortMaterial } from "@react-three/drei"

export function FloatingCubes() {
    return (
        <>
            <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.5}>
                <Box args={[0.8, 0.8, 0.8]} position={[-3, 2, -4]}>
                    <MeshDistortMaterial
                        color="#8b5cf6"
                        attach="material"
                        distort={0.2}
                        speed={1.2}
                        roughness={0.3}
                        transparent
                        opacity={0.08}
                    />
                </Box>
            </Float>
            <Float speed={1.6} rotationIntensity={1.2} floatIntensity={2}>
                <Box args={[0.6, 0.6, 0.6]} position={[3, -1, -3]}>
                    <MeshDistortMaterial
                        color="#06b6d4"
                        attach="material"
                        distort={0.3}
                        speed={1.8}
                        roughness={0.3}
                        transparent
                        opacity={0.06}
                    />
                </Box>
            </Float>
        </>
    )
}

export default FloatingCubes
