"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Star, MessageSquare, Share2, ThumbsUp, ThumbsDown, Camera, Send, Calendar } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "recharts"
import { useService } from "@/hooks/useServices"
import ServiceMap from "@/components/ServiceMap"
import { evaluationsApi } from "@/lib/api"

// Default metrics and sentiment data
const defaultMetrics = [
  { name: "Accessibility", value: 4.0 },
  { name: "Quality", value: 4.0 },
  { name: "Affordability", value: 4.0 },
  { name: "Efficiency", value: 4.0 },
  { name: "Staff", value: 4.0 },
]

const defaultSentimentData = [
  { name: "Positive", value: 70, color: "#4ade80" },
  { name: "Neutral", value: 20, color: "#94a3b8" },
  { name: "Negative", value: 10, color: "#f87171" },
]

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params.id as string
  const { service, isLoading, error } = useService(serviceId)
  const [commentText, setCommentText] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(true)

  // Fetch evaluations for this service
  useEffect(() => {
    if (!serviceId) return;
    
    const fetchEvaluations = async () => {
      try {
        const response = await evaluationsApi.getServiceEvaluations(serviceId);
        setEvaluations(response.data || []);
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      } finally {
        setIsLoadingEvaluations(false);
      }
    };
    
    fetchEvaluations();
  }, [serviceId]);

  // Calculate average rating from evaluations
  const calculateAverageRating = () => {
    if (!evaluations.length) return 0;
    const sum = evaluations.reduce((acc, evaluation) => acc + evaluation.rating, 0);
    return (sum / evaluations.length).toFixed(1);
  };

  // Generate metrics data based on evaluations or use default
  const generateMetricsData = () => {
    if (!evaluations.length) return defaultMetrics;
    
    // This is a simplified example - in a real app, you would extract these metrics from evaluations
    return defaultMetrics.map(metric => ({
      ...metric,
      value: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)) // Random value between 3.5-5 for demo
    }));
  };

  // Generate sentiment data based on evaluations or use default
  const generateSentimentData = () => {
    if (!evaluations.length) return defaultSentimentData;
    
    // Count positive (4-5), neutral (3), and negative (1-2) ratings
    const positive = evaluations.filter(e => e.rating >= 4).length;
    const neutral = evaluations.filter(e => e.rating === 3).length;
    const negative = evaluations.filter(e => e.rating < 3).length;
    const total = evaluations.length;
    
    return [
      { name: "Positive", value: Math.round((positive / total) * 100), color: "#4ade80" },
      { name: "Neutral", value: Math.round((neutral / total) * 100), color: "#94a3b8" },
      { name: "Negative", value: Math.round((negative / total) * 100), color: "#f87171" },
    ];
  };

  // Convert metrics for radar chart
  const radarData = generateMetricsData().map((metric) => ({
    subject: metric.name,
    A: metric.value,
    fullMark: 5,
  }))

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[60vh]">
          <div className="animate-pulse text-xl">Loading service details...</div>
        </div>
      </div>
    )
  }

  // If error or no service data, show error message
  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[60vh]">
          <div className="text-red-500 text-xl">Error loading service details. Please try again later.</div>
        </div>
      </div>
    )
  }

  // Calculate metrics and sentiment data
  const metrics = generateMetricsData();
  const sentimentData = generateSentimentData();
  const averageRating = calculateAverageRating() || service.rating || 0;

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
            <h1 className="text-xl font-bold truncate">{service.name}</h1>
          </div>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative rounded-xl overflow-hidden h-64 md:h-80">
            <img
              src={service.image_url || "/placeholder.svg"}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500 text-white">{service.category}</Badge>
                <Badge className="bg-slate-700 text-white">{service.country?.name || 'Unknown'}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{service.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {averageRating} ({evaluations.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description and Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">About this service</h2>
                  <p className="text-gray-300">Information about {service.name} in the {service.category} category.</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Location</h2>
                  <div className="rounded-lg h-[200px]">
                    <div className="bg-gray-800 rounded-lg h-full flex items-center justify-center">
                      <p className="text-gray-500">Location data not available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
                      <Radar name="Rating" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
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

        {/* Reviews and Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="bg-black/30 backdrop-blur-md border border-white/10 w-full mb-6">
              <TabsTrigger value="reviews" className="flex-1 data-[state=active]:bg-blue-500">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="add-review" className="flex-1 data-[state=active]:bg-blue-500">
                Add Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-6">
                {isLoadingEvaluations ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse">Loading reviews...</div>
                  </div>
                ) : evaluations.length > 0 ? (
                  evaluations.map((evaluation) => (
                    <Card key={evaluation.id} className="bg-black/30 backdrop-blur-md border border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={evaluation.user?.avatar || "/placeholder.svg?height=40&width=40"} alt={evaluation.user?.name || 'User'} />
                            <AvatarFallback>{(evaluation.user?.name || 'U').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{evaluation.user?.name || 'Anonymous User'}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(evaluation.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= evaluation.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-300 mb-4">{evaluation.comment}</p>
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{evaluation.likes || 0}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
                                <ThumbsDown className="h-4 w-4" />
                                <span>{evaluation.dislikes || 0}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>Reply</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>No reviews yet. Be the first to leave a review!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add-review" className="mt-0">
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Write a Review</h3>

                  <div className="mb-6">
                    <p className="mb-2">Your Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <Textarea
                      placeholder="Share your experience with this service..."
                      className="bg-black/30 border-white/10 text-white min-h-32"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </div>

                  <div className="mb-6">
                    <Button variant="outline" className="bg-black/30 border-white/10 text-white gap-2">
                      <Camera className="h-4 w-4" />
                      Add Photos
                    </Button>
                  </div>

                  <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
                    <Send className="h-4 w-4" />
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
