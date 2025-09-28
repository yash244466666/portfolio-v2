"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Code, Server, Database, Smartphone, Globe, Zap } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { Float, Box, MeshDistortMaterial } from "@react-three/drei"
import { getSectionContent, getSkills } from "@/lib/content/utils"

function FloatingCubes() {
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

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Get content from centralized content module
  const sectionContent = getSectionContent('about')
  const skillsData = getSkills()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Helper function to get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Code: <Code className="w-8 h-8 text-primary" />,
      Server: <Server className="w-8 h-8 text-primary" />,
      Database: <Database className="w-8 h-8 text-primary" />,
      Smartphone: <Smartphone className="w-8 h-8 text-primary" />,
      Globe: <Globe className="w-8 h-8 text-primary" />,
      Zap: <Zap className="w-8 h-8 text-primary" />
    }
    return iconMap[iconName as keyof typeof iconMap] || <Code className="w-8 h-8 text-primary" />
  }

  return (
    <section id="about" ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} />
          <FloatingCubes />
        </Canvas>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">{sectionContent.heading}</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            {sectionContent.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {skillsData.map((skill, index) => (
            <Card
              key={index}
              className={`p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm bg-background/80 ${isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex justify-center mb-4">{getIconComponent(skill.icon)}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">{skill.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{skill.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
