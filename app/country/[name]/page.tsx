"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Star, Share2, Info, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Logo from "@/components/logo"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { COUNTRIES_DATA } from "@/lib/countries-data"

export default function CountryPage() {
  const params = useParams()
  const countryName = params.name as string
  const [country, setCountry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Find country data based on URL parameter
    const formattedName = countryName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    const foundCountry = COUNTRIES_DATA.find((c) => c.name.toLowerCase() === formattedName.toLowerCase())

    if (foundCountry) {
      setCountry(foundCountry)
    } else {
      // If country not found, redirect to explore page
      window.location.href = "/explore"
    }

    setIsLoading(false)
  }, [countryName])

  // Generate service data for the country
  const generateServiceData = () => {
    if (!country) return []

    const serviceTypes = ["Healthcare", "Education", "Transportation", "Utilities", "Government"]
    return serviceTypes.map((type) => {
      const serviceKey = type.toLowerCase() as keyof typeof country.services
      return {
        name: `${type} System`,
        category: type,
        rating: country.services[serviceKey] || 0,
        reviews: Math.floor(Math.random() * 1000) + 200,
      }
    })
  }

  // Convert metrics for radar chart
  const radarData = country?.services
    ? Object.entries(country.services).map(([key, value]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        value: value,
        fullMark: 5,
      }))
    : []

  // Generate sentiment data
  const generateSentimentData = () => {
    if (!country) return []

    const avgRating = country.rating
    let positive = 0
    let neutral = 0
    let negative = 0

    if (avgRating >= 4.5) {
      positive = 80
      neutral = 15
      negative = 5
    } else if (avgRating >= 4.0) {
      positive = 70
      neutral = 20
      negative = 10
    } else if (avgRating >= 3.5) {
      positive = 60
      neutral = 25
      negative = 15
    } else if (avgRating >= 3.0) {
      positive = 50
      neutral = 30
      negative = 20
    } else {
      positive = 40
      neutral = 30
      negative = 30
    }

    return [
      { name: "Positive", value: positive, color: "#4ade80" },
      { name: "Neutral", value: neutral, color: "#94a3b8" },
      { name: "Negative", value: negative, color: "#f87171" },
    ]
  }

  // Generate comparison data with neighboring countries
  const generateComparisonData = () => {
    if (!country) return []

    // Get countries from the same region
    const regionalCountries = COUNTRIES_DATA.filter(
      (c) => c.region === country.region && c.name !== country.name,
    ).slice(0, 5)

    // Add current country
    const allCountries = [country, ...regionalCountries]

    // Generate comparison data for each service type
    const serviceTypes = ["healthcare", "education", "transportation", "utilities", "government"]

    return serviceTypes.map((type) => {
      const data = allCountries.map((c) => ({
        name: c.name,
        value: c.services[type as keyof typeof c.services] || 0,
        color: c.name === country.name ? "#3b82f6" : "#94a3b8",
      }))

      // Sort by value descending
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        data: data.sort((a, b) => b.value - a.value),
      }
    })
  }

  const bestService = useMemo(() => {
    if (!country) return { key: "", value: 0 };
    return Object.entries(country.services as Record<string, number>).reduce((best, [key, value]) => (value > best.value ? { key, value } : best), { key: "", value: 0 });
  }, [country]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!country) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Country not found</h2>
          <Link href="/explore">
            <Button className="bg-blue-500 hover:bg-blue-600">Back to Explore</Button>
          </Link>
        </div>
      </div>
    )
  }

  const services = generateServiceData()
  const sentimentData = generateSentimentData()
  const comparisonData = generateComparisonData()

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
            <Link href="/explore">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Logo size="small" animated={false} />
            <h1 className="text-xl font-bold truncate">{country.name}</h1>
          </div>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-black/30 backdrop-blur-md border border-white/10 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Regional Comparison
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative rounded-xl overflow-hidden h-64 md:h-80">
                <img
                  src={`/placeholder.svg?height=400&width=800&text=${country.name}`}
                  alt={country.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-500 text-white">{country.code}</Badge>
                    <Badge className="bg-slate-700 text-white">{country.region}</Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">{country.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= Math.round(country.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{country.rating.toFixed(1)} Overall Rating</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Country Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              
              <Card className="bg-black/30 backdrop-blur-md border border-white/10 md:col-span-2">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">About {country.name}</h2>
                  <p className="text-gray-300 mb-4">
                    {country.name} is located in {country.region} with a population of approximately{" "}
                    {country.population?.toLocaleString()} people. The country has an overall public service rating of{" "}
                    {country.rating.toFixed(1)} out of 5.
                  </p>
                  <Alert className="bg-blue-500/20 border-blue-500/30 text-blue-100">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Public Services Overview</AlertTitle>
                    <AlertDescription>
                      {country.name}'s highest rated public service is{" "}
                      {bestService.key ? `${bestService.key.charAt(0).toUpperCase()}${bestService.key.slice(1)} at ${bestService.value.toFixed(1)}` : "N/A"}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Quick Facts</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Region:</span>
                      <span className="font-medium">{country.region}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Population:</span>
                      <span className="font-medium">{country.population?.toLocaleString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Country Code:</span>
                      <span className="font-medium">{country.code}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Overall Rating:</span>
                      <span className="font-medium text-yellow-400">{country.rating.toFixed(1)}/5</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Best Service:</span>
                      <span className="font-medium">
                        {bestService.key ? `${bestService.key.charAt(0).toUpperCase()}${bestService.key.slice(1)}` : "N/A"}
                      </span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <a href={`https://en.wikipedia.org/wiki/${country.name}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4">Service Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#4b5563" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#e5e7eb" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#e5e7eb" }} />
                          <Radar name="Rating" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment Chart */}
                <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Sentiment Analysis</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sentimentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {sentimentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4">Public Services in {country.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="bg-black/30 backdrop-blur-md border border-white/10 hover:border-blue-500/50 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold">{service.name}</h3>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{service.category}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(service.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                        />
                      ))}
                      <span className="text-sm ml-2">({service.rating.toFixed(1)})</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">Based on {service.reviews} reviews</div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Link href={`/service/${country.code.toLowerCase()}-${service.category.toLowerCase()}`}>
                        <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comparison Tab */}
        {activeTab === "comparison" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4">
              {country.name} Compared to Other {country.region} Countries
            </h2>

            <div className="space-y-8">
              {comparisonData.map((item, index) => (
                <Card key={index} className="bg-black/30 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">{item.type} Comparison</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={item.data}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                          <XAxis type="number" domain={[0, 5]} tick={{ fill: "#e5e7eb" }} />
                          <YAxis dataKey="name" type="category" tick={{ fill: "#e5e7eb" }} width={100} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {item.data.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-cyan-600">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Share Your Experience</h2>
              <p className="text-xl mb-6">
                Help improve public services in {country.name} by sharing your reviews and feedback.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-6 rounded-full text-lg">
                Add Review
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
