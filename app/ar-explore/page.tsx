"use client"

import { useState } from "react"
import ARView from "@/components/ar-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, MapPin } from "lucide-react"
import Link from "next/link"

export default function ARExplorePage() {
  const [hasError, setHasError] = useState(false)

  // Error boundary for AR view
  if (hasError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">AR Experience Unavailable</h2>
          <p className="text-gray-300 mb-6">
            Your browser doesn't support augmented reality features or permissions were denied. Try using a different
            browser or device.
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" className="w-full bg-transparent border-white/20 text-white">
                <Camera className="mr-2 h-4 w-4" /> Explore Countries
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full">
      <ARView />

      {/* Fallback UI in case AR component fails to render */}
      <div className="hidden absolute inset-0 bg-black/80 flex items-center justify-center" id="ar-fallback">
        <div className="text-center p-6">
          <p className="text-white text-lg mb-4">Unable to load AR experience</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
