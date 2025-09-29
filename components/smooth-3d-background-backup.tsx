"use client"

import { Canvas } from "@react-three/fiber"
import { useRef, useMemo, Suspense, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box } from "@react-three/drei"
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

// Collision system
let elementPositions: Array<{ x: number; y: number; z: number; radius: number; velocity: { x: number; y: number; z: number } }> = []
let displayBounds = { width: 16, height: 12, depth: 16 } // 3D space boundaries

// Collision detection utilities
function checkElementCollision(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }, radius1: number, radius2: number) {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  const dz = pos1.z - pos2.z
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  const minDistance = radius1 + radius2

  // High collision sensitivity for better detection
  const collisionDistance = minDistance * 1.8 // 80% larger collision zone

  return distance < collisionDistance ? {
    collision: true,
    distance: Math.max(distance, 0.01), // Prevent division by zero
    dx,
    dy,
    dz,
    overlap: collisionDistance - distance
  } : {
    collision: false,
    distance,
    dx: 0,
    dy: 0,
    dz: 0,
    overlap: 0
  }
}

function checkBoundaryCollision(pos: { x: number; y: number; z: number }, radius: number) {
  const collisions = {
    left: pos.x - radius < -displayBounds.width / 2,
    right: pos.x + radius > displayBounds.width / 2,
    top: pos.y + radius > displayBounds.height / 2,
    bottom: pos.y - radius < -displayBounds.height / 2,
    front: pos.z + radius > displayBounds.depth / 2,
    back: pos.z - radius < -displayBounds.depth / 2
  }
  return collisions
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
      const radius = 3.5 + seedA * 3 // Wider distribution
      elements.push({
        position: [Math.cos(angle) * radius, (seedB - 0.5) * 5, Math.sin(angle) * radius] as [
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

    // Initialize collision tracking
    elementPositions = elements.map((element, index) => ({
      x: element.position[0],
      y: element.position[1],
      z: element.position[2],
      radius: 0.8, // Smaller collision radius for better detection
      velocity: { x: 0, y: 0, z: 0 }
    }))

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
  const meshRef = useRef<THREE.Group>(null!)
  const initialPosition = useMemo(() => position, [position])
  const velocity = useRef({ x: 0, y: 0, z: 0 })
  const elementIndex = useRef(-1)

  // Get element index for collision tracking based on text content (unique identifier)
  useEffect(() => {
    // Find the index based on the text content to ensure consistent mapping
    for (let i = 0; i < elementPositions.length; i++) {
      if (Math.abs(elementPositions[i].x - position[0]) < 0.1 &&
        Math.abs(elementPositions[i].y - position[1]) < 0.1 &&
        Math.abs(elementPositions[i].z - position[2]) < 0.1) {
        elementIndex.current = i
        break
      }
    }
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + timeOffset

      // Base rotations with ultra-slow individual phases, varied movement and chaos
      meshRef.current.rotation.x += (0.0003 + Math.sin(time * 0.2 + rotationPhases[0]) * 0.0002 + chaosX * 0.0001) * speed
      meshRef.current.rotation.y += (0.0002 + Math.cos(time * 0.15 + rotationPhases[1]) * 0.0001 + chaosY * 0.0001) * speed
      meshRef.current.rotation.z += (0.0004 + Math.sin(time * 0.25 + rotationPhases[2]) * 0.0002 + chaosZ * 0.0001) * speed      // Click wave reaction - creates ripple effect
      if (clickWave.active) {
        const distance = Math.sqrt(
          (meshRef.current.position.x - 0) ** 2 +
          (meshRef.current.position.z - 0) ** 2
        )
        const waveEffect = clickWave.intensity * Math.sin(time * 15 - distance) * reactivity
        meshRef.current.rotation.x += waveEffect * 0.1
        meshRef.current.rotation.y += waveEffect * 0.1
        meshRef.current.rotation.z += waveEffect * 0.15
        meshRef.current.position.y += waveEffect * 0.2
      }

      // Scroll reaction - elements bounce based on scroll direction
      if (Math.abs(scrollDirection) > 0.1) {
        meshRef.current.rotation.x += scrollDirection * 0.03 * reactivity
        meshRef.current.rotation.z += scrollDirection * 0.02 * reactivity
        meshRef.current.position.y += scrollDirection * 0.1 * reactivity
      }

      // Reactive rotation based on mouse/touch interaction
      if (!isInHeroSection) {
        meshRef.current.rotation.x += globalMouse.y * 0.015 * reactivity
        meshRef.current.rotation.y += globalMouse.x * 0.015 * reactivity
        meshRef.current.rotation.z += (globalMouse.x + globalMouse.y) * 0.008 * reactivity

        // Touch pressure reaction for mobile
        if (isMobileDevice && touchPressure > 0) {
          meshRef.current.rotation.x += touchPressure * 0.02 * reactivity
          meshRef.current.rotation.y += touchPressure * 0.02 * reactivity
          meshRef.current.scale.setScalar(1 + touchPressure * 0.3 * reactivity)
        }
      }

      // Enhanced orbital movement with extremely slow, chaotic timing
      const orbitTime = (time * speed * 0.01) + orbitPhase // Extremely slow orbital movement
      const pulseIntensity = Math.sin(time * 1.2 + pulsePhase) * 0.2 // Slower, smaller pulses
      const clickBoost = clickWave.active ? clickWave.intensity * 0.5 : 0
      const orbitVariation = Math.sin(time * 0.08 + orbitPhase + chaosX) * 0.4 // Slower, more chaotic variation
      const driftX = Math.cos(time * 0.02 + chaosX) * 0.5 // Slow drift patterns
      const driftZ = Math.sin(time * 0.025 + chaosZ) * 0.5
      const newRadius = radius + pulseIntensity + clickBoost + orbitVariation

      // Calculate target position with chaos and drift
      let targetX = Math.cos(angle + orbitTime) * newRadius + driftX
      let targetZ = Math.sin(angle + orbitTime) * newRadius + driftZ

      // Vertical floating with slower, more irregular patterns
      const primaryFloat = Math.sin(time * speed * 0.4 + floatPhase) * 0.3 // Slower, smaller float
      const secondaryFloat = Math.cos(time * speed * 0.3 + floatPhase + chaosY) * 0.15 // Add chaos
      const chaosFloat = Math.sin(time * 0.1 + chaosX + chaosZ) * 0.1 // Very slow chaos drift
      const scrollBounce = Math.abs(scrollVelocity) * 2 * reactivity
      let targetY = initialPosition[1] + primaryFloat + secondaryFloat + chaosFloat + scrollBounce

      // Apply collision physics
      const currentPos = { x: meshRef.current.position.x, y: meshRef.current.position.y, z: meshRef.current.position.z }
      const elementRadius = 0.8

      // Check boundary collisions
      const boundaryCollisions = checkBoundaryCollision(currentPos, elementRadius)

      // Boundary collision response
      if (boundaryCollisions.left || boundaryCollisions.right) {
        velocity.current.x *= -0.8 // Bounce with energy loss
        targetX = boundaryCollisions.left ? -displayBounds.width / 2 + elementRadius : displayBounds.width / 2 - elementRadius
      }
      if (boundaryCollisions.top || boundaryCollisions.bottom) {
        velocity.current.y *= -0.8
        targetY = boundaryCollisions.top ? displayBounds.height / 2 - elementRadius : -displayBounds.height / 2 + elementRadius
      }
      if (boundaryCollisions.front || boundaryCollisions.back) {
        velocity.current.z *= -0.8
        targetZ = boundaryCollisions.front ? displayBounds.depth / 2 - elementRadius : -displayBounds.depth / 2 + elementRadius
      }

      // Check element-to-element collisions with all other elements
      for (let i = 0; i < elementPositions.length; i++) {
        if (i !== elementIndex.current) {
          const otherPos = elementPositions[i]
          if (otherPos) {
            const collision = checkElementCollision(currentPos, otherPos, elementRadius, otherPos.radius)

            if (collision.collision && collision.overlap > 0) {
              // Calculate collision response with stronger force for visibility
              const separationForce = collision.overlap * 0.8 // Stronger force for visible collisions
              const normalX = collision.distance > 0 ? collision.dx / collision.distance : 1
              const normalY = collision.distance > 0 ? collision.dy / collision.distance : 0
              const normalZ = collision.distance > 0 ? collision.dz / collision.distance : 0

              // Apply strong separation force with chaos for realistic bounce
              velocity.current.x += (normalX * separationForce) + (chaosX * 0.2)
              velocity.current.y += (normalY * separationForce * 0.6) + (chaosY * 0.1)
              velocity.current.z += (normalZ * separationForce) + (chaosZ * 0.2)

              // Add very visible collision effects
              const collisionIntensity = Math.min(collision.overlap / elementRadius, 2)
              meshRef.current.rotation.x += collisionIntensity * 1.5
              meshRef.current.rotation.y += collisionIntensity * 1.2
              meshRef.current.rotation.z += collisionIntensity * 1.0

              // Strong scale pulse on collision
              const scalePulse = 1 + collisionIntensity * 0.8
              meshRef.current.scale.setScalar(scalePulse)

              // Add color flash effect by temporarily increasing opacity
              const boxes = meshRef.current.children
              boxes.forEach((box: any) => {
                if (box.material && box.material.opacity !== undefined) {
                  box.material.opacity = Math.min(box.material.opacity + 0.3, 1.0)
                }
              })
            }
          }
        }
      }

      // Apply very gentle integration for ultra-natural movement
      velocity.current.x += (targetX - currentPos.x) * 0.003 // Ultra-slow integration
      velocity.current.y += (targetY - currentPos.y) * 0.003
      velocity.current.z += (targetZ - currentPos.z) * 0.003

      // Apply very strong damping for stable movement
      velocity.current.x *= 0.98 // Strong damping for stability
      velocity.current.y *= 0.98
      velocity.current.z *= 0.98

      // Update position with velocity
      meshRef.current.position.x = currentPos.x + velocity.current.x
      meshRef.current.position.y = currentPos.y + velocity.current.y
      meshRef.current.position.z = currentPos.z + velocity.current.z

      // Update collision tracking - always update if we have a valid index
      if (elementIndex.current >= 0 && elementIndex.current < elementPositions.length) {
        elementPositions[elementIndex.current].x = meshRef.current.position.x
        elementPositions[elementIndex.current].y = meshRef.current.position.y
        elementPositions[elementIndex.current].z = meshRef.current.position.z
        elementPositions[elementIndex.current].velocity = { ...velocity.current }
      }      // Scale pulsing with individual timing phases
      const primaryPulse = Math.sin(time * 3 + pulsePhase) * 0.1
      const secondaryPulse = Math.cos(time * 1.5 + pulsePhase + 2) * 0.05
      const breathingPulse = Math.sin(time * 0.8 + timeOffset) * 0.03
      const baseScale = 1 + primaryPulse + secondaryPulse + breathingPulse
      const clickScale = clickWave.active ? 1 + clickWave.intensity * 0.4 * reactivity : 1
      const scaleVariation = baseScale * clickScale

      // Reactive scale boost
      if (!isInHeroSection) {
        const mouseDistance = Math.sqrt(globalMouse.x ** 2 + globalMouse.y ** 2)
        const scaleBoost = 1 + mouseDistance * 0.25 * reactivity
        meshRef.current.scale.setScalar(scaleVariation * scaleBoost)
      } else {
        meshRef.current.scale.setScalar(scaleVariation)
      }
    }
  })

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
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
  )
}

function OrbitingShape({
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

        // Boundary collision for particles
        const particleRadius = data.size * 20 // Scale up for collision detection
        const pos = { x: particle.position.x, y: particle.position.y, z: particle.position.z }
        const boundaryCollisions = checkBoundaryCollision(pos, particleRadius)

        if (boundaryCollisions.left || boundaryCollisions.right) {
          particle.position.x = boundaryCollisions.left ? -displayBounds.width / 2 + particleRadius : displayBounds.width / 2 - particleRadius
          particle.rotation.y += 0.5 // Visual bounce effect
        }
        if (boundaryCollisions.top || boundaryCollisions.bottom) {
          particle.position.y = boundaryCollisions.top ? displayBounds.height / 2 - particleRadius : -displayBounds.height / 2 + particleRadius
          particle.rotation.x += 0.5
        }
        if (boundaryCollisions.front || boundaryCollisions.back) {
          particle.position.z = boundaryCollisions.front ? displayBounds.depth / 2 - particleRadius : -displayBounds.depth / 2 + particleRadius
          particle.rotation.z += 0.5
        }

        // Normal floating movement if no collisions
        if (!boundaryCollisions.left && !boundaryCollisions.right && !boundaryCollisions.top && !boundaryCollisions.bottom && !boundaryCollisions.front && !boundaryCollisions.back) {
          particle.position.y += primaryFloat + secondaryFloat
        }

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

      // Check if central geometry would collide with any code elements
      const centralPos = { x: 0, y: Math.sin(time * 0.2) * 0.3, z: -2 }
      let collisionInfluence = 0

      for (let i = 0; i < elementPositions.length; i++) {
        const elementPos = elementPositions[i]
        const distance = Math.sqrt(
          (centralPos.x - elementPos.x) ** 2 +
          (centralPos.y - elementPos.y) ** 2 +
          (centralPos.z - elementPos.z) ** 2
        )

        if (distance < 3) { // Influence radius
          collisionInfluence += (3 - distance) / 3
          // Push away from nearby elements
          const pushForce = (3 - distance) * 0.1
          meshRef.current.rotation.x += pushForce
          meshRef.current.rotation.y += pushForce * 0.5
        }
      }

      meshRef.current.rotation.x = baseRotationX + scrollInfluence + collisionInfluence * 0.2
      meshRef.current.rotation.y += 0.005 + Math.abs(scrollVelocity) * 0.02 + collisionInfluence * 0.1
      meshRef.current.rotation.z = Math.sin(time * 0.15) * 0.2 + scrollDirection * 0.05 + collisionInfluence * 0.15
      meshRef.current.position.y = centralPos.y + Math.abs(scrollVelocity) * 2

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
          <FloatingCodeBlocks />
          <FloatingParticles />
          <TechGeometry />
        </Canvas>
      </Suspense>
    </div>
  )
}
