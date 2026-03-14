"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBookings } from "@/components/booking-context"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Users, Mail, Phone } from "lucide-react"

export default function BookingsPage() {
  const { getAllBookings, updateBookingStatus } = useBookings()
  const { toast } = useToast()
  const allBookings = getAllBookings()

  // Check for recent cancellations and show notifications
  useEffect(() => {
    const recentCancellations = allBookings.filter(
      (booking) =>
        booking.status === "cancelled" &&
        new Date(booking.modifiedAt || booking.submittedAt).getTime() > Date.now() - 1000 * 60 * 5, // Last 5 minutes
    )

    recentCancellations.forEach((booking) => {
      toast({
        title: "Booking Cancelled",
        description: `${booking.userInfo.name} has cancelled their ${booking.eventType} booking for ${new Date(booking.date).toLocaleDateString()}`,
        variant: "destructive",
      })
    })
  }, [allBookings, toast])

  const handleStatusUpdate = (bookingId: string, newStatus: "confirmed" | "declined" | "completed") => {
    updateBookingStatus(bookingId, newStatus)
    toast({
      title: "Booking updated",
      description: `Booking has been ${newStatus}.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingBookings = allBookings.filter((booking) => booking.status === "pending")
  const confirmedBookings = allBookings.filter((booking) => booking.status === "confirmed")
  const completedBookings = allBookings.filter((booking) => booking.status === "completed")

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Booking Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBookings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Booking Requests</CardTitle>
            <CardDescription>Manage and update booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{booking.eventName}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          {booking.guestCount} guests
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{booking.userInfo.name}</p>
                      </div>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {booking.userInfo.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        {booking.userInfo.phone}
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Event Type:</span> {booking.eventType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Booking ID:</span> {booking.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(booking.submittedAt).toLocaleDateString()}
                    </p>
                    {booking.specialRequests && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Confirm Booking
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(booking.id, "declined")}
                        >
                          Decline Booking
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && new Date(booking.date) < new Date() && (
                      <Button size="sm" onClick={() => handleStatusUpdate(booking.id, "completed")}>
                        Mark as Completed
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Contact Customer
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {allBookings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No booking requests found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
