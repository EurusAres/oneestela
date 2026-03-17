'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, MapPin, Building2 } from 'lucide-react'
import { ReserveButton } from '@/components/reserve-button'

interface Venue {
  id: number
  name: string
  description: string
  location: string
  capacity: number
  price_per_hour: number
  image_url: string
  image_360_url: string
  amenities: string
}

interface OfficeRoom {
  id: number
  name: string
  description: string
  capacity: number
  price_per_hour: number
  image_url: string
  image_360_url: string
  type: string
  amenities: string
}

export function AvailableSpacesSection() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [rooms, setRooms] = useState<OfficeRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const [venuesRes, roomsRes] = await Promise.all([
          fetch('/api/venues'),
          fetch('/api/office-rooms')
        ])

        if (venuesRes.ok) {
          const venuesData = await venuesRes.json()
          setVenues(venuesData.venues || [])
        }

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json()
          setRooms(roomsData.rooms || [])
        }
      } catch (error) {
        console.error('Error fetching spaces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpaces()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Spaces</h2>
          <div className="text-center text-gray-500">Loading available spaces...</div>
        </div>
      </section>
    )
  }

  const allSpaces = [...venues, ...rooms]

  if (allSpaces.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Spaces</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our premium event venues and office spaces, perfect for any occasion
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Event Venues */}
          {venues.slice(0, 3).map((venue) => {
            const amenities = venue.amenities ? JSON.parse(venue.amenities) : []
            return (
              <Card key={`venue-${venue.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                {venue.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={venue.image_url}
                      alt={venue.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{venue.name}</CardTitle>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Event Venue
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{venue.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {venue.capacity > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Up to {venue.capacity} guests
                      </div>
                    )}
                    {venue.price_per_hour > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ₱{parseFloat(venue.price_per_hour).toFixed(2)}/hour
                      </div>
                    )}
                    {venue.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {venue.location}
                      </div>
                    )}
                  </div>
                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {amenities.slice(0, 3).map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <ReserveButton className="w-full bg-amber-700 hover:bg-amber-800">
                    Book Now
                  </ReserveButton>
                </CardContent>
              </Card>
            )
          })}

          {/* Office Spaces */}
          {rooms.slice(0, 3).map((room) => {
            const amenities = room.amenities ? JSON.parse(room.amenities) : []
            return (
              <Card key={`room-${room.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                {room.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {room.type || 'Office'}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{room.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {room.capacity > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        Up to {room.capacity} people
                      </div>
                    )}
                    {room.price_per_hour > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ₱{parseFloat(room.price_per_hour).toFixed(2)}/hour
                      </div>
                    )}
                  </div>
                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {amenities.slice(0, 3).map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <ReserveButton className="w-full bg-amber-700 hover:bg-amber-800">
                    Book Now
                  </ReserveButton>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
