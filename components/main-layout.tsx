"use client"

import type React from "react"

import { useState } from "react"
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
import { useMessages } from "@/components/message-context"
import { usePaymentProof } from "@/components/payment-proof-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { getUnreadCount } = useMessages()
  const { getPendingPaymentProofs } = usePaymentProof()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const unreadCount = getUnreadCount()
  const pendingPayments = getPendingPaymentProofs().length

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Booking Calendar", href: "/calendar", icon: Calendar },
    { name: "Booking Management", href: "/dashboard/bookings", icon: BookOpen },
    {
      name: "Contact Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: "Customer Chat", href: "/dashboard/chat", icon: MessageSquare },
    {
      name: "Payment Verification",
      href: "/dashboard/payments",
      icon: CreditCard,
      badge: pendingPayments > 0 ? pendingPayments : undefined,
    },
    { name: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Staff Management", href: "/dashboard/staff", icon: UserCheck },
    { name: "CMS - Content Management", href: "/dashboard/cms", icon: Settings },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Users Information", href: "/users", icon: Users },
  ]

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="flex items-center justify-between border-b p-4 md:hidden">
        <h1 className="text-xl font-bold">One Estela Place</h1>
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span className="sr-only">Toggle menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } w-full border-r bg-white md:block md:w-64 md:flex-shrink-0 md:sticky md:top-0 md:h-screen`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center justify-center border-b p-4 md:flex">
            <h1 className="text-xl font-bold">One Estela Place</h1>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
          <div className="border-t p-4">
            <Button variant="outline" className="flex w-full items-center justify-start bg-transparent" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
