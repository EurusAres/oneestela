"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { FileUploadService, type UploadedFile } from "@/lib/file-upload"
import { useAuth } from "@/components/auth-context"

export interface PaymentProof {
  id: string
  bookingId: string
  fileId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedAt: string
  uploadedBy: string
  status: "pending" | "verified" | "rejected"
  verifiedAt?: string
  verifiedBy?: string
  adminNote?: string
  paymentMethod: string
  paymentAmount: string
  paymentDate: string
  paymentReference?: string
  customerName?: string
  customerEmail?: string
  eventName?: string
  roomName?: string
}

interface PaymentProofContextType {
  paymentProofs: PaymentProof[]
  uploadPaymentProof: (
    bookingId: string,
    file: File,
    paymentDetails: {
      paymentMethod: string
      paymentAmount: string
      paymentDate: string
      paymentReference?: string
    },
  ) => Promise<PaymentProof>
  getPaymentProofByBooking: (bookingId: string) => PaymentProof | undefined
  getAllPaymentProofs: () => PaymentProof[]
  getPendingPaymentProofs: () => PaymentProof[]
  verifyPaymentProof: (proofId: string, adminId: string, note?: string) => void
  rejectPaymentProof: (proofId: string, adminId: string, note: string) => void
  getPaymentProofFile: (fileId: string) => UploadedFile | null
}

const PaymentProofContext = createContext<PaymentProofContextType | undefined>(undefined)

export function PaymentProofProvider({ children }: { children: React.ReactNode }) {
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])
  const fileUploadService = FileUploadService.getInstance()
  const { user } = useAuth()

  useEffect(() => {
    // Load payment proofs from database on mount
    const loadProofs = async () => {
      try {
        console.log('Fetching payment proofs from API...')
        const response = await fetch("/api/payment-proofs")
        console.log('API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Raw API data:', data)
          console.log('Number of proofs:', data.proofs?.length || 0)
          
          // Map database fields to expected interface
          const mappedProofs = (data.proofs || []).map((proof: any) => {
            console.log('Mapping proof:', proof)
            const mapped = {
              id: proof.id?.toString() || '',
              bookingId: proof.booking_id?.toString() || '',
              fileId: proof.id?.toString() || '', // Use proof id as fileId
              fileName: 'payment-proof.jpg', // Default filename
              fileUrl: proof.proof_url || '',
              fileSize: 0, // Not stored in DB
              fileType: 'image/jpeg', // Default type
              uploadedAt: proof.created_at || new Date().toISOString(),
              uploadedBy: proof.user_id?.toString() || '',
              status: proof.status || 'pending',
              verifiedAt: proof.updated_at,
              verifiedBy: '',
              adminNote: proof.verification_notes || '',
              paymentMethod: proof.payment_method || '',
              paymentAmount: proof.amount?.toString() || '0',
              paymentDate: proof.created_at || new Date().toISOString(),
              paymentReference: '',
              customerName: proof.customer_name || 'Unknown',
              customerEmail: proof.customer_email || '',
              eventName: proof.event_name || proof.room_name || 'Booking',
              eventType: proof.event_type || 'general',
              roomName: proof.room_name || '',
            }
            console.log('Mapped proof fileUrl:', mapped.fileUrl?.substring(0, 100))
            return mapped
          })
          
          console.log('Mapped payment proofs:', mappedProofs)
          setPaymentProofs(mappedProofs)
        } else {
          console.error('API returned error status:', response.status)
        }
      } catch (error) {
        console.error("Load payment proofs error:", error)
      }
    }
    
    loadProofs()
    
    // Listen for booking cancellations and payment verifications to reload proofs
    const handleBookingCancelled = () => {
      loadProofs()
    }
    
    const handlePaymentVerified = () => {
      loadProofs()
    }
    
    window.addEventListener('booking-cancelled', handleBookingCancelled)
    window.addEventListener('payment-verified', handlePaymentVerified)
    
    return () => {
      window.removeEventListener('booking-cancelled', handleBookingCancelled)
      window.removeEventListener('payment-verified', handlePaymentVerified)
    }
  }, [])

  const uploadPaymentProof = async (
    bookingId: string,
    file: File,
    paymentDetails: {
      paymentMethod: string
      paymentAmount: string
      paymentDate: string
      paymentReference?: string
    },
  ): Promise<PaymentProof> => {
    try {
      // Check if user is authenticated
      if (!user || !user.id) {
        throw new Error("User not authenticated. Please log in to upload payment proof.")
      }
      
      console.log('Uploading payment proof:', {
        bookingId,
        userId: user.id,
        paymentDetails,
        fileName: file.name
      })
      
      // Upload file first
      const uploadedFile = await fileUploadService.uploadFile(file, bookingId)
      
      console.log('File uploaded:', uploadedFile)

      // Send to API with correct field names matching database
      const requestBody = {
        bookingId,
        userId: user.id,
        fileUrl: uploadedFile.url,
        paymentMethod: paymentDetails.paymentMethod,
        paymentAmount: paymentDetails.paymentAmount,
      }
      
      console.log('Sending to API:', requestBody)

      const response = await fetch("/api/payment-proofs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const dbProof = await response.json()
        console.log('Created payment proof:', dbProof)
        
        // Map database response to expected interface
        const paymentProof = {
          id: dbProof.id?.toString() || '',
          bookingId: dbProof.booking_id?.toString() || bookingId,
          fileId: dbProof.id?.toString() || '',
          fileName: uploadedFile.name || 'payment-proof.jpg',
          fileUrl: dbProof.proof_url || uploadedFile.url,
          fileSize: uploadedFile.size || 0,
          fileType: uploadedFile.type || 'image/jpeg',
          uploadedAt: dbProof.created_at || new Date().toISOString(),
          uploadedBy: dbProof.user_id?.toString() || user.id,
          status: dbProof.status || 'pending',
          verifiedAt: dbProof.updated_at,
          verifiedBy: '',
          adminNote: dbProof.verification_notes || '',
          paymentMethod: dbProof.payment_method || paymentDetails.paymentMethod,
          paymentAmount: dbProof.amount?.toString() || paymentDetails.paymentAmount,
          paymentDate: dbProof.created_at || new Date().toISOString(),
          paymentReference: paymentDetails.paymentReference || '',
        }
        
        setPaymentProofs((prev) => [...prev, paymentProof])
        return paymentProof
      }
      
      const errorData = await response.json()
      console.error('API error response:', errorData)
      throw new Error(errorData.error || "Failed to upload payment proof")
    } catch (error) {
      console.error('Upload payment proof error:', error)
      throw new Error(`Failed to upload payment proof: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const getPaymentProofByBooking = (bookingId: string): PaymentProof | undefined => {
    return paymentProofs.find((proof) => proof.bookingId === bookingId)
  }

  const getAllPaymentProofs = (): PaymentProof[] => {
    return paymentProofs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }

  const getPendingPaymentProofs = (): PaymentProof[] => {
    return paymentProofs.filter((proof) => proof.status === "pending")
  }

  const verifyPaymentProof = async (proofId: string, adminId: string, note?: string) => {
    try {
      const response = await fetch(`/api/payment-proofs?id=${proofId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified", verificationNotes: note }),
      })
      if (response.ok) {
        setPaymentProofs((prev) =>
          prev.map((proof) =>
            proof.id === proofId
              ? {
                  ...proof,
                  status: "verified" as const,
                  verifiedAt: new Date().toISOString(),
                  verifiedBy: adminId,
                  adminNote: note,
                }
              : proof,
          ),
        )
      }
    } catch (error) {
      console.error("Verify payment proof error:", error)
    }
  }

  const rejectPaymentProof = async (proofId: string, adminId: string, note: string) => {
    try {
      const response = await fetch(`/api/payment-proofs?id=${proofId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", verificationNotes: note }),
      })
      if (response.ok) {
        setPaymentProofs((prev) =>
          prev.map((proof) =>
            proof.id === proofId
              ? {
                  ...proof,
                  status: "rejected" as const,
                  verifiedAt: new Date().toISOString(),
                  verifiedBy: adminId,
                  adminNote: note,
                }
              : proof,
          ),
        )
      }
    } catch (error) {
      console.error("Reject payment proof error:", error)
    }
  }

  const getPaymentProofFile = (fileId: string): UploadedFile | null => {
    return fileUploadService.getFile(fileId)
  }

  return (
    <PaymentProofContext.Provider
      value={{
        paymentProofs,
        uploadPaymentProof,
        getPaymentProofByBooking,
        getAllPaymentProofs,
        getPendingPaymentProofs,
        verifyPaymentProof,
        rejectPaymentProof,
        getPaymentProofFile,
      }}
    >
      {children}
    </PaymentProofContext.Provider>
  )
}

export function usePaymentProof() {
  const context = useContext(PaymentProofContext)
  if (context === undefined) {
    throw new Error("usePaymentProof must be used within a PaymentProofProvider")
  }
  return context
}
