'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useReviews } from '@/components/reviews-context'
import { Star, MessageSquare } from 'lucide-react'

interface ReviewSubmissionDialogProps {
  trigger?: React.ReactNode
  bookingId?: string
  officeRoomId?: string
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ReviewSubmissionDialog({ 
  trigger, 
  bookingId, 
  officeRoomId,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: ReviewSubmissionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState(officeRoomId || '')
  const [selectedType, setSelectedType] = useState<'venue' | 'office'>('office')
  const [spaces, setSpaces] = useState<Array<{ id: string; name: string; type: 'venue' | 'office' }>>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  
  const { submitReview } = useReviews()
  const { toast } = useToast()

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  // Fetch office rooms when dialog opens
  useEffect(() => {
    if (open) {
      fetchOfficeRooms()
    }
  }, [open])

  // Update selected room when officeRoomId prop changes
  useEffect(() => {
    if (officeRoomId) {
      setSelectedRoomId(officeRoomId)
    }
  }, [officeRoomId])

  const fetchOfficeRooms = async () => {
    try {
      setIsLoadingRooms(true)
      console.log('Starting to fetch spaces...')
      
      // Fetch both venues and office rooms
      const [venuesResponse, roomsResponse] = await Promise.all([
        fetch('/api/venues'),
        fetch('/api/office-rooms?includeAll=true')
      ])
      
      console.log('Venues response status:', venuesResponse.status)
      console.log('Rooms response status:', roomsResponse.status)
      
      const allSpaces: Array<{ id: string; name: string; type: 'venue' | 'office' }> = []
      
      if (venuesResponse.ok) {
        const venuesData = await venuesResponse.json()
        console.log('Raw venues data:', JSON.stringify(venuesData))
        const venuesArray = venuesData.venues
        console.log('Venues array type:', typeof venuesArray, 'isArray:', Array.isArray(venuesArray))
        
        if (venuesArray && Array.isArray(venuesArray)) {
          for (let i = 0; i < venuesArray.length; i++) {
            const venue = venuesArray[i]
            console.log('Processing venue', i, ':', venue)
            allSpaces.push({
              id: `venue_${venue.id}`,
              name: venue.name,
              type: 'venue'
            })
          }
        }
      }
      
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json()
        console.log('Raw rooms data:', JSON.stringify(roomsData))
        const roomsArray = roomsData.rooms
        console.log('Rooms array type:', typeof roomsArray, 'isArray:', Array.isArray(roomsArray))
        
        if (roomsArray && Array.isArray(roomsArray)) {
          for (let i = 0; i < roomsArray.length; i++) {
            const room = roomsArray[i]
            console.log('Processing room', i, ':', room)
            allSpaces.push({
              id: `office_${room.id}`,
              name: room.name,
              type: 'office'
            })
          }
        }
      }
      
      console.log('Final allSpaces:', JSON.stringify(allSpaces))
      console.log('Setting spaces state with', allSpaces.length, 'items')
      setSpaces([...allSpaces]) // Create a new array reference
      
      // If no room is selected and we have spaces, select the first one
      if (!selectedRoomId && allSpaces.length > 0) {
        const firstSpace = allSpaces[0]
        console.log('Auto-selecting first space:', firstSpace)
        setSelectedRoomId(firstSpace.id)
        setSelectedType(firstSpace.type)
      }
    } catch (error) {
      console.error('Error fetching spaces:', error)
      toast({
        title: 'Error',
        description: 'Failed to load spaces. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingRooms(false)
      console.log('Finished loading spaces')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (!userInfo) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a review.',
        variant: 'destructive',
      })
      return
    }

    const user = JSON.parse(userInfo)
    
    if (!reviewText.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write a review before submitting.',
        variant: 'destructive',
      })
      return
    }

    if (!selectedRoomId) {
      console.log('No room selected, current value:', selectedRoomId)
      toast({
        title: 'Space Required',
        description: 'Please select a space to review.',
        variant: 'destructive',
      })
      return
    }

    console.log('Submitting review for space:', selectedRoomId, 'type:', selectedType)

    setIsSubmitting(true)
    
    try {
      // Parse the ID to get the actual numeric ID
      const actualId = selectedRoomId.replace(/^(venue_|office_)/, '')
      
      const reviewData: any = {
        userId: user.id,
        bookingId,
        rating,
        title: title.trim(),
        reviewText: reviewText.trim(),
      }
      
      // Set either venueId or officeRoomId based on type
      if (selectedType === 'venue') {
        reviewData.venueId = actualId
      } else {
        reviewData.officeRoomId = actualId
      }
      
      console.log('Review data:', reviewData)
      
      const success = await submitReview(reviewData)

      if (success) {
        toast({
          title: 'Review Submitted!',
          description: 'Thank you for your feedback. Your review is pending approval.',
        })
        
        // Reset form
        setRating(5)
        setTitle('')
        setReviewText('')
        setOpen(false)
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: 'Submission Failed',
          description: 'There was an error submitting your review. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your review. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
            disabled={!interactive}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {interactive && (
          <span className="ml-2 text-sm text-muted-foreground">
            {rating} star{rating !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            Help others by sharing your experience at One Estela Place. Your review will be visible after approval.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="space">Space/Venue *</Label>
            {(() => {
              console.log('Rendering select, spaces:', spaces, 'length:', spaces.length, 'isArray:', Array.isArray(spaces))
              return null
            })()}
            <select
              key={`space-select-${spaces.length}`}
              id="space"
              value={selectedRoomId}
              onChange={(e) => {
                console.log('Selected value:', e.target.value)
                setSelectedRoomId(e.target.value)
                const space = spaces.find(s => s.id === e.target.value)
                console.log('Found space:', space)
                if (space) {
                  setSelectedType(space.type)
                }
              }}
              disabled={!!officeRoomId || isLoadingRooms}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">
                {isLoadingRooms ? 'Loading spaces...' : spaces.length === 0 ? 'No spaces available' : 'Select a space'}
              </option>
              {!isLoadingRooms && spaces.length > 0 && spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name} ({space.type === 'venue' ? 'Venue' : 'Office Space'})
                </option>
              ))}
            </select>
            {!isLoadingRooms && spaces.length === 0 && (
              <p className="text-xs text-red-500">No spaces found. Please add venues or office spaces first.</p>
            )}
            {officeRoomId && (
              <p className="text-xs text-muted-foreground">
                This review is for a specific booking
              </p>
            )}
            <p className="text-xs text-gray-500">
              Debug: {isLoadingRooms ? 'Loading...' : `${spaces.length} spaces loaded`} | Array.isArray: {Array.isArray(spaces).toString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            {renderStars(true)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Amazing venue for our wedding!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review *</Label>
            <Textarea
              id="review"
              placeholder="Tell us about your experience at One Estela Place..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {reviewText.length}/1000 characters
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium">Review Guidelines:</p>
            <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
              <li>Be honest and constructive in your feedback</li>
              <li>Focus on your experience with the venue and service</li>
              <li>Reviews are moderated and may take time to appear</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reviewText.trim()}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}