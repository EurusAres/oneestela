"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Mock data for events
const events = [
  { id: 1, title: "Wedding Reception", client: "Maria Santos", date: new Date(2025, 5, 15), status: "confirmed" },
  { id: 2, title: "Corporate Seminar", client: "Tech Solutions Inc.", date: new Date(2025, 5, 22), status: "pending" },
  { id: 3, title: "Birthday Party", client: "John Miller", date: new Date(2025, 5, 30), status: "confirmed" },
  { id: 4, title: "Charity Gala", client: "Hope Foundation", date: new Date(2025, 6, 5), status: "new" },
]

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const { toast } = useToast()

  // Find events for the selected date
  const eventsForSelectedDate = date
    ? events.filter(
        (event) =>
          event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear(),
      )
    : []

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Booking added",
      description: "The new booking has been successfully added",
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Booking Calendar</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Booking</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Booking</DialogTitle>
                <DialogDescription>Create a new event booking. Click save when you're done.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBooking}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input id="event-title" placeholder="Enter event title" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input id="client-name" placeholder="Enter client name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input id="event-date" type="date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-status">Status</Label>
                    <Select defaultValue="new">
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-notes">Notes</Label>
                    <Textarea id="event-notes" placeholder="Add any additional notes here" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Booking</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
              <CardDescription>View and manage all your event bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events for {date?.toLocaleDateString()}</CardTitle>
              <CardDescription>
                {eventsForSelectedDate.length === 0
                  ? "No events scheduled for this date"
                  : `${eventsForSelectedDate.length} event(s) scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventsForSelectedDate.map((event) => (
                  <div key={event.id} className="rounded-md border p-4">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">Client: {event.client}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          event.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : event.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
