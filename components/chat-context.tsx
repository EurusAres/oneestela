"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-context"
import { ChatSocket } from "@/lib/chat-socket"

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderType: "client" | "admin" | "bot"
  senderAvatar?: string
  content: string
  timestamp: string
  read: boolean
  readBy?: string[]
  recipientId?: string
  escalated?: boolean
  botConversation?: boolean
}

export interface TypingIndicator {
  userId: string
  userType: "client" | "admin"
  userName: string
  isTyping: boolean
}

export interface UserStatus {
  userId: string
  userType: "client" | "admin"
  isOnline: boolean
  lastSeen: string
}

interface ChatContextType {
  messages: ChatMessage[]
  typingIndicators: TypingIndicator[]
  userStatuses: { [key: string]: UserStatus }
  isConnected: boolean
  sendMessage: (content: string, recipientId?: string) => void
  markAsRead: (messageId: string) => void
  startTyping: () => void
  stopTyping: () => void
  getChatHistory: () => ChatMessage[]
  getUnreadCount: () => number
  newMessageNotifications?: string[]
  clearNotifications?: () => void
  escalateFromBot: (botMessages: any[]) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Enhanced chat context with better real-time notifications and chatbot integration
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  const [userStatuses, setUserStatuses] = useState<{ [key: string]: UserStatus }>({})
  const [isConnected, setIsConnected] = useState(false)
  const [newMessageNotifications, setNewMessageNotifications] = useState<string[]>([])
  const chatSocket = useRef<ChatSocket | null>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user) {
      // Initialize chat socket
      const userType = user.email === "demo@oneestela.com" ? "admin" : "client"
      chatSocket.current = new ChatSocket(user.id, userType)

      // Set up event listeners
      chatSocket.current.on("connected", () => {
        setIsConnected(true)
        chatSocket.current?.updateOnlineStatus(true)
      })

      chatSocket.current.on("message", (message: any) => {
        const newMessage: ChatMessage = {
          ...message,
          senderName: message.senderType === "admin" ? "Support Team" : message.senderName || "User",
          senderAvatar:
            message.senderType === "admin"
              ? "/placeholder.svg?height=32&width=32"
              : user.avatar || "/placeholder.svg?height=32&width=32",
        }

        setMessages((prev) => {
          // Avoid duplicate messages
          const exists = prev.some((msg) => msg.id === newMessage.id)
          if (exists) return prev

          return [...prev, newMessage]
        })

        // Add notification for new messages from others
        if (message.senderId !== user.id) {
          setNewMessageNotifications((prev) => [...prev, message.id])

          // Show browser notification if supported
          if (Notification.permission === "granted") {
            new Notification(`New message from ${newMessage.senderName}`, {
              body: newMessage.content,
              icon: newMessage.senderAvatar,
            })
          }
        }
      })

      chatSocket.current.on("messageSent", (message: any) => {
        const newMessage: ChatMessage = {
          ...message,
          senderName: user.name,
          senderAvatar: user.avatar || "/placeholder.svg?height=32&width=32",
        }

        setMessages((prev) => {
          // Avoid duplicate messages
          const exists = prev.some((msg) => msg.id === newMessage.id)
          if (exists) return prev

          return [...prev, newMessage]
        })
      })

      chatSocket.current.on("typingIndicator", (data: any) => {
        setTypingIndicators((prev) => {
          const filtered = prev.filter((t) => t.userId !== data.userId)
          if (data.isTyping) {
            return [
              ...filtered,
              {
                userId: data.userId,
                userType: data.userType,
                userName: data.userType === "admin" ? "Support Team" : "User",
                isTyping: true,
              },
            ]
          }
          return filtered
        })
      })

      chatSocket.current.on("messageRead", (data: any) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, read: true, readBy: [...(msg.readBy || []), data.readBy] } : msg,
          ),
        )

        // Remove from notifications when read
        setNewMessageNotifications((prev) => prev.filter((id) => id !== data.messageId))
      })

      chatSocket.current.on("statusUpdate", (data: any) => {
        setUserStatuses((prev) => ({
          ...prev,
          [data.userId]: {
            userId: data.userId,
            userType: data.userType,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen,
          },
        }))
      })

      // Connect to chat
      chatSocket.current.connect()

      // Load existing messages from localStorage (simulating database)
      const savedMessages = localStorage.getItem(`chat-messages-${user.id}`)
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }

      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }

      // Listen for chatbot escalations
      const handleEscalation = (e: StorageEvent) => {
        if (e.key === "admin-escalation" && e.newValue && user.email === "demo@oneestela.com") {
          const escalation = JSON.parse(e.newValue)

          if (escalation.type === "chatEscalation" || escalation.type === "manualEscalation") {
            // Convert chatbot messages to chat messages
            const botMessages = escalation.chatHistory || []
            escalateFromBot(botMessages)
          }
        }
      }

      window.addEventListener("storage", handleEscalation)

      // Cleanup on unmount
      return () => {
        chatSocket.current?.updateOnlineStatus(false)
        chatSocket.current?.disconnect()
        window.removeEventListener("storage", handleEscalation)
      }
    }
  }, [user])

  // Save messages to localStorage when they change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat-messages-${user.id}`, JSON.stringify(messages))
    }
  }, [messages, user])

  const escalateFromBot = (botMessages: any[]) => {
    // Convert bot messages to chat messages format
    const convertedMessages: ChatMessage[] = botMessages.map((msg, index) => ({
      id: `escalated-${Date.now()}-${index}`,
      senderId: msg.isBot ? "chatbot" : user?.id || "unknown",
      senderName: msg.isBot ? "Virtual Assistant" : user?.name || "User",
      senderType: msg.isBot ? "bot" : "client",
      senderAvatar: msg.isBot ? "/placeholder.svg?height=32&width=32" : user?.avatar,
      content: msg.content,
      timestamp: msg.timestamp,
      read: false,
      escalated: true,
      botConversation: true,
    }))

    // Add escalation notice
    const escalationNotice: ChatMessage = {
      id: `escalation-notice-${Date.now()}`,
      senderId: "system",
      senderName: "System",
      senderType: "bot",
      content:
        "🔄 **Chat Escalated to Human Support** \nThis conversation has been transferred from our virtual assistant. Our support team will continue to assist you.",
      timestamp: new Date().toISOString(),
      read: false,
      escalated: true,
    }

    // Merge with existing messages, avoiding duplicates
    setMessages((prev) => {
      const existingIds = new Set(prev.map((msg) => msg.id))
      const newMessages = convertedMessages.filter((msg) => !existingIds.has(msg.id))
      return [...prev, ...newMessages, escalationNotice]
    })

    // Notify admin
    setTimeout(() => {
      const adminNotification = {
        type: "escalatedChat",
        userId: user?.id,
        userName: user?.name,
        messageCount: convertedMessages.length,
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem("admin-notification", JSON.stringify(adminNotification))
      setTimeout(() => localStorage.removeItem("admin-notification"), 1000)
    }, 500)
  }

  const sendMessage = (content: string, recipientId?: string) => {
    if (chatSocket.current && content.trim()) {
      chatSocket.current.sendMessage(content.trim(), recipientId)
    }
  }

  const markAsRead = (messageId: string) => {
    if (chatSocket.current) {
      chatSocket.current.markAsRead(messageId)
    }
  }

  const startTyping = () => {
    if (chatSocket.current) {
      chatSocket.current.sendTypingIndicator(true)

      // Clear existing timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current)
      }

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeout.current = setTimeout(() => {
        stopTyping()
      }, 3000)
    }
  }

  const stopTyping = () => {
    if (chatSocket.current) {
      chatSocket.current.sendTypingIndicator(false)
    }
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
      typingTimeout.current = null
    }
  }

  const getChatHistory = () => {
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const getUnreadCount = () => {
    return messages.filter((msg) => !msg.read && msg.senderId !== user?.id).length
  }

  const clearNotifications = () => {
    setNewMessageNotifications([])
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        typingIndicators,
        userStatuses,
        isConnected,
        sendMessage,
        markAsRead,
        startTyping,
        stopTyping,
        getChatHistory,
        getUnreadCount,
        newMessageNotifications,
        clearNotifications,
        escalateFromBot,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
