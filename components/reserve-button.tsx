"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReserveDialog } from "@/components/reserve-dialog"

interface ReserveButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: boolean
  disabledMessage?: string
}

export function ReserveButton({ children, className, size, variant, disabled, disabledMessage }: ReserveButtonProps) {
  const [showReserve, setShowReserve] = useState(false)

  const handleClick = () => {
    if (disabled && disabledMessage) {
      // You could show a toast here if needed
      return
    }
    setShowReserve(true)
  }

  return (
    <>
      <Button 
        className={className} 
        size={size} 
        variant={variant} 
        disabled={disabled}
        onClick={handleClick}
        title={disabled ? disabledMessage : undefined}
      >
        {children}
      </Button>
      <ReserveDialog open={showReserve} onOpenChange={setShowReserve} />
    </>
  )
}
