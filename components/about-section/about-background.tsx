"use client"

import { Canvas } from "@react-three/fiber"
// import { FloatingCubes } from "./floating-cubes"

interface AboutBackgroundProps {
    shouldRenderCanvas: boolean
}

export function AboutBackground({ shouldRenderCanvas }: AboutBackgroundProps) {
    if (!shouldRenderCanvas) {
        return <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-80" />
    }

    return (
        <div className="absolute inset-0 -z-10">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} />
                {/* <FloatingCubes /> */}
            </Canvas>
        </div>
    )
}

export default AboutBackground
