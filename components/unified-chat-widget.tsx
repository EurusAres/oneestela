"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Check,
  CheckCheck,
  UserCircleIcon,Bot,
  User,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { useChat } from "@/components/chat-context"
import { useAuth } from "@/components/auth-context"
import { useChatbot } from "@/components/chatbot-service"
import { cn } from "@/lib/utils"

interface UnifiedMessage {
  id: string
  content: string
  senderType: "user" | "bot" | "admin"
  senderName: string
  senderAvatar?: string
  timestamp: string
  read?: boolean
  followUps?: string[]
  escalated?: boolean
}

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 600
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log("Audio notification not supported")
  }
}

export function UnifiedChatWidget() {
  const { user } = useAuth()
  const {
    messages: chatMessages,
    typingIndicators,
    userStatuses,
    isConnected,
    sendMessage: sendChatMessage,
    markAsRead,
    startTyping,
    stopTyping,
    getChatHistory,
    getUnreadCount,
  } = useChat()

  const {
    messages: botMessages,
    isTyping: botIsTyping,
    sendMessage: sendBotMessage,
    sendFollowUp,
    escalateToHuman,
    isEscalated,
  } = useChatbot()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [unifiedMessages, setUnifiedMessages] = useState<UnifiedMessage[]>([])
  const [isHandedOffToAdmin, setIsHandedOffToAdmin] = useState(false)
  const [adminJoined, setAdminJoined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const unreadCount = getUnreadCount()
  const supportStatus = userStatuses["admin-1"] || { isOnline: false, lastSeen: new Date().toISOString() }

  // Initialize with welcome message
  useEffect(() => {
    if (unifiedMessages.length === 0) {
      const welcomeMessage: UnifiedMessage = {
        id: `welcome-${Date.now()}`,
        content:
          "Hello! Welcome to One Estela Place! 👋 I'm your AI assistant. I can help you with venue availability, office space details, pricing, and reservation steps. How can I assist you today?",
        senderType: "bot",
        senderName: "AI Assistant",
        senderAvatar: "/placeholder.svg?height=32&width=32",
        timestamp: new Date().toISOString(),
        followUps: [
          "Check venue availability",
          "View office spaces",
          "Get pricing information",
          "Learn about reservation process",
        ],
      }
      setUnifiedMessages([welcomeMessage])
    }
  }, [unifiedMessages.length])

  // Merge bot messages into unified thread
  useEffect(() => {
    if (botMessages.length > 0 && !isHandedOffToAdmin) {
      const convertedMessages: UnifiedMessage[] = botMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderType: msg.isBot ? "bot" : "user",
        senderName: msg.isBot ? "AI Assistant" : user?.name || "You",
        senderAvatar: msg.isBot ? "/placeholder.svg?height=32&width=32" : user?.avatar,
        timestamp: msg.timestamp,
        followUps: msg.followUps,
        escalated: msg.escalated,
      }))

      setUnifiedMessages(convertedMessages)
    }
  }, [botMessages, isHandedOffToAdmin, user])

  // Handle escalation to admin
  useEffect(() => {
    if (isEscalated && !isHandedOffToAdmin) {
      setIsHandedOffToAdmin(true)

      // Add handoff message
      const handoffMessage: UnifiedMessage = {
        id: `handoff-${Date.now()}`,
        content:
          "🔄 **Connecting you with our support team...** \n\nI'm transferring you to one of our specialists who can provide more detailed assistance. Please hold on while I connect you.",
        senderType: "bot",
        senderName: "AI Assistant",
        senderAvatar: "/placeholder.svg?height=32&width=32",
        timestamp: new Date().toISOString(),
        escalated: true,
      }

      setUnifiedMessages((prev) => [...prev, handoffMessage])

      // Simulate admin joining after a short delay
      setTimeout(() => {
        setAdminJoined(true)
        const adminJoinMessage: UnifiedMessage = {
          id: `admin-join-${Date.now()}`,
          content:
            "Hello! I'm here to help you. I can see our AI assistant has been helping you, and I'm ready to continue from where we left off. How can I assist you further?",
          senderType: "admin",
          senderName: "Support Team",
          senderAvatar: "/placeholder.svg?height=32&width=32",
          timestamp: new Date().toISOString(),
        }
        setUnifiedMessages((prev) => [...prev, adminJoinMessage])
      }, 2000)

      // Notify admin about escalation
      setTimeout(() => {
        const escalationNotification = {
          type: "chatEscalation",
          userId: user?.id,
          userName: user?.name,
          chatHistory: unifiedMessages,
          timestamp: new Date().toISOString(),
        }

        localStorage.setItem("admin-escalation", JSON.stringify(escalationNotification))
        setTimeout(() => localStorage.removeItem("admin-escalation"), 1000)
      }, 500)
    }
  }, [isEscalated, isHandedOffToAdmin, unifiedMessages, user])

  // Merge admin messages from chat context
  useEffect(() => {
    if (isHandedOffToAdmin && adminJoined) {
      const adminMessages = getChatHistory().filter(
        (msg) => msg.senderType === "admin" && !unifiedMessages.some((um) => um.id === msg.id),
      )

      if (adminMessages.length > 0) {
        const convertedAdminMessages: UnifiedMessage[] = adminMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderType: "admin",
          senderName: "Support Team",
          senderAvatar: "/placeholder.svg?height=32&width=32",
          timestamp: msg.timestamp,
          read: msg.read,
        }))

        setUnifiedMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const newMessages = convertedAdminMessages.filter((m) => !existingIds.has(m.id))
          if (newMessages.length > 0) {
            return [...prev, ...newMessages].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            )
          }
          return prev
        })
      }
    }
  }, [getChatHistory, isHandedOffToAdmin, adminJoined, unifiedMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [unifiedMessages, typingIndicators, botIsTyping])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && isHandedOffToAdmin) {
      getChatHistory()
        .filter((msg) => !msg.read && msg.senderId !== user?.id)
        .forEach((msg) => markAsRead(msg.id))
    }
  }, [isOpen, isMinimized, isHandedOffToAdmin, getChatHistory, user?.id, markAsRead])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    // Add user message to unified thread
    const userMessage: UnifiedMessage = {
      id: `user-${Date.now()}`,
      content: messageInput.trim(),
      senderType: "user",
      senderName: user?.name || "You",
      senderAvatar: user?.avatar,
      timestamp: new Date().toISOString(),
    }

    setUnifiedMessages((prev) => [...prev, userMessage])

    if (isHandedOffToAdmin && adminJoined) {
      // Send to admin via chat system
      sendChatMessage(messageInput)
      stopTyping()
      setIsTyping(false)
    } else {
      // Send to bot
      await sendBotMessage(messageInput)
    }

    setMessageInput("")
  }

  const handleFollowUpClick = async (followUp: string) => {
    // Add user message for follow-up
    const userMessage: UnifiedMessage = {
      id: `user-followup-${Date.now()}`,
      content: followUp,
      senderType: "user",
      senderName: user?.name || "You",
      senderAvatar: user?.avatar,
      timestamp: new Date().toISOString(),
    }

    setUnifiedMessages((prev) => [...prev, userMessage])

    if (isHandedOffToAdmin && adminJoined) {
      sendChatMessage(followUp)
    } else {
      await sendFollowUp(followUp)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    if (isHandedOffToAdmin && adminJoined) {
      if (!isTyping && e.target.value.trim()) {
        setIsTyping(true)
        startTyping()
      } else if (isTyping && !e.target.value.trim()) {
        setIsTyping(false)
        stopTyping()
      }
    }
  }

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date()
    const lastSeenDate = new Date(lastSeen)
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return lastSeenDate.toLocaleDateString()
  }

  if (!user) return null

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg relative group"
            size="icon"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            {!isHandedOffToAdmin && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              </div>
            )}
            {isHandedOffToAdmin && adminJoined && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                <User className="h-2 w-2 text-white" />
              </div>
            )}
            {unreadCount > 0 && isHandedOffToAdmin && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <div className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {!isHandedOffToAdmin
                ? "Chat with AI Assistant"
                : adminJoined
                  ? "Chat with Support Team"
                  : "Connecting to Support..."}
            </div>
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border transition-all duration-300 flex flex-col",
            isMinimized ? "w-80 h-14" : "w-96 h-[520px] md:w-[420px] md:h-[580px]",
          )}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>{!isHandedOffToAdmin ? "AI" : adminJoined ? "ST" : "..."}</AvatarFallback>
                </Avatar>
                {!isHandedOffToAdmin && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center">
                    <Bot className="h-2 w-2 text-white" />
                  </div>
                )}
                {isHandedOffToAdmin && adminJoined && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white flex items-center justify-center">
                    <User className="h-1.5 w-1.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm flex items-center space-x-2">
                  {!isHandedOffToAdmin ? (
                    <span>One Estela Place</span>
                  ) : adminJoined ? (
                    <>
                      <User className="h-4 w-4" />
                      <span>Support Team</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 animate-pulse" />
                      <span>Connecting...</span>
                    </>
                  )}
                </h3>
                <div className="flex items-center space-x-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      !isHandedOffToAdmin
                        ? "bg-green-400"
                        : adminJoined && supportStatus.isOnline
                          ? "bg-green-400"
                          : isHandedOffToAdmin && !adminJoined
                            ? "bg-yellow-400 animate-pulse"
                            : "bg-gray-400",
                    )}
                  />
                  <span className="text-xs opacity-90">
                    {!isHandedOffToAdmin
                      ? "Always available"
                      : adminJoined
                        ? supportStatus.isOnline
                          ? "Online"
                          : `Last seen ${formatLastSeen(supportStatus.lastSeen)}`
                        : "Connecting to support..."}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {isHandedOffToAdmin && !isConnected && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Connecting..." />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-blue-700"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Status Bar */}
              {isHandedOffToAdmin && (
                <div className="px-4 py-2 bg-purple-50 border-b border-purple-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">
                      {adminJoined ? "🤖➡️👨‍💼 Connected with Support Team" : "🔄 Transferring to Support Team..."}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    {adminJoined
                      ? "Our team can see the full conversation history and will continue to help you."
                      : "Please wait while we connect you with a human specialist."}
                  </p>
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 h-[280px] md:h-[340px] p-4">
                <div className="space-y-4">
                  {unifiedMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">Start a conversation!</p>
                      <p className="text-xs text-gray-400 mt-1">I can help with venue info, pricing, and bookings</p>
                    </div>
                  ) : (
                    unifiedMessages.map((message, index) => (
                      <div key={message.id}>
                        <div className={cn("flex", message.senderType === "user" ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "flex items-end space-x-2 max-w-[85%]",
                              message.senderType === "user" ? "flex-row-reverse space-x-reverse" : "flex-row",
                            )}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {message.senderType === "bot" ? "AI" : message.senderType === "admin" ? "ST" : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                "rounded-lg px-3 py-2 relative",
                                message.senderType === "bot"
                                  ? "bg-green-600 text-white"
                                  : message.senderType === "admin"
                                    ? "bg-purple-600 text-white"
                                    : "bg-blue-600 text-white",
                              )}
                            >
                              <div className="flex items-start space-x-2">
                                {message.senderType === "bot" && <Sparkles className="h-3 w-3 mt-0.5 text-green-200" />}
                                {message.senderType === "admin" && <User className="h-3 w-3 mt-0.5 text-purple-200" />}
                                <div className="flex-1">
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <div
                                    className={cn(
                                      "flex items-center justify-between mt-1 space-x-2",
                                      message.senderType === "bot"
                                        ? "text-green-100"
                                        : message.senderType === "admin"
                                          ? "text-purple-100"
                                          : "text-blue-100",
                                    )}
                                  >
                                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                                    {message.senderType === "user" && isHandedOffToAdmin && (
                                      <div className="flex items-center">
                                        {message.read ? (
                                          <CheckCheck className="h-3 w-3" />
                                        ) : (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {message.escalated && (
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                  <AlertCircle className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Follow-up suggestions for bot messages */}
                        {message.senderType === "bot" &&
                          message.followUps &&
                          message.followUps.length > 0 &&
                          index === unifiedMessages.length - 1 &&
                          !isHandedOffToAdmin && (
                            <div className="mt-2 flex flex-wrap gap-2 justify-start">
                              {message.followUps.map((followUp, followUpIndex) => (
                                <Button
                                  key={followUpIndex}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFollowUpClick(followUp)}
                                  className="text-xs h-7 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                >
                                  {followUp}
                                </Button>
                              ))}
                            </div>
                          )}
                      </div>
                    ))
                  )}

                  {/* Typing Indicators */}
                  {isHandedOffToAdmin &&
                    adminJoined &&
                    typingIndicators
                      .filter((indicator) => indicator.userId !== user.id)
                      .map((indicator) => (
                        <div key={indicator.userId} className="flex justify-start">
                          <div className="flex items-end space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/placeholder.svg?height=24&width=24" />
                              <AvatarFallback>ST</AvatarFallback>
                            </Avatar>
                            <div className="bg-purple-100 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                  <div
                                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  />
                                  <div
                                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  />
                                </div>
                                <span className="text-xs text-purple-600">Support team is typing...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                  {/* Bot typing indicator */}
                  {!isHandedOffToAdmin && botIsTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-green-100 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                            <span className="text-xs text-green-600">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    placeholder={
                      !isHandedOffToAdmin
                        ? "Ask me about venues, pricing, or bookings..."
                        : adminJoined
                          ? "Type your message..."
                          : "Please wait while we connect you..."
                    }
                    className="flex-1"
                    disabled={isHandedOffToAdmin && (!isConnected || !adminJoined)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageInput.trim() || (isHandedOffToAdmin && (!isConnected || !adminJoined))}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                {!isHandedOffToAdmin && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                  </p>
                )}
                {isHandedOffToAdmin && !adminJoined && (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                    Connecting to support team...
                  </p>
                )}
                {isHandedOffToAdmin && adminJoined && !isConnected && (
                  <p className="text-xs text-gray-500 mt-1">Connecting to chat...</p>
                )}
                {isHandedOffToAdmin && adminJoined && isConnected && (
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    Support Team • Real-time chat
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
