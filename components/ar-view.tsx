"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { COUNTRIES_DATA } from "@/lib/countries-data"

export default function ARView() {
  const router = useRouter()
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null)
  const [countryData, setCountryData] = useState<any>(null)
  const [position, setPosition] = useState({ lat: 0, lng: 0 })

  useEffect(() => {
    // Safely check if WebXR is supported
    const checkXRSupport = async () => {
      try {
        if ("xr" in navigator && typeof (navigator as any).xr?.isSessionSupported === "function") {
          const supported = await (navigator as any).xr.isSessionSupported("immersive-ar").catch(() => false)
          setIsSupported(supported)
        } else {
          console.log("WebXR not available in this browser")
          setIsSupported(false)
        }
      } catch (error) {
        console.log("Error checking XR support:", error)
        setIsSupported(false)
      }

      // Always enable location-based fallback
      if ("geolocation" in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setPosition({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              })

              // Find nearest country based on coordinates
              const nearestCountry = findNearestCountry(position.coords.latitude, position.coords.longitude)
              if (nearestCountry) {
                setDetectedCountry(nearestCountry.name)
                setCountryData(nearestCountry)
              }
            },
            (error) => {
              console.log("Geolocation error:", error)
            },
          )
        } catch (error) {
          console.log("Error accessing geolocation:", error)
        }
      }
    }

    checkXRSupport()
  }, [])

  const findNearestCountry = (lat: number, lng: number) => {
    // Simple implementation - in a real app, you'd use a more sophisticated algorithm
    return COUNTRIES_DATA.reduce((nearest, country) => {
      const distance = calculateDistance(lat, lng, country.coordinates.lat, country.coordinates.lon)

      if (!nearest || distance < nearest.distance) {
        return { ...country, distance }
      }
      return nearest
    }, null as any)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  const startARSession = async () => {
    if ("xr" in navigator && typeof (navigator as any).xr?.requestSession === "function") {
      try {
        const session = await (navigator as any).xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test", "dom-overlay"],
          domOverlay: { root: document.getElementById("ar-overlay") },
        })

        setIsActive(true)

        session.addEventListener("end", () => {
          setIsActive(false)
        })

        // AR session setup would go here
      } catch (error) {
        console.error("Error starting AR session:", error)
        // Fallback to camera view
        activateCameraView()
      }
    } else {
      // Fallback to camera view
      activateCameraView()
    }
  }

  const activateCameraView = () => {
    setIsActive(true)
    // In a real implementation, you would access the camera here
  }

  return (
    <div className="relative h-screen w-full bg-black">
      {/* AR View / Camera Feed */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80">
        {isActive ? (
          <div className="h-full w-full relative">
            {/* This would be replaced with actual camera feed or AR view */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-xl">Camera feed would appear here</p>
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center p-6 bg-black/50 backdrop-blur-md rounded-xl max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Explore Countries in AR</h2>
              <p className="text-gray-300 mb-6">
                Point your camera at the world around you to discover country data and public service ratings in
                augmented reality.
              </p>
              <Button
                onClick={startARSession}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-full"
              >
                <Camera className="mr-2 h-5 w-5" />
                Start AR Experience
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* AR Overlay */}
      <div id="ar-overlay" className="absolute inset-0 pointer-events-none">
        {isActive && detectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-xl p-4 max-w-xs w-full pointer-events-auto"
          >
            <h3 className="text-xl font-bold text-white">{detectedCountry}</h3>
            {countryData && (
              <div className="mt-2">
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Public Service Rating</span>
                  <span className="font-bold text-yellow-400">{countryData.rating}/5</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full"
                    style={{ width: `${(countryData.rating / 5) * 100}%` }}
                  ></div>
                </div>
                <Button
                  className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => router.push(`/country/${detectedCountry.toLowerCase().replace(/\s+/g, "-")}`)}
                >
                  View Details
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/30 backdrop-blur-md text-white rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {!isSupported && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-600/80 backdrop-blur-md p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-white shrink-0 mt-0.5" />
            <p className="text-white text-sm">
              AR features may not be fully supported on your device. We'll use your location to provide relevant
              information instead.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
