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
import { useServices } from "@/hooks/useServices"

export default function ExploreClient() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

  const apiFilters = {
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    include_country: true
  }

  const { services, isLoading, error } = useServices(apiFilters)
  const [filteredServices, setFilteredServices] = useState<any[]>([])

  useEffect(() => {
    const serviceParam = searchParams.get("service")
    const regionParam = searchParams.get("region")

    if (serviceParam) {
      setSelectedCategory(serviceParam.charAt(0).toUpperCase() + serviceParam.slice(1))
    }

    if (regionParam) {
      setSelectedRegion(regionParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (!services || services.length === 0) return

    let filtered = [...services]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          (service.country?.name && service.country.name.toLowerCase().includes(query)) ||
          (service.category && service.category.toLowerCase().includes(query)),
      )
    }

    if (selectedRegion !== "All") {
      const countriesInRegion = COUNTRIES_BY_REGION[selectedRegion]?.map((c) => c.name) || []
      filtered = filtered.filter((service) => 
        service.country && countriesInRegion.includes(service.country.name)
      )
    }

    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    setFilteredServices(filtered)
  }, [searchQuery, selectedRegion, services])

  const categories = ["All", "Healthcare", "Education", "Transportation", "Utilities", "Government"]
  const regions = ["All", "Africa", "Asia", "Europe", "North America", "South America", "Oceania"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-300">
              Showing {filteredServices.length} results
              {selectedCategory !== "All" && ` for ${selectedCategory}`}
              {selectedRegion !== "All" && ` in ${selectedRegion}`}
            </div>

            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <Link key={service.id} href={`/service/${service.id}`}>
                    <Card className="bg-black/30 backdrop-blur-md border border-white/10 hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                      <div className="relative h-32 rounded-t-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                          <span className="text-3xl text-white/30">{service.category?.charAt(0) || '?'}</span>
                        </div>
                        <Badge className="absolute top-2 right-2 bg-blue-500 text-white">{service.category}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold truncate">{service.name}</h3>
                        <p className="text-sm text-gray-400">{service.country?.name || 'Unknown'}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(service.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs ml-2 text-gray-400">
                            {(service.rating || 0).toFixed(1)} ({service.evaluations?.length || 0} reviews)
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

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