"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useBookings } from "@/components/booking-context"
import { useToast } from "@/hooks/use-toast"
import { UnavailableDatesManager } from "@/components/unavailable-dates-manager"
import { UnavailableOfficeManager } from "@/components/unavailable-office-manager"
import { Calendar as CalendarIcon, Clock, Users, MapPin, CalendarX, Building2 } from "lucide-react"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [unavailableDatesOpen, setUnavailableDatesOpen] = useState(false)
  const [unavailableOfficesOpen, setUnavailableOfficesOpen] = useState(false)
  const [adminUnavailableDates, setAdminUnavailableDates] = useState<any[]>([])
  const { getAllBookings } = useBookings()
  const { toast } = useToast()

  // Fetch admin-managed unavailable dates
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const response = await fetch('/api/unavailable-dates')
        if (response.ok) {
          const data = await response.json()
          setAdminUnavailableDates(data.unavailableDates || [])
        }
      } catch (error) {
        console.error('Error fetching unavailable dates:', error)
      }
    }
    
    fetchUnavailableDates()
  }, [unavailableDatesOpen]) // Refetch when dialog closes
  
  const allBookings = getAllBookings()
  
  // Get all confirmed and pending bookings
  const reservedBookings = allBookings.filter(
    (booking) => booking.status === "confirmed" || booking.status === "pending"
  )
  
  // Extract dates from bookings - parse as local date to avoid timezone issues
  const reservedDates = reservedBookings.map((booking) => {
    const [year, month, day] = booking.date.split('-').map(Number)
    return new Date(year, month - 1, day)
  })

  // Extract admin unavailable dates
  const adminReservedDates = adminUnavailableDates.map((unavailable) => {
    const dateStr = unavailable.date
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date(dateStr)
  })

  // Combine all reserved dates (bookings + admin unavailable)
  const allReservedDates = [...reservedDates, ...adminReservedDates]
  
  // Find bookings for the selected date
  const bookingsForSelectedDate = date
    ? reservedBookings.filter((booking) => {
        const bookingDate = new Date(booking.date)
        return (
          bookingDate.getDate() === date.getDate() &&
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getFullYear() === date.getFullYear()
        )
      })
    : []

  // Find admin unavailable dates for the selected date
  const unavailableDatesForSelectedDate = date
    ? adminUnavailableDates.filter((unavailable) => {
        // Parse date string properly to avoid timezone issues
        const dateStr = unavailable.date
        let unavailableDate: Date
        
        if (dateStr.includes('-')) {
          const [year, month, day] = dateStr.split('-').map(Number)
          unavailableDate = new Date(year, month - 1, day)
        } else {
          unavailableDate = new Date(dateStr)
        }
        
        return (
          unavailableDate.getDate() === date.getDate() &&
          unavailableDate.getMonth() === date.getMonth() &&
          unavailableDate.getFullYear() === date.getFullYear()
        )
      })
    : []

  // Combine bookings and unavailable dates for display
  const totalEventsForSelectedDate = bookingsForSelectedDate.length + unavailableDatesForSelectedDate.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Booking Calendar</h1>
            <p className="text-xs md:text-sm text-muted-foreground">View all customer reservations and bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setUnavailableDatesOpen(true)}
              className="flex items-center gap-2"
            >
              <CalendarX className="h-4 w-4" />
              Manage Unavailable Dates
            </Button>
            <Button 
              onClick={() => setUnavailableOfficesOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Manage Unavailable Office Space
            </Button>
            <Badge variant="outline" className="gap-1 text-xs md:text-sm">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
              Reserved Dates
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Bookings</CardTitle>
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{allBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Confirmed</CardTitle>
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {allBookings.filter((b) => b.status === "confirmed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Pending</CardTitle>
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {allBookings.filter((b) => b.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle>
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {allBookings.filter((b) => {
                  const bookingDate = new Date(b.date)
                  const now = new Date()
                  return (
                    bookingDate.getMonth() === now.getMonth() &&
                    bookingDate.getFullYear() === now.getFullYear()
                  )
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.15fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Event Calendar</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Dates highlighted in red are reserved by customers or marked unavailable by admin
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-3 md:p-6">
              <div className="scale-90 sm:scale-100 md:scale-110 lg:scale-125" style={{ transform: 'scaleX(1.15)' }}>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  modifiers={{
                    reserved: allReservedDates,
                  }}
                  modifiersClassNames={{
                    reserved: "!bg-red-500 !text-white !font-bold hover:!bg-red-600",
                  }}
                  className="rounded-md border scale-125 origin-center"
                  style={{
                    fontSize: '1.1rem',
                    '--cell-size': '3rem'
                  } as any}
                  components={{
                    DayButton: ({ day, modifiers, ...props }: any) => {
                      const isReserved = modifiers?.reserved || false
                      return (
                        <button
                          {...props}
                          data-reserved={isReserved ? "true" : "false"}
                          className={`${props.className || ''} ${isReserved ? '!bg-red-500 !text-white !font-bold hover:!bg-red-600' : ''}`}
                        />
                      )
                    }
                  }}
                />
              </div>
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {totalEventsForSelectedDate === 0
                  ? "No bookings or unavailable dates scheduled for this date"
                  : `${bookingsForSelectedDate.length} booking(s)${unavailableDatesForSelectedDate.length > 0 ? ` and ${unavailableDatesForSelectedDate.length} unavailable date(s)` : ''} scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {totalEventsForSelectedDate === 0 ? (
                  <div className="text-center py-6 md:py-8 text-gray-500">
                    <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs md:text-sm">No events on this date</p>
                  </div>
                ) : (
                  <>
                    {/* Display customer bookings */}
                    {bookingsForSelectedDate.map((booking) => (
                      <div key={booking.id} className="rounded-lg border p-3 md:p-4 space-y-2 md:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm md:text-base lg:text-lg truncate">{booking.eventName}</h4>
                            <p className="text-xs md:text-sm text-muted-foreground capitalize">{booking.eventType}</p>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-xs flex-shrink-0`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span>{booking.guestCount} guests</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span>
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="truncate">{booking.userInfo?.name || "Unknown"}</span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-gray-700">Special Requests:</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{booking.specialRequests}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs md:text-sm"
                            onClick={() => {
                              toast({
                                title: "Booking Details",
                                description: `Booking ID: ${booking.id}`,
                              })
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Display admin unavailable dates */}
                    {unavailableDatesForSelectedDate.map((unavailable, index) => (
                      <div key={`unavailable-${index}`} className="rounded-lg border border-orange-200 bg-orange-50 p-3 md:p-4 space-y-2 md:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm md:text-base lg:text-lg truncate text-orange-800">
                              {unavailable.venue_name} - Unavailable
                            </h4>
                            <p className="text-xs md:text-sm text-orange-600">Admin marked as unavailable - {unavailable.reason}</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">
                            Unavailable
                          </Badge>
                        </div>

                        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                          <div className="flex items-center gap-2 text-orange-700">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span>Venue: {unavailable.venue_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-orange-700">
                            <CalendarX className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span>Reason: {unavailable.reason}</span>
                          </div>
                          {unavailable.notes && (
                            <div className="flex items-center gap-2 text-orange-700">
                              <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                              <span>Notes: {unavailable.notes}</span>
                            </div>
                          )}
                        </div>

                        {unavailable.notes && (
                          <div className="pt-2 border-t border-orange-200">
                            <p className="text-xs font-medium text-orange-800">Additional Notes:</p>
                            <p className="text-xs text-orange-700 mt-1 line-clamp-2">{unavailable.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unavailable Dates Manager */}
      <UnavailableDatesManager 
        open={unavailableDatesOpen} 
        onOpenChange={setUnavailableDatesOpen} 
      />

      {/* Unavailable Office Manager */}
      <UnavailableOfficeManager 
        open={unavailableOfficesOpen} 
        onOpenChange={setUnavailableOfficesOpen} 
      />
    </MainLayout>
  )
}
