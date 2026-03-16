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
  
  // Extract dates from bookings
  const reservedDates = reservedBookings.map((booking) => new Date(booking.date))
  
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Booking Calendar</h1>
            <p className="text-muted-foreground">View all customer reservations and bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Reserved Dates
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CalendarIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allBookings.filter((b) => b.status === "confirmed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <CalendarIcon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allBookings.filter((b) => b.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
              <CardDescription>
                Dates highlighted in red are reserved by customers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <style>{`
                .rdp-day_button:has([data-reserved="true"]) {
                  background-color: #ef4444 !important;
                  color: white !important;
                  font-weight: bold !important;
                }
                .rdp-day_button:has([data-reserved="true"]):hover {
                  background-color: #dc2626 !important;
                }
              `}</style>
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
                className="rounded-md border"
                components={{
                  DayButton: ({ day, modifiers, ...props }: any) => {
                    const isReserved = modifiers.reserved
                    return (
                      <button
                        {...props}
                        data-reserved={isReserved}
                        style={isReserved ? {
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontWeight: 'bold'
                        } : undefined}
                        className={`${props.className} ${isReserved ? 'bg-red-500 text-white font-bold hover:bg-red-600' : ''}`}
                      />
                    )
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardTitle>
              <CardDescription>
                {bookingsForSelectedDate.length === 0
                  ? "No bookings scheduled for this date"
                  : `${bookingsForSelectedDate.length} booking(s) scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingsForSelectedDate.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No events on this date</p>
                  </div>
                ) : (
                  bookingsForSelectedDate.map((booking) => (
                    <div key={booking.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{booking.eventName}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{booking.eventType}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{booking.guestCount} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{booking.userInfo?.name || "Unknown"}</span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium text-gray-700">Special Requests:</p>
                          <p className="text-xs text-gray-600 mt-1">{booking.specialRequests}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
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
