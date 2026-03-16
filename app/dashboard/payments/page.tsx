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
  const [reviewAction, setReviewAction] = useState<"verify" | "reject">("verify")
  const [adminNote, setAdminNote] = useState("")
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

  const allProofs = getAllPaymentProofs()
  const pendingProofs = getPendingPaymentProofs()
  const verifiedProofs = allProofs.filter((proof) => proof.status === "verified")
  const rejectedProofs = allProofs.filter((proof) => proof.status === "rejected")
  
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
  
  const cancelledProofs = proofsWithBookingStatus.filter(
    proof => proof.bookingStatus === 'cancelled'
  )

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
    console.log('Rendering PaymentProofCard with proof:', proof)
    console.log('Proof fileUrl:', proof.fileUrl)
    
    const isCancelled = proof.bookingStatus === 'cancelled'
    
    return (
      <Card className={`mb-4 ${isCancelled ? 'border-red-300 bg-red-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(proof.status)}
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {proof.eventName || "Booking"}
                  {isCancelled && (
                    <Badge className="bg-red-100 text-red-800">
                      Booking Cancelled
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Booking ID: {proof.bookingId} • Uploaded {new Date(proof.uploadedAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(proof.status)}>
              {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isCancelled && (
            <div className="bg-red-100 border border-red-300 p-4 rounded-lg mb-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This booking has been cancelled by the customer. Payment proof is no longer valid.
              </p>
              <p className="text-xs text-red-700 mt-1">
                Refund processing may be required based on cancellation policy.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-gray-600">{proof.paymentMethod}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Amount</p>
                <p className="text-sm text-gray-600">₱{Number(proof.paymentAmount).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Payment Date</p>
                <p className="text-sm text-gray-600">{new Date(proof.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Customer</p>
                <p className="text-sm text-gray-600">{proof.customerName || "Unknown"}</p>
                {proof.customerEmail && (
                  <p className="text-xs text-gray-500">{proof.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {proof.paymentReference && (
            <div className="mb-4">
              <p className="text-sm font-medium">Reference Number</p>
              <p className="text-sm text-gray-600">{proof.paymentReference}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileImage className="h-4 w-4" />
              <span className="text-sm">{proof.fileName}</span>
              <span className="text-xs text-gray-500">({formatFileSize(proof.fileSize)})</span>
            </div>
          </div>

          {proof.adminNote && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium">Admin Note:</p>
              <p className="text-sm text-gray-600 mt-1">{proof.adminNote}</p>
              {proof.verifiedBy && (
                <p className="text-xs text-gray-500 mt-2">
                  By {proof.verifiedBy} on {new Date(proof.verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleViewImage(proof)}>
              <Eye className="h-4 w-4 mr-2" />
              View File
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownloadFile(proof)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {proof.status === "pending" && !isCancelled && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleReviewProof(proof, "verify")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleReviewProof(proof, "reject")}>
                  <XCircle className="h-4 w-4 mr-2" />
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
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Cancelled
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Verification</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileImage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allProofs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingProofs.length}</div>
              {pendingProofs.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 mt-2">Needs Attention</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedProofs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedProofs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cancelledProofs.length}</div>
              {cancelledProofs.length > 0 && (
                <Badge className="bg-red-100 text-red-800 mt-2">Refund Required</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Proofs Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingProofs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="verified">
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified ({verifiedProofs.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected ({rejectedProofs.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-red-600">
              <XCircle className="h-4 w-4 mr-2" />
              Cancelled ({cancelledProofs.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({allProofs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingProofs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No pending payment proofs</p>
                  </CardContent>
                </Card>
              ) : (
                proofsWithBookingStatus
                  .filter(p => p.status === 'pending')
                  .map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)
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
                proofsWithBookingStatus
                  .filter(p => p.status === 'verified')
                  .map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)
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
                proofsWithBookingStatus
                  .filter(p => p.status === 'rejected')
                  .map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)
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

          <TabsContent value="all">
            <div className="space-y-4">
              {allProofs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No payment proofs submitted yet</p>
                  </CardContent>
                </Card>
              ) : (
                proofsWithBookingStatus.map((proof) => <PaymentProofCard key={proof.id} proof={proof} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{reviewAction === "verify" ? "Verify Payment" : "Reject Payment"}</DialogTitle>
            <DialogDescription>
              {reviewAction === "verify"
                ? "Confirm that this payment proof is valid and complete."
                : "Provide feedback on why this payment proof is being rejected."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminNote">{reviewAction === "verify" ? "Note (Optional)" : "Rejection Reason *"}</Label>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              className={reviewAction === "verify" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={reviewAction === "reject" ? "destructive" : "default"}
            >
              {reviewAction === "verify" ? "Verify Payment" : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
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
                <p className="text-gray-500">No image to display</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
