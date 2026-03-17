"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, User, FileText, Settings, HelpCircle, LogOut, Star } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { LoginDialog } from "@/components/login-dialog"
import { SignupDialog } from "@/components/signup-dialog"
import { TransactionsDialog } from "@/components/transactions-dialog"
import { ProfileDialog } from "@/components/profile-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { SupportDialog } from "@/components/support-dialog"
import { ReserveButton } from "@/components/reserve-button"
import { UnifiedChatWidget } from "@/components/unified-chat-widget"
import { ReviewSubmissionDialog } from "@/components/review-submission-dialog"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Reviews", href: "/customer-reviews" },
    { name: "FAQs", href: "/faqs" },
    { name: "Contact", href: "/contact" },
  ]

  const handleLogout = () => {
    logout()
  }

  // Safe user property access with proper null checks
  const getUserName = () => {
    if (!user) return "User"
    return user.name || "User"
  }

  const getUserEmail = () => {
    if (!user) return ""
    return user.email || ""
  }

  const getUserAvatar = () => {
    if (!user) return "/placeholder.svg?height=40&width=40"
    return user.avatar || "/placeholder.svg?height=40&width=40"
  }

  const getUserInitial = () => {
    const name = getUserName()
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : "U"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-black">
              One Estela Place
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden space-x-8 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-all duration-300 hover:text-gray-700 relative group ${
                    pathname === item.href ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute left-0 bottom-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full ${
                      pathname === item.href ? "w-full" : "w-0"
                    }`}
                  ></span>
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="hidden items-center space-x-4 md:flex">
              {user ? (
                <>
                  <ReserveButton className="bg-blue-600 hover:bg-blue-700">Reserve Now</ReserveButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getUserAvatar() || "/placeholder.svg"} alt={getUserName()} />
                          <AvatarFallback>{getUserInitial()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{getUserName()}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">{getUserEmail()}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowTransactions(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        My Transactions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowReviewDialog(true)}>
                        <Star className="mr-2 h-4 w-4" />
                        Write a Review
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowProfile(true)}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowSettings(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowSupport(true)}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Support / Help Center
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <ReserveButton variant="outline">Reserve Now</ReserveButton>
                  <LoginDialog />
                  <SignupDialog />
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="border-t py-4 md:hidden">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-all duration-300 hover:text-gray-700 relative group ${
                      pathname === item.href ? "text-gray-900" : "text-gray-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                    <span
                      className={`absolute left-0 bottom-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full ${
                        pathname === item.href ? "w-full" : "w-0"
                      }`}
                    ></span>
                  </Link>
                ))}
                <div className="flex flex-col space-y-2 pt-4">
                  <ReserveButton className="w-full">Reserve Now</ReserveButton>
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getUserAvatar() || "/placeholder.svg"} alt={getUserName()} />
                          <AvatarFallback>{getUserInitial()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{getUserName()}</p>
                          <p className="text-xs text-muted-foreground">{getUserEmail()}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setShowTransactions(true)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        My Transactions
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setShowReviewDialog(true)}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Write a Review
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setShowProfile(true)}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setShowSettings(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setShowSupport(true)}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Support / Help Center
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <LoginDialog className="w-full" />
                      <SignupDialog className="w-full" />
                    </div>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">One Estela Place</h3>
              <p className="text-sm text-gray-600">
                The premier event venue for your special occasions and celebrations.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-blue-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="text-gray-600 hover:text-blue-600">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-blue-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Services</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Wedding Receptions</li>
                <li>Corporate Events</li>
                <li>Birthday Parties</li>
                <li>Special Celebrations</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Contact Info</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>123 Event Street</li>
                <li>City, State 12345</li>
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@oneestela.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 One Estela Place. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      {user && <UnifiedChatWidget />}

      {/* Floating Review Button - Only show for logged-in users */}
      {user && (
        <div className="fixed bottom-24 right-6 z-40">
          <ReviewSubmissionDialog
            trigger={
              <Button
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg bg-amber-600 hover:bg-amber-700 transition-all hover:scale-110"
                title="Write a Review"
              >
                <Star className="h-6 w-6" />
              </Button>
            }
            onSuccess={() => {
              // Optional: Show success message or redirect
            }}
          />
        </div>
      )}

      {/* Dialogs */}
      <TransactionsDialog open={showTransactions} onOpenChange={setShowTransactions} />
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <SupportDialog open={showSupport} onOpenChange={setShowSupport} />
      
      {/* Review Dialog - Controlled by menu item */}
      {user && (
        <ReviewSubmissionDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          onSuccess={() => {
            setShowReviewDialog(false)
          }}
        />
      )}
    </div>
  )
}
