"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Zap, X, AlertTriangle, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"

interface NeuralInterfaceProps {
  onClose: () => void
  onSubmit: (ratings: Record<string, number>) => void
  serviceName: string
}

export default function NeuralInterface({ onClose, onSubmit, serviceName }: NeuralInterfaceProps) {
  const [step, setStep] = useState(0)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationProgress, setCalibrationProgress] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [brainwaveData, setBrainwaveData] = useState<number[]>([])
  const [ratings, setRatings] = useState({
    accessibility: 0,
    quality: 0,
    efficiency: 0,
    staff: 0,
    value: 0,
  })
  const [currentCategory, setCurrentCategory] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>(0)

  // Simulate brainwave data
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        const newData = Array(100)
          .fill(0)
          .map(() => Math.random() * 2 - 1)
        setBrainwaveData(newData)
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isConnected])

  // Draw brainwave visualization
  useEffect(() => {
    if (!canvasRef.current || !isConnected) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1

      // Vertical grid lines
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal grid lines
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw brainwave data
      if (brainwaveData.length > 0) {
        ctx.strokeStyle = "#00ffff"
        ctx.lineWidth = 2
        ctx.beginPath()

        const sliceWidth = canvas.width / brainwaveData.length

        for (let i = 0; i < brainwaveData.length; i++) {
          const x = i * sliceWidth
          const y = ((brainwaveData[i] + 1) / 2) * canvas.height

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()
      }

      animationFrameId.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [brainwaveData, isConnected])

  // Simulate calibration process
  const startCalibration = () => {
    setIsCalibrating(true)
    setCalibrationProgress(0)

    const interval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCalibrating(false)
          setIsConnected(true)
          setStep(1)
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  // Process neural rating for current category
  const processNeuralRating = () => {
    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      // Generate a "neural" rating based on brainwave data
      const rating = Math.floor(Math.random() * 5) + 1

      setRatings((prev) => ({
        ...prev,
        [currentCategory.toLowerCase()]: rating,
      }))

      setIsProcessing(false)

      // Move to next category or finish
      const categories = Object.keys(ratings)
      const currentIndex = categories.indexOf(currentCategory.toLowerCase())

      if (currentIndex < categories.length - 1) {
        setCurrentCategory(categories[currentIndex + 1])
      } else {
        setStep(2)
      }
    }, 2000)
  }

  // Handle manual rating adjustment
  const handleRatingChange = (category: string, value: number[]) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value[0],
    }))
  }

  // Submit final ratings
  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      onSubmit(ratings)
      setIsSubmitting(false)
      onClose()
    }, 1500)
  }

  // Start with first category
  useEffect(() => {
    if (step === 1 && currentCategory === "") {
      setCurrentCategory(Object.keys(ratings)[0])
    }
  }, [step, currentCategory, ratings])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-black/80 border border-cyan-500/50 rounded-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-white" />
              <h2 className="text-white font-bold text-lg">Neural Interface</h2>
            </div>
            <Button variant="ghost" size="icon" className="text-white" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 0 && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-12 w-12 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Neural Rating System</h3>
                  <p className="text-gray-300 mb-4">
                    Rate {serviceName} using our advanced neural interface. This system will analyze your brainwave
                    patterns to determine your true feelings about this service.
                  </p>
                  <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-yellow-200 text-sm text-left">
                        This is a simulated experience. No actual neural data is being collected. In a real
                        implementation, this would require specialized hardware.
                      </p>
                    </div>
                  </div>
                </div>

                {isCalibrating ? (
                  <div>
                    <h4 className="text-white font-medium mb-2">Calibrating Neural Interface</h4>
                    <Progress value={calibrationProgress} className="mb-4" />
                    <p className="text-gray-400 text-sm">Please remain still while we calibrate the system...</p>
                  </div>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    onClick={startCalibration}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Begin Neural Calibration
                  </Button>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Rating: {currentCategory}</h3>

                {/* Brainwave visualization */}
                <div className="relative mb-6">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    className="w-full h-[150px] rounded-lg bg-black/50"
                  />

                  <div className="absolute top-2 left-2 bg-black/50 rounded-md px-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-green-400 text-xs">Connected</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 mb-4">
                    Think about your experience with the {currentCategory.toLowerCase()} of {serviceName}. How satisfied
                    were you? The system will analyze your brainwave patterns.
                  </p>

                  {isProcessing ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-2" />
                        <p className="text-cyan-400">Processing neural response...</p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      onClick={processNeuralRating}
                    >
                      <Brain className="mr-2 h-5 w-5" />
                      Process Neural Rating
                    </Button>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Review Your Ratings</h3>
                <p className="text-gray-300 mb-6">
                  Our neural interface has analyzed your brainwave patterns and generated the following ratings. You can
                  adjust them manually if needed.
                </p>

                <div className="space-y-4 mb-6">
                  {Object.entries(ratings).map(([category, value]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-white capitalize">{category}</span>
                        <span className="text-cyan-400">{value}/5</span>
                      </div>
                      <Slider
                        value={[value]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(newValue) => handleRatingChange(category, newValue)}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Submit Neural Ratings
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
