"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { useBookings } from "@/components/booking-context"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Users, Mail, Phone, FileText, MessageSquare, X } from "lucide-react"

type Booking = ReturnType<ReturnType<typeof useBookings>["getAllBookings"]>[number]

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":  return "bg-green-100 text-green-800"
    case "pending":    return "bg-yellow-100 text-yellow-800"
    case "completed":  return "bg-blue-100 text-blue-800"
    case "cancelled":
    case "declined":   return "bg-red-100 text-red-800"
    default:           return "bg-gray-100 text-gray-800"
  }
}

function BookingDetailDialog({ booking, open, onClose }: { booking: Booking | null; open: boolean; onClose: () => void }) {
  if (!booking) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{booking.eventName}</span>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>Booking ID: #{booking.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{booking.startTime} – {booking.endTime}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{booking.guestCount} guests</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span className="capitalize">{booking.eventType}</span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <p className="font-medium">Customer Information</p>
            <p className="font-semibold">{booking.userInfo?.name || "—"}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${booking.userInfo?.email}`} className="text-blue-600 hover:underline">
                {booking.userInfo?.email || "—"}
              </a>
            </div>
            {booking.userInfo?.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <a href={`tel:${booking.userInfo.phone}`} className="text-blue-600 hover:underline">
                  {booking.userInfo.phone}
                </a>
              </div>
            )}
          </div>

          {booking.specialRequests && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="font-medium mb-1">Special Requests</p>
              <p className="text-gray-700">{booking.specialRequests}</p>
            </div>
          )}

          <div className="text-gray-500 text-xs space-y-1 border-t pt-3">
            <p>Submitted: {new Date(booking.submittedAt).toLocaleString()}</p>
            {booking.total && <p>Total: ₱{Number(booking.total).toLocaleString()}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function BookingsPage() {
  const { getAllBookings, updateBookingStatus } = useBookings()
  const { toast } = useToast()
  const allBookings = getAllBookings()

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    const recentCancellations = allBookings.filter(
      (b) => b.status === "cancelled" &&
        new Date((b as any).modifiedAt || b.submittedAt).getTime() > Date.now() - 1000 * 60 * 5,
    )
    recentCancellations.forEach((b) => {
      toast({
        title: "Booking Cancelled",
        description: `${b.userInfo?.name} cancelled their ${b.eventType} booking for ${new Date(b.date).toLocaleDateString()}`,
        variant: "destructive",
      })
    })
  }, [allBookings, toast])

  const handleStatusUpdate = (id: string, status: "confirmed" | "declined" | "completed") => {
    updateBookingStatus(id, status)
    toast({ title: "Booking updated", description: `Booking has been ${status}.` })
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailOpen(true)
  }

  const handleContactCustomer = (booking: Booking) => {
    const email = booking.userInfo?.email
    if (!email) {
      toast({ title: "No email", description: "No email address found for this customer.", variant: "destructive" })
      return
    }
    const subject = encodeURIComponent(`Re: Your booking – ${booking.eventName}`)
    const body = encodeURIComponent(
      `Hi ${booking.userInfo?.name},\n\nThank you for your booking at One Estela Place.\n\nBooking Details:\n- Event: ${booking.eventName}\n- Date: ${new Date(booking.date).toLocaleDateString()}\n- Time: ${booking.startTime} – ${booking.endTime}\n- Guests: ${booking.guestCount}\n\nPlease let us know if you have any questions.\n\nBest regards,\nOne Estela Place Team`
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank")
  }

  const pendingBookings   = allBookings.filter((b) => b.status === "pending")
  const confirmedBookings = allBookings.filter((b) => b.status === "confirmed")
  const completedBookings = allBookings.filter((b) => b.status === "completed")

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Booking Management</h1>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Total Bookings",   value: allBookings.length },
            { label: "Pending Requests", value: pendingBookings.length },
            { label: "Confirmed",        value: confirmedBookings.length },
            { label: "Completed",        value: completedBookings.length },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Booking Requests</CardTitle>
            <CardDescription>Manage and update booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border p-6">
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

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <p className="font-medium">{booking.userInfo?.name}</p>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {booking.userInfo?.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        {booking.userInfo?.phone}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Event Type:</span> {booking.eventType}</p>
                    <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(booking.submittedAt).toLocaleDateString()}</p>
                    {booking.specialRequests && (
                      <p><span className="font-medium">Special Requests:</span> {booking.specialRequests}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {booking.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(booking.id, "confirmed")}>
                          Confirm Booking
                        </Button>
                        <Button size="sm" variant="destructive"
                          onClick={() => handleStatusUpdate(booking.id, "declined")}>
                          Decline Booking
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && new Date(booking.date) < new Date() && (
                      <Button size="sm" onClick={() => handleStatusUpdate(booking.id, "completed")}>
                        Mark as Completed
                      </Button>
                    )}
                    <Button size="sm" variant="outline"
                      onClick={() => handleContactCustomer(booking)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Customer
                    </Button>
                    <Button size="sm" variant="outline"
                      onClick={() => handleViewDetails(booking)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {allBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500">No booking requests found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </MainLayout>
  )
}
