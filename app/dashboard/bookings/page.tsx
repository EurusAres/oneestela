"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
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

function BookingDetailDialog({ 
  booking, 
  open, 
  onClose, 
  onStatusUpdate 
}: { 
  booking: Booking | null; 
  open: boolean; 
  onClose: () => void;
  onStatusUpdate: (id: string, status: "confirmed" | "declined" | "completed") => void;
}) {
  const [spaceName, setSpaceName] = useState<string>('')
  const [loadingSpace, setLoadingSpace] = useState(false)

  useEffect(() => {
    if (!booking || !open) return
    
    const fetchSpaceName = async () => {
      setLoadingSpace(true)
      try {
        // Parse eventType to get type and ID (e.g., "venue-12" or "office-14")
        if (booking.eventType.includes('-')) {
          const [type, id] = booking.eventType.split('-')
          
          if (type === 'venue') {
            const res = await fetch('/api/venues')
            if (res.ok) {
              const data = await res.json()
              const venue = data.venues?.find((v: any) => v.id === parseInt(id))
              if (venue) {
                setSpaceName(`${venue.name} (Venue)`)
              } else {
                setSpaceName('Venue')
              }
            }
          } else if (type === 'office') {
            const res = await fetch('/api/office-rooms?includeAll=true')
            if (res.ok) {
              const data = await res.json()
              const room = data.rooms?.find((r: any) => r.id === parseInt(id))
              if (room) {
                setSpaceName(`${room.name} (Office Space)`)
              } else {
                setSpaceName('Office Space')
              }
            }
          }
        } else {
          // Fallback for old format
          setSpaceName(booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1))
        }
      } catch (error) {
        console.error('Error fetching space name:', error)
        setSpaceName(booking.eventType)
      } finally {
        setLoadingSpace(false)
      }
    }
    
    fetchSpaceName()
  }, [booking, open])

  if (!booking) return null
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{booking.eventName}</span>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>Booking ID: #{booking.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm overflow-y-auto flex-1 pr-2">
          {/* Check if this is an office space inquiry */}
          {booking.eventType.startsWith('office-') ? (
            // Office Space Inquiry Layout
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{booking.guestCount} people</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{loadingSpace ? 'Loading...' : spaceName || 'N/A'}</span>
              </div>
            </div>
          ) : (
            // Event Venue Layout
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{booking.date ? new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : 'No date specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{booking.startTime && booking.endTime ? `${booking.startTime} – ${booking.endTime}` : 'No time specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{booking.guestCount} guests</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{loadingSpace ? 'Loading...' : spaceName || 'N/A'}</span>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="font-medium mb-2">{booking.eventType.startsWith('office-') ? 'Inquiry Details' : 'Event Details'}</p>
            <div className="space-y-1 text-gray-700">
              <p><span className="font-medium">{booking.eventType.startsWith('office-') ? 'Purpose/Description:' : 'Event Name:'}</span> {booking.eventName}</p>
              <p><span className="font-medium">{booking.eventType.startsWith('office-') ? 'Office Space:' : 'Event Space:'}</span> {loadingSpace ? 'Loading...' : spaceName || 'N/A'}</p>
              <p><span className="font-medium">Expected {booking.eventType.startsWith('office-') ? 'People:' : 'Guests:'}</span> {booking.guestCount}</p>
              {!booking.eventType.startsWith('office-') && booking.date && (
                <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              )}
              {!booking.eventType.startsWith('office-') && booking.startTime && booking.endTime && (
                <p><span className="font-medium">Time:</span> {booking.startTime} – {booking.endTime}</p>
              )}
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
              <p className="font-medium mb-1 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {booking.eventType.startsWith('office-') ? 'Additional Requirements' : 'Special Requests'}
              </p>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.specialRequests}</p>
            </div>
          )}

          {booking.declineReason && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="font-medium mb-1 flex items-center gap-2">
                <X className="h-4 w-4" />
                Decline Reason
              </p>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.declineReason}</p>
            </div>
          )}

          <div className="text-gray-500 text-xs space-y-1 border-t pt-3">
            <p>Submitted: {new Date(booking.submittedAt).toLocaleString()}</p>
            {booking.total && <p>Total: ₱{Number(booking.total).toLocaleString()}</p>}
          </div>
        </div>

        {/* Action buttons at the bottom */}
        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
          
          <div className="flex space-x-2">
            {booking.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(booking.id, "confirmed")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirm
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onStatusUpdate(booking.id, "declined")}
                >
                  Decline
                </Button>
              </>
            )}
            
            {booking.status === "confirmed" && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(booking.id, "completed")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function BookingsPage() {
  const { getAllBookings, updateBookingStatus } = useBookings()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const allBookings = getAllBookings()

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingPage, setPendingPage] = useState(1)
  const [confirmedPage, setConfirmedPage] = useState(1)
  const [completedPage, setCompletedPage] = useState(1)
  const [cancelledPage, setCancelledPage] = useState(1)
  const itemsPerPage = 5

  // Get status from URL parameter
  const statusFilter = searchParams.get('status')

  useEffect(() => {
    // Set active tab based on URL parameter
    if (statusFilter && ['pending', 'confirmed', 'cancelled', 'completed'].includes(statusFilter)) {
      setActiveTab(statusFilter)
    }
  }, [statusFilter])

  useEffect(() => {
    const recentCancellations = allBookings.filter(
      (b) => b.status === "cancelled" &&
        new Date((b as any).modifiedAt || b.submittedAt).getTime() > Date.now() - 1000 * 60 * 5,
    )
    recentCancellations.forEach((b) => {
      const isOfficeInquiry = b.eventType.startsWith('office-')
      const dateInfo = isOfficeInquiry ? '' : ` for ${new Date(b.date).toLocaleDateString()}`
      
      toast({
        title: isOfficeInquiry ? "Inquiry Cancelled" : "Booking Cancelled",
        description: `${b.userInfo?.name} cancelled their ${isOfficeInquiry ? 'office space inquiry' : `${b.eventType} booking`}${dateInfo}`,
        variant: "destructive",
      })
    })
  }, [allBookings, toast])

  const handleStatusUpdate = (id: string, status: "confirmed" | "declined" | "completed") => {
    if (status === "declined") {
      // Open decline dialog instead of immediately declining
      const booking = allBookings.find(b => b.id === id)
      if (booking) {
        setSelectedBooking(booking)
        setDeclineDialogOpen(true)
      }
    } else {
      const booking = allBookings.find(b => b.id === id)
      const isOfficeInquiry = booking?.eventType.startsWith('office-')
      
      updateBookingStatus(id, status)
      
      // Trigger booking status change event for real-time updates
      window.dispatchEvent(new CustomEvent('booking-status-changed', { 
        detail: { 
          bookingId: id, 
          newStatus: status 
        } 
      }))
      
      let message = `Booking has been ${status}.`
      if (isOfficeInquiry) {
        if (status === "confirmed") {
          message = "Office inquiry has been approved."
        } else if (status === "completed") {
          message = "Office inquiry has been completed."
        }
      } else {
        if (status === "confirmed") {
          message = "Event booking has been confirmed."
        } else if (status === "completed") {
          message = "Event booking has been completed."
        }
      }
      
      toast({ title: "Status updated", description: message })
    }
  }

  const handleStatusUpdateFromDialog = (id: string, status: "confirmed" | "declined" | "completed") => {
    if (status === "declined") {
      // Close detail dialog and open decline dialog
      setDetailOpen(false)
      const booking = allBookings.find(b => b.id === id)
      if (booking) {
        setSelectedBooking(booking)
        setDeclineDialogOpen(true)
      }
    } else {
      const booking = allBookings.find(b => b.id === id)
      const isOfficeInquiry = booking?.eventType.startsWith('office-')
      
      updateBookingStatus(id, status)
      
      // Trigger booking status change event for real-time updates
      window.dispatchEvent(new CustomEvent('booking-status-changed', { 
        detail: { 
          bookingId: id, 
          newStatus: status 
        } 
      }))
      
      let message = `Booking has been ${status}.`
      if (isOfficeInquiry) {
        if (status === "confirmed") {
          message = "Office inquiry has been approved."
        } else if (status === "completed") {
          message = "Office inquiry has been completed."
        }
      } else {
        if (status === "confirmed") {
          message = "Event booking has been confirmed."
        } else if (status === "completed") {
          message = "Event booking has been completed."
        }
      }
      
      toast({ title: "Status updated", description: message })
      setDetailOpen(false)
    }
  }

  const confirmDecline = () => {
    if (selectedBooking && declineReason.trim()) {
      const isOfficeInquiry = selectedBooking.eventType.startsWith('office-')
      
      updateBookingStatus(selectedBooking.id, "declined", declineReason)
      
      // Trigger booking status change event for real-time updates
      window.dispatchEvent(new CustomEvent('booking-status-changed', { 
        detail: { 
          bookingId: selectedBooking.id, 
          newStatus: "declined" 
        } 
      }))
      
      const message = isOfficeInquiry 
        ? "Office inquiry has been declined. Customer will be notified."
        : "Booking has been declined. Customer will be notified."
      
      toast({ 
        title: isOfficeInquiry ? "Inquiry declined" : "Booking declined", 
        description: message
      })
      setDeclineDialogOpen(false)
      setDeclineReason("")
      setSelectedBooking(null)
    } else if (!declineReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for declining this booking.",
        variant: "destructive"
      })
    }
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
    
    const isOfficeInquiry = booking.eventType.startsWith('office-')
    const subject = encodeURIComponent(`Re: Your ${isOfficeInquiry ? 'office space inquiry' : 'booking'} – ${booking.eventName}`)
    
    let body: string
    if (isOfficeInquiry) {
      body = encodeURIComponent(
        `Hi ${booking.userInfo?.name},\n\nThank you for your office space inquiry at One Estela Place.\n\nInquiry Details:\n- Purpose: ${booking.eventName}\n- Expected People: ${booking.guestCount}\n${booking.specialRequests ? `- Requirements: ${booking.specialRequests}\n` : ''}\nWe'll review your inquiry and get back to you within 24 hours with availability and pricing information.\n\nBest regards,\nOne Estela Place Team`
      )
    } else {
      body = encodeURIComponent(
        `Hi ${booking.userInfo?.name},\n\nThank you for your booking at One Estela Place.\n\nBooking Details:\n- Event: ${booking.eventName}\n- Date: ${new Date(booking.date).toLocaleDateString()}\n- Time: ${booking.startTime} – ${booking.endTime}\n- Guests: ${booking.guestCount}\n\nPlease let us know if you have any questions.\n\nBest regards,\nOne Estela Place Team`
      )
    }
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank")
  }

  const pendingBookings   = allBookings.filter((b) => b.status === "pending").sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
  const confirmedBookings = allBookings.filter((b) => b.status === "confirmed").sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
  const completedBookings = allBookings.filter((b) => b.status === "completed").sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
  const cancelledBookings = allBookings.filter((b) => b.status === "cancelled").sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())

  // Pagination for all tabs
  const totalPendingPages = Math.ceil(pendingBookings.length / itemsPerPage)
  const totalConfirmedPages = Math.ceil(confirmedBookings.length / itemsPerPage)
  const totalCompletedPages = Math.ceil(completedBookings.length / itemsPerPage)
  const totalCancelledPages = Math.ceil(cancelledBookings.length / itemsPerPage)

  const paginatedPendingBookings = pendingBookings.slice(
    (pendingPage - 1) * itemsPerPage,
    pendingPage * itemsPerPage
  )
  const paginatedConfirmedBookings = confirmedBookings.slice(
    (confirmedPage - 1) * itemsPerPage,
    confirmedPage * itemsPerPage
  )
  const paginatedCompletedBookings = completedBookings.slice(
    (completedPage - 1) * itemsPerPage,
    completedPage * itemsPerPage
  )
  const paginatedCancelledBookings = cancelledBookings.slice(
    (cancelledPage - 1) * itemsPerPage,
    cancelledPage * itemsPerPage
  )

  const handlePreviousPage = (tab: string) => {
    if (tab === 'pending' && pendingPage > 1) setPendingPage(pendingPage - 1)
    if (tab === 'confirmed' && confirmedPage > 1) setConfirmedPage(confirmedPage - 1)
    if (tab === 'completed' && completedPage > 1) setCompletedPage(completedPage - 1)
    if (tab === 'cancelled' && cancelledPage > 1) setCancelledPage(cancelledPage - 1)
  }

  const handleNextPage = (tab: string) => {
    if (tab === 'pending' && pendingPage < totalPendingPages) setPendingPage(pendingPage + 1)
    if (tab === 'confirmed' && confirmedPage < totalConfirmedPages) setConfirmedPage(confirmedPage + 1)
    if (tab === 'completed' && completedPage < totalCompletedPages) setCompletedPage(completedPage + 1)
    if (tab === 'cancelled' && cancelledPage < totalCancelledPages) setCancelledPage(cancelledPage + 1)
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const isOfficeInquiry = booking.eventType.startsWith('office-')
    
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            <div>
              <p className="font-medium text-gray-900">{booking.eventName}</p>
              <p className="text-sm text-gray-500">
                {booking.userInfo?.name || "Unknown Customer"} • {isOfficeInquiry ? 'Office Inquiry' : 'Event Booking'}
              </p>
              {!isOfficeInquiry && booking.date && (
                <p className="text-xs text-gray-400">
                  {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleViewDetails(booking)}
          >
            View Details
          </Button>
          
          {booking.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                className="bg-green-600 hover:bg-green-700"
              >
                {isOfficeInquiry ? 'Approve' : 'Confirm'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleStatusUpdate(booking.id, "declined")}
              >
                Decline
              </Button>
            </>
          )}
          
          {booking.status === "confirmed" && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(booking.id, "completed")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Complete
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderBookingList = (bookings: Booking[], tab: string, currentPage: number, totalPages: number, totalCount: number) => (
    <>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalCount} total bookings)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreviousPage(tab)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNextPage(tab)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Booking Management</h1>

        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-lg md:text-xl">Booking Management</CardTitle>
            <CardDescription className="text-sm">Manage and update booking statuses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending ({pendingBookings.length})</TabsTrigger>
                <TabsTrigger value="confirmed" className="text-xs sm:text-sm">Confirmed ({confirmedBookings.length})</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed ({completedBookings.length})</TabsTrigger>
                <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled ({cancelledBookings.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-6">
                {renderBookingList(paginatedPendingBookings, 'pending', pendingPage, totalPendingPages, pendingBookings.length)}
              </TabsContent>
              
              <TabsContent value="confirmed" className="mt-6">
                {renderBookingList(paginatedConfirmedBookings, 'confirmed', confirmedPage, totalConfirmedPages, confirmedBookings.length)}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-6">
                {renderBookingList(paginatedCompletedBookings, 'completed', completedPage, totalCompletedPages, completedBookings.length)}
              </TabsContent>
              
              <TabsContent value="cancelled" className="mt-6">
                {renderBookingList(paginatedCancelledBookings, 'cancelled', cancelledPage, totalCancelledPages, cancelledBookings.length)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusUpdate={handleStatusUpdateFromDialog}
      />

      {/* Decline Booking Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.eventType.startsWith('office-') ? 'Decline Inquiry' : 'Decline Booking'}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this {selectedBooking?.eventType.startsWith('office-') ? 'inquiry' : 'booking'}. The customer will be notified.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedBooking && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="font-medium">{selectedBooking.eventName}</p>
                <p className="text-gray-600">{selectedBooking.userInfo?.name}</p>
                {!selectedBooking.eventType.startsWith('office-') && selectedBooking.date && (
                  <p className="text-gray-600">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="decline-reason">Reason for Declining *</Label>
              <Textarea
                id="decline-reason"
                placeholder={selectedBooking?.eventType.startsWith('office-') 
                  ? "e.g., No availability, requirements cannot be met, space not suitable..."
                  : "e.g., Date unavailable, venue already booked, does not meet requirements..."
                }
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeclineDialogOpen(false)
                setDeclineReason("")
                setSelectedBooking(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDecline}
              disabled={!declineReason.trim()}
              className="w-full sm:w-auto"
            >
              {selectedBooking?.eventType.startsWith('office-') ? 'Decline Inquiry' : 'Decline Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
