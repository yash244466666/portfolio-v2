"use client"

import { Canvas } from "@react-three/fiber"
import { useRef, useMemo, Suspense, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Global interaction state
let globalMouse = { x: 0, y: 0 }
let isInHeroSection = true
let isMobileDevice = false
let scrollVelocity = 0
let lastScrollY = 0
let clickWave = { active: false, intensity: 0, decay: 0.95 }
let touchPressure = 0
let scrollDirection = 0

// Feature toggles
const ENABLE_COLOR_CHANGE_ON_CLICK = true // Set to false to disable color changing

// Grid configuration matching the original
const GRID_CONFIG = {
  n: 30, // Grid density (optimized for performance)
  radius: 2.5, // Hexagon radius
  colors: [0x0066ff, 0x33ccff, 0xffffff], // Default blue theme
  lightIntensity1: 1000,
  lightIntensity2: 500,
  timeCoef: 1,
  depthScale: 1,
  metalness: 0.8,
  roughness: 0.5,
  clearcoat: 1,
  clearcoatRoughness: 0.1
}

// Color palettes matching website's dark theme
const COLOR_PALETTES = [
  [0x4a5568, 0x718096, 0xa0aec0], // Dark Gray theme (matches bg-gray-950)
  [0x2d3748, 0x4a5568, 0x718096], // Darker Gray theme
  [0x1a202c, 0x2d3748, 0x4a5568], // Deepest Gray theme
  [0x4299e1, 0x63b3ed, 0x90cdf4], // Subtle Blue accents
  [0x667eea, 0x764ba2, 0x9f7aea], // Purple-gray accents
  [0x38b2ac, 0x4fd1c7, 0x81e6d9], // Teal accents for contrast
]

// Generate hexagonal grid like the original
function generateHexGrid(n: number, radius: number) {
  const positions: THREE.Vector3[] = []
  const rotations: number[] = []
  const phases: number[] = []

  const hexWidth = Math.cos(Math.PI / 6) * radius * 2
  const hexHeight = 1.5 * radius
  const gridWidth = n * hexWidth / 0.8
  const gridHeight = n * hexHeight / 0.8

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

// Create 3D hexagonal tube geometry with smooth surfaces
function createHexTubeGeometry(radius: number, height: number) {
  const points = []

  // Create smooth profile for lathe geometry
  points.push(new THREE.Vector2(radius, -height / 2))

  // Add more rounded corners for smoother appearance
  const cornerRadius = radius * 0.15
  const cornerSamples = 8 // More samples for smoother curves
  for (let i = 0; i < cornerSamples; i++) {
    const angle = (i / (cornerSamples - 1)) * Math.PI / 2
    const x = radius - cornerRadius + Math.cos(angle) * cornerRadius
    const y = height / 2 - cornerRadius + Math.sin(angle) * cornerRadius
    points.push(new THREE.Vector2(x, y))
  }

  points.push(new THREE.Vector2(0, height / 2))

  const geometry = new THREE.LatheGeometry(points, 6) // 6 segments for hexagon
  geometry.translate(0, -height / 2, 0)
  geometry.rotateX(Math.PI / 2)

  // Compute vertex normals for smooth shading
  geometry.computeVertexNormals()

  return geometry
}

// High-performance instanced hexagonal grid
function HexagonalInstancedMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const [targetColors, setTargetColors] = useState<Float32Array | null>(null)
  const [colorTransitionProgress, setColorTransitionProgress] = useState(0)

  const { positions, rotations, phases } = useMemo(() =>
    generateHexGrid(GRID_CONFIG.n, GRID_CONFIG.radius), []
  )

  const count = positions.length
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const mouse2D = useMemo(() => new THREE.Vector2(), [])
  const tilt = useMemo(() => new THREE.Vector3(), [])
  const targetTilt = useMemo(() => new THREE.Vector3(), [])

  // Color interpolation helper
  const [currentColors, setCurrentColors] = useState(() => {
    const colors = new Float32Array(count * 3)
    const palette = GRID_CONFIG.colors
    for (let i = 0; i < count; i++) {
      const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)])
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return colors
  })

  // Initialize instances
  useEffect(() => {
    if (!meshRef.current) return

    for (let i = 0; i < count; i++) {
      dummy.position.copy(positions[i])
      dummy.rotation.z = rotations[i]
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    // Set initial colors
    const colorAttribute = new THREE.InstancedBufferAttribute(currentColors, 3)
    meshRef.current.geometry.setAttribute('color', colorAttribute)

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions, rotations, count, dummy, currentColors])

  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime

    // Update mouse position for tilt effect
    mouse2D.set(globalMouse.x, globalMouse.y)
    targetTilt.set(-globalMouse.y * 0.15, globalMouse.x * 0.15, 0)
    tilt.lerp(targetTilt, 0.1)

    // Optimized instance updates with smoother mouse interaction
    for (let i = 0; i < count; i++) {
      dummy.position.copy(positions[i])

      // Improved mouse distance calculation for smoother interaction
      const mouseWorldX = globalMouse.x * 50
      const mouseWorldY = globalMouse.y * 50
      const dx = positions[i].x - mouseWorldX
      const dy = positions[i].y - mouseWorldY
      const mouseDistance = Math.sqrt(dx * dx + dy * dy) / 20

      // Smoother mouse influence with better falloff
      const mouseInfluence = Math.max(0, 1 - Math.min(mouseDistance, 1))
      const smoothInfluence = mouseInfluence * mouseInfluence * (3 - 2 * mouseInfluence) // Smooth step

      // Gentler depth animation
      const depthWave = Math.sin(phases[i] + time * GRID_CONFIG.timeCoef) * 0.5
      const depthOffset = smoothInfluence * GRID_CONFIG.depthScale * 3
      dummy.position.z = depthWave * GRID_CONFIG.radius * 0.5 + depthOffset

      dummy.rotation.z = rotations[i]
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    // Apply global tilt
    meshRef.current.rotation.set(tilt.x, tilt.y, 0)

    // Smooth color transitions
    if (targetColors && colorTransitionProgress < 1) {
      const newProgress = Math.min(colorTransitionProgress + 0.02, 1) // Smooth transition speed
      setColorTransitionProgress(newProgress)

      const interpolatedColors = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i++) {
        const current = currentColors[i]
        const target = targetColors[i]
        interpolatedColors[i] = current + (target - current) * newProgress
      }

      setCurrentColors(interpolatedColors)

      const colorAttribute = meshRef.current.geometry.getAttribute('color') as THREE.InstancedBufferAttribute
      if (colorAttribute) {
        colorAttribute.array = interpolatedColors
        colorAttribute.needsUpdate = true
      }

      // Clear target colors when transition is complete
      if (newProgress >= 1) {
        setTargetColors(null)
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Color randomization function with smooth transitions
  const randomizeColors = () => {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]
    const newColors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)])
      newColors[i * 3] = color.r
      newColors[i * 3 + 1] = color.g
      newColors[i * 3 + 2] = color.b
    }

    setTargetColors(newColors)
    setColorTransitionProgress(0) // Start transition
  }

  // Expose randomization globally
  useEffect(() => {
    (window as any).updateHexColors = randomizeColors
  }, [])

  const geometry = useMemo(() => createHexTubeGeometry(GRID_CONFIG.radius, GRID_CONFIG.radius * 5), [])

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
    >
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

// Main grid component with proper scaling
function HexagonalGrid() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!groupRef.current) return

    // Scale grid to viewport like the original
    const { width, height } = state.size
    const aspect = width / height

    if (aspect > 1) {
      // Landscape
      groupRef.current.scale.setScalar(width / 1000)
    } else {
      // Portrait  
      groupRef.current.scale.setScalar(height / 1000)
    }
  })

  return (
    <group ref={groupRef}>
      <HexagonalInstancedMesh />
    </group>
  )
}

// Lighting system matching the original
function DynamicLights() {
  const light1Ref = useRef<THREE.PointLight>(null!)
  const light2Ref = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    if (!light1Ref.current || !light2Ref.current) return

    // Position lights at mouse location like the original
    light1Ref.current.position.set(
      globalMouse.x * 50,
      globalMouse.y * 50,
      5
    )

    light2Ref.current.position.set(
      globalMouse.x * 50,
      globalMouse.y * 50,
      -20
    )

    // Click wave decay
    if (clickWave.active) {
      clickWave.intensity *= clickWave.decay
      if (clickWave.intensity < 0.01) {
        clickWave.active = false
      }
    }
  })

  // Light randomization function
  const randomizeLights = () => {
    if (light1Ref.current && light2Ref.current) {
      const randomColor1 = Math.random() * 0xffffff
      const randomColor2 = Math.random() * 0xffffff

      light1Ref.current.color.setHex(randomColor1)
      light1Ref.current.intensity = 500 + Math.random() * 1000

      light2Ref.current.color.setHex(randomColor2)
      light2Ref.current.intensity = 250 + Math.random() * 250
    }
  }

  // Expose light randomization globally
  useEffect(() => {
    (window as any).randomizeLights = randomizeLights
  }, [])

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

// Fallback component with proper background
function BackgroundFallback() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Radial gradient matching the original */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 200%)'
        }}
      />
    </div>
  )
}

// Main component
export default function Smooth3DBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Device detection
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        window.innerWidth < 768
    }

    isMobileDevice = detectMobile()

    // Mouse tracking
    const updateMousePosition = (e: MouseEvent) => {
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    // Touch tracking
    const updateTouchPosition = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
      }
    }

    // Scroll tracking
    const updateScrollVelocity = () => {
      const currentScrollY = window.scrollY
      const rawVelocity = currentScrollY - lastScrollY
      scrollVelocity = rawVelocity * 0.01
      scrollDirection = rawVelocity > 0 ? 1 : rawVelocity < 0 ? -1 : 0
      lastScrollY = currentScrollY

      scrollVelocity *= 0.95
      scrollDirection *= 0.9
    }

    // Click effects
    const handleClick = (e: MouseEvent) => {
      clickWave.active = true
      clickWave.intensity = 1.0

      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1

      // Trigger color and light randomization (if enabled)
      if (ENABLE_COLOR_CHANGE_ON_CLICK) {
        if ((window as any).updateHexColors) {
          (window as any).updateHexColors()
        }
        if ((window as any).randomizeLights) {
          (window as any).randomizeLights()
        }
      }
    }

    // Touch effects
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchPressure = Math.min(e.touches.length / 5, 1)
        clickWave.active = true
        clickWave.intensity = 0.8

        const touch = e.touches[0]
        globalMouse.x = (touch.clientX / window.innerWidth) * 2 - 1
        globalMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1

        // Trigger color and light randomization on touch
        if ((window as any).updateHexColors) {
          (window as any).updateHexColors()
        }
        if ((window as any).randomizeLights) {
          (window as any).randomizeLights()
        }
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

    // Section detection
    const checkCurrentSection = () => {
      const heroSection = document.querySelector('section.min-h-screen')
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect()
        isInHeroSection = rect.bottom > window.innerHeight * 0.8
      }
    }

    // Event listeners
    if (isMobileDevice) {
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchstart', handleTouchStart, { passive: true })
      window.addEventListener('touchend', handleTouchEnd, { passive: true })
    } else {
      window.addEventListener('mousemove', updateMousePosition)
      window.addEventListener('click', handleClick)
    }

    window.addEventListener('scroll', checkCurrentSection, { passive: true })
    window.addEventListener('scroll', updateScrollVelocity, { passive: true })

    // Initial setup
    checkCurrentSection()
    lastScrollY = window.scrollY

    return () => {
      if (isMobileDevice) {
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchend', handleTouchEnd)
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
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <Suspense fallback={<BackgroundFallback />}>
        <Canvas
          camera={{ position: [0, 0, 100], fov: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={Math.min(window.devicePixelRatio, 1.5)}
        >
          <DynamicLights />
          <HexagonalGrid />
        </Canvas>
      </Suspense>
    </div>
  )
}