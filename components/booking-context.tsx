"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export interface Booking {
  id: string
  userId: string
  eventName: string
  eventType: string
  guestCount: number
  date: string
  startTime: string
  endTime: string
  specialRequests: string
  declineReason?: string
  status: "pending" | "confirmed" | "declined" | "completed" | "cancelled"
  submittedAt: string
  total?: string
  userInfo: {
    name: string
    email: string
    phone: string
  }
}

interface BookingContextType {
  bookings: Booking[]
  addBooking: (booking: Omit<Booking, "id" | "submittedAt">) => void
  updateBookingStatus: (id: string, status: Booking["status"], declineReason?: string) => void
  getUserBookings: (userId: string) => Booking[]
  getAllBookings: () => Booking[]
  cancelBooking: (id: string) => void
  modifyBooking: (id: string, updatedBooking: Partial<Booking>) => void
  getBookingById: (id: string) => Booking | undefined
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Load bookings from database
  const loadBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        const mapped = (data.bookings || []).map((b: any) => ({
          ...b,
          id: b.id?.toString(),
          userId: b.userId || b.user_id?.toString(),
          eventName: b.eventName || b.event_name || 'Event Booking',
          eventType: b.room_name || b.eventType || b.event_type || 'general', // Use resolved room/venue name
          guestCount: b.guestCount || b.number_of_guests || 0,
          date: b.date || (b.check_in_date ? b.check_in_date.split('T')[0] : ''),
          startTime: b.startTime || (b.check_in_date ? new Date(b.check_in_date).toTimeString().slice(0,5) : ''),
          endTime: b.endTime || (b.check_out_date ? new Date(b.check_out_date).toTimeString().slice(0,5) : ''),
          specialRequests: b.specialRequests || b.special_requests || '',
          declineReason: b.declineReason || b.decline_reason || '',
          status: (b.status || 'pending') as "pending" | "confirmed" | "declined" | "completed" | "cancelled",
          submittedAt: b.submittedAt || b.created_at || new Date().toISOString(),
          total: b.total || b.total_price?.toString(),
          userInfo: b.userInfo || {
            name: b.user_name || '',
            email: b.user_email || '',
            phone: b.user_phone || '',
          },
        }))
        setBookings(mapped)
        setLastUpdate(Date.now())
      }
    } catch (error) {
      console.error("Load bookings error:", error)
    }
  }

  useEffect(() => {
    // Initial load
    loadBookings()

    // Set up polling for real-time updates (every 5 seconds)
    const pollInterval = setInterval(() => {
      loadBookings()
    }, 5000)

    // Listen for custom events that trigger immediate refresh
    const handleRefresh = () => {
      loadBookings()
    }

    window.addEventListener('booking-updated', handleRefresh)
    window.addEventListener('booking-status-changed', handleRefresh)
    window.addEventListener('payment-verified', handleRefresh)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('booking-updated', handleRefresh)
      window.removeEventListener('booking-status-changed', handleRefresh)
      window.removeEventListener('payment-verified', handleRefresh)
    }
  }, [])

  const addBooking = async (bookingData: Omit<Booking, "id" | "submittedAt">) => {
    try {
      console.log('Sending booking data:', bookingData);
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking error response:', errorData);
      }
      if (response.ok) {
        const newBooking = await response.json()
        const mapped = {
          ...newBooking,
          id: newBooking.id?.toString(),
          userId: newBooking.userId || bookingData.userId,
          userInfo: newBooking.userInfo || bookingData.userInfo,
        }
        setBookings((prev) => [...prev, mapped])
        
        // Trigger event for real-time update
        window.dispatchEvent(new CustomEvent('booking-updated'))
      }
    } catch (error) {
      console.error("Add booking error:", error)
    }
  }

  const updateBookingStatus = async (id: string, status: Booking["status"], declineReason?: string) => {
    try {
      const body: any = { status }
      if (declineReason) {
        body.declineReason = declineReason
      }
      
      const response = await fetch(`/api/bookings?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const updatedBookings = bookings.map((booking) => 
          booking.id === id 
            ? { ...booking, status, ...(declineReason && { declineReason }) } 
            : booking
        )
        setBookings(updatedBookings)
        
        // Trigger event for real-time update
        window.dispatchEvent(new CustomEvent('booking-status-changed', { detail: { bookingId: id, status } }))
      }
    } catch (error) {
      console.error("Update booking status error:", error)
    }
  }

  const getUserBookings = (userId: string) => {
    return bookings.filter((booking) => booking.userId === userId)
  }

  const getAllBookings = () => {
    return bookings
  }

  const cancelBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        const updatedBookings = bookings.map((booking) =>
          booking.id === id ? { ...booking, status: "cancelled" as const } : booking,
        )
        setBookings(updatedBookings)
        
        // Trigger a reload of payment proofs to reflect cancellation
        window.dispatchEvent(new CustomEvent('booking-cancelled', { detail: { bookingId: id } }))
      }
    } catch (error) {
      console.error("Cancel booking error:", error)
    }
  }

  const modifyBooking = async (id: string, updatedBooking: Partial<Booking>) => {
    try {
      const response = await fetch(`/api/bookings?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBooking),
      })
      if (response.ok) {
        const updatedBookings = bookings.map((booking) =>
          booking.id === id ? { ...booking, ...updatedBooking } : booking,
        )
        setBookings(updatedBookings)
        
        // Trigger event for real-time update
        window.dispatchEvent(new CustomEvent('booking-updated'))
      }
    } catch (error) {
      console.error("Modify booking error:", error)
    }
  }

  const getBookingById = (id: string) => {
    return bookings.find((booking) => booking.id === id)
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        updateBookingStatus,
        getUserBookings,
        getAllBookings,
        cancelBooking,
        modifyBooking,
        getBookingById,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider")
  }
  return context
}
