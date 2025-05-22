"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { COUNTRIES_DATA } from "@/lib/countries-data"
import { motion } from "framer-motion"
import { AlertTriangle, Info, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

// Convert lat/lon to 3D coordinates
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

interface HeatmapPoint {
  position: THREE.Vector3
  intensity: number
  category: string
  timestamp: number
}

function HeatmapGlobe() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const globeRef = useRef<THREE.Group>(null)
  const heatmapRef = useRef<THREE.Group>(null)
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([])
  const [globeTexture, setGlobeTexture] = useState<THREE.Texture | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [timeWindow, setTimeWindow] = useState(24) // hours

  const { camera } = useThree()

  // Generate initial heatmap data
  useEffect(() => {
    generateHeatmapData()

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      addNewDataPoint()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Filter heatmap points based on category and time window
  useEffect(() => {
    if (heatmapRef.current) {
      const now = Date.now()
      const timeThreshold = now - timeWindow * 60 * 60 * 1000

      // Update visibility of heatmap points
      heatmapRef.current.children.forEach((child, index) => {
        const point = heatmapPoints[index]
        if (!point) return

        const categoryMatch = selectedCategory ? point.category === selectedCategory : true
        const timeMatch = point.timestamp > timeThreshold

        child.visible = categoryMatch && timeMatch
      })
    }
  }, [selectedCategory, timeWindow, heatmapPoints])

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

    return canvas
  }

  // Create texture
  useEffect(() => {
    const canvas = createGlobeTexture()
    if (canvas) {
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      setGlobeTexture(texture)
    }
  }, [isDarkMode])

  // Generate initial heatmap data
  const generateHeatmapData = () => {
    const categories = ["Healthcare", "Education", "Transportation", "Government", "Utilities"]
    const points: HeatmapPoint[] = []

    // Generate points for each country
    COUNTRIES_DATA.forEach((country) => {
      // Add 1-3 points per country
      const numPoints = Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < numPoints; i++) {
        // Add some randomness to position
        const latOffset = (Math.random() - 0.5) * 5
        const lonOffset = (Math.random() - 0.5) * 5

        const position = latLonToVector3(country.coordinates.lat + latOffset, country.coordinates.lon + lonOffset, 2.02)

        const category = categories[Math.floor(Math.random() * categories.length)]
        const intensity = Math.random() * 0.8 + 0.2 // 0.2 to 1.0
        const timestamp = Date.now() - Math.random() * 24 * 60 * 60 * 1000 // Random time in last 24h

        points.push({
          position,
          intensity,
          category,
          timestamp,
        })
      }
    })

    setHeatmapPoints(points)
  }

  // Add a new data point (simulating real-time data)
  const addNewDataPoint = () => {
    const categories = ["Healthcare", "Education", "Transportation", "Government", "Utilities"]

    // Pick a random country
    const country = COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)]

    // Add some randomness to position
    const latOffset = (Math.random() - 0.5) * 5
    const lonOffset = (Math.random() - 0.5) * 5

    const position = latLonToVector3(country.coordinates.lat + latOffset, country.coordinates.lon + lonOffset, 2.02)

    const category = categories[Math.floor(Math.random() * categories.length)]
    const intensity = Math.random() * 0.8 + 0.2 // 0.2 to 1.0

    const newPoint = {
      position,
      intensity,
      category,
      timestamp: Date.now(),
    }

    setHeatmapPoints((prev) => [...prev, newPoint])
  }

  // Rotate the globe
  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
    if (heatmapRef.current) {
      heatmapRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Healthcare":
        return new THREE.Color(0xff5555)
      case "Education":
        return new THREE.Color(0x55ff55)
      case "Transportation":
        return new THREE.Color(0x5555ff)
      case "Government":
        return new THREE.Color(0xffff55)
      case "Utilities":
        return new THREE.Color(0xff55ff)
      default:
        return new THREE.Color(0xffffff)
    }
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

      {/* Heatmap points */}
      <group ref={heatmapRef}>
        {heatmapPoints.map((point, index) => (
          <group key={index} position={[point.position.x, point.position.y, point.position.z]}>
            <mesh>
              <sphereGeometry args={[0.03 + point.intensity * 0.05, 16, 16]} />
              <meshBasicMaterial color={getCategoryColor(point.category)} transparent opacity={0.7} />
            </mesh>
            <pointLight color={getCategoryColor(point.category)} intensity={point.intensity * 0.5} distance={0.5} />
          </group>
        ))}
      </group>

      {/* Ambient light */}
      <ambientLight intensity={isDarkMode ? 0.2 : 0.4} />

      {/* Point lights */}
      <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 1 : 0.8} color="#ffffff" />

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
    </>
  )
}

export default function LiveHeatmap() {
  const { theme } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [timeWindow, setTimeWindow] = useState(24) // hours
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="relative w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={[theme === "dark" ? "#000000" : "#f0f9ff"]} />
        <HeatmapGlobe />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 right-4 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-white text-lg font-bold">Live Public Service Activity</h2>
          <p className="text-gray-300 text-sm">Real-time global heatmap of service interactions</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`${selectedCategory === null ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${selectedCategory === "Healthcare" ? "bg-red-500 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setSelectedCategory("Healthcare")}
            >
              Healthcare
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${selectedCategory === "Education" ? "bg-green-500 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setSelectedCategory("Education")}
            >
              Education
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${selectedCategory === "Transportation" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setSelectedCategory("Transportation")}
            >
              Transport
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-gray-800 text-gray-300"
            onClick={refreshData}
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Time slider */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm">Time Window: {timeWindow} hours</span>
          <div className="flex items-center gap-1">
            <Info className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300 text-xs">Showing data from the last {timeWindow} hours</span>
          </div>
        </div>
        <Slider
          value={[timeWindow]}
          min={1}
          max={48}
          step={1}
          onValueChange={(value) => setTimeWindow(value[0])}
          className="w-full"
        />
      </div>

      {/* Legend */}
      <div className="absolute top-24 right-4 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-white text-xs">Healthcare</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white text-xs">Education</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-white text-xs">Transportation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-white text-xs">Government</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-white text-xs">Utilities</span>
          </div>
        </div>
      </div>

      {/* Alert for high activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-24 left-4 bg-yellow-600/80 backdrop-blur-md p-3 rounded-lg max-w-xs"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-white shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-bold">High Activity Detected</p>
            <p className="text-white text-xs">Unusual healthcare service activity in Northern Europe region</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
