"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PublicLayout } from "@/components/public-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { TermsDialog } from "@/components/terms-dialog"

export default function ContactPage() {
  const [showTerms, setShowTerms] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    location: '123 Event Street\nDowntown District\nCity, Sheesh 12345',
    phone: '09123456789',
    email: 'estelatest1@gmail.com',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: By appointment only'
  })

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const response = await fetch('/api/homepage')
        const data = await response.json()
        if (data.contactLocation || data.contactPhone || data.contactEmail || data.contactHours) {
          setContactInfo({
            location: data.contactLocation || contactInfo.location,
            phone: data.contactPhone || contactInfo.phone,
            email: data.contactEmail || contactInfo.email,
            hours: data.contactHours || contactInfo.hours
          })
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      }
    }
    fetchContactInfo()
  }, [])

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600">Ready to plan your event? Get in touch with our team today.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2">
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg text-gray-900">
                  <MapPin className="mr-2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600 whitespace-pre-line">
                  {contactInfo.location}
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg text-gray-900">
                  <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600">{contactInfo.phone}</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg text-gray-900">
                  <Mail className="mr-2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600">{contactInfo.email}</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg text-gray-900">
                  <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs md:text-sm text-gray-600 whitespace-pre-line">
                  {contactInfo.hours}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Google Map */}
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow mt-6 md:mt-8">
            <CardHeader>
              <CardTitle className="text-base md:text-lg text-gray-900">Find Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden border border-orange-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.2089!2d121.0244!3d14.5547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDMzJzE3LjAiTiAxMjHCsDAyJzE2LjAiRQ!5e0!3m2!1sen!2sph!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="One Estela Place Location"
                />
              </div>
              <div className="mt-3 md:mt-4 text-center">
                <a
                  href="https://maps.app.goo.gl/U56VTkSLYGXwtawA8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm md:text-base text-orange-500 hover:text-orange-600 font-medium hover:underline"
                >
                  <MapPin className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                  Open in Google Maps
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <TermsDialog open={showTerms} onOpenChange={setShowTerms} />
    </PublicLayout>
  )
}
