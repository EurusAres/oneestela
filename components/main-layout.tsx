"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  LayoutDashboard,
  FileText,
  Star,
  Users,
  LogOut,
  BookOpen,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { usePaymentProof } from "@/components/payment-proof-context"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { AdminSettingsDialog } from "@/components/admin-settings-dialog"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { getPendingPaymentProofs } = usePaymentProof()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>('admin')
  const [userId, setUserId] = useState<string>('')

  const pendingPayments = getPendingPaymentProofs().length

  // Get user role and ID from localStorage/sessionStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role || 'admin')
        setUserId(user.id || '')
        console.log('User role:', user.role, 'User ID:', user.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setUserRole('admin') // Default to admin if parsing fails
      }
    } else {
      console.log('No user data found, defaulting to admin')
      setUserRole('admin')
    }
  }, [])

  // Define all menu items with role restrictions
  const allMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { name: "Booking Calendar", href: "/calendar", icon: Calendar, roles: ['admin', 'staff'] },
    { name: "Booking Management", href: "/dashboard/bookings", icon: BookOpen, roles: ['admin', 'staff'] },
    { name: "Customer Chat", href: "/dashboard/chat", icon: MessageSquare, roles: ['admin', 'staff'] },
    {
      name: "Payment Verification",
      href: "/dashboard/payments",
      icon: CreditCard,
      badge: pendingPayments > 0 ? pendingPayments : undefined,
      roles: ['admin', 'staff']
    },
    { name: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3, roles: ['admin', 'staff'] },
    { name: "Staff Management", href: "/dashboard/staff", icon: UserCheck, roles: ['admin'] },
    { name: "CMS - Content Management", href: "/dashboard/cms", icon: Settings, roles: ['admin'] },
    { name: "Reviews", href: "/reviews", icon: Star, roles: ['admin'] },
    { name: "Users Information", href: "/users", icon: Users, roles: ['admin'] },
  ]

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole))
  
  console.log('Menu items count:', menuItems.length, 'User role:', userRole)

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    
    // Force full page reload to clear auth state
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Always visible */}
      <aside className="w-64 border-r bg-gray-50 flex-shrink-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center border-b p-4 bg-white">
            <h1 className="text-xl font-bold">One Estela Place</h1>
          </div>
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {item.badge && <Badge className="bg-red-100 text-red-800 text-xs animate-pulse">{item.badge}</Badge>}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4 space-y-2 bg-white">
            {userRole === 'admin' && userId && (
              <AdminSettingsDialog userId={userId} />
            )}
            {userRole === 'staff' && userId && (
              <ChangePasswordDialog userId={userId} userRole={userRole} />
            )}
            <Button variant="outline" className="flex w-full items-center justify-start" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-white">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
