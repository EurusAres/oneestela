"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Trash2, Plus, Building2 } from 'lucide-react'

interface UnavailableOffice {
  id: number
  office_room_id: number
  office_name: string
  reason: string
  unavailable_rooms: number
  created_at: string
}

interface OfficeRoom {
  id: number
  name: string
  capacity: number
  available_rooms?: number
  total_rooms?: number
  price_per_hour?: number
  type?: string
}

interface UnavailableOfficeManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnavailableOfficeManager({ open, onOpenChange }: UnavailableOfficeManagerProps) {
  const [unavailableOffices, setUnavailableOffices] = useState<UnavailableOffice[]>([])
  const [officeRooms, setOfficeRooms] = useState<OfficeRoom[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')
  const [unavailableRooms, setUnavailableRooms] = useState<string>('')
  const { toast } = useToast()

  // Fetch unavailable offices and office rooms
  useEffect(() => {
    if (open) {
      fetchUnavailableOffices()
      fetchOfficeRooms()
    }
  }, [open])

  const fetchUnavailableOffices = async () => {
    try {
      const response = await fetch('/api/unavailable-offices')
      if (response.ok) {
        const data = await response.json()
        setUnavailableOffices(data.unavailableOffices || [])
      }
    } catch (error) {
      console.error('Error fetching unavailable offices:', error)
    }
  }

  const fetchOfficeRooms = async () => {
    try {
      const response = await fetch('/api/office-rooms?includeAll=true')
      if (response.ok) {
        const data = await response.json()
        console.log('Office rooms data:', data)
        setOfficeRooms(data.rooms || [])
      } else {
        console.error('Failed to fetch office rooms:', response.status)
      }
    } catch (error) {
      console.error('Error fetching office rooms:', error)
    }
  }

  const handleAddUnavailableOffice = async () => {
    if (!selectedOfficeId || !reason || !unavailableRooms) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    // Validate custom reason if "Other" is selected
    if (reason === "Other" && !customReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a custom reason',
        variant: 'destructive'
      })
      return
    }

    const unavailableCount = parseInt(unavailableRooms)
    if (isNaN(unavailableCount) || unavailableCount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number of unavailable rooms',
        variant: 'destructive'
      })
      return
    }

    const selectedOffice = officeRooms.find(office => office.id.toString() === selectedOfficeId)
    if (selectedOffice && unavailableCount > (selectedOffice.available_rooms || 0)) {
      toast({
        title: 'Error',
        description: `Cannot mark ${unavailableCount} rooms as unavailable. Only ${selectedOffice.available_rooms || 0} rooms available.`,
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // Use custom reason if "Other" is selected
      const finalReason = reason === "Other" ? customReason.trim() : reason

      const response = await fetch('/api/unavailable-offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_room_id: parseInt(selectedOfficeId),
          reason: finalReason,
          unavailable_rooms: unavailableCount
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${unavailableCount} room(s) marked as unavailable`
        })
        setSelectedOfficeId('')
        setReason('')
        setCustomReason('')
        setUnavailableRooms('')
        fetchUnavailableOffices()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add unavailable office')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add unavailable office',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUnavailableOffice = async (id: number) => {
    if (!confirm('Are you sure you want to remove this unavailable office period?')) {
      return
    }

    try {
      const response = await fetch('/api/unavailable-offices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Unavailable office period removed'
        })
        fetchUnavailableOffices()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete unavailable office')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete unavailable office',
        variant: 'destructive'
      })
    }
  }

  // Get selected office details
  const selectedOffice = officeRooms.find(office => office.id.toString() === selectedOfficeId)

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'maintenance':
        return 'bg-orange-100 text-orange-800'
      case 'renovation':
        return 'bg-blue-100 text-blue-800'
      case 'fully occupied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Manage Unavailable Office Spaces
          </DialogTitle>
          <DialogDescription>
            Mark office spaces as unavailable due to maintenance, renovation, or other reasons. Spaces will remain unavailable until manually removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Unavailable Office */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Unavailable Office
              </CardTitle>
              <CardDescription>
                Select an office space and specify the reason for unavailability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="office">Office Space</Label>
                  <Select value={selectedOfficeId} onValueChange={setSelectedOfficeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select office space" />
                    </SelectTrigger>
                    <SelectContent>
                      {officeRooms.map((office) => (
                        <SelectItem key={office.id} value={office.id.toString()}>
                          {office.name} (Capacity: {office.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedOffice && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <strong>Available Rooms:</strong> {selectedOffice.available_rooms || 0} total rooms
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Renovation">Renovation</SelectItem>
                      <SelectItem value="Fully Occupied">Fully Occupied</SelectItem>
                      <SelectItem value="Other">Other (Custom Reason)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Reason Input - Show only when "Other" is selected */}
              {reason === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="customReason">Custom Reason</Label>
                  <Input
                    id="customReason"
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom reason..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="unavailableRooms">Number of Rooms to Mark Unavailable</Label>
                <Input
                  id="unavailableRooms"
                  type="number"
                  min="1"
                  max={selectedOffice?.available_rooms || 1}
                  value={unavailableRooms}
                  onChange={(e) => setUnavailableRooms(e.target.value)}
                  placeholder={selectedOffice ? `Enter 1 to ${selectedOffice.available_rooms || 1}` : "Select office space first"}
                />
                {selectedOffice && (
                  <p className="text-xs text-gray-500">
                    Maximum: {selectedOffice.available_rooms || 0} rooms available
                  </p>
                )}
              </div>

              <Button 
                onClick={handleAddUnavailableOffice} 
                disabled={isLoading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? 'Adding...' : 'Mark Rooms as Unavailable'}
              </Button>
            </CardContent>
          </Card>

          {/* Current Unavailable Offices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Current Unavailable Offices
              </CardTitle>
              <CardDescription>
                {unavailableOffices.length} office space(s) currently marked as unavailable
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unavailableOffices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No office spaces are currently marked as unavailable</p>
                  <p className="text-sm mt-1">Mark office spaces as unavailable above to manage office availability</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unavailableOffices.map((unavailable) => (
                    <div key={unavailable.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{unavailable.office_name}</h4>
                          <Badge className={getReasonColor(unavailable.reason)}>
                            {unavailable.reason}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {unavailable.unavailable_rooms} room{unavailable.unavailable_rooms !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Marked unavailable on {formatDate(unavailable.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUnavailableOffice(unavailable.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}