"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Globe, Users, BarChart2, Shield, Award, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("mission")

  const teamMembers = [
    {
      name: "Emma Chen",
      role: "Founder & CEO",
      avatar: "/placeholder.svg?height=100&width=100",
      bio: "Former civic tech advisor with 10+ years experience in public service innovation.",
    },
    {
      name: "Marcus Johnson",
      role: "CTO",
      avatar: "/placeholder.svg?height=100&width=100",
      bio: "Full-stack developer with a background in data visualization and civic engagement platforms.",
    },
    {
      name: "Sofia Rodriguez",
      role: "Head of Research",
      avatar: "/placeholder.svg?height=100&width=100",
      bio: "PhD in Public Policy with expertise in measuring service quality across different countries.",
    },
    {
      name: "Jamal Williams",
      role: "Design Lead",
      avatar: "/placeholder.svg?height=100&width=100",
      bio: "UX/UI specialist focused on creating accessible interfaces for diverse global users.",
    },
  ]

  const features = [
    {
      title: "Global Coverage",
      description: "Rate and review public services across 196 countries and territories worldwide.",
      icon: Globe,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      title: "Community Driven",
      description: "Powered by citizens like you who want to improve public services for everyone.",
      icon: Users,
      color: "bg-green-500/20 text-green-400",
    },
    {
      title: "Data Insights",
      description: "Advanced analytics and visualizations to understand service quality trends.",
      icon: BarChart2,
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      title: "Verified Reviews",
      description: "Robust verification system to ensure authentic, helpful feedback.",
      icon: Shield,
      color: "bg-yellow-500/20 text-yellow-400",
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
            <h1 className="text-xl font-bold">About Civiscore</h1>
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
            Civic Innovation Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Empowering Citizens to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Improve Public Services
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Civiscore is a global platform where citizens can rate, review, and help improve public services across
            countries and sectors.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/explore">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-6 rounded-full text-lg">
                Explore Services
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button
                variant="outline"
                className="bg-black/30 backdrop-blur-md border border-white/10 text-white px-6 py-6 rounded-full text-lg"
              >
                How It Works
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex overflow-x-auto space-x-2 pb-2 justify-center">
          {["mission", "features", "team", "impact"].map((section) => (
            <Button
              key={section}
              variant={activeSection === section ? "default" : "outline"}
              className={`${
                activeSection === section
                  ? "bg-blue-500 text-white"
                  : "bg-black/30 backdrop-blur-md border border-white/10 text-white"
              }`}
              onClick={() => setActiveSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-24">
        {/* Mission Section */}
        {activeSection === "mission" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-white">Our Mission</h2>
              </div>
              <CardContent className="p-8">
                <p className="text-xl mb-6 text-gray-300">
                  Civiscore was founded on a simple but powerful idea: public services should be accountable to the
                  people they serve.
                </p>
                <p className="mb-6 text-gray-300">
                  We believe that by creating a transparent, global platform for citizens to rate and review public
                  services, we can:
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-500/20 mt-1">
                      <ChevronRight className="h-4 w-4 text-green-400" />
                    </div>
                    <p>
                      <span className="font-bold">Increase transparency</span> in how public services perform across
                      different countries and regions
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-500/20 mt-1">
                      <ChevronRight className="h-4 w-4 text-green-400" />
                    </div>
                    <p>
                      <span className="font-bold">Empower citizens</span> to share their experiences and hold service
                      providers accountable
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-500/20 mt-1">
                      <ChevronRight className="h-4 w-4 text-green-400" />
                    </div>
                    <p>
                      <span className="font-bold">Provide valuable data</span> to policymakers and service providers to
                      drive improvements
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-500/20 mt-1">
                      <ChevronRight className="h-4 w-4 text-green-400" />
                    </div>
                    <p>
                      <span className="font-bold">Create a global standard</span> for measuring and comparing public
                      service quality
                    </p>
                  </li>
                </ul>
                <p className="text-gray-300">
                  Our vision is a world where every citizen has access to high-quality public services, and where their
                  voice matters in shaping how those services are delivered.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features Section */}
        {activeSection === "features" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Civiscore combines powerful technology with user-friendly design to create a truly global civic
                platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-black/30 backdrop-blur-md border border-white/10 h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className={`p-3 rounded-full ${feature.color} w-fit mb-4`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-300 flex-grow">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/30 backdrop-blur-md border border-white/10 col-span-1 md:col-span-3">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" /> Premium Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-bold mb-2">Advanced Analytics</h4>
                      <p className="text-gray-300">
                        Deep dive into service performance with trend analysis, comparative metrics, and custom reports.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Verified Contributor Status</h4>
                      <p className="text-gray-300">
                        Gain a verified badge and increased visibility for your reviews and contributions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">API Access</h4>
                      <p className="text-gray-300">
                        Integrate Civiscore data into your own applications, research, or dashboards.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Team Section */}
        {activeSection === "team" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We're a diverse group of civic tech enthusiasts, data scientists, and public policy experts united by
                our passion for improving public services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6 text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-blue-400 mb-4">{member.role}</p>
                      <p className="text-gray-300 text-sm">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-12">
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-4">Join Our Team</h3>
                  <p className="text-gray-300 mb-6">
                    We're always looking for passionate individuals to help us build the future of civic engagement.
                  </p>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    View Open Positions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Impact Section */}
        {activeSection === "impact" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Since our launch, Civiscore has helped drive meaningful improvements in public services around the
                world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 text-center">
                  <h3 className="text-4xl font-bold text-blue-400 mb-2">1.2M+</h3>
                  <p className="text-gray-300">Reviews submitted</p>
                </CardContent>
              </Card>
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 text-center">
                  <h3 className="text-4xl font-bold text-green-400 mb-2">196</h3>
                  <p className="text-gray-300">Countries covered</p>
                </CardContent>
              </Card>
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 text-center">
                  <h3 className="text-4xl font-bold text-purple-400 mb-2">42%</h3>
                  <p className="text-gray-300">Average service improvement</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/30 backdrop-blur-md border border-white/10 mb-12">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Success Stories</h3>
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img
                        src="/placeholder.svg?height=200&width=300"
                        alt="Helsinki Transportation"
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <h4 className="text-xl font-bold mb-2">Helsinki Public Transportation</h4>
                      <p className="text-gray-300 mb-4">
                        After receiving consistent feedback through Civiscore about accessibility issues, Helsinki's
                        transportation authority implemented major improvements, resulting in a 28% increase in
                        satisfaction scores.
                      </p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success Story</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img
                        src="/placeholder.svg?height=200&width=300"
                        alt="Singapore Healthcare"
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <h4 className="text-xl font-bold mb-2">Singapore Healthcare System</h4>
                      <p className="text-gray-300 mb-4">
                        Singapore's Ministry of Health used Civiscore data to identify bottlenecks in patient care,
                        leading to a redesign of their appointment system and a 45% reduction in wait times.
                      </p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success Story</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Join the Movement</h3>
                <p className="text-xl mb-6 max-w-3xl mx-auto">
                  Help us create a world where public services work for everyone. Your voice matters.
                </p>
                <Link href="/login">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-6 rounded-full text-lg">
                    Get Started Today
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
