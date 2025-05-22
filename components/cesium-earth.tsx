"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { COUNTRIES_DATA } from "@/lib/countries-data"

interface CesiumEarthProps {
  setHoveredCountry: (country: string) => void
}

// Define a global type for Cesium
declare global {
  interface Window {
    Cesium: any
  }
}

export default function CesiumEarth({ setHoveredCountry }: CesiumEarthProps) {
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [viewer, setViewer] = useState<any>(null)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Initialize Cesium after scripts are loaded
  useEffect(() => {
    if (!scriptLoaded || !cesiumContainerRef.current || viewer) return

    try {
      const Cesium = window.Cesium

      // Set Cesium Ion access token
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzQiLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ5NH0.XcKpgANiY19MC4bdFUXMVEBToBmBLjssJDNYoZA9UBo"

      // Create Cesium viewer
      const newViewer = new Cesium.Viewer(cesiumContainerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        imageryProvider: new Cesium.TileMapServiceImageryProvider({
          url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
        }),
      })

      // Remove Cesium credits container
      if (newViewer.cesiumWidget.creditContainer) {
        newViewer.cesiumWidget.creditContainer.style.display = "none"
      }

      // Configure camera settings
      newViewer.scene.globe.enableLighting = true
      newViewer.scene.globe.showGroundAtmosphere = true

      // Set initial camera position
      newViewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(10, 20, 20000000),
      })

      // Add countries as entities
      COUNTRIES_DATA.forEach((country) => {
        const entity = newViewer.entities.add({
          name: country.name,
          position: Cesium.Cartesian3.fromDegrees(country.coordinates.lon, country.coordinates.lat),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString("#4da6ff"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
          label: {
            text: country.name,
            font: "14px sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000),
          },
          properties: {
            countryData: country,
          },
        })
      })

      // Set up event handlers
      newViewer.screenSpaceEventHandler.setInputAction((movement: any) => {
        const pickedObject = newViewer.scene.pick(movement.endPosition)
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.name) {
          setHoveredCountry(pickedObject.id.name)

          // Highlight the entity
          if (selectedEntity) {
            selectedEntity.point.color = Cesium.Color.fromCssColorString("#4da6ff")
          }
          pickedObject.id.point.color = Cesium.Color.fromCssColorString("#00ff00")
          setSelectedEntity(pickedObject.id)
        } else {
          setHoveredCountry("")
          if (selectedEntity) {
            selectedEntity.point.color = Cesium.Color.fromCssColorString("#4da6ff")
            setSelectedEntity(null)
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      // Handle click events
      newViewer.screenSpaceEventHandler.setInputAction((movement: any) => {
        const pickedObject = newViewer.scene.pick(movement.position)
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.name) {
          const countryName = pickedObject.id.name
          router.push(`/country/${countryName.toLowerCase().replace(/\s+/g, "-")}`)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      // Enable auto-rotation
      let lastTime = Date.now()
      newViewer.scene.postRender.addEventListener(() => {
        const currentTime = Date.now()
        const delta = (currentTime - lastTime) / 1000
        lastTime = currentTime

        // Only rotate if not interacting
        if (!newViewer.scene.screenSpaceCameraController.enableInputs) {
          newViewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, delta * 0.05)
        }
      })

      // Disable rotation when interacting
      newViewer.screenSpaceEventHandler.setInputAction(() => {
        newViewer.scene.screenSpaceCameraController.enableInputs = true
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

      // Re-enable auto-rotation after a delay when interaction stops
      newViewer.screenSpaceEventHandler.setInputAction(() => {
        setTimeout(() => {
          newViewer.scene.screenSpaceCameraController.enableInputs = false
        }, 5000)
      }, Cesium.ScreenSpaceEventType.LEFT_UP)

      setViewer(newViewer)
      setIsLoaded(true)
    } catch (error) {
      console.error("Error initializing Cesium:", error)
    }
  }, [scriptLoaded, viewer, setHoveredCountry, router])

  // Cleanup
  useEffect(() => {
    return () => {
      if (viewer) {
        viewer.destroy()
      }
    }
  }, [viewer])

  return (
    <div className="w-full h-full">
      {/* Load Cesium scripts directly */}
      <Script
        src="https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js"
        onLoad={() => setScriptLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Widgets/widgets.css"
      />

      <div
        ref={cesiumContainerRef}
        className="w-full h-full"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}
