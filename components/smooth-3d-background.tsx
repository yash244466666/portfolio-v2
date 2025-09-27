"use client"

import { Canvas } from "@react-three/fiber"
import { useRef, useMemo, Suspense } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box } from "@react-three/drei"
import type * as THREE from "three"

function FloatingCodeBlocks() {
  const groupRef = useRef<THREE.Group>(null!)

  const codeElements = useMemo(() => {
    const elements = []
    const codeSnippets = [
      "const app = () => {",
      "function compile() {",
      "import React from",
      "export default",
      "async/await",
      "try { catch }",
      "if (condition)",
      "for (let i = 0)",
      "return result;",
      "console.log()",
      "useState()",
      "useEffect()",
      "API.get()",
      "database.query",
      "git commit -m",
      "npm install",
      "docker run",
      "SELECT * FROM",
      "class Component",
      "interface Props",
    ]

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      // Use deterministic values based on index to avoid hydration mismatch
      const seedA = (i * 0.618) % 1 // Golden ratio for pseudo-random distribution
      const seedB = (i * 0.414) % 1
      const seedC = (i * 0.732) % 1
      const radius = 4 + seedA * 2
      elements.push({
        position: [Math.cos(angle) * radius, (seedB - 0.5) * 4, Math.sin(angle) * radius] as [
          number,
          number,
          number,
        ],
        rotation: [seedA * Math.PI, seedB * Math.PI, 0] as [number, number, number],
        text: codeSnippets[Math.floor(seedC * codeSnippets.length)],
        speed: 0.2 + seedA * 0.3, // Deterministic speed based on index
        angle: angle,
        radius: radius,
      })
    }
    return elements
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002

      // Gentle mouse interaction
      const mouse = state.mouse
      groupRef.current.rotation.x = mouse.y * 0.05
      groupRef.current.rotation.y += mouse.x * 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {codeElements.map((element, index) => (
        <FloatingElement key={index} {...element} />
      ))}
    </group>
  )
}

function FloatingElement({
  position,
  rotation,
  text,
  speed,
  angle,
  radius,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  text: string
  speed: number
  angle: number
  radius: number
}) {
  const meshRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002 * speed
      meshRef.current.rotation.y += 0.001 * speed

      const time = state.clock.elapsedTime * speed * 0.5
      const newRadius = radius - Math.sin(time * 0.3) * 0.1
      meshRef.current.position.x = Math.cos(angle + time * 0.1) * newRadius
      meshRef.current.position.z = Math.sin(angle + time * 0.1) * newRadius
      meshRef.current.position.y += Math.sin(time) * 0.001
    }
  })

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      <Box args={[1.2, 0.6, 0.1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#1e293b" transparent opacity={0.4} />
      </Box>
      <Box args={[1.1, 0.5, 0.05]} position={[0, 0, 0.05]}>
        <meshBasicMaterial color="#0f172a" transparent opacity={0.6} />
      </Box>
      <Text position={[0, 0, 0.08]} fontSize={0.15} color="#64748b" anchorX="center" anchorY="middle">
        {text}
      </Text>
    </group>
  )
}

function TechGeometry() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current && innerRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.1
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2

      // Inner cube counter-rotation for more visual interest
      innerRef.current.rotation.x -= 0.003
      innerRef.current.rotation.y -= 0.004
    }
  })

  return (
    <group position={[0, 0, -2]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} wireframe />
      </mesh>
      <mesh ref={innerRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function BackgroundFallback() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black opacity-50" />
    </div>
  )
}

export default function Smooth3DBackground() {
  if (typeof window === "undefined") {
    return <BackgroundFallback />
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Suspense fallback={<BackgroundFallback />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={Math.min(window.devicePixelRatio, 2)}
        >
          <FloatingCodeBlocks />
          <TechGeometry />
        </Canvas>
      </Suspense>
    </div>
  )
}
