'use client'

import { useState } from 'react'
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
  
  const { submitReview } = useReviews()
  const { toast } = useToast()

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

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

    setIsSubmitting(true)
    
    try {
      const success = await submitReview({
        userId: user.id,
        officeRoomId: officeRoomId || '1', // Default to first room if not specified
        bookingId,
        rating,
        title: title.trim(),
        reviewText: reviewText.trim(),
      })

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            Help others by sharing your experience at One Estela Place. Your review will be visible after approval.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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