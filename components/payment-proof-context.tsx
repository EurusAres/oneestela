"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { FileUploadService, type UploadedFile } from "@/lib/file-upload"

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

  useEffect(() => {
    // Load payment proofs from database on mount
    const loadProofs = async () => {
      try {
        const response = await fetch("/api/payment-proofs")
        if (response.ok) {
          const data = await response.json()
          setPaymentProofs(data.proofs || [])
        }
      } catch (error) {
        console.error("Load payment proofs error:", error)
      }
    }
    loadProofs()
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
      // Upload file first
      const uploadedFile = await fileUploadService.uploadFile(file, bookingId)

      // Send to API
      const response = await fetch("/api/payment-proofs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          fileId: uploadedFile.id,
          fileName: uploadedFile.name,
          fileUrl: uploadedFile.url,
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type,
          ...paymentDetails,
        }),
      })

      if (response.ok) {
        const paymentProof = await response.json()
        setPaymentProofs((prev) => [...prev, paymentProof])
        return paymentProof
      }
      throw new Error("Failed to upload payment proof")
    } catch (error) {
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
        body: JSON.stringify({ status: "verified", verifiedBy: adminId, adminNote: note }),
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
        body: JSON.stringify({ status: "rejected", verifiedBy: adminId, adminNote: note }),
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
