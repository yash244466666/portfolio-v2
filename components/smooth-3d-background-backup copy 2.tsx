"use client"

import { Canvas } from "@react-three/fiber"
import { useRef, useMemo, Suspense, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box } from "@react-three/drei"
import { Physics, useBox, useSphere, Debug } from "@react-three/cannon"
import type * as THREE from "three"

// Global interaction state
let globalMouse = { x: 0, y: 0 }
let isInHeroSection = true
let isMobileDevice = false
let scrollVelocity = 0
let lastScrollY = 0
let clickWave = { active: false, intensity: 0, decay: 0.95 }
let touchPressure = 0
let scrollDirection = 0

// Physics world boundaries - smaller to ensure viewport containment
const worldBounds = { width: 10, height: 6, depth: 6 }

// Physics boundary walls component
function PhysicsBoundaries() {
  const wallThickness = 0.5

  // Create thicker invisible walls for physics boundaries
  const [leftWall] = useBox(() => ({
    position: [-worldBounds.width / 2 - wallThickness / 2, 0, 0],
    args: [wallThickness, worldBounds.height + 2, worldBounds.depth + 2],
    type: 'Static',
    material: {
      friction: 0.01, // Almost frictionless walls
      restitution: 0.98, // Extremely bouncy walls
    }
  }))
  const [rightWall] = useBox(() => ({
    position: [worldBounds.width / 2 + wallThickness / 2, 0, 0],
    args: [wallThickness, worldBounds.height + 2, worldBounds.depth + 2],
    type: 'Static',
    material: {
      friction: 0.01,
      restitution: 0.98,
    }
  }))
  const [topWall] = useBox(() => ({
    position: [0, worldBounds.height / 2 + wallThickness / 2, 0],
    args: [worldBounds.width + 2, wallThickness, worldBounds.depth + 2],
    type: 'Static',
    material: {
      friction: 0.01,
      restitution: 0.98,
    }
  }))
  const [bottomWall] = useBox(() => ({
    position: [0, -worldBounds.height / 2 - wallThickness / 2, 0],
    args: [worldBounds.width + 2, wallThickness, worldBounds.depth + 2],
    type: 'Static',
    material: {
      friction: 0.01,
      restitution: 0.98,
    }
  }))
  const [frontWall] = useBox(() => ({
    position: [0, 0, worldBounds.depth / 2 + wallThickness / 2],
    args: [worldBounds.width + 2, worldBounds.height + 2, wallThickness],
    type: 'Static',
    material: {
      friction: 0.01,
      restitution: 0.95, // Slightly less bouncy for depth control
    }
  }))
  const [backWall] = useBox(() => ({
    position: [0, 0, -worldBounds.depth / 2 - wallThickness / 2],
    args: [worldBounds.width + 2, worldBounds.height + 2, wallThickness],
    type: 'Static',
    material: {
      friction: 0.01,
      restitution: 0.95,
    }
  }))

  return null // Invisible walls
}

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
      "React.FC<Props>",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "Three.js",
      "WebGL",
      "GraphQL",
      "MongoDB",
      "PostgreSQL",
      "AWS Lambda",
      "Kubernetes",
    ]

    // Increase number of elements for more lively animation
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2
      // Use deterministic values based on index to avoid hydration mismatch
      const seedA = (i * 0.618) % 1 // Golden ratio for pseudo-random distribution
      const seedB = (i * 0.414) % 1
      const seedC = (i * 0.732) % 1
      const seedD = (i * 0.123) % 1
      const seedE = (i * 0.891) % 1
      const seedF = (i * 0.267) % 1
      const radius = 1 + seedA * 1.5 // Much smaller distribution to stay within bounds
      elements.push({
        position: [Math.cos(angle) * radius, (seedB - 0.5) * 2, Math.sin(angle) * radius] as [
          number,
          number,
          number,
        ],
        rotation: [seedA * Math.PI, seedB * Math.PI, seedC * Math.PI] as [number, number, number],
        text: codeSnippets[Math.floor(seedC * codeSnippets.length)],
        speed: 0.02 + seedA * 0.08, // Even slower for natural collisions
        angle: angle,
        radius: radius,
        pulsePhase: seedD * Math.PI * 2, // For pulsing animation
        reactivity: 0.3 + seedA * 0.7, // More variation in reactivity
        timeOffset: seedE * 25, // Much longer staggered timing
        rotationPhases: [
          seedA * Math.PI * 4, // X-axis rotation phase - more variation
          seedB * Math.PI * 4, // Y-axis rotation phase - more variation
          seedC * Math.PI * 4  // Z-axis rotation phase - more variation
        ] as [number, number, number],
        orbitPhase: seedF * Math.PI * 6, // Much more orbital timing variation
        floatPhase: seedE * Math.PI * 4, // More floating phase variation
        chaosX: (seedA - 0.5) * 2, // Random chaos factors
        chaosY: (seedB - 0.5) * 2,
        chaosZ: (seedC - 0.5) * 2,
      })
    }

    return elements
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008 // Much slower group rotation

      // Click wave reaction
      if (clickWave.active) {
        const waveForce = clickWave.intensity * 0.1
        groupRef.current.rotation.x += waveForce * Math.sin(state.clock.elapsedTime * 10)
        groupRef.current.rotation.z += waveForce * Math.cos(state.clock.elapsedTime * 10)
        clickWave.intensity *= clickWave.decay
        if (clickWave.intensity < 0.01) clickWave.active = false
      }

      // Scroll direction reaction
      if (Math.abs(scrollDirection) > 0.1) {
        groupRef.current.rotation.x += scrollDirection * 0.05
        groupRef.current.rotation.y += scrollDirection * 0.02
      }

      // Interaction only when not in hero section
      if (!isInHeroSection) {
        if (isMobileDevice) {
          // Mobile: Enhanced touch and scroll interactions
          groupRef.current.rotation.x += scrollVelocity * 0.15
          groupRef.current.rotation.y += globalMouse.x * 0.03
          groupRef.current.rotation.z += touchPressure * 0.02
        } else {
          // Desktop: Enhanced mouse interaction
          groupRef.current.rotation.x = globalMouse.y * 0.08
          groupRef.current.rotation.y += globalMouse.x * 0.015
        }
      }
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
  pulsePhase,
  reactivity,
  timeOffset,
  rotationPhases,
  orbitPhase,
  floatPhase,
  chaosX,
  chaosY,
  chaosZ,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  text: string
  speed: number
  angle: number
  radius: number
  pulsePhase: number
  reactivity: number
  timeOffset: number
  rotationPhases: [number, number, number]
  orbitPhase: number
  floatPhase: number
  chaosX: number
  chaosY: number
  chaosZ: number
}) {
  // Create physics body with individual properties for variation
  const individualMass = 0.3 + (Math.abs(Math.sin(chaosX * 100)) * 0.4) // Varied mass 0.3-0.7
  const individualFriction = 0.01 + (Math.abs(Math.cos(chaosY * 100)) * 0.04) // Varied friction 0.01-0.05
  const individualRestitution = 0.9 + (Math.abs(Math.sin(chaosZ * 100)) * 0.09) // Varied restitution 0.9-0.99

  const [ref, api] = useBox(() => ({
    mass: individualMass,
    position: position,
    rotation: rotation,
    args: [1.2, 0.6, 0.1], // Box dimensions for collision
    material: {
      friction: individualFriction,
      restitution: individualRestitution,
      contactEquationStiffness: 1e8, // Individual solid object stiffness
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e7,
      frictionEquationRelaxation: 3,
    },
    linearDamping: 0.1 + (Math.abs(Math.sin(chaosX * 200)) * 0.2), // Lower damping for more bounce
    angularDamping: 0.1 + (Math.abs(Math.cos(chaosY * 200)) * 0.15), // Lower damping for rotation
    allowSleep: true,
    type: 'Dynamic',
    fixedRotation: false, // Allow rotation on collision
  }))

  const meshRef = useRef<THREE.Group>(null!)

  // Store velocity and position for collision detection
  const velocityRef = useRef([0, 0, 0])
  const positionRef = useRef([0, 0, 0])

  // Subscribe to physics updates and collision events
  useEffect(() => {
    const unsubscribeVel = api.velocity.subscribe((velocity) => {
      velocityRef.current = velocity
    })
    const unsubscribePos = api.position.subscribe((position) => {
      positionRef.current = position
    })

    // Add collision event listener for strong separation
    const unsubscribeCollision = api.collisionResponse.subscribe((value) => {
      if (value) {
        // On collision, apply strong separation impulse
        const separationStrength = 0.2 + Math.random() * 0.15
        api.applyImpulse([
          (Math.random() - 0.5) * separationStrength,
          (Math.random() - 0.5) * separationStrength,
          (Math.random() - 0.5) * separationStrength
        ], [0, 0, 0])

        // Wake up the object to prevent sticking
        api.wakeUp()
      }
    })

    return () => {
      unsubscribeVel()
      unsubscribePos()
      unsubscribeCollision()
    }
  }, [api])

  // Apply continuous forces for floating behavior with collision awareness
  useFrame((state) => {
    if (meshRef.current && api && ref.current) {
      const time = state.clock.elapsedTime + timeOffset

      // Wake up sleeping bodies periodically to prevent permanent clustering
      if (Math.random() < 0.001) { // 0.1% chance per frame
        api.wakeUp()
      }

      // Completely desynchronized individual forces
      const uniqueTimeX = time * speed * (0.02 + chaosX * 0.015) + orbitPhase * 3.7
      const uniqueTimeY = time * speed * (0.025 + chaosY * 0.02) + floatPhase * 2.3
      const uniqueTimeZ = time * speed * (0.022 + chaosZ * 0.018) + orbitPhase * 4.1

      const orbitForceX = Math.cos(uniqueTimeX) * (0.05 + Math.abs(chaosX) * 0.03)
      const orbitForceZ = Math.sin(uniqueTimeZ) * (0.05 + Math.abs(chaosZ) * 0.03)
      const floatForceY = Math.sin(uniqueTimeY) * (0.04 + Math.abs(chaosY) * 0.02)

      // Individual random micro-forces to break synchronization
      const microForceX = Math.sin(time * 6.32 + chaosX * 11.7) * 0.015
      const microForceY = Math.cos(time * 4.84 + chaosY * 13.3) * 0.01
      const microForceZ = Math.sin(time * 5.91 + chaosZ * 16.9) * 0.015

      // Get current position for centering force
      const currentPos = positionRef.current
      if (currentPos) {
        const centeringForceX = -currentPos[0] * (0.01 + Math.abs(chaosX) * 0.005)
        const centeringForceY = -currentPos[1] * (0.01 + Math.abs(chaosY) * 0.005)
        const centeringForceZ = -currentPos[2] * (0.01 + Math.abs(chaosZ) * 0.005)

        // Check if velocity is too low (potential clustering) and apply wake-up force
        const velocity = velocityRef.current
        const speed = Math.sqrt(velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2)
        let wakeUpForce = [0, 0, 0]

        if (speed < 0.1) { // If moving too slowly, apply random impulse
          const wakeUpStrength = 0.05 + Math.random() * 0.05
          wakeUpForce = [
            (Math.random() - 0.5) * wakeUpStrength,
            (Math.random() - 0.5) * wakeUpStrength,
            (Math.random() - 0.5) * wakeUpStrength
          ]
        }

        api.applyForce([
          orbitForceX + centeringForceX + microForceX + wakeUpForce[0],
          floatForceY + centeringForceY + microForceY + wakeUpForce[1],
          orbitForceZ + centeringForceZ + microForceZ + wakeUpForce[2]
        ], [0, 0, 0])
      }

      // Strong anti-clustering separation impulses
      if (Math.random() < 0.005) { // Reduced frequency but stronger force
        const separationImpulse = 0.15 + (Math.random() * 0.1)
        api.applyImpulse([
          (Math.random() - 0.5) * separationImpulse,
          (Math.random() - 0.5) * separationImpulse,
          (Math.random() - 0.5) * separationImpulse
        ], [0, 0, 0])
      }

      // Reduced interactive forces to prevent escaping viewport
      if (clickWave.active) {
        const waveForce = clickWave.intensity * reactivity * 1
        api.applyImpulse([
          (Math.random() - 0.5) * waveForce,
          (Math.random() - 0.5) * waveForce * 0.5, // Reduce Y force
          (Math.random() - 0.5) * waveForce
        ], [0, 0, 0])
      }

      // Gentle mouse/touch interaction forces
      if (!isInHeroSection) {
        const mouseForceX = globalMouse.x * reactivity * 0.03
        const mouseForceY = -globalMouse.y * reactivity * 0.03
        api.applyForce([mouseForceX, mouseForceY, 0], [0, 0, 0])

        // Gentle touch pressure
        if (isMobileDevice && touchPressure > 0) {
          api.applyForce([0, touchPressure * 0.5, 0], [0, 0, 0])
        }
      }

      // Gentle scroll interaction
      if (Math.abs(scrollDirection) > 0.1) {
        api.applyForce([0, scrollDirection * reactivity * 0.3, 0], [0, 0, 0])
      }

      // Visual rotation effects (not affecting physics)
      if (meshRef.current) {
        meshRef.current.rotation.x += (0.002 + Math.sin(time * 0.3 + rotationPhases[0]) * 0.001) * speed
        meshRef.current.rotation.y += (0.001 + Math.cos(time * 0.2 + rotationPhases[1]) * 0.0005) * speed
        meshRef.current.rotation.z += (0.0015 + Math.sin(time * 0.4 + rotationPhases[2]) * 0.0008) * speed

        // Scale pulsing
        const primaryPulse = Math.sin(time * 3 + pulsePhase) * 0.1
        const secondaryPulse = Math.cos(time * 1.5 + pulsePhase + 2) * 0.05
        const baseScale = 1 + primaryPulse + secondaryPulse
        const clickScale = clickWave.active ? 1 + clickWave.intensity * 0.4 * reactivity : 1
        meshRef.current.scale.setScalar(baseScale * clickScale)
      }
    }
  })

  return (
    <group ref={ref}>
      <group ref={meshRef}>
        {/* Outer glow effect */}
        <Box args={[1.3, 0.7, 0.12]} position={[0, 0, -0.01]}>
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
        </Box>

        {/* Main card background */}
        <Box args={[1.2, 0.6, 0.1]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#1e293b" transparent opacity={0.5} />
        </Box>

        {/* Inner card front */}
        <Box args={[1.1, 0.5, 0.05]} position={[0, 0, 0.05]}>
          <meshBasicMaterial color="#0f172a" transparent opacity={0.7} />
        </Box>

        {/* Inner card back */}
        <Box args={[1.1, 0.5, 0.05]} position={[0, 0, -0.05]}>
          <meshBasicMaterial color="#0f172a" transparent opacity={0.7} />
        </Box>

        {/* Accent border */}
        <Box args={[1.15, 0.55, 0.02]} position={[0, 0, 0.06]}>
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} wireframe />
        </Box>

        {/* Front side text */}
        <Text position={[0, 0, 0.08]} fontSize={0.14} color="#e2e8f0" anchorX="center" anchorY="middle">
          {text}
        </Text>

        {/* Back side text (rotated 180 degrees) */}
        <Text
          position={[0, 0, -0.08]}
          fontSize={0.14}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
        >
          {text}
        </Text>
      </group>
    </group>
  )
} function OrbitingShape({
  position,
  geometry,
  color,
  size,
  phaseOffset
}: {
  position: [number, number, number]
  geometry: string
  color: string
  size: number
  phaseOffset: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + phaseOffset

      // Individual rotation with phase offset
      meshRef.current.rotation.x += 0.02 * (1 + Math.sin(time * 0.3) * 0.3)
      meshRef.current.rotation.y += 0.015 * (1 + Math.cos(time * 0.5) * 0.4)
      meshRef.current.rotation.z += 0.01 * (1 + Math.sin(time * 0.7) * 0.2)

      // Individual floating movement
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1

      // Individual scaling pulse
      const scaleVariation = 1 + Math.sin(time * 4) * 0.1
      meshRef.current.scale.setScalar(scaleVariation)
    }
  })

  const GeometryComponent = () => {
    switch (geometry) {
      case 'octahedron':
        return <octahedronGeometry args={[size]} />
      case 'tetrahedron':
        return <tetrahedronGeometry args={[size]} />
      case 'dodecahedron':
        return <dodecahedronGeometry args={[size]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[size]} />
      default:
        return <boxGeometry args={[size, size, size]} />
    }
  }

  return (
    <mesh ref={meshRef} position={position}>
      <GeometryComponent />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Group>(null!)

  const particles = useMemo(() => {
    const particleArray = []
    for (let i = 0; i < 25; i++) {
      const seed = (i * 0.789) % 1
      const seedB = (i * 0.456) % 1
      const seedC = (i * 0.234) % 1
      particleArray.push({
        position: [
          (seed - 0.5) * 20,
          (seedB - 0.5) * 15,
          (seedC - 0.5) * 20
        ] as [number, number, number],
        speed: 0.1 + seed * 0.3,
        size: 0.02 + seed * 0.06,
        phase: seed * Math.PI * 2,
        timeOffset: seedB * 8, // Individual animation start time
        floatPhase: seedC * Math.PI * 2, // Individual floating pattern
        rotationSpeed: 0.005 + seed * 0.02, // Individual rotation speed
      })
    }
    return particleArray
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, index) => {
        const data = particles[index]
        const time = state.clock.elapsedTime + data.timeOffset

        // Floating movement with individual phases
        const primaryFloat = Math.sin(time * data.speed + data.phase) * 0.002
        const secondaryFloat = Math.cos(time * data.speed * 0.6 + data.floatPhase) * 0.001

        // Simple floating movement
        particle.position.y += primaryFloat + secondaryFloat

        // Individual rotation speeds and phases
        particle.rotation.x += data.rotationSpeed * (1 + Math.sin(time * 0.3 + data.phase) * 0.5)
        particle.rotation.y += data.rotationSpeed * 0.7 * (1 + Math.cos(time * 0.5 + data.floatPhase) * 0.3)        // Click wave dispersion
        if (clickWave.active) {
          const distance = Math.sqrt(
            particle.position.x ** 2 + particle.position.z ** 2
          )
          const disperseForce = clickWave.intensity * (1 - distance / 10) * 0.1
          particle.position.x += Math.cos(data.phase) * disperseForce
          particle.position.z += Math.sin(data.phase) * disperseForce
          particle.scale.setScalar(1 + clickWave.intensity * 2)
        } else {
          particle.scale.setScalar(1)
        }

        // Scroll reaction - particles flow with scroll
        if (Math.abs(scrollVelocity) > 0.1) {
          particle.position.y += scrollVelocity * data.speed * 0.5
          particle.rotation.z += scrollVelocity * 0.1
        }

        // Reactive movement
        if (!isInHeroSection) {
          particle.position.x += globalMouse.x * 0.015 * data.speed
          particle.position.z += globalMouse.y * 0.015 * data.speed

          // Touch pressure effect
          if (isMobileDevice && touchPressure > 0) {
            particle.position.y += touchPressure * 0.1 * data.speed
            particle.scale.setScalar(1 + touchPressure * 0.5)
          }
        }
      })
    }
  })

  return (
    <group ref={particlesRef}>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function TechGeometry() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  const orbitRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (meshRef.current && innerRef.current && orbitRef.current) {
      const time = state.clock.elapsedTime

      // Click explosion effect
      if (clickWave.active) {
        const explosionForce = clickWave.intensity
        meshRef.current.rotation.x += explosionForce * Math.sin(time * 20) * 0.1
        meshRef.current.rotation.y += explosionForce * Math.cos(time * 20) * 0.1
        meshRef.current.rotation.z += explosionForce * Math.sin(time * 15) * 0.1
        meshRef.current.scale.setScalar(1 + explosionForce * 0.5)

        // Orbital speed boost during click
        orbitRef.current.rotation.y += explosionForce * 0.05
        orbitRef.current.rotation.x += explosionForce * 0.03
      }

      // Main geometry with enhanced movement and collision awareness
      const baseRotationX = Math.sin(time * 0.1) * 0.3
      const scrollInfluence = scrollDirection * 0.1

      // Simplified geometry movement without collision logic
      meshRef.current.rotation.x = baseRotationX + scrollInfluence
      meshRef.current.rotation.y += 0.005 + Math.abs(scrollVelocity) * 0.02
      meshRef.current.rotation.z = Math.sin(time * 0.15) * 0.2 + scrollDirection * 0.05
      meshRef.current.position.y = Math.sin(time * 0.2) * 0.3 + Math.abs(scrollVelocity) * 2

      // Inner cube counter-rotation with scroll reaction
      innerRef.current.rotation.x -= 0.003 + scrollVelocity * 0.01
      innerRef.current.rotation.y -= 0.004 + scrollDirection * 0.01
      innerRef.current.rotation.z += 0.002 + Math.abs(scrollVelocity) * 0.01

      // Orbital elements with enhanced reactivity and individual timing
      const baseOrbitSpeed = 0.01
      const scrollBoost = Math.abs(scrollVelocity) * 0.1
      const touchBoost = isMobileDevice ? touchPressure * 0.02 : 0
      const timeVariation = Math.sin(time * 0.2) * 0.005 // Subtle speed variation
      orbitRef.current.rotation.y += baseOrbitSpeed + scrollBoost + touchBoost + timeVariation
      orbitRef.current.rotation.x = Math.sin(time * 0.3) * 0.1 + scrollDirection * 0.05
      orbitRef.current.rotation.z = Math.cos(time * 0.25) * 0.05 // Additional rotation axis

      // Reactive scaling and movement
      if (!isInHeroSection) {
        const mouseInfluence = Math.sqrt(globalMouse.x ** 2 + globalMouse.y ** 2)
        const baseScale = 1 + mouseInfluence * 0.3
        const clickScale = clickWave.active ? 1 + clickWave.intensity * 0.4 : 1
        const touchScale = isMobileDevice && touchPressure > 0 ? 1 + touchPressure * 0.3 : 1
        meshRef.current.scale.setScalar(baseScale * clickScale * touchScale)

        meshRef.current.rotation.x += globalMouse.y * 0.03
        meshRef.current.rotation.y += globalMouse.x * 0.03

        // Touch pressure influence
        if (isMobileDevice && touchPressure > 0) {
          meshRef.current.position.y += touchPressure * 0.5
          orbitRef.current.scale.setScalar(1 + touchPressure * 0.2)
        } else {
          orbitRef.current.scale.setScalar(1)
        }
      } else {
        const clickScale = clickWave.active ? 1 + clickWave.intensity * 0.2 : 1
        meshRef.current.scale.setScalar(clickScale)
        orbitRef.current.scale.setScalar(1)
      }
    }
  })

  return (
    <group position={[0, 0, -2]}>
      {/* Main wireframe cubes */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} wireframe />
      </mesh>
      <mesh ref={innerRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} wireframe />
      </mesh>

      {/* Central sphere */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
      </mesh>

      {/* Orbiting elements with individual animations */}
      <group ref={orbitRef}>
        <OrbitingShape position={[2, 0, 0]} geometry="octahedron" color="#f59e0b" size={0.2} phaseOffset={0} />
        <OrbitingShape position={[-2, 0, 0]} geometry="tetrahedron" color="#ef4444" size={0.15} phaseOffset={Math.PI / 2} />
        <OrbitingShape position={[0, 2, 0]} geometry="dodecahedron" color="#10b981" size={0.18} phaseOffset={Math.PI} />
        <OrbitingShape position={[0, -2, 0]} geometry="icosahedron" color="#8b5cf6" size={0.16} phaseOffset={3 * Math.PI / 2} />
      </group>
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Detect mobile device
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        window.innerWidth < 768
    }

    isMobileDevice = detectMobile()

    const updateMousePosition = (e: MouseEvent) => {
      // Normalize mouse coordinates to [-1, 1] range
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const updateTouchPosition = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        // Normalize touch coordinates to [-1, 1] range
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
      }
    }

    const updateScrollVelocity = () => {
      const currentScrollY = window.scrollY
      const rawVelocity = currentScrollY - lastScrollY
      scrollVelocity = rawVelocity * 0.01
      scrollDirection = rawVelocity > 0 ? 1 : rawVelocity < 0 ? -1 : 0
      lastScrollY = currentScrollY

      // Decay scroll velocity over time
      scrollVelocity *= 0.95
      scrollDirection *= 0.9
    }

    const handleClick = (e: MouseEvent) => {
      clickWave.active = true
      clickWave.intensity = 1.0

      // Normalize click position
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchPressure = Math.min(e.touches.length / 5, 1) // Multi-touch pressure
        clickWave.active = true
        clickWave.intensity = 0.8

        const touch = e.touches[0]
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
      }
    }

    const handleTouchEnd = () => {
      touchPressure = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchPressure = Math.min(e.touches.length / 5, 1)

        const touch = e.touches[0]
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
      }
    }

    const checkCurrentSection = () => {
      // Find the hero section (first section with min-h-screen class)
      const heroSection = document.querySelector('section.min-h-screen')
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect()
        // Consider hero section active if it's more than 80% visible
        isInHeroSection = rect.bottom > window.innerHeight * 0.8
      }
    }

    // Add appropriate event listeners based on device type
    if (isMobileDevice) {
      // Mobile: enhanced touch and scroll events
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchstart', handleTouchStart, { passive: true })
      window.addEventListener('touchend', handleTouchEnd, { passive: true })
      window.addEventListener('scroll', updateScrollVelocity, { passive: true })
    } else {
      // Desktop: mouse events including clicks
      window.addEventListener('mousemove', updateMousePosition)
      window.addEventListener('click', handleClick)
    }

    // Check section on scroll for both
    window.addEventListener('scroll', checkCurrentSection, { passive: true })

    // Global scroll listener for enhanced reactions
    window.addEventListener('scroll', updateScrollVelocity, { passive: true })

    // Initial checks
    checkCurrentSection()
    lastScrollY = window.scrollY

    return () => {
      if (isMobileDevice) {
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchend', handleTouchEnd)
        window.removeEventListener('scroll', updateScrollVelocity)
      } else {
        window.removeEventListener('mousemove', updateMousePosition)
        window.removeEventListener('click', handleClick)
      }
      window.removeEventListener('scroll', checkCurrentSection)
      window.removeEventListener('scroll', updateScrollVelocity)
    }
  }, [])

  if (!mounted || typeof window === "undefined") {
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
          <Physics
            gravity={[0, 0, 0]}
            defaultContactMaterial={{
              friction: 0.02, // Minimal friction for smooth bouncing
              restitution: 0.98, // Very high restitution for solid bounces
              contactEquationStiffness: 1e8, // Higher stiffness for solid objects
              contactEquationRelaxation: 3, // Lower relaxation for firmness
              frictionEquationStiffness: 1e7, // Firm friction response
              frictionEquationRelaxation: 3,
            }}
            broadphase="SAP" // More efficient collision detection
            allowSleep={true} // Allow sleep for performance
            iterations={6} // Balanced iterations for stability
          >
            <PhysicsBoundaries />
            <FloatingCodeBlocks />
            <FloatingParticles />
            <TechGeometry />
          </Physics>
        </Canvas>
      </Suspense>
    </div>
  )
}
