"use client"

import { useState, useEffect } from "react"
import { PublicLayout } from "@/components/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import { ReserveButton } from "@/components/reserve-button"
import { TourButton } from "@/components/tour-button"
import { FeaturedReviewsSection } from "@/components/featured-reviews-section"

export default function HomePage() {
  const [content, setContent] = useState({
    heroTitle: 'Welcome to One Estela Place',
    heroDescription: 'The perfect venue for your special events and celebrations',
    heroImage: '/images/venue-interior.jpg',
    ctaTitle: 'Ready to Book Your Event?',
    ctaDescription: 'Take a virtual tour first, then contact us to start planning your perfect event',
    ctaButtonText: 'Book Now'
  })

  useEffect(() => {
    async function getHomepageContent() {
      try {
        const res = await fetch('/api/homepage', {
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()
          setContent(data)
        }
      } catch (error) {
        console.error('Error fetching homepage content:', error)
      }
    }
    getHomepageContent()
  }, [])
  
  return (
    <PublicLayout>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${content.heroImage || '/images/venue-interior.jpg'}')`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 text-center relative z-10">
          <h1 className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg text-white">{content.heroTitle}</h1>
          <p className="mb-6 md:mb-8 text-base md:text-lg lg:text-xl drop-shadow-md text-white max-w-2xl mx-auto">
            {content.heroDescription}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <ReserveButton className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg border-0 w-full sm:w-auto" size="lg">
              Book Your Event
            </ReserveButton>
            <TourButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0 w-full sm:w-auto" size="lg">
              Take a Tour
            </TourButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 md:mb-12 text-center text-2xl md:text-3xl font-bold">Why Choose One Estela Place?</h2>
          <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="mx-auto h-10 w-10 md:h-12 md:w-12 text-amber-700" />
                <CardTitle className="text-lg md:text-xl">Prime Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">Located in the heart of the city with easy access and stunning views</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="mx-auto h-10 w-10 md:h-12 md:w-12 text-amber-700" />
                <CardTitle className="text-lg md:text-xl">Flexible Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Accommodates intimate gatherings to large celebrations up to 500 guests
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="mx-auto h-10 w-10 md:h-12 md:w-12 text-amber-700" />
                <CardTitle className="text-lg md:text-xl">Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">Simple online booking system with real-time availability</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="mx-auto h-10 w-10 md:h-12 md:w-12 text-amber-700" />
                <CardTitle className="text-lg md:text-xl">5-Star Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">Professional staff dedicated to making your event unforgettable</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section id="about" className="bg-gray-50 py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl font-bold">About One Estela Place</h2>
            <p className="mb-3 md:mb-4 text-sm md:text-base text-gray-600">
              One Estela Place is a premier event venue that has been hosting memorable celebrations for over a
              decade. Our stunning architecture and versatile spaces provide the perfect backdrop for weddings,
              corporate events, and special occasions.
            </p>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-600">
              With state-of-the-art facilities, professional catering services, and a dedicated events team, we ensure
              every detail of your event is perfectly executed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button className="bg-amber-700 text-white hover:bg-amber-800 w-full sm:w-auto">
                <a href="/about">Learn More About Us</a>
              </Button>
              <TourButton
                variant="outline"
                className="border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white w-full sm:w-auto"
              >
                Virtual Tour
              </TourButton>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <FeaturedReviewsSection />

      {/* CTA Section with Chandelier Background */}
      <section className="relative py-8 md:py-12 lg:py-16 bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/cta-background.png')`,
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="mb-3 md:mb-4 text-2xl md:text-3xl font-bold drop-shadow-lg text-white">
            {content.ctaTitle || 'Ready to Book Your Event?'}
          </h2>
          <p className="mb-6 md:mb-8 text-base md:text-lg lg:text-xl drop-shadow-md text-white max-w-2xl mx-auto">
            {content.ctaDescription || 'Take a virtual tour first, then contact us to start planning your perfect event'}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <TourButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0 w-full sm:w-auto" size="lg">
              Take Virtual Tour
            </TourButton>
            <ReserveButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0 w-full sm:w-auto" size="lg">
              {content.ctaButtonText || 'Book Now'}
            </ReserveButton>
            <Button
              size="lg"
              className="bg-amber-700 text-white hover:bg-amber-800 border-2 border-amber-700 shadow-lg w-full sm:w-auto"
            >
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
