"use client"
import InteractiveGlobe from "@/components/InteractiveGlobe";
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, ChevronRight, Zap, GlobeIcon as Globe3, BrainCircuit, Sparkles, Menu, User, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ParticleBackground from "@/components/particle-background"
import StatsCounter from "@/components/stats-counter"
import Logo from "@/components/logo"
import { COUNTRIES_DATA, TOP_RATED_COUNTRIES, BEST_HEALTHCARE_COUNTRIES } from "@/lib/countries-data"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Home() {
  const { theme } = useTheme()
  const [hoveredCountry, setHoveredCountry] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [highlightedCountries, setHighlightedCountries] = useState<any[]>([])
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>(0)

  // Make sure all countries are visible by default when the page loads
  useEffect(() => {
    resetFilters()
  }, [])

  // Track window size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Modern data visualization instead of the globe
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    // Create nodes for countries
    const nodes = COUNTRIES_DATA.map((country) => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: country.rating * 3 + 5,
        color: getColorByRating(country.rating),
        name: country.name,
        region: country.region,
        rating: country.rating,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        highlighted: false,
        countryData: country,
      }
    })

    // Function to get color based on rating
    function getColorByRating(rating: number) {
      if (rating >= 4.5) return "#10b981" // Green
      if (rating >= 4.0) return "#3b82f6" // Blue
      if (rating >= 3.5) return "#6366f1" // Indigo
      if (rating >= 3.0) return "#f59e0b" // Amber
      return "#ef4444" // Red
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections between nodes
      ctx.strokeStyle = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"
      ctx.lineWidth = 1

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].region === nodes[j].region) {
            const dx = nodes[i].x - nodes[j].x
            const dy = nodes[i].y - nodes[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 200) {
              ctx.beginPath()
              ctx.moveTo(nodes[i].x, nodes[i].y)
              ctx.lineTo(nodes[j].x, nodes[j].y)
              ctx.stroke()
            }
          }
        }
      }

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < node.radius || node.x > canvas.width - node.radius) {
          node.vx *= -1
        }
        if (node.y < node.radius || node.y > canvas.height - node.radius) {
          node.vy *= -1
        }

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)

        // Highlight nodes based on filters
        if (
          (activeRegion && node.region === activeRegion) ||
          highlightedCountries.some((c) => c.name === node.name) ||
          node.highlighted
        ) {
          ctx.fillStyle = node.color
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
        } else if (activeRegion || highlightedCountries.length > 0) {
          ctx.fillStyle = `${node.color}80` // Semi-transparent
          ctx.strokeStyle = `${node.color}80`
          ctx.lineWidth = 1
        } else {
          // Default state - all nodes fully visible
          ctx.fillStyle = node.color
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
          ctx.lineWidth = 1
        }

        ctx.fill()
        ctx.stroke()

        // Always draw country name for better visibility
        if (
          node.highlighted ||
          (activeRegion && node.region === activeRegion) ||
          highlightedCountries.some((c) => c.name === node.name)
        ) {
          ctx.font = "12px Arial"
          ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
          ctx.textAlign = "center"
          ctx.fillText(node.name, node.x, node.y - node.radius - 5)
        }
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Handle mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let hoveredNode = null

      for (const node of nodes) {
        const dx = node.x - x
        const dy = node.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < node.radius) {
          hoveredNode = node
          break
        }
      }

      // Reset all nodes
      for (const node of nodes) {
        node.highlighted = false
      }

      // Highlight hovered node
      if (hoveredNode) {
        hoveredNode.highlighted = true
        setHoveredCountry(hoveredNode.name)

        // Change cursor to pointer to indicate clickable
        canvas.style.cursor = "pointer"
      } else {
        setHoveredCountry("")
        canvas.style.cursor = "default"
      }
    }

    // Handle click to navigate to country page
    const handleMouseClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      for (const node of nodes) {
        const dx = node.x - x
        const dy = node.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < node.radius) {
          // Navigate to country page when clicked
          const countrySlug = node.name.toLowerCase().replace(/\s+/g, "-")
          window.location.href = `/country/${countrySlug}`
          break
        }
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("click", handleMouseClick)

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("click", handleMouseClick)
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [theme, activeRegion, highlightedCountries])

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const query = searchQuery.toLowerCase()

    // Search countries
    const countryResults = COUNTRIES_DATA.filter((country) => country.name.toLowerCase().includes(query)).map(
      (country) => ({
        type: "country",
        name: country.name,
        rating: country.rating,
        url: `/country/${country.name.toLowerCase().replace(/\s+/g, "-")}`,
      }),
    )

    // Mock service results (in a real app, you'd search a services database)
    const serviceTypes = ["Healthcare", "Education", "Transportation", "Utilities", "Government"]
    const serviceResults = serviceTypes
      .filter((service) => service.toLowerCase().includes(query))
      .map((service) => ({
        type: "service",
        name: service + " System",
        rating: (Math.random() * 2 + 3).toFixed(1),
        url: `/explore?service=${service.toLowerCase()}`,
      }))

    setSearchResults([...countryResults, ...serviceResults].slice(0, 5))
    setShowResults(searchResults.length > 0)
  }, [searchQuery])

  // Hide search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false)
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  // Set highlighted countries based on top ratings
  const showTopRatedCountries = () => {
    setHighlightedCountries(TOP_RATED_COUNTRIES)
    setActiveRegion(null)
  }

  // Set highlighted countries based on healthcare
  const showBestHealthcareCountries = () => {
    setHighlightedCountries(BEST_HEALTHCARE_COUNTRIES)
    setActiveRegion(null)
  }

  // Filter by region
  const filterByRegion = (region: string) => {
    setActiveRegion(region)
    setHighlightedCountries([])
  }

  // Reset filters
  const resetFilters = () => {
    setActiveRegion(null)
    setHighlightedCountries([])
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-black via-slate-900 to-slate-800 dark:from-black dark:via-slate-900 dark:to-slate-800">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Interactive Data Visualization (replacing the globe) */}
      <div className="absolute inset-0 z-0">
        <InteractiveGlobe />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full flex justify-between items-center"
        >
          <Logo size="medium" animated={true} />

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-slate-900 text-white border-slate-700">
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Link href="/about">
                    <Button variant="ghost" className="w-full justify-start">
                      About
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button variant="ghost" className="w-full justify-start">
                      How it works
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">Explore Services</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-4 items-center">
            <Link href="/about">
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/10 dark:text-white dark:hover:text-white dark:hover:bg-white/10"
              >
                About
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/10 dark:text-white dark:hover:text-white dark:hover:bg-white/10"
              >
                How it works
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/10 dark:text-white dark:hover:text-white dark:hover:bg-white/10"
              >
                Login
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Center Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-6 max-w-3xl text-center my-8"
        >
          <h1 className="text-3xl md:text-6xl font-bold text-white dark:text-white leading-tight">
            Rate{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              public services
            </span>{" "}
            around the world
          </h1>
          <p className="text-base md:text-lg text-gray-300 dark:text-gray-300 max-w-2xl px-4">
            Civiscore is a global platform where citizens can rate, review, and improve public services across countries
            and sectors.
          </p>

          {/* Data Visualization Controls */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 px-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                  >
                    All Countries
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show all countries</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showTopRatedCountries}
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Top Rated
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show top rated countries</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showBestHealthcareCountries}
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                  >
                    Best Healthcare
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show countries with best healthcare</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
              {["Europe", "Asia", "Africa", "North America", "South America", "Oceania"].map((region) => (
                <Button
                  key={region}
                  variant="outline"
                  size="sm"
                  onClick={() => filterByRegion(region)}
                  className={`bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 ${activeRegion === region ? "bg-blue-500/50" : ""}`}
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Bar with Results */}
          <div className="relative w-full max-w-md mt-4 px-4" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for a country or service..."
              className="pl-12 pr-4 py-6 w-full bg-black/30 backdrop-blur-md border border-white/10 text-white dark:bg-black/30 dark:border-white/10 dark:text-white rounded-full focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value.length >= 2) {
                  setShowResults(true)
                }
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowResults(true)
                }
              }}
            />

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute mt-2 w-full bg-black/80 backdrop-blur-md border border-white/10 dark:bg-black/80 dark:border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
                <ul>
                  {searchResults.map((result, index) => (
                    <li key={index}>
                      <Link href={result.url}>
                        <div className="px-4 py-3 hover:bg-white/10 dark:hover:bg-white/10 flex justify-between items-center">
                          <div>
                            <p className="text-white dark:text-white">{result.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-400">{result.type}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span className="text-white dark:text-white">{result.rating}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Link href="/explore" className="mt-4">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-6 rounded-full text-lg font-medium flex items-center gap-2">
              Enter Civiscore
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>

          {/* Hovered Country Info */}
          {hoveredCountry && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 px-6 py-3 bg-white/10 backdrop-blur-md dark:bg-white/10 rounded-full text-white dark:text-white"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{hoveredCountry}</span>
                <Badge className="bg-blue-500/20 text-blue-400">Click to view details</Badge>
              </div>
            </motion.div>
          )}

          {/* Advanced Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-4">
            <Link href="/ar-explore">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 flex flex-col items-center text-center hover:border-purple-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                  <Globe3 className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-white font-bold mb-1">AR Explorer</h3>
                <p className="text-gray-300 text-sm">Discover services in augmented reality</p>
              </motion.div>
            </Link>

            <Link href="/live-data">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 flex flex-col items-center text-center hover:border-blue-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-white font-bold mb-1">Live Heatmap</h3>
                <p className="text-gray-300 text-sm">Real-time global service activity</p>
              </motion.div>
            </Link>

            <Link href="/holographic">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 flex flex-col items-center text-center hover:border-cyan-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
                  <BrainCircuit className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-bold mb-1">Holographic View</h3>
                <p className="text-gray-300 text-sm">3D comparison of global services</p>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-4 mb-4"
        >
          <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-4">
            <div className="text-center">
              <p className="text-gray-400 dark:text-gray-400 text-sm">Total Reviews</p>
              <StatsCounter end={1245632} className="text-2xl font-bold text-white dark:text-white" />
            </div>
          </Card>
          <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-4">
            <div className="text-center">
              <p className="text-gray-400 dark:text-gray-400 text-sm">Countries</p>
              <StatsCounter end={COUNTRIES_DATA.length} className="text-2xl font-bold text-white dark:text-white" />
            </div>
          </Card>
          <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-4">
            <div className="text-center">
              <p className="text-gray-400 dark:text-gray-400 text-sm">Services</p>
              <StatsCounter end={5842} className="text-2xl font-bold text-white dark:text-white" />
            </div>
          </Card>
          <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-4">
            <div className="text-center">
              <p className="text-gray-400 dark:text-gray-400 text-sm">Top Country</p>
              <p className="text-2xl font-bold text-white dark:text-white">Finland</p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
                4.8/5
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Footer with instructions */}
        <div className="w-full text-center mt-4 mb-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="px-6 py-3 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-lg inline-block"
          >
            <p className="text-white flex items-center gap-2">
              <Info className="h-4 w-4" />
              Click on any country bubble to view detailed information
            </p>
          </motion.div>
        </div>
      </div>

      {/* Fixed bottom navigation bar for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md border-t border-white/10 z-50">
        <div className="flex justify-around py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
              <Globe3 className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
              <Search className="h-5 w-5 mb-1" />
              <span className="text-xs">Explore</span>
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
              <BrainCircuit className="h-5 w-5 mb-1" />
              <span className="text-xs">About</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs">Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
