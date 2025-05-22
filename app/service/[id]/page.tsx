"use client"

import { useState } from "react"
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

// Sample service data
const serviceData = {
  id: 1,
  name: "Healthcare System",
  category: "Health",
  country: "Finland",
  rating: 4.8,
  reviews: 1245,
  description:
    "Finland's healthcare system is known for its high-quality services, universal coverage, and patient-centered approach. The system is primarily funded through taxation and provides comprehensive care to all residents.",
  image: "/placeholder.svg?height=400&width=800",
  metrics: [
    { name: "Accessibility", value: 4.7 },
    { name: "Quality", value: 4.9 },
    { name: "Affordability", value: 4.8 },
    { name: "Efficiency", value: 4.6 },
    { name: "Staff", value: 4.7 },
  ],
  sentimentData: [
    { name: "Positive", value: 75, color: "#4ade80" },
    { name: "Neutral", value: 20, color: "#94a3b8" },
    { name: "Negative", value: 5, color: "#f87171" },
  ],
  comments: [
    {
      id: 1,
      user: "Emma S.",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "2 days ago",
      rating: 5,
      text: "I was amazed by how efficient the healthcare system is. I got an appointment quickly and the staff was very professional and caring.",
      likes: 24,
      dislikes: 2,
    },
    {
      id: 2,
      user: "Mikko L.",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "1 week ago",
      rating: 4,
      text: "Overall great experience. The only minor issue was the waiting time for specialized care, but the quality of service made up for it.",
      likes: 18,
      dislikes: 3,
    },
    {
      id: 3,
      user: "Sarah J.",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "2 weeks ago",
      rating: 5,
      text: "As a foreigner living in Finland, I'm impressed by how accessible healthcare is. The digital services are particularly convenient.",
      likes: 32,
      dislikes: 1,
    },
  ],
}

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params.id
  const [commentText, setCommentText] = useState("")
  const [userRating, setUserRating] = useState(0)

  // Convert metrics for radar chart
  const radarData = serviceData.metrics.map((metric) => ({
    subject: metric.name,
    A: metric.value,
    fullMark: 5,
  }))

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
            <h1 className="text-xl font-bold truncate">{serviceData.name}</h1>
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
              src={serviceData.image || "/placeholder.svg"}
              alt={serviceData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500 text-white">{serviceData.category}</Badge>
                <Badge className="bg-slate-700 text-white">{serviceData.country}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{serviceData.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= Math.round(serviceData.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {serviceData.rating} ({serviceData.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-black/30 backdrop-blur-md border border-white/10">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">About this service</h2>
              <p className="text-gray-300">{serviceData.description}</p>
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
                        data={serviceData.sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceData.sentimentData.map((entry, index) => (
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
                {serviceData.comments.map((comment) => (
                  <Card key={comment.id} className="bg-black/30 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={comment.avatar} alt={comment.user} />
                          <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{comment.user}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="h-3 w-3" />
                                <span>{comment.date}</span>
                              </div>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= comment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 mb-4">{comment.text}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{comment.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
                              <ThumbsDown className="h-4 w-4" />
                              <span>{comment.dislikes}</span>
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
                ))}
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
