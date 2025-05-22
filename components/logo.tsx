"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface LogoProps {
  size?: "small" | "medium" | "large"
  animated?: boolean
}

export default function Logo({ size = "medium", animated = true }: LogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Size mapping
  const sizeMap = {
    small: { width: 40, height: 40, fontSize: 14 },
    medium: { width: 50, height: 50, fontSize: 18 },
    large: { width: 80, height: 80, fontSize: 28 },
  }

  const { width, height, fontSize } = sizeMap[size]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Animation variables
    let animationFrameId: number
    let hue = 0
    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      hue: number
    }> = []

    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        hue: Math.random() * 60 + 180, // Blue to cyan range
      })
    }

    // Animation function
    const animate = () => {
      // Clear canvas with semi-transparent black for trail effect
      ctx.fillStyle = isDarkMode ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, width, height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > height) particle.speedY *= -1

        // Draw particle
        ctx.fillStyle = `hsl(${particle.hue}, 100%, 50%)`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw the main logo shape - a futuristic "C"
      ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`
      ctx.lineWidth = width * 0.1
      ctx.lineCap = "round"

      // Outer C
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width * 0.35, Math.PI * 0.8, Math.PI * 1.8, false)
      ctx.stroke()

      // Inner details
      ctx.strokeStyle = `hsl(${(hue + 120) % 360}, 100%, 60%)`
      ctx.lineWidth = width * 0.05
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width * 0.25, Math.PI * 0.6, Math.PI * 1.6, false)
      ctx.stroke()

      // Center dot
      ctx.fillStyle = `hsl(${(hue + 240) % 360}, 100%, 70%)`
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width * 0.1, 0, Math.PI * 2)
      ctx.fill()

      // Update hue for color cycling
      hue = (hue + 0.5) % 360

      if (animated) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    // Start animation
    if (animated) {
      animate()
    } else {
      // Just draw once for non-animated version
      ctx.fillStyle = isDarkMode ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 1)"
      ctx.fillRect(0, 0, width, height)

      // Draw the main logo shape
      ctx.strokeStyle = `hsl(210, 100%, 60%)`
      ctx.lineWidth = width * 0.1
      ctx.lineCap = "round"

      // Outer C
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width * 0.35, Math.PI * 0.8, Math.PI * 1.8, false)
      ctx.stroke()

      // Inner details
      ctx.strokeStyle = `hsl(330, 100%, 60%)`
      ctx.lineWidth = width * 0.05
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width * 0.25, Math.PI * 0.6, Math.PI * 1.6, false)
      ctx.stroke()

      // Center dot
      ctx.fillStyle = `hsl(270, 100%, 70%)`
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width * 0.1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Cleanup
    return () => {
      if (animated) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [width, height, animated, isDarkMode])

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ rotate: -10 }}
        animate={animated ? { rotate: [0, 10, 0, -10, 0] } : {}}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded-full"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
      >
        Civiscore
      </motion.h1>
    </div>
  )
}
