import { PublicLayout } from "@/components/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import { ReserveButton } from "@/components/reserve-button"
import { TourButton } from "@/components/tour-button"
import { FeaturedReviewsSection } from "@/components/featured-reviews-section"

async function getHomepageContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/homepage`, {
      cache: 'no-store'
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error)
  }
  
  // Return default content if fetch fails
  return {
    heroTitle: 'Welcome to One Estela Place',
    heroDescription: 'The perfect venue for your special events and celebrations',
    heroImage: '/images/venue-interior.jpg'
  }
}

export default async function HomePage() {
  const content = await getHomepageContent()
  
  return (
    <PublicLayout>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[600px] bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${content.heroImage || '/images/venue-interior.jpg'}')`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <h1 className="mb-6 text-5xl font-bold drop-shadow-lg text-white">{content.heroTitle}</h1>
          <p className="mb-8 text-xl drop-shadow-md text-white">
            {content.heroDescription}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <ReserveButton className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg border-0" size="lg">
              Book Your Event
            </ReserveButton>
            <TourButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              Take a Tour
            </TourButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose One Estela Place?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>Prime Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Located in the heart of the city with easy access and stunning views</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>Flexible Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accommodates intimate gatherings to large celebrations up to 500 guests
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Simple online booking system with real-time availability</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>5-Star Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Professional staff dedicated to making your event unforgettable</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section id="about" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-3xl font-bold">About One Estela Place</h2>
            <p className="mb-4 text-gray-600">
              One Estela Place is a premier event venue that has been hosting memorable celebrations for over a
              decade. Our stunning architecture and versatile spaces provide the perfect backdrop for weddings,
              corporate events, and special occasions.
            </p>
            <p className="mb-6 text-gray-600">
              With state-of-the-art facilities, professional catering services, and a dedicated events team, we ensure
              every detail of your event is perfectly executed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button className="bg-amber-700 text-white hover:bg-amber-800">
                <a href="/about">Learn More About Us</a>
              </Button>
              <TourButton
                variant="outline"
                className="border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white"
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
      <section className="relative py-16 bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/cta-background.png')`,
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="mb-4 text-3xl font-bold drop-shadow-lg text-white">
            {content.ctaTitle || 'Ready to Book Your Event?'}
          </h2>
          <p className="mb-8 text-xl drop-shadow-md text-white">
            {content.ctaDescription || 'Take a virtual tour first, then contact us to start planning your perfect event'}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <TourButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              Take Virtual Tour
            </TourButton>
            <ReserveButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              {content.ctaButtonText || 'Book Now'}
            </ReserveButton>
            <Button
              size="lg"
              className="bg-amber-700 text-white hover:bg-amber-800 border-2 border-amber-700 shadow-lg"
            >
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
