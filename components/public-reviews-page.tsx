'use client'

import { useState, useEffect } from 'react'
import { PublicLayout } from '@/components/public-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReviewSubmissionDialog } from '@/components/review-submission-dialog'
import { Star, Calendar, User, MessageSquare, RefreshCw } from 'lucide-react'
import { Review } from '@/components/reviews-context'

export function PublicReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, averageRating: 0 })

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reviews?approved=true')
      if (response.ok) {
        const data = await response.json()
        const approvedReviews = data.reviews.filter((r: Review) => r.is_approved)
        setReviews(approvedReviews)
        
        // Calculate stats
        const total = approvedReviews.length
        const averageRating = total > 0 
          ? approvedReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / total 
          : 0
        
        setStats({
          total,
          averageRating: Math.round(averageRating * 10) / 10
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const renderStars = (rating: number, size = 'h-4 w-4') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-xl text-muted-foreground mb-6">
            See what our customers say about their experience at One Estela Place
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-amber-600">{stats.averageRating}</span>
                {renderStars(Math.round(stats.averageRating), 'h-6 w-6')}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>

          {/* Write Review Button */}
          <ReviewSubmissionDialog
            trigger={
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                <MessageSquare className="mr-2 h-5 w-5" />
                Share Your Experience
              </Button>
            }
            onSuccess={() => {
              // Refresh reviews after submission
              fetchReviews()
            }}
          />
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{review.full_name}</span>
                      {review.is_featured && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                {review.title && (
                  <CardTitle className="text-lg">{review.title}</CardTitle>
                )}
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  "{review.review_text}"
                </p>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  Event at {review.room_name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your experience at One Estela Place!
            </p>
            <ReviewSubmissionDialog
              trigger={
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Write the First Review
                </Button>
              }
              onSuccess={fetchReviews}
            />
          </div>
        )}

        {/* Call to Action */}
        {reviews.length > 0 && (
          <div className="text-center mt-16 p-8 bg-amber-50 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Create Your Own Memory?</h3>
            <p className="text-muted-foreground mb-6">
              Join our satisfied customers and book your event at One Estela Place today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                Book Your Event
              </Button>
              <Button size="lg" variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white">
                Contact Us
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}