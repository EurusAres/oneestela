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
}

interface Space {
  id: number
  name: string
  type: 'venue' | 'office'
}

export function ReserveDialog({ open, onOpenChange }: ReserveDialogProps) {
  const { user, login, isLoading } = useAuth()
  const { addBooking, getAllBookings } = useBookings()
  const { toast } = useToast()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
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

  // Fetch venues and office spaces when dialog opens
  useEffect(() => {
    if (open) {
      fetchSpaces()
    }
  }, [open])

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
            type: 'venue'
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
            type: 'office'
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

  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const allBookings = getAllBookings()
  const reservedDates = allBookings
    .filter((booking) => booking.status === "confirmed" || booking.status === "pending")
    .map((booking) => {
      const [year, month, day] = booking.date.split('-').map(Number)
      return new Date(year, month - 1, day)
    })

  const isDateReserved = (date: Date) => {
    return reservedDates.some((reservedDate) => reservedDate.toDateString() === date.toDateString())
  }

  const validateEventDetails = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!bookingData.eventName.trim()) {
      newErrors.eventName = "Event name is required"
    }
    if (!bookingData.eventType) {
      newErrors.eventType = "Event space is required"
    }
    if (!bookingData.guestCount) {
      newErrors.guestCount = "Expected guests is required"
    } else if (Number.parseInt(bookingData.guestCount) <= 0) {
      newErrors.guestCount = "Guest count must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateEventDetails()) {
      setActiveTab("datetime")
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
      return
    }
    
    if (date < minDate) {
      toast({
        title: "Invalid Date",
        description: "Reservations must be made at least 1 month in advance.",
        variant: "destructive",
      })
      return
    }
    
    if (isDateReserved(date)) {
      toast({
        title: "Date Unavailable",
        description: "This date is already reserved. Please select another date.",
        variant: "destructive",
      })
      return
    }
    
    setSelectedDate(date)
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
      date: selectedDate ? formatLocalDate(selectedDate) : "",
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
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
      description: "Your booking has been added to My Transactions. We'll review and get back to you within 24 hours.",
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
    setSelectedDate(new Date())
    setAgreedToTerms(false)
    onOpenChange(false)
  }

  const availableTimes = [
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
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reserve Your Event</DialogTitle>
          <DialogDescription>
            {user ? "Fill out the details for your event reservation" : "Please log in to make a reservation"}
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="datetime" disabled={activeTab === "details"}>
                Date & Time
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    placeholder="Enter event name"
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Space</Label>
                    <Select
                      value={bookingData.eventType}
                      onValueChange={(value) => {
                        setBookingData({ ...bookingData, eventType: value })
                        if (errors.eventType) {
                          setErrors({ ...errors, eventType: "" })
                        }
                      }}
                    >
                      <SelectTrigger className={errors.eventType ? "border-red-500" : ""}>
                        <SelectValue placeholder={loadingSpaces ? "Loading spaces..." : "Select space"} />
                      </SelectTrigger>
                      <SelectContent>
                        {spaces.map((space) => (
                          <SelectItem key={`${space.type}-${space.id}`} value={`${space.type}-${space.id}`}>
                            {space.name} ({space.type === 'venue' ? 'Venue' : 'Office Space'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.eventType && <p className="text-sm text-red-500">{errors.eventType}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestCount">Expected Guests</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      placeholder="Number of guests"
                      value={bookingData.guestCount}
                      onChange={(e) => {
                        setBookingData({ ...bookingData, guestCount: e.target.value })
                        if (errors.guestCount) {
                          setErrors({ ...errors, guestCount: "" })
                        }
                      }}
                      className={errors.guestCount ? "border-red-500" : ""}
                    />
                    {errors.guestCount && <p className="text-sm text-red-500">{errors.guestCount}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Any special requirements, decorations, catering preferences, etc."
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleNext}>
                  Next
                </Button>
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
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < minDate || isDateReserved(date)}
                      modifiers={{
                        reserved: reservedDates,
                      }}
                      modifiersClassNames={{
                        reserved: "!bg-red-500 !text-white !font-bold line-through hover:!bg-red-600",
                      }}
                      className="rounded-md border w-full"
                      style={{
                        fontSize: '1rem',
                        '--cell-size': '2.8rem'
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
                  <div className="mt-3 text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Reserved dates (unavailable)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>Unavailable (less than 1 month)</span>
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
                          ⚠️ This date is already reserved and cannot be booked
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
                  disabled={!selectedDate || isDateReserved(selectedDate) || !bookingData.startTime || !bookingData.endTime || !agreedToTerms}
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
