'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Image, Camera, Users, DollarSign, RefreshCw, Building2 } from 'lucide-react'

interface OfficeRoom {
  id: number
  name: string
  description: string
  capacity: number
  price_per_hour: number
  available_rooms: number
  image_url: string
  image_360_url: string
  type: string
  status: string
  amenities: string
}

export function CMSOfficeRoomEditor() {
  const [rooms, setRooms] = useState<OfficeRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRoom, setEditingRoom] = useState<OfficeRoom | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    pricePerHour: '',
    availableRooms: '',
    imageUrl: '',
    image360Url: '',
    type: 'meeting',
    amenities: ''
  })

  // File upload states
  const [regularImageFile, setRegularImageFile] = useState<File | null>(null)
  const [image360File, setImage360File] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchRooms = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/office-rooms?includeAll=true')
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms || [])
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast({
        title: 'Error',
        description: 'Failed to load office spaces',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleAdd = () => {
    setEditingRoom(null)
    setFormData({
      name: '',
      description: '',
      capacity: '',
      pricePerHour: '',
      availableRooms: '',
      imageUrl: '',
      image360Url: '',
      type: 'meeting',
      amenities: ''
    })
    setRegularImageFile(null)
    setImage360File(null)
    setShowDialog(true)
  }

  const handleEdit = (room: OfficeRoom) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity.toString(),
      pricePerHour: room.price_per_hour.toString(),
      availableRooms: (room.available_rooms || 1).toString(),
      imageUrl: room.image_url || '',
      image360Url: room.image_360_url || '',
      type: room.type || 'office',
      amenities: room.amenities || ''
    })
    setRegularImageFile(null)
    setImage360File(null)
    setShowDialog(true)
  }

  const uploadFile = async (file: File, type: 'regular' | '360') => {
    console.log('Uploading file:', file.name, 'type:', type);
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', `office-${type}`)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    console.log('Upload response:', data);
    return data.url
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.capacity) {
      toast({
        title: 'Validation Error',
        description: 'Name and capacity are required',
        variant: 'destructive'
      })
      return
    }

    try {
      setUploading(true)
      
      let imageUrl = ''
      let image360Url = formData.image360Url

      // Upload 360° image if file is selected
      if (image360File) {
        image360Url = await uploadFile(image360File, '360')
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        capacity: parseInt(formData.capacity),
        pricePerHour: parseFloat(formData.pricePerHour) || 0,
        availableRooms: parseInt(formData.availableRooms) || 1,
        imageUrl,
        image360Url,
        type: formData.type,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
      }

      console.log('Saving office room with payload:', payload);
      console.log('regularImageFile:', regularImageFile);
      console.log('image360File:', image360File);

      const url = '/api/office-rooms'
      const method = editingRoom ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRoom ? { ...payload, id: editingRoom.id } : payload)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingRoom ? 'Space updated successfully' : 'Space created successfully'
        })
        setShowDialog(false)
        fetchRooms()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save space')
      }
    } catch (error) {
      console.error('Error saving space:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save space',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this space?')) return

    try {
      const response = await fetch('/api/office-rooms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Space deleted successfully'
        })
        fetchRooms()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete space',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-xs md:text-sm text-muted-foreground">
          Manage office spaces and meeting rooms. Add 360° images for virtual tours.
        </p>
        <Button onClick={handleAdd} className="w-full sm:w-auto text-xs md:text-sm">
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          Add Space
        </Button>
      </div>

      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${room.image_360_url ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <p className="font-medium text-gray-900">{room.name}</p>
                  <p className="text-sm text-gray-500">
                    Capacity: {room.capacity} • ₱{room.price_per_hour}/month
                  </p>
                  <p className="text-xs text-gray-400">
                    Available Rooms: {room.available_rooms || 1} • {room.type}
                    {room.image_360_url && ' • 360° Available'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(room)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(room.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-8 md:py-12 border-2 border-dashed rounded-lg">
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">No office spaces added yet</p>
          <Button onClick={handleAdd} className="text-xs md:text-sm">
            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Add Your First Space
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              {editingRoom ? 'Edit Space' : 'Add New Space'}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Add office spaces or meeting rooms with 360° panoramic images for virtual tours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4">
            <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs md:text-sm">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Conference Room A"
                  className="text-xs md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs md:text-sm">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting" className="text-xs md:text-sm">Meeting Room</SelectItem>
                    <SelectItem value="conference" className="text-xs md:text-sm">Conference Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the space..."
                rows={3}
                className="text-xs md:text-sm"
              />
            </div>

            <div className="grid gap-3 md:gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-xs md:text-sm">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 50"
                  className="text-xs md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs md:text-sm">Monthly (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="e.g., 500"
                  className="text-xs md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableRooms" className="text-xs md:text-sm">Available Rooms</Label>
                <Input
                  id="availableRooms"
                  type="number"
                  min="1"
                  value={formData.availableRooms}
                  onChange={(e) => setFormData({ ...formData, availableRooms: e.target.value })}
                  placeholder="e.g., 5"
                  className="text-xs md:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image360File" className="text-xs md:text-sm">
                <Camera className="h-3 w-3 md:h-4 md:w-4 inline mr-2" />
                360° Panoramic Image
              </Label>
              <Input
                id="image360File"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImage360File(file)
                  }
                }}
                className="text-xs md:text-sm"
              />
              {formData.image360Url && !image360File && (
                <p className="text-xs text-green-600">Current: {formData.image360Url.split('/').pop()}</p>
              )}
              {image360File && (
                <p className="text-xs text-blue-600">Selected: {image360File.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a 360° panoramic image for immersive virtual tour experience
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities" className="text-xs md:text-sm">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="WiFi, Projector, Whiteboard, AC"
                className="text-xs md:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={uploading} className="w-full sm:w-auto text-xs md:text-sm">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={uploading} className="w-full sm:w-auto text-xs md:text-sm">
              {uploading ? (
                <>
                  <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `${editingRoom ? 'Update' : 'Create'} Space`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}