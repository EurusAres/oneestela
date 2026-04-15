'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'user' | 'staff' | 'admin'
  registeredDate: string
  lastUpdated: string
  status: 'Active' | 'Inactive'
  password?: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: {
    user: number
    staff: number
    admin: number
  }
}

interface UsersContextType {
  users: User[]
  stats: UserStats | null
  isLoading: boolean
  refreshUsers: () => Promise<void>
  getUsersByRole: (role?: string) => User[]
  getUserWithPassword: (id: string) => Promise<User | null>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setStats(data.stats || null)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const getUsersByRole = useCallback((role?: string) => {
    if (!role) return users
    return users.filter(user => user.role === role)
  }, [users])

  const getUserWithPassword = useCallback(async (id: string): Promise<User | null> => {
    try {
      console.log('Fetching user with password for ID:', id);
      const response = await fetch(`/api/users?includePasswords=true`)
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data);
        const user = data.users.find((u: User) => u.id === id)
        console.log('Found user:', user);
        return user || null
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData);
        return null
      }
    } catch (error) {
      console.error('Error fetching user with password:', error)
      return null
    }
  }, [])

  const value: UsersContextType = {
    users,
    stats,
    isLoading,
    refreshUsers,
    getUsersByRole,
    getUserWithPassword,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider')
  }
  return context
}