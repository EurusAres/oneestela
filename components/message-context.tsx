"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  message: string
  submittedAt: string
  status: "new" | "read" | "replied"
  priority: "low" | "medium" | "high"
}

interface MessageContextType {
  messages: ContactMessage[]
  addMessage: (message: Omit<ContactMessage, "id" | "submittedAt" | "status" | "priority">) => void
  updateMessageStatus: (id: string, status: ContactMessage["status"]) => void
  getUnreadCount: () => number
  getAllMessages: () => ContactMessage[]
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ContactMessage[]>([])

  useEffect(() => {
    // Load messages from database on mount
    const loadMessages = async () => {
      try {
        const response = await fetch("/api/contact")
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error("Load messages error:", error)
      }
    }
    loadMessages()
  }, [])

  const addMessage = async (messageData: Omit<ContactMessage, "id" | "submittedAt" | "status" | "priority">) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      })
      if (response.ok) {
        const newMessage = await response.json()
        const updatedMessages = [newMessage, ...messages]
        setMessages(updatedMessages)
      }
    } catch (error) {
      console.error("Add message error:", error)
    }
  }

  const updateMessageStatus = async (id: string, status: ContactMessage["status"]) => {
    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        const updatedMessages = messages.map((message) => (message.id === id ? { ...message, status } : message))
        setMessages(updatedMessages)
      }
    } catch (error) {
      console.error("Update message status error:", error)
    }
  }

  const getUnreadCount = () => {
    return messages.filter((message) => message.status === "new").length
  }

  const getAllMessages = () => {
    return messages
  }

  return (
    <MessageContext.Provider value={{ messages, addMessage, updateMessageStatus, getUnreadCount, getAllMessages }}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider")
  }
  return context
}
