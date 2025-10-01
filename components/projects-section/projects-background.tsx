"use client"

import { Canvas } from "@react-three/fiber"
// import { FloatingShapes } from "./floating-shapes"

interface ProjectsBackgroundProps {
    shouldRenderCanvas: boolean
}

export function ProjectsBackground({ shouldRenderCanvas }: ProjectsBackgroundProps) {
    if (!shouldRenderCanvas) {
        return <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-80" />
    }

    return (
        <div className="absolute inset-0 -z-10">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} />
                {/* <FloatingShapes /> */}
            </Canvas>
        </div>
    )
}

export default ProjectsBackground
