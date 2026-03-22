"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useReviews } from "@/components/reviews-context"
import { useToast } from "@/hooks/use-toast"
import { 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Award, 
  RefreshCw,
  Calendar,
  User,
  MapPin
} from "lucide-react"

export default function ReviewsPage() {
  const { 
    reviews, 
    stats, 
    isLoading, 
    refreshReviews, 
    approveReview, 
    featureReview, 
    deleteReview 
  } = useReviews()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")

  const handleApprove = async (reviewId: string) => {
    const success = await approveReview(reviewId)
    if (success) {
      toast({
        title: "Review Approved",
        description: "The review is now visible to customers.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFeature = async (reviewId: string) => {
    const success = await featureReview(reviewId)
    if (success) {
      toast({
        title: "Review Featured",
        description: "The review is now featured on the homepage.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to feature review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (reviewId: string) => {
    const success = await deleteReview(reviewId)
    if (success) {
      toast({
        title: "Review Deleted",
        description: "The review has been permanently removed.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 md:h-4 md:w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs md:text-sm text-muted-foreground">({rating})</span>
      </div>
    )
  }

  const getStatusBadge = (review: any) => {
    if (review.is_featured) {
      return <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
    }
    if (review.is_approved) {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
  }

  const filterReviews = (status: string) => {
    switch (status) {
      case 'pending':
        return reviews.filter(r => !r.is_approved)
      case 'approved':
        return reviews.filter(r => r.is_approved && !r.is_featured)
      case 'featured':
        return reviews.filter(r => r.is_featured)
      default:
        return reviews
    }
  }

  const renderReviewCard = (review: any) => (
    <Card key={review.id} className="mb-3 md:mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold text-sm md:text-base truncate">{review.full_name}</span>
              {getStatusBadge(review)}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{review.venue_name || review.room_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {renderStars(review.rating)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {review.title && (
          <h4 className="font-medium mb-2 text-sm md:text-base">{review.title}</h4>
        )}
        <p className="text-gray-700 mb-3 md:mb-4 text-xs md:text-sm">{review.review_text}</p>
        
        <div className="flex items-center gap-2 flex-wrap">
          {!review.is_approved && (
            <Button
              size="sm"
              onClick={() => handleApprove(review.id)}
              className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
            >
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Approve
            </Button>
          )}
          
          {review.is_approved && !review.is_featured && (
            <Button
              size="sm"
              onClick={() => handleFeature(review.id)}
              className="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm"
            >
              <Award className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Feature
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="text-xs md:text-sm">
                <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-full max-w-[95vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base md:text-lg">Delete Review</AlertDialogTitle>
                <AlertDialogDescription className="text-xs md:text-sm">
                  Are you sure you want to delete this review? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto text-xs md:text-sm">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(review.id)}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-xs md:text-sm"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Customer Reviews</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage customer feedback and testimonials
            </p>
          </div>
          <Button onClick={refreshReviews} variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
            <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
                <span className="hidden sm:inline">Pending</span>
                <span className="sm:hidden">Pend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="hidden sm:inline">Approved</span>
                <span className="sm:hidden">Appr</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                <Award className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                <span className="hidden sm:inline">Featured</span>
                <span className="sm:hidden">Feat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-purple-600">{stats?.featured || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
                <span className="hidden sm:inline">Avg Rating</span>
                <span className="sm:hidden">Avg</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats?.averageRating || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Review Management</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Approve, feature, or delete customer reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full min-w-[400px] grid-cols-4">
                  <TabsTrigger value="all" className="text-xs md:text-sm">All ({stats?.total || 0})</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs md:text-sm">Pending ({stats?.pending || 0})</TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs md:text-sm">Approved ({stats?.approved || 0})</TabsTrigger>
                  <TabsTrigger value="featured" className="text-xs md:text-sm">Featured ({stats?.featured || 0})</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-4 md:mt-6">
                <div className="space-y-3 md:space-y-4">
                  {filterReviews('all').map(renderReviewCard)}
                  {filterReviews('all').length === 0 && (
                    <div className="text-center py-6 md:py-8 text-xs md:text-sm text-muted-foreground">
                      No reviews found
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pending" className="mt-4 md:mt-6">
                <div className="space-y-3 md:space-y-4">
                  {filterReviews('pending').map(renderReviewCard)}
                  {filterReviews('pending').length === 0 && (
                    <div className="text-center py-6 md:py-8 text-xs md:text-sm text-muted-foreground">
                      No pending reviews
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="approved" className="mt-4 md:mt-6">
                <div className="space-y-3 md:space-y-4">
                  {filterReviews('approved').map(renderReviewCard)}
                  {filterReviews('approved').length === 0 && (
                    <div className="text-center py-6 md:py-8 text-xs md:text-sm text-muted-foreground">
                      No approved reviews
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="featured" className="mt-4 md:mt-6">
                <div className="space-y-3 md:space-y-4">
                  {filterReviews('featured').map(renderReviewCard)}
                  {filterReviews('featured').length === 0 && (
                    <div className="text-center py-6 md:py-8 text-xs md:text-sm text-muted-foreground">
                      No featured reviews
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
