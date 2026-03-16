'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface StaffAccount {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: string
  status: 'active' | 'inactive' | 'on_leave'
  createdAt: string
}

interface StaffContextType {
  staff: StaffAccount[]
  isLoading: boolean
  addStaff: (staffData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    position: string
    department: string
    hireDate: string
    salary: string
  }) => Promise<void>
  updateStaff: (id: string, staffData: Partial<StaffAccount>) => Promise<void>
  deactivateStaff: (id: string) => Promise<void>
  activateStaff: (id: string) => Promise<void>
  getStaffById: (id: string) => StaffAccount | undefined
  refreshStaff: () => Promise<void>
}

const StaffContext = createContext<StaffContextType | undefined>(undefined)

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshStaff = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff || [])
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshStaff()
  }, [refreshStaff])

  const addStaff = useCallback(
    async (staffData: {
      firstName: string
      lastName: string
      email: string
      phone: string
      position: string
      department: string
      hireDate: string
      salary: string
    }) => {
      try {
        console.log('addStaff called with:', staffData)
        
        const response = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData),
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        const responseData = await response.json()
        console.log('Response data:', responseData)

        if (response.ok) {
          await refreshStaff()
        } else {
          throw new Error(responseData.error || responseData.details || 'Failed to add staff')
        }
      } catch (error) {
        console.error('Error adding staff:', error)
        throw error
      }
    },
    [refreshStaff],
  )

  const updateStaff = useCallback(
    async (id: string, staffData: Partial<StaffAccount>) => {
      try {
        const response = await fetch(`/api/staff?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData),
        })

        if (response.ok) {
          await refreshStaff()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update staff')
        }
      } catch (error) {
        console.error('Error updating staff:', error)
        throw error
      }
    },
    [refreshStaff],
  )

  const deactivateStaff = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/staff?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'inactive' }),
        })

        if (response.ok) {
          await refreshStaff()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to deactivate staff')
        }
      } catch (error) {
        console.error('Error deactivating staff:', error)
        throw error
      }
    },
    [refreshStaff],
  )

  const activateStaff = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/staff?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' }),
        })

        if (response.ok) {
          await refreshStaff()
        }
      } catch (error) {
        console.error('Error activating staff:', error)
        throw error
      }
    },
    [refreshStaff],
  )

  const getStaffById = useCallback(
    (id: string) => {
      return staff.find((s) => s.id === id)
    },
    [staff],
  )

  const value: StaffContextType = {
    staff,
    isLoading,
    addStaff,
    updateStaff,
    deactivateStaff,
    activateStaff,
    getStaffById,
    refreshStaff,
  }

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
}

export function useStaff() {
  const context = useContext(StaffContext)
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider')
  }
  return context
}