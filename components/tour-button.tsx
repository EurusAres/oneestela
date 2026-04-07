"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { VirtualTour } from "@/components/virtual-tour"
import { ReserveDialog } from "@/components/reserve-dialog"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Camera } from "lucide-react"

interface TourButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function TourButton({ children, className, size, variant }: TourButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showTour, setShowTour] = useState(false)
  const [showReserveDialog, setShowReserveDialog] = useState(false)
  const [preSelectedSpace, setPreSelectedSpace] = useState<{type: string, id: string, name: string, capacity?: number} | null>(null)

  const handleTourClick = () => {
    setShowTour(true)
  }

  const handleBookSpace = (spaceType: string, spaceId: string, spaceName: string, capacity?: number) => {
    setPreSelectedSpace({ type: spaceType, id: spaceId, name: spaceName, capacity })
    setShowReserveDialog(true)
  }

  return (
    <>
      <Button className={className} size={size} variant={variant} onClick={handleTourClick}>
        <Camera className="mr-2 h-4 w-4" />
        {children}
      </Button>

      <VirtualTour 
        open={showTour} 
        onOpenChange={setShowTour} 
        onBookSpace={handleBookSpace}
      />

      <ReserveDialog 
        open={showReserveDialog} 
        onOpenChange={setShowReserveDialog}
        preSelectedSpace={preSelectedSpace}
      />
    </>
  )
}
