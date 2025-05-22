"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ThemeToggle({ variant = "ghost", size = "icon", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`relative overflow-hidden rounded-full ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative">
        {/* Sun icon */}
        <motion.div
          initial={{ opacity: theme === "dark" ? 0 : 1, y: theme === "dark" ? 20 : 0 }}
          animate={{ opacity: theme === "dark" ? 0 : 1, y: theme === "dark" ? 20 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        </motion.div>

        {/* Moon icon */}
        <motion.div
          initial={{ opacity: theme === "dark" ? 1 : 0, y: theme === "dark" ? 0 : -20 }}
          animate={{ opacity: theme === "dark" ? 1 : 0, y: theme === "dark" ? 0 : -20 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        </motion.div>

        {/* Hidden icon for spacing */}
        <div className="opacity-0">
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        </div>
      </div>
    </Button>
  )
}
