"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePaymentProof } from "@/components/payment-proof-context"
import { useBookings } from "@/components/booking-context"
import { useToast } from "@/hooks/use-toast"
import {
  FileImage,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  CreditCard,
  Calendar,
  User,
  DollarSign,
} from "lucide-react"

export default function PaymentsPage() {
  const { getAllPaymentProofs, getPendingPaymentProofs, verifyPaymentProof, rejectPaymentProof, getPaymentProofFile } =
    usePaymentProof()
  const { getBookingById, updateBookingStatus } = useBookings()
  const { toast } = useToast()

  const [selectedProof, setSelectedProof] = useState<any>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<"verify" | "reject">("verify")
  const [adminNote, setAdminNote] = useState("")
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

  const allProofs = getAllPaymentProofs()
  const pendingProofs = getPendingPaymentProofs()
  
  // Get bookings to check cancellation status
  const { getAllBookings } = useBookings()
  const allBookings = getAllBookings()
  
  // Filter proofs by booking status
  const proofsWithBookingStatus = allProofs.map(proof => {
    const booking = allBookings.find(b => b.id === proof.bookingId)
    return {
      ...proof,
      bookingStatus: booking?.status || 'unknown'
    }
  })
  
  // Separate cancelled proofs from active proofs
  const cancelledProofs = proofsWithBookingStatus.filter(
    proof => proof.bookingStatus === 'cancelled'
  )
  
  const activeProofs = proofsWithBookingStatus.filter(
    proof => proof.bookingStatus !== 'cancelled'
  )
  
  const verifiedProofs = activeProofs.filter((proof) => proof.status === "verified")
  const rejectedProofs = activeProofs.filter((proof) => proof.status === "rejected")
  const activePendingProofs = activeProofs.filter((proof) => proof.status === "pending")

  const handleViewDetails = (proof: any) => {
    setSelectedProof(proof)
    setShowDetailsDialog(true)
  }

  const handleReviewProof = (proof: any, action: "verify" | "reject") => {
    setSelectedProof(proof)
    setReviewAction(action)
    setAdminNote("")
    setShowReviewDialog(true)
  }

  const handleSubmitReview = () => {
    if (!selectedProof) return

    const adminId = "admin-1" // In real app, get from auth context

    if (reviewAction === "verify") {
      verifyPaymentProof(selectedProof.id, adminId, adminNote)

      // Update booking status to confirmed
      updateBookingStatus(selectedProof.bookingId, "confirmed")

      toast({
        title: "Payment verified",
        description: "Payment has been verified and booking confirmed.",
      })
    } else {
      if (!adminNote.trim()) {
        toast({
          title: "Note required",
          description: "Please provide a reason for rejecting the payment proof.",
          variant: "destructive",
        })
        return
      }

      rejectPaymentProof(selectedProof.id, adminId, adminNote)

      toast({
        title: "Payment rejected",
        description: "Payment proof has been rejected with feedback.",
        variant: "destructive",
      })
    }

    setShowReviewDialog(false)
    setSelectedProof(null)
    setAdminNote("")
  }

  const handleViewImage = async (proof: any) => {
    console.log('View image - proof object:', proof)
    console.log('File URL:', proof.fileUrl)
    console.log('File URL type:', typeof proof.fileUrl)
    console.log('File URL starts with:', proof.fileUrl?.substring(0, 50))
    
    // File URL is stored directly in the proof object from the database
    if (proof.fileUrl || proof.file_url) {
      const imageUrl = proof.fileUrl || proof.file_url
      console.log('Setting image URL:', imageUrl?.substring(0, 100))
      setSelectedImage(imageUrl)
      setShowImageDialog(true)
    } else {
      console.error('No file URL found in proof:', proof)
      toast({
        title: "File not found",
        description: "Unable to load the payment proof file.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadFile = (proof: any) => {
    console.log('Download - proof object:', proof)
    const fileUrl = proof.fileUrl || proof.file_url
    const fileName = proof.fileName || proof.file_name
    
    if (fileUrl) {
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download started",
        description: `Downloading ${fileName}`,
      })
    } else {
      toast({
        title: "File not found",
        description: "Unable to download the payment proof file.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const PaymentProofCard = ({ proof }: { proof: any }) => {
    const isCancelled = proof.bookingStatus === 'cancelled'
    
    return (
      <div className={`flex items-center justify-between p-4 border rounded-lg ${isCancelled ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(proof.status)}
            <div>
              <p className="font-medium text-gray-900">{proof.customerName || "Unknown Customer"}</p>
              <p className="text-sm text-gray-500">
                Booking ID: {proof.bookingId} • {new Date(proof.uploadedAt).toLocaleDateString()}
              </p>
              {isCancelled && (
                <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                  Booking Cancelled
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleViewDetails(proof)}
          >
            View Details
          </Button>
          
          {proof.status === "pending" && !isCancelled && (
            <>
              <Button
                size="sm"
                onClick={() => handleReviewProof(proof, "verify")}
                className="bg-green-600 hover:bg-green-700"
              >
                Verify
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleReviewProof(proof, "reject")}
              >
                Reject
              </Button>
            </>
          )}
          
          {isCancelled && proof.status === "pending" && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleReviewProof(proof, "reject")}
            >
              Mark as Cancelled
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Payment Verification</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Submissions</CardTitle>
              <FileImage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{allProofs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{activePendingProofs.length}</div>
              {activePendingProofs.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 mt-2 text-xs">Needs Attention</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{verifiedProofs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{rejectedProofs.length}</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{cancelledProofs.length}</div>
              {cancelledProofs.length > 0 && (
                <Badge className="bg-red-100 text-red-800 mt-2 text-xs">Refund Required</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Proofs Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-full sm:w-auto">
              <TabsTrigger value="pending" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pending ({activePendingProofs.length})</span>
                <span className="sm:hidden">({activePendingProofs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="verified" className="text-xs sm:text-sm">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Verified ({verifiedProofs.length})</span>
                <span className="sm:hidden">({verifiedProofs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs sm:text-sm">
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Rejected ({rejectedProofs.length})</span>
                <span className="sm:hidden">({rejectedProofs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-red-600 text-xs sm:text-sm">
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Cancelled ({cancelledProofs.length})</span>
                <span className="sm:hidden">({cancelledProofs.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending">
            <div className="space-y-4">
              {activePendingProofs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No pending payment proofs</p>
                  </CardContent>
                </Card>
              ) : (
                activePendingProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="verified">
            <div className="space-y-4">
              {verifiedProofs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No verified payments yet</p>
                  </CardContent>
                </Card>
              ) : (
                verifiedProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="space-y-4">
              {rejectedProofs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No rejected payments</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="space-y-4">
              {cancelledProofs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No cancelled bookings with payment proofs</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                      <p className="text-sm text-red-800">
                        <strong>Note:</strong> These bookings have been cancelled by customers. Review refund eligibility based on the cancellation policy and process refunds accordingly.
                      </p>
                    </CardContent>
                  </Card>
                  {cancelledProofs.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Proof Details</DialogTitle>
            <DialogDescription>
              Complete information for this payment submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedProof && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Booking Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Event:</span> {selectedProof.eventName || "N/A"}</p>
                    <p><span className="font-medium">Booking ID:</span> {selectedProof.bookingId}</p>
                    <p><span className="font-medium">Uploaded:</span> {new Date(selectedProof.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedProof.customerName || "Unknown"}</p>
                    {selectedProof.customerEmail && (
                      <p><span className="font-medium">Email:</span> {selectedProof.customerEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-medium text-sm mb-2">Payment Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Method:</span> {selectedProof.paymentMethod}</p>
                    <p><span className="font-medium">Amount:</span> ₱{Number(selectedProof.paymentAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Date:</span> {new Date(selectedProof.paymentDate).toLocaleDateString()}</p>
                    {selectedProof.paymentReference && (
                      <p><span className="font-medium">Reference:</span> {selectedProof.paymentReference}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Information */}
              <div>
                <h4 className="font-medium text-sm mb-2">Attached File</h4>
                <div className="flex items-center space-x-2 text-sm">
                  <FileImage className="h-4 w-4" />
                  <span>{selectedProof.fileName}</span>
                  <span className="text-gray-500">({formatFileSize(selectedProof.fileSize)})</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewImage(selectedProof)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View File
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadFile(selectedProof)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedProof.adminNote && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Admin Note</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p>{selectedProof.adminNote}</p>
                    {selectedProof.verifiedBy && (
                      <p className="text-gray-500 mt-2">
                        By {selectedProof.verifiedBy} on {new Date(selectedProof.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Badge className={getStatusColor(selectedProof.status)}>
                  {selectedProof.status.charAt(0).toUpperCase() + selectedProof.status.slice(1)}
                </Badge>
                
                {selectedProof.status === "pending" && selectedProof.bookingStatus !== 'cancelled' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowDetailsDialog(false)
                        handleReviewProof(selectedProof, "verify")
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Verify
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        setShowDetailsDialog(false)
                        handleReviewProof(selectedProof, "reject")
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">{reviewAction === "verify" ? "Verify Payment" : "Reject Payment"}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              {reviewAction === "verify"
                ? "Confirm that this payment proof is valid and complete."
                : "Provide feedback on why this payment proof is being rejected."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminNote" className="text-xs md:text-sm">{reviewAction === "verify" ? "Note (Optional)" : "Rejection Reason *"}</Label>
              <Textarea
                id="adminNote"
                placeholder={
                  reviewAction === "verify"
                    ? "Add any additional notes..."
                    : "Please provide a clear reason for rejection..."
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required={reviewAction === "reject"}
                className="text-xs md:text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="w-full sm:w-auto text-xs md:text-sm">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              className={`w-full sm:w-auto text-xs md:text-sm ${reviewAction === "verify" ? "bg-green-600 hover:bg-green-700" : ""}`}
              variant={reviewAction === "reject" ? "destructive" : "default"}
            >
              {reviewAction === "verify" ? "Verify Payment" : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center overflow-auto">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Payment proof"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', selectedImage?.substring(0, 100))
                  console.error('Error event:', e)
                }}
                onLoad={() => {
                  console.log('Image loaded successfully')
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-xs md:text-sm">No image to display</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
