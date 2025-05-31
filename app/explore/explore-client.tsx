"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Globe, ArrowLeft, Star, ChevronDown, User, Moon, Sun, MapPin, BarChart2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { COUNTRIES_DATA, COUNTRIES_BY_REGION } from "@/lib/countries-data"

// Generate services data from countries data
const generateServicesData = () => {
  const serviceTypes = ["Healthcare", "Education", "Transportation", "Utilities", "Government"]
  const services = []

  for (const country of COUNTRIES_DATA) {
    for (const serviceType of serviceTypes) {
      const serviceKey = serviceType.toLowerCase() as keyof typeof country.services
      if (country.services && country.services[serviceKey]) {
        services.push({
          id: `${country.code}-${serviceKey}`,
          name: `${serviceType} System`,
          category: serviceType,
          country: country.name,
          rating: country.services[serviceKey],
          reviews: Math.floor(Math.random() * 3000) + 500,
          image: `/placeholder.svg?height=200&width=400&text=${country.name}+${serviceType}`,
        })
      }
    }
  }

  return services
}

export default function ExploreClient() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize services data
  useEffect(() => {
    const servicesData = generateServicesData()
    setServices(servicesData)
    setFilteredServices(servicesData)
    setIsLoading(false)

    // Check for URL parameters
    const serviceParam = searchParams.get("service")
    const regionParam = searchParams.get("region")

    if (serviceParam) {
      setSelectedCategory(serviceParam.charAt(0).toUpperCase() + serviceParam.slice(1))
    }

    if (regionParam) {
      setSelectedRegion(regionParam)
    }
  }, [searchParams])

  // Filter services based on search, category, and region
  useEffect(() => {
    if (services.length === 0) return

    let filtered = [...services]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.country.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((service) => service.category === selectedCategory)
    }

    // Apply region filter
    if (selectedRegion !== "All") {
      const countriesInRegion = COUNTRIES_BY_REGION[selectedRegion]?.map((c) => c.name) || []
      filtered = filtered.filter((service) => countriesInRegion.includes(service.country))
    }

    // Sort by rating (highest first)
    filtered.sort((a, b) => b.rating - a.rating)

    setFilteredServices(filtered)
  }, [searchQuery, selectedCategory, selectedRegion, services])

  const categories = ["All", "Healthcare", "Education", "Transportation", "Utilities", "Government"]
  const regions = ["All", "Africa", "Asia", "Europe", "North America", "South America", "Oceania"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              <h1 className="text-xl font-bold">Explore Services</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`text-white hover:bg-white/10 ${viewMode === "grid" ? "bg-white/20" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <BarChart2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`text-white hover:bg-white/10 ${viewMode === "map" ? "bg-white/20" : ""}`}
              onClick={() => setViewMode("map")}
            >
              <MapPin className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search services, countries..."
              className="pl-10 bg-black/30 backdrop-blur-md border border-white/10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-black/30 backdrop-blur-md border border-white/10 text-white flex gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Category: {selectedCategory}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border border-white/10 text-white">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-blue-500/20" : ""}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-black/30 backdrop-blur-md border border-white/10 text-white flex gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Region: {selectedRegion}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border border-white/10 text-white">
                {regions.map((region) => (
                  <DropdownMenuItem
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={selectedRegion === region ? "bg-blue-500/20" : ""}
                  >
                    {region}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Category Tabs (visible on larger screens) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden md:block mb-8"
        >
          <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} value={selectedCategory}>
            <TabsList className="bg-black/30 backdrop-blur-md border border-white/10 p-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-gray-300">
              Showing {filteredServices.length} results
              {selectedCategory !== "All" && ` for ${selectedCategory}`}
              {selectedRegion !== "All" && ` in ${selectedRegion}`}
            </div>

            {/* Services Grid */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <Link href={`/service/${service.id}`}>
                      <Card className="h-full overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={service.image || "/placeholder.svg"}
                            alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-blue-500 text-white">{service.category}</Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold">{service.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300">{service.country}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                          <span className="text-xs text-gray-400">{service.reviews} reviews</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-0"
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Map View */}
            {viewMode === "map" && (
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6 h-[600px] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Interactive Map View</h3>
                    <p className="text-gray-300 max-w-md">
                      Explore services geographically with our interactive world map. See ratings and reviews across
                      different regions.
                    </p>
                    <Button className="mt-4 bg-blue-500 hover:bg-blue-600">Coming Soon</Button>
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No services found</h3>
                <p className="text-gray-300 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  className="bg-black/30 backdrop-blur-md border border-white/10 text-white"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                    setSelectedRegion("All")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}