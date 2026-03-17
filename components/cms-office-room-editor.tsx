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
import { Plus, Edit, Trash2, Image, Camera, Users, DollarSign, RefreshCw } from 'lucide-react'

interface OfficeRoom {
  id: number
  name: string
  description: string
  capacity: number
  price_per_hour: number
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
    imageUrl: '',
    image360Url: '',
    type: 'office',
    amenities: ''
  })

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
      imageUrl: '',
      image360Url: '',
      type: 'office',
      amenities: ''
    })
    setShowDialog(true)
  }

  const handleEdit = (room: OfficeRoom) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity.toString(),
      pricePerHour: room.price_per_hour.toString(),
      imageUrl: room.image_url || '',
      image360Url: room.image_360_url || '',
      type: room.type || 'office',
      amenities: room.amenities || ''
    })
    setShowDialog(true)
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
      const payload = {
        name: formData.name,
        description: formData.description,
        capacity: parseInt(formData.capacity),
        pricePerHour: parseFloat(formData.pricePerHour) || 0,
        imageUrl: formData.imageUrl,
        image360Url: formData.image360Url,
        type: formData.type,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
      }

      const url = editingRoom 
        ? '/api/office-rooms'
        : '/api/office-rooms'
      
      const method = editingRoom ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRoom ? { ...payload, id: editingRoom.id } : payload)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Space ${editingRoom ? 'updated' : 'created'} successfully`
        })
        setShowDialog(false)
        fetchRooms()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingRoom ? 'update' : 'create'} space`,
        variant: 'destructive'
      })
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage office spaces and meeting rooms. Add 360° images for virtual tours.
        </p>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Space
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline">{room.type}</Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(room)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(room.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {room.image_url && (
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Up to {room.capacity} people</span>
                </div>
                {room.price_per_hour > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>₱{room.price_per_hour}/hour</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className={room.image_360_url ? 'text-green-600' : 'text-gray-400'}>
                    {room.image_360_url ? '360° Available' : 'No 360° image'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No office spaces added yet</p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Space
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? 'Edit Space' : 'Add New Space'}
            </DialogTitle>
            <DialogDescription>
              Add office spaces or meeting rooms with 360° panoramic images for virtual tours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Conference Room A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office Space</SelectItem>
                    <SelectItem value="meeting">Meeting Room</SelectItem>
                    <SelectItem value="conference">Conference Room</SelectItem>
                    <SelectItem value="event">Event Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the space..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Hour (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">
                <Image className="h-4 w-4 inline mr-2" />
                Regular Image URL
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Upload image to /public/images/ or use external URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image360Url">
                <Camera className="h-4 w-4 inline mr-2" />
                360° Panoramic Image URL
              </Label>
              <Input
                id="image360Url"
                value={formData.image360Url}
                onChange={(e) => setFormData({ ...formData, image360Url: e.target.value })}
                placeholder="https://example.com/360-image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Add 360° panoramic image for virtual tour experience
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="WiFi, Projector, Whiteboard, AC"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingRoom ? 'Update' : 'Create'} Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}