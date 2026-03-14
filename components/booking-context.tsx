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
  updateBookingStatus: (id: string, status: Booking["status"]) => void
  getUserBookings: (userId: string) => Booking[]
  getAllBookings: () => Booking[]
  cancelBooking: (id: string) => void
  modifyBooking: (id: string, updatedBooking: Partial<Booking>) => void
  getBookingById: (id: string) => Booking | undefined
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    // Load bookings from database on mount
    const loadBookings = async () => {
      try {
        const response = await fetch("/api/bookings")
        if (response.ok) {
          const data = await response.json()
          setBookings(data.bookings || [])
        }
      } catch (error) {
        console.error("Load bookings error:", error)
      }
    }
    loadBookings()
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
        const updatedBookings = [...bookings, newBooking]
        setBookings(updatedBookings)
      }
    } catch (error) {
      console.error("Add booking error:", error)
    }
  }

  const updateBookingStatus = async (id: string, status: Booking["status"]) => {
    try {
      const response = await fetch(`/api/bookings?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        const updatedBookings = bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking))
        setBookings(updatedBookings)
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
      await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE",
      })
      const updatedBookings = bookings.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" } : booking,
      )
      setBookings(updatedBookings)
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
