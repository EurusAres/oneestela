'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Review {
  id: string
  user_id: string
  office_room_id?: string
  venue_id?: string
  booking_id?: string
  rating: number
  title: string
  review_text: string
  is_approved: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  full_name: string
  room_name?: string
  venue_name?: string
}

export interface ReviewStats {
  total: number
  pending: number
  approved: number
  featured: number
  averageRating: number
}

interface ReviewsContextType {
  reviews: Review[]
  stats: ReviewStats | null
  isLoading: boolean
  refreshReviews: () => Promise<void>
  submitReview: (reviewData: {
    userId: string
    officeRoomId: string
    bookingId?: string
    rating: number
    title: string
    reviewText: string
  }) => Promise<boolean>
  approveReview: (reviewId: string) => Promise<boolean>
  featureReview: (reviewId: string) => Promise<boolean>
  deleteReview: (reviewId: string) => Promise<boolean>
  getApprovedReviews: () => Review[]
  getFeaturedReviews: () => Review[]
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        
        // Calculate stats
        const total = data.reviews.length
        const pending = data.reviews.filter((r: Review) => !r.is_approved).length
        const approved = data.reviews.filter((r: Review) => r.is_approved).length
        const featured = data.reviews.filter((r: Review) => r.is_featured).length
        const averageRating = total > 0 
          ? data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / total 
          : 0

        setStats({
          total,
          pending,
          approved,
          featured,
          averageRating: Math.round(averageRating * 10) / 10
        })
      } else {
        console.error('Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitReview = useCallback(async (reviewData: {
    userId: string
    officeRoomId?: string
    venueId?: string
    bookingId?: string
    rating: number
    title: string
    reviewText: string
  }) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (response.ok) {
        await refreshReviews()
        return true
      }
      return false
    } catch (error) {
      console.error('Error submitting review:', error)
      return false
    }
  }, [refreshReviews])

  const approveReview = useCallback(async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, action: 'approve' }),
      })

      if (response.ok) {
        await refreshReviews()
        return true
      }
      return false
    } catch (error) {
      console.error('Error approving review:', error)
      return false
    }
  }, [refreshReviews])

  const featureReview = useCallback(async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, action: 'feature' }),
      })

      if (response.ok) {
        await refreshReviews()
        return true
      }
      return false
    } catch (error) {
      console.error('Error featuring review:', error)
      return false
    }
  }, [refreshReviews])

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId }),
      })

      if (response.ok) {
        await refreshReviews()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting review:', error)
      return false
    }
  }, [refreshReviews])

  const getApprovedReviews = useCallback(() => {
    return reviews.filter(review => review.is_approved)
  }, [reviews])

  const getFeaturedReviews = useCallback(() => {
    return reviews.filter(review => review.is_approved && review.is_featured)
  }, [reviews])

  useEffect(() => {
    refreshReviews()
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(refreshReviews, 30000)
    return () => clearInterval(interval)
  }, [refreshReviews])

  const value: ReviewsContextType = {
    reviews,
    stats,
    isLoading,
    refreshReviews,
    submitReview,
    approveReview,
    featureReview,
    deleteReview,
    getApprovedReviews,
    getFeaturedReviews,
  }

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider')
  }
  return context
}