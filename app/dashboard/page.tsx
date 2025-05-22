"use client"

import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"

import { Input } from "@/components/ui/input"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Home,
  Globe,
  User,
  Settings,
  LogOut,
  Star,
  BarChart2,
  Award,
  MapPin,
  Trash2,
  ThumbsUp,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Sample user data
const userData = {
  name: "Alex Johnson",
  avatar: "/placeholder.svg?height=100&width=100",
  joinDate: "Member since Jan 2023",
  totalReviews: 47,
  badges: ["Top Reviewer", "Healthcare Expert", "Verified User"],
  stats: {
    reviewsThisMonth: 8,
    countriesVisited: 12,
    totalUpvotes: 342,
    contributionLevel: 78,
  },
  recentActivity: [
    {
      id: 1,
      type: "review",
      service: "Healthcare System",
      country: "Sweden",
      rating: 4,
      date: "2 days ago",
    },
    {
      id: 2,
      type: "comment",
      service: "Public Transportation",
      country: "Japan",
      date: "1 week ago",
    },
    {
      id: 3,
      type: "review",
      service: "Education System",
      country: "Finland",
      rating: 5,
      date: "2 weeks ago",
    },
  ],
  activityData: [
    { name: "Jan", reviews: 4 },
    { name: "Feb", reviews: 3 },
    { name: "Mar", reviews: 5 },
    { name: "Apr", reviews: 7 },
    { name: "May", reviews: 2 },
    { name: "Jun", reviews: 6 },
    { name: "Jul", reviews: 8 },
    { name: "Aug", reviews: 9 },
    { name: "Sep", reviews: 5 },
    { name: "Oct", reviews: 4 },
    { name: "Nov", reviews: 7 },
    { name: "Dec", reviews: 8 },
  ],
  categoryData: [
    { name: "Healthcare", value: 35, color: "#3b82f6" },
    { name: "Transport", value: 25, color: "#10b981" },
    { name: "Education", value: 20, color: "#f59e0b" },
    { name: "Government", value: 15, color: "#8b5cf6" },
    { name: "Other", value: 5, color: "#6b7280" },
  ],
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 md:w-64 bg-black/30 backdrop-blur-md border-r border-white/10 z-50">
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CS</span>
            </div>
            <h1 className="text-xl font-bold hidden md:block">Civiscore</h1>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${activeTab === "overview" ? "bg-blue-500/20 text-blue-400" : "text-gray-300 hover:text-white"}`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <Home className="h-5 w-5" />
                    <span className="hidden md:inline">Overview</span>
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/explore">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:text-white">
                    <Globe className="h-5 w-5" />
                    <span className="hidden md:inline">Explore</span>
                  </Button>
                </Link>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${activeTab === "profile" ? "bg-blue-500/20 text-blue-400" : "text-gray-300 hover:text-white"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Profile</span>
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${activeTab === "settings" ? "bg-blue-500/20 text-blue-400" : "text-gray-300 hover:text-white"}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-5 w-5" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
              </li>
            </ul>
          </nav>

          <Button variant="ghost" className="justify-start gap-3 text-gray-300 hover:text-white mt-auto">
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-16 md:ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {userData.name}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border border-white/10 text-white" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/20">
                    <Star className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Reviews This Month</p>
                    <h3 className="text-2xl font-bold">{userData.stats.reviewsThisMonth}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <Globe className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Countries Visited</p>
                    <h3 className="text-2xl font-bold">{userData.stats.countriesVisited}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <ThumbsUp className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Upvotes</p>
                    <h3 className="text-2xl font-bold">{userData.stats.totalUpvotes}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <Award className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Contribution Level</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{userData.stats.contributionLevel}%</h3>
                    </div>
                    <Progress
                      value={userData.stats.contributionLevel}
                      className="h-1 mt-1 bg-white/10"
                      indicatorClassName="bg-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle>Review Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userData.activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" tick={{ fill: "#e5e7eb" }} />
                        <YAxis tick={{ fill: "#e5e7eb" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                        <Line
                          type="monotone"
                          dataKey="reviews"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle>Review Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {userData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-black/30 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "review" ? "bg-blue-500/20" : "bg-purple-500/20"
                        }`}
                      >
                        {activity.type === "review" ? (
                          <Star
                            className={`h-5 w-5 ${activity.type === "review" ? "text-blue-400" : "text-purple-400"}`}
                          />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {activity.type === "review" ? "Reviewed" : "Commented on"} {activity.service}
                          </h4>
                          <span className="text-sm text-gray-400">{activity.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-400">{activity.country}</span>

                          {activity.rating && (
                            <div className="flex items-center ml-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${star <= activity.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Profile Card */}
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 lg:col-span-1">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{userData.name}</h2>
                <p className="text-gray-400 mb-4">{userData.joinDate}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {userData.badges.map((badge, index) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {badge}
                    </Badge>
                  ))}
                </div>

                <div className="w-full mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Contribution Level</span>
                    <span className="font-medium">{userData.stats.contributionLevel}%</span>
                  </div>
                  <Progress
                    value={userData.stats.contributionLevel}
                    className="h-2 bg-white/10"
                    indicatorClassName="bg-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-2xl font-bold">{userData.totalReviews}</p>
                    <p className="text-gray-400 text-sm">Total Reviews</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-2xl font-bold">{userData.stats.countriesVisited}</p>
                    <p className="text-gray-400 text-sm">Countries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 lg:col-span-2">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-500/20">
                      <Award className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Top Reviewer</h4>
                      <p className="text-sm text-gray-400">Submitted over 25 reviews</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <Globe className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">World Explorer</h4>
                      <p className="text-sm text-gray-400">Reviewed services in 10+ countries</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/20">
                      <Star className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Quality Contributor</h4>
                      <p className="text-sm text-gray-400">Received 100+ upvotes</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <BarChart2 className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Data Analyst</h4>
                      <p className="text-sm text-gray-400">Provided detailed reviews with metrics</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Next Achievements</h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Elite Reviewer (100 reviews)</span>
                        <span className="text-sm">{userData.totalReviews}/100</span>
                      </div>
                      <Progress
                        value={(userData.totalReviews / 100) * 100}
                        className="h-2 bg-white/10"
                        indicatorClassName="bg-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Global Citizen (25 countries)</span>
                        <span className="text-sm">{userData.stats.countriesVisited}/25</span>
                      </div>
                      <Progress
                        value={(userData.stats.countriesVisited / 25) * 100}
                        className="h-2 bg-white/10"
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 mb-6">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      type="text"
                      defaultValue={userData.name}
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      defaultValue="alex.johnson@example.com"
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea
                    defaultValue="Passionate about improving public services around the world. Travel enthusiast and civic tech advocate."
                    className="bg-black/30 border-white/10 text-white min-h-32"
                  />
                </div>

                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="bg-black/30 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-400">Receive email updates about your activity</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-gray-400">Use dark theme across the application</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Profile</h4>
                    <p className="text-sm text-gray-400">Make your profile visible to other users</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
