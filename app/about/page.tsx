"use client"

import { PublicLayout } from "@/components/public-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, Calendar, Heart } from "lucide-react"
import { useEffect, useState } from "react"

export default function AboutPage() {
  const [stats, setStats] = useState({
    eventsHosted: 0,
    yearsOfExperience: 10,
    averageRating: 0,
    maxCapacity: 0
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch dashboard stats for total bookings
        const dashboardRes = await fetch('/api/dashboard/stats')
        const dashboardData = await dashboardRes.json()
        
        // Fetch reviews for average rating
        const reviewsRes = await fetch('/api/reviews?approved=true')
        const reviewsData = await reviewsRes.json()
        
        // Fetch office rooms for max capacity
        const roomsRes = await fetch('/api/office-rooms?includeAll=true')
        const roomsData = await roomsRes.json()
        
        // Calculate average rating
        const approvedReviews = reviewsData.reviews || []
        const avgRating = approvedReviews.length > 0
          ? (approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
          : '0.0'
        
        // Get max capacity from all rooms
        const maxCap = roomsData.rooms?.length > 0
          ? Math.max(...roomsData.rooms.map((r: any) => r.capacity || 0))
          : 0
        
        // Calculate years since 2014
        const yearsOfExperience = new Date().getFullYear() - 2014
        
        setStats({
          eventsHosted: dashboardData.summary?.totalBookings || 0,
          yearsOfExperience,
          averageRating: parseFloat(avgRating),
          maxCapacity: maxCap
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    
    fetchStats()
  }, [])

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-12 md:mb-16 text-center">
          <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">About One Estela Place</h1>
          <p className="mx-auto max-w-3xl text-sm md:text-base lg:text-lg text-gray-600">
            For over a decade, One Estela Place has been the premier destination for unforgettable events. Our
            commitment to excellence and attention to detail has made us the trusted choice for celebrations that matter
            most.
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-12 md:mb-16 mx-auto max-w-4xl">
          <h2 className="mb-4 md:mb-6 text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 text-center">Our Story</h2>
          <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600">
            <p>
              Founded in 2014, One Estela Place began as a vision to create a space where life's most precious moments
              could be celebrated in style. Named after the founder's grandmother, Estela, our venue embodies the
              warmth, elegance, and hospitality that she was known for.
            </p>
            <p>
              What started as a single event space has grown into a comprehensive venue offering multiple rooms,
              state-of-the-art facilities, and a team of dedicated professionals who are passionate about making every
              event extraordinary.
            </p>
            <p>
              Today, we've had the honor of hosting over 2,000 events, from intimate gatherings to grand celebrations,
              each one unique and memorable in its own way.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="mb-8 md:mb-12 text-center text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Our Values</h2>
          <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="mx-auto h-10 w-10 md:h-12 md:w-12 text-orange-500" />
                <CardTitle className="text-base md:text-lg text-gray-900">Passion</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs md:text-sm text-gray-600">
                  We're passionate about creating magical moments that you'll treasure forever
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="mx-auto h-10 w-10 md:h-12 md:w-12 text-orange-500" />
                <CardTitle className="text-base md:text-lg text-gray-900">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs md:text-sm text-gray-600">
                  We strive for perfection in every detail, from planning to execution
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="mx-auto h-10 w-10 md:h-12 md:w-12 text-orange-500" />
                <CardTitle className="text-base md:text-lg text-gray-900">Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs md:text-sm text-gray-600">
                  Our dedicated team goes above and beyond to exceed your expectations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="mx-auto h-10 w-10 md:h-12 md:w-12 text-orange-500" />
                <CardTitle className="text-base md:text-lg text-gray-900">Reliability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs md:text-sm text-gray-600">
                  You can count on us to deliver exactly what we promise, every time
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 p-6 md:p-8 lg:p-12 text-white shadow-xl">
          <h2 className="mb-6 md:mb-8 text-center text-xl md:text-2xl lg:text-3xl font-bold">Our Achievements</h2>
          <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-1 md:mb-2 text-2xl md:text-3xl lg:text-4xl font-bold">{stats.eventsHosted}+</div>
              <div className="text-xs md:text-sm text-orange-100">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="mb-1 md:mb-2 text-2xl md:text-3xl lg:text-4xl font-bold">{stats.yearsOfExperience}+</div>
              <div className="text-xs md:text-sm text-orange-100">Years of Experience</div>
            </div>
            <div className="text-center">
              <div className="mb-1 md:mb-2 text-2xl md:text-3xl lg:text-4xl font-bold">{stats.averageRating}</div>
              <div className="text-xs md:text-sm text-orange-100">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="mb-1 md:mb-2 text-2xl md:text-3xl lg:text-4xl font-bold">{stats.maxCapacity}</div>
              <div className="text-xs md:text-sm text-orange-100">Max Capacity</div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
