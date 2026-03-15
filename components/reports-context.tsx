"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface DashboardStats {
  summary: {
    totalBookings: number
    confirmed: number
    pending: number
    cancelled: number
    completed: number
    totalRevenue: number
    totalUsers: number
    avgRating: string
    totalReviews: number
    unreadMessages: number
    totalMessages: number
  }
  thisMonth: { bookings: number; revenue: number }
  lastMonth: { bookings: number; revenue: number }
  recentBookings: any[]
  monthlyBookings: { month: string; count: number }[]
  monthlyRevenue: { month: string; amount: number }[]
  bookingsByRoom: { area: string; count: number }[]
  statusBreakdown: { status: string; count: number; amount: number }[]
  newSignups: { month: string; count: number }[]
  topCustomers: { name: string; bookings: number; revenue: number }[]
}

interface ReportsContextType {
  stats: DashboardStats | null
  generateReports: () => void
  isLoading: boolean
  // Legacy fields kept for backward compat with reports page
  bookingReport: any
  revenueReport: any
  inquiryReport: any
  customerReport: any
}

const defaultStats: DashboardStats = {
  summary: { totalBookings: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0, totalRevenue: 0, totalUsers: 0, avgRating: '0.0', totalReviews: 0, unreadMessages: 0, totalMessages: 0 },
  thisMonth: { bookings: 0, revenue: 0 },
  lastMonth: { bookings: 0, revenue: 0 },
  recentBookings: [],
  monthlyBookings: [],
  monthlyRevenue: [],
  bookingsByRoom: [],
  statusBreakdown: [],
  newSignups: [],
  topCustomers: [],
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error('Failed to load dashboard stats:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    generateReports()
    // Auto-refresh every 30 seconds
    const interval = setInterval(generateReports, 30000)
    return () => clearInterval(interval)
  }, [generateReports])

  const s = stats || defaultStats

  // Map to legacy shape for reports page
  const bookingReport = {
    totalBookings: s.summary.totalBookings,
    monthlyBookings: s.monthlyBookings.map(m => ({ month: m.month, count: m.count })),
    mostBookedAreas: s.bookingsByRoom,
    peakTimes: [],
    cancellations: s.summary.cancelled,
    noShows: 0,
    occupancyRate: s.bookingsByRoom.map(r => ({
      area: r.area,
      rate: s.summary.totalBookings > 0 ? Math.round((r.count / s.summary.totalBookings) * 100) : 0,
    })),
    dailyBookings: [],
    weeklyBookings: [],
  }

  const revenueReport = {
    totalRevenue: s.summary.totalRevenue,
    monthlyRevenue: s.monthlyRevenue.map(m => ({ month: m.month, amount: m.amount })),
    revenueByEventType: s.bookingsByRoom.map(r => ({ eventType: r.area, amount: 0 })),
    paymentStatus: s.statusBreakdown.map(st => ({
      status: st.status.charAt(0).toUpperCase() + st.status.slice(1),
      count: st.count,
      amount: st.amount,
    })),
    refunds: { total: s.summary.cancelled, amount: 0 },
    dailyRevenue: [],
    revenueByArea: [],
  }

  const inquiryReport = {
    totalInquiries: s.summary.totalMessages,
    dailyInquiries: [],
    weeklyInquiries: [],
    averageResponseTime: 0,
    topTopics: [],
    responseRate: s.summary.totalMessages > 0
      ? Math.round(((s.summary.totalMessages - s.summary.unreadMessages) / s.summary.totalMessages) * 100)
      : 0,
  }

  const customerReport = {
    totalCustomers: s.summary.totalUsers,
    newSignups: s.newSignups,
    repeatCustomers: s.topCustomers.filter(c => c.bookings > 1).length,
    customerRetentionRate: s.summary.totalUsers > 0
      ? Math.round((s.topCustomers.filter(c => c.bookings > 1).length / s.summary.totalUsers) * 100)
      : 0,
    topCustomers: s.topCustomers,
  }

  return (
    <ReportsContext.Provider value={{ stats, generateReports, isLoading, bookingReport, revenueReport, inquiryReport, customerReport }}>
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) throw new Error("useReports must be used within a ReportsProvider")
  return context
}
