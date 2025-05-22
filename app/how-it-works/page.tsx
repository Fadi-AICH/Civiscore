"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Search, Star, BarChart2, Globe, MessageSquare, Camera, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Find Services",
      description: "Search for public services by country, city, or category using our interactive globe or search.",
      icon: Search,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      title: "Rate & Review",
      description: "Share your experience with public services by leaving ratings, reviews, and uploading evidence.",
      icon: Star,
      color: "bg-yellow-500/20 text-yellow-400",
    },
    {
      title: "View Analytics",
      description: "Explore detailed analytics and visualizations to understand service performance over time.",
      icon: BarChart2,
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      title: "Compare Globally",
      description: "Compare similar services across different countries to identify best practices.",
      icon: Globe,
      color: "bg-green-500/20 text-green-400",
    },
    {
      title: "Join Discussions",
      description: "Participate in community discussions about how to improve public services.",
      icon: MessageSquare,
      color: "bg-pink-500/20 text-pink-400",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 text-white">
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
            <h1 className="text-xl font-bold">How Civiscore Works</h1>
          </div>

          <Link href="/login">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              Get Started
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1 text-sm">
            Simple & Powerful
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            How to Use{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Civiscore</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Civiscore makes it easy to rate, review, and improve public services around the world. Here's how it works.
          </p>
        </motion.div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 hidden md:block"></div>

            {/* Steps */}
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-12 flex flex-col md:flex-row gap-6 relative"
              >
                <div className="md:w-16 flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center z-10 shrink-0`}
                  >
                    <step.icon className="h-8 w-8" />
                  </div>
                </div>
                <Card className="flex-1 bg-black/30 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">Step {index + 1}:</span> {step.title}
                    </h3>
                    <p className="text-gray-300">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Final Step */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: steps.length * 0.1 }}
              className="mb-12 flex flex-col md:flex-row gap-6 relative"
            >
              <div className="md:w-16 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center z-10 shrink-0">
                  <Camera className="h-8 w-8" />
                </div>
              </div>
              <Card className="flex-1 bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span className="text-blue-400">Step {steps.length + 1}:</span> Upload Evidence
                  </h3>
                  <p className="text-gray-300">
                    Add photos or documents to support your reviews and provide concrete evidence of service quality.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Video Tutorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <Card className="bg-black/30 backdrop-blur-md border border-white/10 overflow-hidden">
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <div className="text-center p-8">
                <h3 className="text-2xl font-bold mb-4">Video Tutorial</h3>
                <p className="text-gray-300 mb-6">
                  Watch our quick tutorial to learn how to use Civiscore effectively.
                </p>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  Play Video
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <Card className="bg-black/30 backdrop-blur-md border border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">How are services verified?</h3>
                <p className="text-gray-300">
                  Our team verifies the existence and basic information of public services before they appear on the
                  platform. User reviews are moderated to ensure quality and authenticity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/30 backdrop-blur-md border border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Can government agencies respond to reviews?</h3>
                <p className="text-gray-300">
                  Yes! We have a verification process for official government representatives to claim their service
                  listings and respond to reviews directly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/30 backdrop-blur-md border border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">How is my data protected?</h3>
                <p className="text-gray-300">
                  We take data privacy seriously. Your personal information is encrypted and never shared without your
                  consent. You can choose to review anonymously if you prefer.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/30 backdrop-blur-md border border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Is Civiscore available in multiple languages?</h3>
                <p className="text-gray-300">
                  Yes! Civiscore is currently available in 12 languages, with more being added regularly to ensure
                  global accessibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="max-w-4xl mx-auto mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-cyan-600">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-xl mb-6">
                Join thousands of citizens around the world who are making a difference through Civiscore.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-6 rounded-full text-lg w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white/10 px-6 py-6 rounded-full text-lg w-full sm:w-auto"
                  >
                    Explore Services <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
