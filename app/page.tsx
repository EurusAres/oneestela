import { PublicLayout } from "@/components/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import { ReserveButton } from "@/components/reserve-button"
import { TourButton } from "@/components/tour-button"
import { FeaturedReviewsSection } from "@/components/featured-reviews-section"
import { AvailableSpacesSection } from "@/components/available-spaces-section"

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[600px] bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/venue-interior.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <h1 className="mb-6 text-5xl font-bold drop-shadow-lg text-white">Welcome to One Estela Place</h1>
          <p className="mb-8 text-xl drop-shadow-md text-white">
            The perfect venue for your special events and celebrations
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

      {/* About Preview Section with Chandelier Image */}
      <section id="about" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
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
              <div className="flex flex-col gap-3 sm:flex-row">
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
            <div className="h-96 rounded-lg overflow-hidden shadow-lg">
              <img
                src="/images/venue-chandelier.png"
                alt="Elegant chandelier at One Estela Place venue"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <FeaturedReviewsSection />

      {/* Available Spaces Section */}
      <AvailableSpacesSection />

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
          <h2 className="mb-4 text-3xl font-bold drop-shadow-lg text-white">Ready to Book Your Event?</h2>
          <p className="mb-8 text-xl drop-shadow-md text-white">
            Take a virtual tour first, then contact us to start planning your perfect event
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <TourButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              Take Virtual Tour
            </TourButton>
            <ReserveButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              Book Now
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
