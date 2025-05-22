"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, Float, OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, BarChart2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ServiceData {
  name: string
  country: string
  metrics: {
    accessibility: number
    quality: number
    efficiency: number
    staff: number
    value: number
  }
}

interface HologramProps {
  services: ServiceData[]
  selectedMetric: string
}

function Hologram({ services, selectedMetric }: HologramProps) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  // Create holographic grid
  const gridRef = useRef<THREE.Group>(null)

  // Create holographic bars
  const barsRef = useRef<THREE.Group>(null)

  // Animation
  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
    }
  })

  // Get metric value
  const getMetricValue = (service: ServiceData, metric: string) => {
    return service.metrics[metric as keyof typeof service.metrics] || 0
  }

  // Get color based on value
  const getValueColor = (value: number) => {
    if (value >= 4) return new THREE.Color(0x00ff00)
    if (value >= 3) return new THREE.Color(0xffff00)
    return new THREE.Color(0xff0000)
  }

  return (
    <>
      {/* Holographic platform */}
      <group ref={groupRef}>
        {/* Base platform */}
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[5, 5, 0.2, 32, 1, true]} />
          <meshStandardMaterial color="#00ffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Grid */}
        <group ref={gridRef}>
          <mesh position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[4.8, 4.8, 0.1, 32, 10, true]} />
            <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
          </mesh>
        </group>

        {/* Service bars */}
        <group ref={barsRef}>
          {services.map((service, index) => {
            const angle = (index / services.length) * Math.PI * 2
            const radius = 3
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius

            const metricValue = getMetricValue(service, selectedMetric)
            const height = metricValue * 0.5 // Scale height
            const color = getValueColor(metricValue)

            return (
              <group key={index} position={[x, -1.9, z]}>
                {/* Bar */}
                <mesh position={[0, height / 2, 0]}>
                  <boxGeometry args={[0.5, height, 0.5]} />
                  <meshStandardMaterial color={color} transparent opacity={0.7} />
                </mesh>

                {/* Value */}
                <Float floatIntensity={0.2} speed={2}>
                  <Text position={[0, height + 0.3, 0]} fontSize={0.3} color={color} anchorX="center" anchorY="middle">
                    {metricValue.toFixed(1)}
                  </Text>
                </Float>

                {/* Country name */}
                <Text
                  position={[0, -0.2, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  fontSize={0.2}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={2}
                >
                  {service.country}
                </Text>

                {/* Service name */}
                <Html position={[0, -1, 0]} center transform>
                  <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs whitespace-nowrap">
                    {service.name}
                  </div>
                </Html>
              </group>
            )
          })}
        </group>

        {/* Center label */}
        <Float floatIntensity={0.5} speed={1.5}>
          <Text position={[0, 0, 0]} fontSize={0.5} color="#00ffff" anchorX="center" anchorY="middle">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
          </Text>
        </Float>
      </group>

      {/* Ambient light */}
      <ambientLight intensity={0.3} />

      {/* Point lights */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00ffff" />
      <pointLight position={[5, 0, 0]} intensity={0.3} color="#ff00ff" />
      <pointLight position={[-5, 0, 0]} intensity={0.3} color="#00ff00" />

      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={15}
      />
    </>
  )
}

export default function HolographicComparison() {
  const [selectedMetric, setSelectedMetric] = useState("quality")
  const [services, setServices] = useState<ServiceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  // Load sample data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleServices: ServiceData[] = [
        {
          name: "Healthcare System",
          country: "Finland",
          metrics: {
            accessibility: 4.7,
            quality: 4.9,
            efficiency: 4.6,
            staff: 4.8,
            value: 4.5,
          },
        },
        {
          name: "Healthcare System",
          country: "United States",
          metrics: {
            accessibility: 3.2,
            quality: 4.1,
            efficiency: 3.0,
            staff: 3.8,
            value: 2.5,
          },
        },
        {
          name: "Healthcare System",
          country: "Japan",
          metrics: {
            accessibility: 4.3,
            quality: 4.7,
            efficiency: 4.5,
            staff: 4.6,
            value: 4.2,
          },
        },
        {
          name: "Healthcare System",
          country: "Germany",
          metrics: {
            accessibility: 4.5,
            quality: 4.6,
            efficiency: 4.3,
            staff: 4.2,
            value: 4.0,
          },
        },
        {
          name: "Healthcare System",
          country: "Canada",
          metrics: {
            accessibility: 4.2,
            quality: 4.4,
            efficiency: 3.9,
            staff: 4.3,
            value: 4.1,
          },
        },
        {
          name: "Healthcare System",
          country: "United Kingdom",
          metrics: {
            accessibility: 4.0,
            quality: 4.2,
            efficiency: 3.7,
            staff: 4.1,
            value: 4.3,
          },
        },
        {
          name: "Healthcare System",
          country: "Australia",
          metrics: {
            accessibility: 4.1,
            quality: 4.3,
            efficiency: 4.0,
            staff: 4.2,
            value: 4.0,
          },
        },
        {
          name: "Healthcare System",
          country: "France",
          metrics: {
            accessibility: 4.4,
            quality: 4.5,
            efficiency: 4.1,
            staff: 4.0,
            value: 4.2,
          },
        },
      ]

      setServices(sampleServices)
      setIsLoading(false)
    }, 1500)
  }, [])

  const refreshData = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Add some randomness to the data
      const updatedServices = services.map((service) => ({
        ...service,
        metrics: {
          accessibility: Math.min(5, Math.max(1, service.metrics.accessibility + (Math.random() - 0.5) * 0.4)),
          quality: Math.min(5, Math.max(1, service.metrics.quality + (Math.random() - 0.5) * 0.4)),
          efficiency: Math.min(5, Math.max(1, service.metrics.efficiency + (Math.random() - 0.5) * 0.4)),
          staff: Math.min(5, Math.max(1, service.metrics.staff + (Math.random() - 0.5) * 0.4)),
          value: Math.min(5, Math.max(1, service.metrics.value + (Math.random() - 0.5) * 0.4)),
        },
      }))

      setServices(updatedServices)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={["#000000"]} />
        {!isLoading && <Hologram services={services} selectedMetric={selectedMetric} />}
      </Canvas>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 text-lg">Loading holographic data...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ y: isExpanded ? 0 : 120 }}
        animate={{ y: isExpanded ? 0 : 120 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md border-t border-cyan-500/30 p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-white font-bold">Holographic Comparison</h3>
          </div>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Select Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="bg-black/50 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 text-white">
                  <SelectItem value="accessibility">Accessibility</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="value">Value for Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={refreshData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh Data
              </Button>
            </div>

            <div className="md:col-span-2">
              <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3">
                <h4 className="text-cyan-400 font-medium mb-1">About Holographic Comparison</h4>
                <p className="text-gray-300 text-sm">
                  This 3D holographic visualization allows you to compare public services across different countries.
                  Rotate the view by dragging, and zoom with your scroll wheel. Select different metrics to see how
                  countries compare.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
