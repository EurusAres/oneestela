"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import {
  CalendarX,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Settings,
  AlertTriangle,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface UnavailableDate {
  id: number
  venue_id: number
  venue_name: string
  date: string
  reason: string
  notes: string
  created_by: string
  created_at: string
}

interface Venue {
  id: number
  name: string
}

interface UnavailableDatesManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnavailableDatesManager({ open, onOpenChange }: UnavailableDatesManagerProps) {
  const { toast } = useToast()
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  // Form state
  const [selectedVenue, setSelectedVenue] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [notes, setNotes] = useState("")

  // Fetch data
  useEffect(() => {
    if (open) {
      fetchUnavailableDates()
      fetchVenues()
    }
  }, [open])

  const fetchUnavailableDates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/unavailable-dates')
      if (response.ok) {
        const data = await response.json()
        setUnavailableDates(data.unavailableDates || [])
      }
    } catch (error) {
      console.error('Error fetching unavailable dates:', error)
      toast({
        title: "Error",
        description: "Failed to load unavailable dates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues')
      if (response.ok) {
        const data = await response.json()
        setVenues(data.venues || [])
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
    }
  }

  const handleAddUnavailableDate = async () => {
    if (!selectedVenue || !selectedDate || !selectedReason) {
      toast({
        title: "Missing Information",
        description: "Please select venue, date, and reason",
        variant: "destructive"
      })
      return
    }

    try {
      // Format date without timezone conversion
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`

      console.log('Selected date object:', selectedDate)
      console.log('Formatted date string:', dateString)
      console.log('Date components:', { year, month, day })

      const response = await fetch('/api/unavailable-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: parseInt(selectedVenue),
          date: dateString,
          reason: selectedReason,
          notes: notes.trim(),
          createdBy: 'admin'
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Date marked as unavailable"
        })
        setShowAddDialog(false)
        resetForm()
        fetchUnavailableDates()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add unavailable date",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding unavailable date:', error)
      toast({
        title: "Error",
        description: "Failed to add unavailable date",
        variant: "destructive"
      })
    }
  }

  const handleRemoveUnavailableDate = async (id: number) => {
    try {
      const response = await fetch('/api/unavailable-dates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Unavailable date removed"
        })
        fetchUnavailableDates()
      } else {
        toast({
          title: "Error",
          description: "Failed to remove unavailable date",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error removing unavailable date:', error)
      toast({
        title: "Error",
        description: "Failed to remove unavailable date",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setSelectedVenue("")
    setSelectedDate(undefined)
    setSelectedReason("")
    setNotes("")
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'Maintenance':
        return <Settings className="h-4 w-4" />
      case 'Staffing Shortages':
        return <Users className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800'
      case 'Staffing Shortages':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              Manage Unavailable Dates
            </DialogTitle>
            <DialogDescription>
              Mark specific dates as unavailable for event venues due to maintenance or staffing issues.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Current Unavailable Dates</h3>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Unavailable Date
              </Button>
            </div>

            {/* Unavailable Dates List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : unavailableDates.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CalendarX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No unavailable dates set</p>
                  </CardContent>
                </Card>
              ) : (
                unavailableDates.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{item.venue_name}</h4>
                            <Badge className={getReasonColor(item.reason)}>
                              {getReasonIcon(item.reason)}
                              <span className="ml-1">{item.reason}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              {(() => {
                                // Parse date without timezone conversion
                                const dateStr = item.date
                                if (dateStr.includes('-')) {
                                  const [year, month, day] = dateStr.split('-').map(Number)
                                  const localDate = new Date(year, month - 1, day)
                                  return localDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                }
                                return new Date(dateStr).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              })()}
                            </p>
                            {item.notes && (
                              <p className="text-gray-500 mt-1">{item.notes}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              Added by {item.created_by} on {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUnavailableDate(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Unavailable Date Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Unavailable Date</DialogTitle>
            <DialogDescription>
              Mark a specific date as unavailable for an event venue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Venue Selection */}
            <div className="space-y-2">
              <Label>Event Venue</Label>
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id.toString()}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 max-h-[400px] overflow-y-auto" 
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="rounded-md border-0"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintenance">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Maintenance
                    </div>
                  </SelectItem>
                  <SelectItem value="Staffing Shortages">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Staffing Shortages
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Add any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUnavailableDate}>
              Add Unavailable Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}