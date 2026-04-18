"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { useBookings } from "@/components/booking-context"
import { TermsDialog } from "@/components/terms-dialog"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface ReserveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preSelectedSpace?: {type: string, id: string, name: string, capacity?: number} | null
}

interface Space {
  id: number
  name: string
  type: 'venue' | 'office'
  capacity?: number
}

export function ReserveDialog({ open, onOpenChange, preSelectedSpace }: ReserveDialogProps) {
  const { user, login, isLoading } = useAuth()
  const { addBooking, getAllBookings } = useBookings()
  const { toast } = useToast()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loadingSpaces, setLoadingSpaces] = useState(false)
  const [bookingData, setBookingData] = useState({
    eventName: "",
    eventType: "",
    guestCount: "",
    startTime: "",
    endTime: "",
    specialRequests: "",
  })

  const [showTerms, setShowTerms] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [unavailableMessage, setUnavailableMessage] = useState<string>("")
  const [clickedUnavailableDate, setClickedUnavailableDate] = useState<any>(null)

  // Calculate dates (1 month from today)
  const today = new Date()
  const defaultMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const minDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

  // Set pre-selected space when dialog opens
  useEffect(() => {
    if (open && preSelectedSpace) {
      const spaceValue = `${preSelectedSpace.type}-${preSelectedSpace.id}`
      setBookingData(prev => ({
        ...prev,
        eventType: spaceValue
      }))
    }
  }, [open, preSelectedSpace])

  // Fetch venues and office spaces when dialog opens
  useEffect(() => {
    if (open) {
      fetchSpaces()
    }
  }, [open])

  // Reset guest count if it exceeds the new space's capacity
  useEffect(() => {
    const capacity = getSelectedSpaceCapacity()
    if (capacity && bookingData.guestCount && parseInt(bookingData.guestCount) > capacity) {
      setBookingData(prev => ({ ...prev, guestCount: capacity.toString() }))
      setErrors(prev => ({ ...prev, guestCount: "" }))
    }
  }, [bookingData.eventType, spaces])

  const fetchSpaces = async () => {
    setLoadingSpaces(true)
    try {
      const [venuesRes, roomsRes] = await Promise.all([
        fetch('/api/venues'),
        fetch('/api/office-rooms?includeAll=true')
      ])

      const allSpaces: Space[] = []

      if (venuesRes.ok) {
        const venuesData = await venuesRes.json()
        const venues = venuesData.venues || []
        venues.forEach((venue: any) => {
          allSpaces.push({
            id: venue.id,
            name: venue.name,
            type: 'venue',
            capacity: venue.capacity || undefined
          })
        })
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        const rooms = roomsData.rooms || []
        rooms.forEach((room: any) => {
          allSpaces.push({
            id: room.id,
            name: room.name,
            type: 'office',
            capacity: room.capacity || undefined
          })
        })
      }

      setSpaces(allSpaces)
    } catch (error) {
      console.error('Error fetching spaces:', error)
    } finally {
      setLoadingSpaces(false)
    }
  }

  // Fetch all bookings directly to ensure we have the latest reserved dates
  const [allBookingsData, setAllBookingsData] = useState<any[]>([])
  const [adminUnavailableDates, setAdminUnavailableDates] = useState<any[]>([])
  
  useEffect(() => {
    if (open) {
      const fetchAllBookings = async () => {
        try {
          const response = await fetch('/api/bookings')
          if (response.ok) {
            const data = await response.json()
            setAllBookingsData(data.bookings || [])
          }
        } catch (error) {
          console.error('Error fetching bookings:', error)
        }
      }
      
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
      
      fetchAllBookings()
      fetchUnavailableDates()
    }
  }, [open])

  const reservedDates = allBookingsData
    .filter((booking) => booking.status === "confirmed" || booking.status === "pending")
    .map((booking) => {
      const dateStr = booking.date || (booking.check_in_date ? booking.check_in_date.split('T')[0] : '')
      if (!dateStr) return null
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    })
    .filter(date => date !== null)

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

  const isDateReserved = (date: Date) => {
    return allReservedDates.some((reservedDate) => reservedDate.toDateString() === date.toDateString())
  }

  // Get unavailable date details for a specific date
  const getUnavailableDateDetails = (date: Date) => {
    // Check admin unavailable dates
    const adminUnavailable = adminUnavailableDates.find((unavailable) => {
      const dateStr = unavailable.date
      let unavailableDate: Date
      
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-').map(Number)
        unavailableDate = new Date(year, month - 1, day)
      } else {
        unavailableDate = new Date(dateStr)
      }
      
      return unavailableDate.toDateString() === date.toDateString()
    })

    if (adminUnavailable) {
      return {
        type: 'admin',
        venue: adminUnavailable.venue_name,
        reason: adminUnavailable.reason,
        notes: adminUnavailable.notes
      }
    }

    // Check customer bookings
    const customerBooking = allBookingsData.find((booking) => {
      if (booking.status !== "confirmed" && booking.status !== "pending") return false
      
      const dateStr = booking.date || (booking.check_in_date ? booking.check_in_date.split('T')[0] : '')
      if (!dateStr) return false
      
      const [year, month, day] = dateStr.split('-').map(Number)
      const bookingDate = new Date(year, month - 1, day)
      
      return bookingDate.toDateString() === date.toDateString()
    })

    if (customerBooking) {
      return {
        type: 'booking',
        eventName: customerBooking.eventName,
        status: customerBooking.status
      }
    }

    return null
  }

  // Check if capacity is exceeded
  const isCapacityExceeded = () => {
    const capacity = getSelectedSpaceCapacity()
    return capacity && bookingData.guestCount && Number.parseInt(bookingData.guestCount) > capacity
  }

  const validateEventDetails = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!bookingData.eventName.trim()) {
      newErrors.eventName = isOfficeSpace() ? "Purpose/Description is required" : "Event name is required"
    }
    if (!bookingData.eventType) {
      newErrors.eventType = "Event space is required"
    }
    if (!bookingData.guestCount) {
      newErrors.guestCount = "Expected guests is required"
    } else if (Number.parseInt(bookingData.guestCount) <= 0) {
      newErrors.guestCount = "Guest count must be greater than 0"
    } else {
      const capacity = getSelectedSpaceCapacity()
      if (capacity && Number.parseInt(bookingData.guestCount) > capacity) {
        newErrors.guestCount = `Maximum capacity is ${capacity} guests`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if selected space is an office space
  const isOfficeSpace = () => {
    return bookingData.eventType.startsWith('office-')
  }

  // Get capacity for the selected space
  const getSelectedSpaceCapacity = (): number | undefined => {
    // First check if we have preSelectedSpace with capacity
    if (preSelectedSpace?.capacity) {
      return preSelectedSpace.capacity
    }
    
    // Otherwise, find the capacity from the spaces list
    if (bookingData.eventType && spaces.length > 0) {
      const [spaceType, spaceId] = bookingData.eventType.split('-')
      const selectedSpace = spaces.find(space => 
        space.type === spaceType && space.id.toString() === spaceId
      )
      
      return selectedSpace?.capacity
    }
    
    return undefined
  }

  const handleNext = () => {
    if (validateEventDetails()) {
      // Skip date & time for office spaces, go directly to submission
      if (isOfficeSpace()) {
        // For office spaces, we don't need date/time selection
        setActiveTab("details") // Stay on details tab but enable submission
      } else {
        setActiveTab("datetime")
      }
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      })
      return
    }

    const success = await login(loginEmail, loginPassword, false)
    if (success) {
      toast({
        title: "Success",
        description: "Logged in successfully!",
      })
      setLoginEmail("")
      setLoginPassword("")
      setShowLoginForm(false)
    } else {
      toast({
        title: "Error",
        description: "Invalid email or password. Try: user@oneestela.com / user123",
        variant: "destructive",
      })
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(date)
      setUnavailableMessage("")
      setClickedUnavailableDate(null)
      return
    }
    
    // Check if the date is reserved/unavailable
    if (isDateReserved(date)) {
      const details = getUnavailableDateDetails(date)
      setClickedUnavailableDate(details)
      
      if (details?.type === 'admin') {
        setUnavailableMessage(`⚠️ ${details.venue} is unavailable on this date due to ${details.reason.toLowerCase()}.`)
      } else if (details?.type === 'booking') {
        setUnavailableMessage(`⚠️ This date is already reserved by another customer.`)
      } else {
        setUnavailableMessage("⚠️ This date is already reserved or marked as unavailable and cannot be booked.")
      }
      
      setTimeout(() => {
        setUnavailableMessage("")
        setClickedUnavailableDate(null)
      }, 8000) // Clear after 8 seconds
      
      // Don't set the date as selected since it's unavailable
      return
    }
    
    if (date < minDate) {
      setUnavailableMessage("⚠️ This date is unavailable. Reservations must be made at least 1 month in advance.")
      setClickedUnavailableDate(null)
      setTimeout(() => setUnavailableMessage(""), 5000) // Clear after 5 seconds
      return
    }
    
    // Only set the date if it's valid (not disabled)
    setSelectedDate(date)
    setUnavailableMessage("")
    setClickedUnavailableDate(null)
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to make a reservation.",
        variant: "destructive",
      })
      return
    }
    if (!agreedToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please read and agree to the terms and conditions.",
        variant: "destructive",
      })
      return
    }

    // Validate capacity before submission
    const capacity = getSelectedSpaceCapacity()
    if (capacity && Number.parseInt(bookingData.guestCount) > capacity) {
      toast({
        title: "Capacity exceeded",
        description: `This space can accommodate a maximum of ${capacity} guests. Please reduce the number of guests or select a different space.`,
        variant: "destructive",
      })
      return
    }

    // For office spaces, we don't need date/time validation
    const isOffice = isOfficeSpace()
    if (!isOffice && (!selectedDate || isDateReserved(selectedDate) || !bookingData.startTime || !bookingData.endTime)) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your event.",
        variant: "destructive",
      })
      return
    }

    // Add booking to the system
    // Format date as YYYY-MM-DD without timezone conversion
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    addBooking({
      userId: user.id,
      eventName: bookingData.eventName,
      eventType: bookingData.eventType,
      guestCount: Number.parseInt(bookingData.guestCount),
      date: isOffice ? "" : (selectedDate ? formatLocalDate(selectedDate) : ""),
      startTime: isOffice ? "" : bookingData.startTime,
      endTime: isOffice ? "" : bookingData.endTime,
      specialRequests: bookingData.specialRequests,
      status: "pending",
      userInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
    })

    toast({
      title: "Reservation request submitted",
      description: isOffice 
        ? "Your office space inquiry has been submitted. We'll review and get back to you within 24 hours."
        : "Your booking has been added to My Transactions. We'll review and get back to you within 24 hours.",
    })

    // Reset form
    setBookingData({
      eventName: "",
      eventType: "",
      guestCount: "",
      startTime: "",
      endTime: "",
      specialRequests: "",
    })
    setSelectedDate(undefined)
    setAgreedToTerms(false)
    setUnavailableMessage("")
    onOpenChange(false)
  }

  const availableTimes = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">{isOfficeSpace() ? "Office Space Inquiry" : "Reserve Your Event"}</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            {user 
              ? (isOfficeSpace() 
                  ? "Fill out the details for your office space inquiry" 
                  : "Fill out the details for your event reservation"
                ) 
              : "Please log in to make a reservation"
            }
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          !showLoginForm ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-gray-600 text-center max-w-sm">
                Log in to your account to start making reservations at One Estela Place.
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowLoginForm(true)}
                className="w-full sm:w-auto px-8"
              >
                Log In
              </Button>
              <p className="text-sm text-gray-500">
                Don't have an account? Contact us for more information.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Email Address</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                Demo: user@oneestela.com / user123
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowLoginForm(false)
                    setLoginEmail("")
                    setLoginPassword("")
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </div>
            </form>
          )
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className={`inline-flex w-max sm:w-full ${isOfficeSpace() ? 'sm:grid sm:grid-cols-1' : 'sm:grid sm:grid-cols-2'}`}>
                <TabsTrigger value="details" className="text-xs sm:text-sm whitespace-nowrap">{isOfficeSpace() ? "Inquiry Details" : "Event Details"}</TabsTrigger>
                {!isOfficeSpace() && (
                  <TabsTrigger value="datetime" disabled={activeTab === "details"} className="text-xs sm:text-sm whitespace-nowrap">
                    Date & Time
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName" className="text-sm">{isOfficeSpace() ? "Purpose/Description" : "Event Name"}</Label>
                  <Input
                    id="eventName"
                    className="h-10"
                    placeholder={isOfficeSpace() ? "e.g., Monthly office rental, Business operations" : "Enter event name"}
                    value={bookingData.eventName}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, eventName: e.target.value })
                      if (errors.eventName) {
                        setErrors({ ...errors, eventName: "" })
                      }
                    }}
                    className={errors.eventName ? "border-red-500" : ""}
                  />
                  {errors.eventName && <p className="text-sm text-red-500">{errors.eventName}</p>}
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="eventType" className="text-sm">Event Space</Label>
                    <Select
                      value={bookingData.eventType}
                      onValueChange={(value) => {
                        setBookingData({ ...bookingData, eventType: value })
                        if (errors.eventType) {
                          setErrors({ ...errors, eventType: "" })
                        }
                      }}
                    >
                      <SelectTrigger className={`w-full ${errors.eventType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={loadingSpaces ? "Loading spaces..." : "Select space"} />
                      </SelectTrigger>
                      <SelectContent>
                        {spaces.map((space) => (
                          <SelectItem key={`${space.type}-${space.id}`} value={`${space.type}-${space.id}`}>
                            {space.name} ({space.type === 'venue' ? 'Venue' : 'Office Space'})
                            {space.capacity && ` - Max ${space.capacity} guests`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.eventType && <p className="text-sm text-red-500">{errors.eventType}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestCount" className="text-sm">
                      Expected Guests
                      {(() => {
                        const capacity = getSelectedSpaceCapacity()
                        return capacity ? ` (Max: ${capacity})` : ''
                      })()}
                    </Label>
                    <Input
                      id="guestCount"
                      type="number"
                      min="1"
                      max={getSelectedSpaceCapacity() || undefined}
                      placeholder="Number of guests"
                      className="h-10"
                      value={bookingData.guestCount}
                      onChange={(e) => {
                        const value = e.target.value
                        const capacity = getSelectedSpaceCapacity()
                        
                        // Validate against capacity if available
                        if (capacity && parseInt(value) > capacity) {
                          setErrors({ ...errors, guestCount: `Maximum capacity is ${capacity} guests` })
                        } else if (errors.guestCount) {
                          setErrors({ ...errors, guestCount: "" })
                        }
                        
                        setBookingData({ ...bookingData, guestCount: value })
                      }}
                      className={errors.guestCount ? "border-red-500" : ""}
                    />
                    {errors.guestCount && <p className="text-sm text-red-500">{errors.guestCount}</p>}
                    {(() => {
                      const capacity = getSelectedSpaceCapacity()
                      if (capacity && !errors.guestCount) {
                        return (
                          <p className="text-xs text-gray-500">
                            This space can accommodate up to {capacity} guests
                          </p>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRequests" className="text-sm">{isOfficeSpace() ? "Additional Requirements" : "Special Requests"}</Label>
                  <Textarea
                    id="specialRequests"
                    className="min-h-[80px] md:min-h-[100px] resize-none"
                    placeholder={isOfficeSpace() 
                      ? "Any specific requirements, furniture needs, access hours, etc." 
                      : "Any special requirements, decorations, catering preferences, etc."
                    }
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  />
                </div>
              </div>
              {isOfficeSpace() && (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms-office"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <label htmlFor="terms-office" className="text-gray-700">
                        I have read and agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Terms and Conditions
                        </button>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                {isOfficeSpace() ? (
                  <Button 
                    onClick={handleBookingSubmit}
                    disabled={!agreedToTerms || isCapacityExceeded() || !bookingData.guestCount.trim() || !bookingData.eventName.trim() || !bookingData.eventType}
                    title={
                      isCapacityExceeded() 
                        ? "Please reduce the number of guests to submit inquiry" 
                        : (!bookingData.guestCount.trim() ? "Expected guests is required" : "")
                    }
                    className="w-full sm:w-auto"
                  >
                    Submit Inquiry
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    disabled={isCapacityExceeded() || !bookingData.guestCount.trim() || !bookingData.eventName.trim() || !bookingData.eventType}
                    title={
                      isCapacityExceeded() 
                        ? "Please reduce the number of guests to continue" 
                        : (!bookingData.guestCount.trim() ? "Expected guests is required" : "")
                    }
                    className="w-full sm:w-auto"
                  >
                    Next
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="datetime" className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Booking Policy:</strong> Reservations must be made at least 1 month in advance. Dates highlighted
                  in red are already reserved and cannot be selected.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                <div className="flex flex-col">
                  <Label className="text-base font-medium mb-2">Select Date</Label>
                  <div className="flex justify-center relative">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < minDate}
                      defaultMonth={defaultMonth}
                      fromDate={minDate}
                      modifiers={{
                        reserved: allReservedDates,
                      }}
                      modifiersClassNames={{
                        reserved: "!bg-red-500 !text-white !font-bold line-through hover:!bg-red-600",
                      }}
                      className="rounded-md border w-full"
                      style={{
                        fontSize: '1rem',
                        '--cell-size': '2.8rem'
                      } as any}
                    />
                  </div>
                  <div className="mt-3 text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Reserved/Unavailable dates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
                      <span>Available dates</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select
                      value={bookingData.startTime}
                      onValueChange={(value) => setBookingData({ ...bookingData, startTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Select
                      value={bookingData.endTime}
                      onValueChange={(value) => setBookingData({ ...bookingData, endTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {unavailableMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">{unavailableMessage}</p>
                      {clickedUnavailableDate?.type === 'admin' && (
                        <div className="mt-2 space-y-1 text-xs text-red-700">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Venue:</span>
                            <span>{clickedUnavailableDate.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Reason:</span>
                            <span>{clickedUnavailableDate.reason}</span>
                          </div>
                          {clickedUnavailableDate.notes && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium">Notes:</span>
                              <span>{clickedUnavailableDate.notes}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedDate && (
                    <div className={`p-4 rounded-lg ${isDateReserved(selectedDate) ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
                      <h4 className="font-medium mb-2">Selected Date</h4>
                      <p className="text-sm text-gray-600">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {isDateReserved(selectedDate) && (
                        <p className="text-sm text-red-600 mt-2 font-medium">
                          ⚠️ This date is already reserved or unavailable and cannot be booked
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleBookingSubmit} 
                  className="w-full md:w-auto"
                  disabled={!selectedDate || isDateReserved(selectedDate) || !bookingData.startTime || !bookingData.endTime || !agreedToTerms || isCapacityExceeded() || !bookingData.guestCount.trim() || !bookingData.eventName.trim() || !bookingData.eventType}
                  title={
                    isCapacityExceeded() 
                      ? "Please reduce the number of guests to submit reservation" 
                      : (!bookingData.guestCount.trim() ? "Expected guests is required" : "")
                  }
                >
                  Submit Reservation Request
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
      <TermsDialog open={showTerms} onOpenChange={setShowTerms} />
    </Dialog>
  )
}
