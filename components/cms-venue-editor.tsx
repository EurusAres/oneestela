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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Image, Camera, Users, DollarSign, RefreshCw, MapPin } from 'lucide-react'

interface Venue {
  id: number
  name: string
  description: string
  location: string
  capacity: number
  price_per_hour: number
  image_url: string
  image_360_url: string
  amenities: string
}

export function CMSVenueEditor() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: '',
    pricePerHour: '',
    imageUrl: '',
    image360Url: '',
    amenities: ''
  })

  // File upload states
  const [regularImageFile, setRegularImageFile] = useState<File | null>(null)
  const [image360File, setImage360File] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchVenues = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/venues')
      if (response.ok) {
        const data = await response.json()
        setVenues(data.venues || [])
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
      toast({
        title: 'Error',
        description: 'Failed to load venues',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  const handleAdd = () => {
    setEditingVenue(null)
    setFormData({
      name: '',
      description: '',
      location: '',
      capacity: '',
      pricePerHour: '',
      imageUrl: '',
      image360Url: '',
      amenities: ''
    })
    setRegularImageFile(null)
    setImage360File(null)
    setShowDialog(true)
  }

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue)
    setFormData({
      name: venue.name,
      description: venue.description || '',
      location: venue.location || '',
      capacity: venue.capacity.toString(),
      pricePerHour: venue.price_per_hour.toString(),
      imageUrl: venue.image_url || '',
      image360Url: venue.image_360_url || '',
      amenities: venue.amenities || ''
    })
    setRegularImageFile(null)
    setImage360File(null)
    setShowDialog(true)
  }

  const uploadFile = async (file: File, type: 'regular' | '360') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', `venue-${type}`)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
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
      
      let imageUrl = formData.imageUrl
      let image360Url = formData.image360Url

      // Upload regular image if file is selected
      if (regularImageFile) {
        imageUrl = await uploadFile(regularImageFile, 'regular')
      }

      // Upload 360° image if file is selected
      if (image360File) {
        image360Url = await uploadFile(image360File, '360')
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        capacity: parseInt(formData.capacity),
        pricePerHour: parseFloat(formData.pricePerHour) || 0,
        imageUrl,
        image360Url,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
      }

      console.log('Saving venue with payload:', payload);

      const method = editingVenue ? 'PATCH' : 'POST'
      
      const response = await fetch('/api/venues', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVenue ? { ...payload, id: editingVenue.id } : payload)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Venue ${editingVenue ? 'updated' : 'created'} successfully`
        })
        setShowDialog(false)
        fetchVenues()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save venue')
      }
    } catch (error) {
      console.error('Error saving venue:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save venue',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this venue?')) return

    try {
      const response = await fetch('/api/venues', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Venue deleted successfully'
        })
        fetchVenues()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete venue',
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
          Manage event venues. Add 360° images for immersive virtual tours.
        </p>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Venue
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <Card key={venue.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{venue.name}</CardTitle>
                  {venue.location && (
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {venue.location}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(venue)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(venue.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Up to {venue.capacity} guests</span>
                </div>
                {venue.price_per_hour > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>₱{venue.price_per_hour}/hour</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className={venue.image_360_url ? 'text-green-600' : 'text-gray-400'}>
                    {venue.image_360_url ? '360° Available' : 'No 360° image'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {venues.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No event venues added yet</p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Venue
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </DialogTitle>
            <DialogDescription>
              Add event venues with 360° panoramic images for virtual tours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., The Milestone Event Place"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the venue..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main Entrance View"
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
                  placeholder="e.g., 500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Hour (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile">
                <Image className="h-4 w-4 inline mr-2" />
                Regular Image
              </Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setRegularImageFile(file)
                  }
                }}
              />
              {formData.imageUrl && !regularImageFile && (
                <p className="text-xs text-green-600">Current: {formData.imageUrl.split('/').pop()}</p>
              )}
              {regularImageFile && (
                <p className="text-xs text-blue-600">Selected: {regularImageFile.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload an image file for this venue
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image360File">
                <Camera className="h-4 w-4 inline mr-2" />
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
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="Stage, Sound System, Lighting, Catering Kitchen, AC"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `${editingVenue ? 'Update' : 'Create'} Venue`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}