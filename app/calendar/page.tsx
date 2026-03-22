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
import { Calendar as CalendarIcon, Clock, Users, MapPin } from "lucide-react"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { getAllBookings } = useBookings()
  const { toast } = useToast()
  
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
          <div className="flex items-center gap-2">
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
                Dates highlighted in red are reserved by customers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-3 md:p-6">
              <div className="scale-90 sm:scale-100 md:scale-110 lg:scale-125" style={{ transform: 'scaleX(1.15)' }}>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  modifiers={{
                    reserved: reservedDates,
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
                {bookingsForSelectedDate.length === 0
                  ? "No bookings scheduled for this date"
                  : `${bookingsForSelectedDate.length} booking(s) scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {bookingsForSelectedDate.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-gray-500">
                    <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs md:text-sm">No events on this date</p>
                  </div>
                ) : (
                  bookingsForSelectedDate.map((booking) => (
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
