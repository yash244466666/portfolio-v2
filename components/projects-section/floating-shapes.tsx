"use client"

import { Float, Octahedron, MeshDistortMaterial } from "@react-three/drei"

export function FloatingShapes() {
    return (
        <>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                <Octahedron args={[1]} position={[-4, 1, -5]}>
                    <MeshDistortMaterial
                        color="#f59e0b"
                        attach="material"
                        distort={0.4}
                        speed={1.3}
                        roughness={0.2}
                        transparent
                        opacity={0.07}
                    />
                </Octahedron>
            </Float>
            <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1.5}>
                <Octahedron args={[0.7]} position={[4, -2, -4]}>
                    <MeshDistortMaterial
                        color="#10b981"
                        attach="material"
                        distort={0.3}
                        speed={1.8}
                        roughness={0.2}
                        transparent
                        opacity={0.05}
                    />
                </Octahedron>
            </Float>
        </>
    )
}

export default FloatingShapes
