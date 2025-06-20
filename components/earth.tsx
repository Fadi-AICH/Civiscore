// @ts-nocheck
"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh } from "three"
import * as THREE from "three"
import { useSpring, animated } from "@react-spring/three"
import { OrbitControls, Text } from "@react-three/drei"
import { useRouter } from "next/navigation"
import { createNoise2D } from "simplex-noise"
import type React from "react"

// Remove the texture imports and use procedural textures instead

interface EarthProps {
  setHoveredCountry: (country: string) => void
}

// Country data with boundaries
const COUNTRIES_DATA = [
  {
    name: "United States",
    center: { lat: 37.0902, lon: -95.7129 },
    bounds: {
      north: 49.3457868, // north latitude
      south: 24.396308, // south latitude
      east: -66.93457, // east longitude
      west: -124.7844079, // west longitude
    },
    population: 331002651,
    services: 1245,
    rating: 4.2,
  },
  {
    name: "Canada",
    center: { lat: 56.1304, lon: -106.3468 },
    bounds: {
      north: 83.0956562,
      south: 41.6765556,
      east: -52.6458333,
      west: -141.0,
    },
    population: 37742154,
    services: 987,
    rating: 4.5,
  },
  {
    name: "Brazil",
    center: { lat: -14.235, lon: -51.9253 },
    bounds: {
      north: 5.2717863,
      south: -33.7683777,
      east: -28.6341164,
      west: -73.9830625,
    },
    population: 212559417,
    services: 876,
    rating: 3.8,
  },
  {
    name: "United Kingdom",
    center: { lat: 55.3781, lon: -3.436 },
    bounds: {
      north: 60.8604,
      south: 49.9613,
      east: 1.7628,
      west: -8.6493,
    },
    population: 67886011,
    services: 1023,
    rating: 4.3,
  },
  {
    name: "France",
    center: { lat: 46.2276, lon: 2.2137 },
    bounds: {
      north: 51.0891667,
      south: 41.3658333,
      east: 9.5597222,
      west: -5.1416667,
    },
    population: 65273511,
    services: 945,
    rating: 4.1,
  },
  {
    name: "Germany",
    center: { lat: 51.1657, lon: 10.4515 },
    bounds: {
      north: 55.0583333,
      south: 47.2708333,
      east: 15.0416667,
      west: 5.8666667,
    },
    population: 83783942,
    services: 1102,
    rating: 4.4,
  },
  {
    name: "Russia",
    center: { lat: 61.524, lon: 105.3188 },
    bounds: {
      north: 81.8583333,
      south: 41.1855556,
      east: -169.05,
      west: 19.6388889,
    },
    population: 145934462,
    services: 765,
    rating: 3.6,
  },
  {
    name: "China",
    center: { lat: 35.8617, lon: 104.1954 },
    bounds: {
      north: 53.5608333,
      south: 15.775,
      east: 134.7722222,
      west: 73.5572222,
    },
    population: 1439323776,
    services: 1543,
    rating: 4.0,
  },
  {
    name: "India",
    center: { lat: 20.5937, lon: 78.9629 },
    bounds: {
      north: 35.5166667,
      south: 6.7516667,
      east: 97.4166667,
      west: 68.1166667,
    },
    population: 1380004385,
    services: 1321,
    rating: 3.9,
  },
  {
    name: "Australia",
    center: { lat: -25.2744, lon: 133.7751 },
    bounds: {
      north: -10.6681857,
      south: -43.6345972,
      east: 153.6386111,
      west: 112.9358333,
    },
    population: 25499884,
    services: 876,
    rating: 4.4,
  },
  {
    name: "Japan",
    center: { lat: 36.2048, lon: 138.2529 },
    bounds: {
      north: 45.5227778,
      south: 24.2494444,
      east: 145.8166667,
      west: 122.9333333,
    },
    population: 126476461,
    services: 1098,
    rating: 4.7,
  },
  {
    name: "South Africa",
    center: { lat: -30.5595, lon: 22.9375 },
    bounds: {
      north: -22.1266667,
      south: -34.8333333,
      east: 32.8908333,
      west: 16.45,
    },
    population: 59308690,
    services: 543,
    rating: 3.7,
  },
  {
    name: "Finland",
    center: { lat: 61.9241, lon: 25.7482 },
    bounds: {
      north: 70.0922222,
      south: 59.8083333,
      east: 31.5866667,
      west: 20.5555556,
    },
    population: 5540720,
    services: 432,
    rating: 4.8,
  },
]

// Convert lat/lon to 3D coordinates
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

// Check if a point is within country bounds
function isPointInCountry(lat: number, lon: number, country: (typeof COUNTRIES_DATA)[0]): boolean {
  return (
    lat <= country.bounds.north &&
    lat >= country.bounds.south &&
    lon <= country.bounds.east &&
    lon >= country.bounds.west
  )
}

// Function to create earth texture (replace with your implementation)
function createEarthTexture(): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas")
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  // Create gradient for ocean
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  oceanGradient.addColorStop(0, "#0c4a6e")
  oceanGradient.addColorStop(0.5, "#0369a1")
  oceanGradient.addColorStop(1, "#0284c7")

  // Fill background with ocean
  ctx.fillStyle = oceanGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Create simplex noise for continents
  const simplex = createNoise2D()

  // Draw continents with more detailed shapes
  const continents = [
    // North America
    { x: 400, y: 360, width: 400, height: 300, color: "#16a34a" },
    // South America
    { x: 600, y: 660, width: 200, height: 300, color: "#15803d" },
    // Europe
    { x: 1000, y: 300, width: 200, height: 200, color: "#166534" },
    // Africa
    { x: 1000, y: 500, width: 300, height: 400, color: "#14532d" },
    // Asia
    { x: 1200, y: 300, width: 400, height: 300, color: "#16a34a" },
    // Australia
    { x: 1500, y: 700, width: 200, height: 160, color: "#15803d" },
    // Antarctica
    { x: 900, y: 900, width: 400, height: 100, color: "#f1f5f9" },
  ]

  // Draw continents with noise
  continents.forEach((continent) => {
    for (let x = continent.x; x < continent.x + continent.width; x++) {
      for (let y = continent.y; y < continent.y + continent.height; y++) {
        // Use noise to create natural-looking continent borders
        const noise = simplex(x / 100, y / 100)
        if (noise > 0.3) {
          // Distance from center of continent
          const dx = (x - (continent.x + continent.width / 2)) / (continent.width / 2)
          const dy = (y - (continent.y + continent.height / 2)) / (continent.height / 2)
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Only draw if within continent shape
          if (distance < 1 + noise * 0.2) {
            ctx.fillStyle = continent.color
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    }
  })

  // Add country borders
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 1

  // Draw grid lines for longitude and latitude
  for (let lat = -80; lat <= 80; lat += 20) {
    ctx.beginPath()
    for (let lon = -180; lon <= 180; lon++) {
      const x = ((lon + 180) / 360) * canvas.width
      const y = ((90 - lat) / 180) * canvas.height

      if (lon === -180) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }

  for (let lon = -180; lon <= 180; lon += 20) {
    ctx.beginPath()
    for (let lat = -80; lat <= 80; lat++) {
      const x = ((lon + 180) / 360) * canvas.width
      const y = ((90 - lat) / 180) * canvas.height

      if (lat === -80) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }

  // Add ice caps
  ctx.fillStyle = "#f1f5f9"
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < 100; y++) {
      const noise = simplex(x / 50, y / 50)
      if (noise > 0.2) {
        ctx.fillRect(x, y, 1, 1)
      }
    }
    for (let y = canvas.height - 100; y < canvas.height; y++) {
      const noise = simplex(x / 50, y / 50)
      if (noise > 0.2) {
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }

  // Add country labels for major countries
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
  ctx.font = "bold 20px Arial"
  ctx.textAlign = "center"

  COUNTRIES_DATA.forEach((country) => {
    const x = ((country.center.lon + 180) / 360) * canvas.width
    const y = ((90 - country.center.lat) / 180) * canvas.height

    // Only draw labels for major countries to avoid clutter
    if (["United States", "Russia", "China", "Brazil", "Australia", "India"].includes(country.name)) {
      ctx.fillText(country.name, x, y)
    }
  })

  return canvas
}

// Create a procedural clouds texture
const createCloudsTexture = () => {
  const canvas = document.createElement("canvas")
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  // Clear canvas
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Create simplex noise for clouds
  const simplex = createNoise2D()

  // Draw clouds
  for (let x = 0; x < canvas.width; x += 2) {
    for (let y = 0; y < canvas.height; y += 2) {
      const noise = simplex(x / 100, y / 100)
      if (noise > 0.4) {
        const alpha = (noise - 0.4) * 2
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fillRect(x, y, 2, 2)
      }
    }
  }

  return canvas
}

// Add this function to create a normal map texture
const createNormalMapTexture = () => {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  // Create a simple normal map
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const data = imageData.data

  const simplex = createNoise2D()

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4

      // Generate normal map based on noise
      const noise = simplex(x / 50, y / 50) * 0.5 + 0.5

      // RGB values for normal map (pointing mostly up with some variation)
      data[i] = 127 + noise * 20 // R: x-normal
      data[i + 1] = 127 + noise * 20 // G: y-normal
      data[i + 2] = 255 // B: z-normal (pointing outward)
      data[i + 3] = 255 // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export default function Earth({ setHoveredCountry }: EarthProps) {
  const router = useRouter()
  const earthRef = useRef<Mesh>(null)
  const cloudsRef = useRef<Mesh>(null)
  const controlsRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [countryMarkers, setCountryMarkers] = useState<React.ReactNode[]>([])
  const [zoomedIn, setZoomedIn] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  // Load textures
  // const [dayMap, normalMap, specularMap, cloudsMap, bumpMap] = useLoader(THREE.TextureLoader, [
  //   earthDayMap,
  //   earthNormalMap,
  //   earthSpecularMap,
  //   earthCloudsMap,
  //   earthBumpMap,
  // ])

  // Replace with procedural texture generation
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null)
  const [cloudsTexture, setCloudsTexture] = useState<THREE.Texture | null>(null)
  const [normalTexture, setNormalTexture] = useState<THREE.Texture | null>(null)

  // Create procedural textures
  useEffect(() => {
    // Create Earth texture
    const earthCanvas = createEarthTexture()
    if (earthCanvas) {
      const texture = new THREE.CanvasTexture(earthCanvas)
      texture.needsUpdate = true
      setEarthTexture(texture)
    }

    // Create clouds texture
    const cloudsCanvas = createCloudsTexture()
    if (cloudsCanvas) {
      const texture = new THREE.CanvasTexture(cloudsCanvas)
      texture.needsUpdate = true
      setCloudsTexture(texture)
    }

    // Create normal map texture
    const normalCanvas = createNormalMapTexture()
    if (normalCanvas) {
      const texture = new THREE.CanvasTexture(normalCanvas)
      texture.needsUpdate = true
      setNormalTexture(texture)
    }
  }, [])

  const noise2D = createNoise2D()

  const generateHeightMap = (width: number, height: number) => {
    const data = new Float32Array(width * height)
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const x = i / width
        const y = j / height
        data[i + j * width] = noise2D(x * 10, y * 10) * 0.5 + 0.5 // Scale and bias to 0-1 range
      }
    }
    return data
  }

  const width = 256
  const height = 256
  const heightData = generateHeightMap(width, height)

  const dayMap = new THREE.DataTexture(heightData, width, height, THREE.RedFormat)
  dayMap.needsUpdate = true

  const normalMap = new THREE.DataTexture(heightData, width, height, THREE.RedFormat)
  normalMap.needsUpdate = true

  const specularMap = new THREE.DataTexture(heightData, width, height, THREE.RedFormat)
  specularMap.needsUpdate = true

  const bumpMap = new THREE.DataTexture(heightData, width, height, THREE.RedFormat)
  bumpMap.needsUpdate = true

  // Animation for hover effect
  const { scale } = useSpring({
    scale: hovered ? 1.05 : 1,
    config: { tension: 300, friction: 10 },
  })

  // Create country markers
  useEffect(() => {
    const markers = COUNTRIES_DATA.map((country, index) => {
      const position = latLonToVector3(country.center.lat, country.center.lon, 2.05)

      return (
        <group key={index} position={position} userData={{ name: country.name, country }}>
          <mesh
            userData={{ name: country.name, country }}
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/country/${country.name.toLowerCase().replace(/\s+/g, "-")}`)
            }}
          >
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#4da6ff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
            userData={{ name: country.name }}
            visible={zoomedIn}
          >
            {country.name}
          </Text>
        </group>
      )
    })

    setCountryMarkers(markers)
  }, [zoomedIn, router])

  // Handle zoom level changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.addEventListener("change", () => {
        if (controlsRef.current) {
          const distance = controlsRef.current.getDistance()
          setZoomedIn(distance < 5)
          setAutoRotate(distance > 6)
        }
      })
    }
  }, [controlsRef])

  // Rotate the earth
  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.02
    }

    if (earthRef.current && autoRotate && !hovered) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  // Raycaster for country detection
  const handlePointerMove = (event: any) => {
    if (earthRef.current) {
      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2(
        (event.point.x / (window.innerWidth / 2)) * 2 - 1,
        -(event.point.y / (window.innerHeight / 2)) * 2 + 1,
      )

      raycaster.setFromCamera(pointer, event.camera)

      // Check for intersections with country markers
      // @ts-ignore – countryMarkers are JSX elements, we extract children any
      const intersects = raycaster.intersectObjects(
        countryMarkers.flatMap((marker) => (marker as any)?.props?.children ?? []),
        true,
      )

      if (intersects.length > 0) {
        const countryName = intersects[0].object.userData.name
        setHoveredCountry(countryName)
        setSelectedCountry(countryName)
        return
      }

      // If no country marker hit, check for intersection with the earth
      const earthIntersects = raycaster.intersectObject(earthRef.current)

      if (earthIntersects.length > 0) {
        // Get the intersection point on the sphere
        const point = earthIntersects[0].point.clone().normalize().multiplyScalar(2)

        // Convert to latitude and longitude
        const lat = 90 - (Math.acos(point.y / 2) * 180) / Math.PI
        const lon = (((Math.atan2(point.z, point.x) * 180) / Math.PI + 270) % 360) - 180

        // Find the country at this lat/lon
        const country = COUNTRIES_DATA.find((c) => isPointInCountry(lat, lon, c))

        if (country) {
          setHoveredCountry(country.name)
          setSelectedCountry(country.name)
        } else {
          setHoveredCountry("")
          setSelectedCountry(null)
        }
      }
    }
  }

  return (
    <animated.group scale={scale}>
      {/* Earth sphere */}
      <mesh
        ref={earthRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => {
          setHovered(false)
          setHoveredCountry("")
        }}
        onPointerMove={handlePointerMove}
        onClick={(e) => {
          if (selectedCountry) {
            e.stopPropagation()
            router.push(`/country/${selectedCountry.toLowerCase().replace(/\s+/g, "-")}`)
          }
        }}
      >
        <sphereGeometry args={[2, 64, 64]} />
        {earthTexture ? (
          <meshStandardMaterial
            map={earthTexture}
            normalMap={normalTexture}
            roughness={0.8}
            metalness={0.2}
            emissive="#0c4a6e"
            emissiveIntensity={0.1}
          />
        ) : (
          <meshPhongMaterial color="#1e40af" emissive="#0c4a6e" emissiveIntensity={0.2} shininess={5} />
        )}
      </mesh>

      {/* Country markers */}
      {countryMarkers}

      {/* Cloud layer */}
      <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[2, 32, 32]} />
        {cloudsTexture ? (
          <meshStandardMaterial map={cloudsTexture} transparent opacity={0.4} depthWrite={false} alphaTest={0.1} />
        ) : (
          <meshPhongMaterial color="white" transparent opacity={0.3} depthWrite={false} />
        )}
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial color="#4870ff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Custom OrbitControls */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        zoomSpeed={0.6}
        rotateSpeed={0.4}
        minDistance={2.5}
        maxDistance={10}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />
    </animated.group>
  )
}
