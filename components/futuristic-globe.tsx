"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRouter } from "next/navigation"
import { OrbitControls, Text, Stars } from "@react-three/drei"
import * as THREE from "three"
import { COUNTRIES_DATA } from "@/lib/countries-data"
import { useTheme } from "next-themes"

interface GlobeProps {
  setHoveredCountry: (country: string) => void
}

// Convert lat/lon to 3D coordinates
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

// Inner globe component
function Globe({ setHoveredCountry }: GlobeProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const globeRef = useRef<THREE.Group>(null)
  const gridRef = useRef<THREE.Group>(null)
  const markersRef = useRef<THREE.Group>(null)
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

  // Create a procedural texture for the globe
  const createGlobeTexture = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // Create gradient background - different for light/dark mode
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)

    if (isDarkMode) {
      gradient.addColorStop(0, "#0c4a6e")
      gradient.addColorStop(0.5, "#0369a1")
      gradient.addColorStop(1, "#0284c7")
    } else {
      gradient.addColorStop(0, "#e0f2fe")
      gradient.addColorStop(0.5, "#bae6fd")
      gradient.addColorStop(1, "#7dd3fc")
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add grid lines
    ctx.strokeStyle = isDarkMode ? "rgba(0, 255, 255, 0.3)" : "rgba(0, 100, 255, 0.3)"
    ctx.lineWidth = 1

    // Longitude lines
    for (let i = 0; i < 24; i++) {
      const x = (i / 24) * canvas.width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Latitude lines
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * canvas.height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Add some random "data points"
    ctx.fillStyle = isDarkMode ? "rgba(0, 255, 255, 0.5)" : "rgba(0, 100, 255, 0.5)"
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 3 + 1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add continent-like shapes
    ctx.fillStyle = isDarkMode ? "rgba(0, 255, 255, 0.2)" : "rgba(0, 100, 255, 0.2)"

    // "North America"
    ctx.beginPath()
    ctx.ellipse(canvas.width * 0.2, canvas.height * 0.3, 100, 80, 0, 0, Math.PI * 2)
    ctx.fill()

    // "Europe/Asia"
    ctx.beginPath()
    ctx.ellipse(canvas.width * 0.6, canvas.height * 0.3, 150, 70, 0, 0, Math.PI * 2)
    ctx.fill()

    // "Africa"
    ctx.beginPath()
    ctx.ellipse(canvas.width * 0.5, canvas.height * 0.5, 70, 100, 0, 0, Math.PI * 2)
    ctx.fill()

    // "South America"
    ctx.beginPath()
    ctx.ellipse(canvas.width * 0.3, canvas.height * 0.7, 60, 90, 0, 0, Math.PI * 2)
    ctx.fill()

    // "Australia"
    ctx.beginPath()
    ctx.ellipse(canvas.width * 0.8, canvas.height * 0.7, 50, 40, 0, 0, Math.PI * 2)
    ctx.fill()

    return canvas
  }

  // Create texture
  const [globeTexture, setGlobeTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const canvas = createGlobeTexture()
    if (canvas) {
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      setGlobeTexture(texture)
    }
  }, [isDarkMode])

  // Rotate the globe
  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
    if (gridRef.current) {
      gridRef.current.rotation.y = -clock.getElapsedTime() * 0.03
      gridRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1
    }
    if (markersRef.current) {
      markersRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  // Handle marker hover and click
  const handleMarkerHover = (index: number) => {
    setHoveredMarker(index)
    setHoveredCountry(COUNTRIES_DATA[index].name)
  }

  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index)
    const countryName = COUNTRIES_DATA[index].name
    router.push(`/country/${countryName.toLowerCase().replace(/\s+/g, "-")}`)
  }

  return (
    <>
      {/* Main globe */}
      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          {globeTexture ? (
            <meshPhongMaterial
              map={globeTexture}
              transparent
              opacity={0.8}
              emissive={isDarkMode ? "#00a3ff" : "#0284c7"}
              emissiveIntensity={0.2}
            />
          ) : (
            <meshPhongMaterial
              color={isDarkMode ? "#0c4a6e" : "#e0f2fe"}
              transparent
              opacity={0.8}
              emissive={isDarkMode ? "#00a3ff" : "#0284c7"}
              emissiveIntensity={0.2}
            />
          )}
        </mesh>
      </group>

      {/* Outer grid sphere */}
      <group ref={gridRef}>
        <mesh>
          <sphereGeometry args={[2.2, 20, 20]} />
          <meshBasicMaterial color={isDarkMode ? "#00ffff" : "#0284c7"} transparent opacity={0.1} wireframe />
        </mesh>
      </group>

      {/* Country markers */}
      <group ref={markersRef}>
        {COUNTRIES_DATA.map((country, index) => {
          const pos = latLonToVector3(country.coordinates.lat, country.coordinates.lon, 2.1)
          const isHovered = index === hoveredMarker
          const isSelected = index === selectedMarker

          return (
            <group key={index} position={[pos.x, pos.y, pos.z]}>
              {/* Marker */}
              <mesh
                onPointerOver={() => handleMarkerHover(index)}
                onPointerOut={() => {
                  setHoveredMarker(null)
                  setHoveredCountry("")
                }}
                onClick={() => handleMarkerClick(index)}
              >
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                  color={isHovered || isSelected ? "#00ff00" : isDarkMode ? "#00a3ff" : "#0284c7"}
                  emissive={isHovered || isSelected ? "#00ff00" : isDarkMode ? "#00a3ff" : "#0284c7"}
                  emissiveIntensity={isHovered || isSelected ? 1 : 0.5}
                />
              </mesh>

              {/* Pulse effect for hovered marker */}
              {isHovered && (
                <mesh>
                  <sphereGeometry args={[0.08, 16, 16]} />
                  <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
                </mesh>
              )}

              {/* Rating indicator */}
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.02, (country.rating / 5) * 0.2, 0.02]} />
                <meshBasicMaterial
                  color={country.rating > 4 ? "#00ff00" : country.rating > 3 ? "#ffff00" : "#ff0000"}
                />
              </mesh>

              {/* Country name (only visible when hovered) */}
              {isHovered && (
                <Text
                  position={[0, 0.2, 0]}
                  fontSize={0.1}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.01}
                  outlineColor="#000000"
                >
                  {country.name}
                </Text>
              )}
            </group>
          )
        })}
      </group>

      {/* Ambient light */}
      <ambientLight intensity={isDarkMode ? 0.2 : 0.4} />

      {/* Point lights */}
      <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 1 : 0.8} color="#ffffff" />
      <pointLight
        position={[-10, -10, -10]}
        intensity={isDarkMode ? 0.5 : 0.3}
        color={isDarkMode ? "#00a3ff" : "#0284c7"}
      />

      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        zoomSpeed={0.6}
        rotateSpeed={0.4}
        minDistance={3}
        maxDistance={10}
      />

      {/* Stars background - only in dark mode */}
      {isDarkMode && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
    </>
  )
}

export default function FuturisticGlobe({ setHoveredCountry }: GlobeProps) {
  const { theme } = useTheme()

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <color attach="background" args={[theme === "dark" ? "#000000" : "#f0f9ff"]} />
      <Globe setHoveredCountry={setHoveredCountry} />
    </Canvas>
  )
}
