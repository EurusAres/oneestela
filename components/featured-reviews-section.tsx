'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { Review } from '@/components/reviews-context'

export function FeaturedReviewsSection() {
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const response = await fetch('/api/reviews?approved=true')
        if (response.ok) {
          const data = await response.json()
          // Get featured reviews first, then approved reviews if not enough featured
          const featured = data.reviews.filter((r: Review) => r.is_featured)
          const approved = data.reviews.filter((r: Review) => r.is_approved && !r.is_featured)
          
          // Show up to 3 reviews, prioritizing featured ones
          const reviewsToShow = [...featured, ...approved].slice(0, 3)
          setFeaturedReviews(reviewsToShow)
        }
      } catch (error) {
        console.error('Error fetching featured reviews:', error)
        // Fallback to static reviews if API fails
        setFeaturedReviews([
          {
            id: '1',
            user_id: '1',
            office_room_id: '1',
            rating: 5,
            title: 'Perfect Wedding Venue',
            review_text: 'One Estela Place was the perfect venue for our wedding. The staff was incredibly helpful and the venue itself is stunning.',
            is_approved: true,
            is_featured: true,
            created_at: '2025-05-10',
            updated_at: '2025-05-10',
            full_name: 'Sarah Johnson',
            room_name: 'Main Hall'
          },
          {
            id: '2',
            user_id: '2',
            office_room_id: '1',
            rating: 4,
            title: 'Great Corporate Venue',
            review_text: 'Great venue for our company retreat. The facilities were excellent and the staff was very accommodating.',
            is_approved: true,
            is_featured: true,
            created_at: '2025-04-22',
            updated_at: '2025-04-22',
            full_name: 'Michael Chen',
            room_name: 'Conference Room'
          },
          {
            id: '3',
            user_id: '3',
            office_room_id: '1',
            rating: 5,
            title: 'Amazing Birthday Celebration',
            review_text: 'Had my 30th birthday here and it was amazing! The space is beautiful and everyone had a great time.',
            is_approved: true,
            is_featured: true,
            created_at: '2025-04-15',
            updated_at: '2025-04-15',
            full_name: 'Jessica Williams',
            room_name: 'Party Hall'
          }
        ] as Review[])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedReviews()
  }, [])

  const renderStars = (rating: number) => {
    return (
      <div className="mb-4 flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${
              i < rating 
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
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 md:mb-12 text-center text-xl md:text-2xl lg:text-3xl font-bold">What Our Clients Say</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardContent className="pt-6 flex-1">
                  <div className="animate-pulse">
                    <div className="mb-4 flex space-x-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-4 w-4 bg-gray-200 rounded" />
                      ))}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 md:mb-12 text-center text-xl md:text-2xl lg:text-3xl font-bold">What Our Clients Say</h2>
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featuredReviews.map((review) => (
            <Card key={review.id} className="flex flex-col">
              <CardContent className="pt-6 flex-1">
                <div className="flex items-center gap-0.5 flex-wrap mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < review.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <p className="mb-4 text-sm text-gray-600 line-clamp-4">
                  "{review.review_text}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm md:text-base">- {review.full_name}</p>
                  {review.is_featured && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="text-sm text-gray-500 mt-1">{review.title}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {featuredReviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No reviews available yet</p>
            <p className="text-sm text-gray-400">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  )
}