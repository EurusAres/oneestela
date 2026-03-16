import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"
import { ChatProvider } from "@/components/chat-context"
import { ChatbotProvider } from "@/components/chatbot-service"
import { BookingProvider } from "@/components/booking-context"
import { MessageProvider } from "@/components/message-context"
import { PaymentProofProvider } from "@/components/payment-proof-context"
import { ReportsProvider } from "@/components/reports-context"
import { CMSProvider } from "@/components/cms-context"
import { StaffProvider } from "@/components/staff-context"
import { UsersProvider } from "@/components/users-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "One Estela Place - Premium Event Venues & Office Spaces",
  description:
    "Discover elegant event venues and modern office spaces at One Estela Place. Perfect for weddings, corporate events, and business operations.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CMSProvider>
            <StaffProvider>
              <UsersProvider>
                <ChatbotProvider>
                  <ChatProvider>
                    <BookingProvider>
                      <MessageProvider>
                        <PaymentProofProvider>
                          <ReportsProvider>
                            {children}
                            <Toaster />
                          </ReportsProvider>
                        </PaymentProofProvider>
                      </MessageProvider>
                    </BookingProvider>
                  </ChatProvider>
                </ChatbotProvider>
              </UsersProvider>
            </StaffProvider>
          </CMSProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
