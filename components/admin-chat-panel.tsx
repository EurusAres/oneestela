"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Send, Search, Check, CheckCheck, Users, Bot, AlertCircle, Sparkles } from "lucide-react"
import { useChat } from "@/components/chat-context"
import { useAuth } from "@/components/auth-context"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface ChatConversation {
  userId: string
  userName: string
  userAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  userType: "client"
  hasNewNotification?: boolean
  isEscalated?: boolean
  hasBotHistory?: boolean
}

// Enhanced admin chat panel with chatbot escalation support
export function AdminChatPanel() {
  const { user } = useAuth()
  const {
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
  } = useChat()

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [lastNotificationSound, setLastNotificationSound] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const chatHistory = getChatHistory()
  const totalUnreadCount = getUnreadCount()

  const playAdminNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different tone for admin notifications
      oscillator.frequency.value = 800
      oscillator.type = "sine"
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log("Audio notification not supported")
    }
  }

  // Play notification sound for new messages (throttled)
  useEffect(() => {
    if (newMessageNotifications && newMessageNotifications.length > 0) {
      const now = Date.now()
      if (now - lastNotificationSound > 2000) {
        // Throttle to once every 2 seconds
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.value = 800
          oscillator.type = "sine"
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)

          setLastNotificationSound(now)
        } catch (error) {
          console.log("Audio notification not supported")
        }
      }

      // Show toast notification for new messages
      const latestMessage = chatHistory.find(
        (msg) => newMessageNotifications.includes(msg.id) && msg.senderId !== user?.id,
      )

      if (latestMessage) {
        toast({
          title: `New message from ${latestMessage.senderName}`,
          description:
            latestMessage.content.length > 50 ? latestMessage.content.substring(0, 50) + "..." : latestMessage.content,
          duration: 5000,
        })
      }
    }
  }, [newMessageNotifications, chatHistory, user?.id, toast, lastNotificationSound])

  // Listen for new customer inquiries and escalations
  useEffect(() => {
    const handleNotifications = (e: StorageEvent) => {
      if (e.key === "admin-notification" && e.newValue) {
        const notification = JSON.parse(e.newValue)

        if (notification.type === "newInquiry") {
          // Play notification sound
          playAdminNotificationSound()

          // Show toast notification
          toast({
            title: "🔔 New Customer Inquiry",
            description: `${notification.customerName} started a conversation: "${notification.message.substring(0, 50)}${notification.message.length > 50 ? "..." : ""}"`,
            duration: 8000,
          })

          // Auto-select the new conversation if no conversation is currently selected
          if (!selectedConversation) {
            setTimeout(() => {
              setSelectedConversation(notification.customerId)
            }, 1000)
          }
        } else if (notification.type === "escalatedChat") {
          // Play escalation notification sound
          playAdminNotificationSound()

          // Show escalation toast
          toast({
            title: "🤖➡️👨‍💼 Chat Escalated from AI",
            description: `${notification.userName} was transferred from our AI assistant. ${notification.messageCount} messages in history.`,
            duration: 10000,
          })

          // Auto-select the escalated conversation
          if (!selectedConversation) {
            setTimeout(() => {
              setSelectedConversation(notification.userId)
            }, 1000)
          }
        }
      }
    }

    window.addEventListener("storage", handleNotifications)
    return () => window.removeEventListener("storage", handleNotifications)
  }, [selectedConversation, toast])

  // Group messages by user to create conversations
  const conversations: ChatConversation[] = React.useMemo(() => {
    const userMessages = chatHistory.reduce(
      (acc, message) => {
        const userId = message.senderId === user?.id ? message.recipientId || "unknown" : message.senderId
        if (!acc[userId]) {
          acc[userId] = []
        }
        acc[userId].push(message)
        return acc
      },
      {} as { [key: string]: typeof chatHistory },
    )

    return Object.entries(userMessages)
      .map(([userId, messages]) => {
        const lastMessage = messages[messages.length - 1]
        const unreadCount = messages.filter((msg) => !msg.read && msg.senderId !== user?.id).length
        const userStatus = userStatuses[userId]
        const hasNewNotification = messages.some((msg) => newMessageNotifications.includes(msg.id))
        const isEscalated = messages.some((msg) => msg.escalated)
        const hasBotHistory = messages.some((msg) => msg.senderType === "bot" || msg.botConversation)

        return {
          userId,
          userName: lastMessage.senderName || "Unknown User",
          userAvatar: lastMessage.senderAvatar || "/placeholder.svg?height=40&width=40",
          lastMessage: lastMessage.content,
          lastMessageTime: lastMessage.timestamp,
          unreadCount,
          isOnline: userStatus?.isOnline || false,
          userType: "client" as const,
          hasNewNotification,
          isEscalated,
          hasBotHistory,
        }
      })
      .sort((a, b) => {
        // Sort by: escalated first, then new notifications, then unread count, then timestamp
        if (a.isEscalated && !b.isEscalated) return -1
        if (!a.isEscalated && b.isEscalated) return 1
        if (a.hasNewNotification && !b.hasNewNotification) return -1
        if (!a.hasNewNotification && b.hasNewNotification) return 1
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      })
  }, [chatHistory, user?.id, userStatuses, newMessageNotifications])

  const selectedMessages = selectedConversation
    ? chatHistory.filter(
        (msg) =>
          msg.senderId === selectedConversation ||
          msg.recipientId === selectedConversation ||
          (msg.senderId === user?.id && msg.recipientId === selectedConversation),
      )
    : []

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedMessages, typingIndicators])

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      selectedMessages.filter((msg) => !msg.read && msg.senderId !== user?.id).forEach((msg) => markAsRead(msg.id))

      // Clear notifications for this conversation
      const conversationNotifications = selectedMessages
        .filter((msg) => newMessageNotifications.includes(msg.id))
        .map((msg) => msg.id)

      if (conversationNotifications.length > 0) {
        clearNotifications()
      }
    }
  }, [selectedConversation, selectedMessages, user?.id, markAsRead, newMessageNotifications, clearNotifications])

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [selectedConversation])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim() && selectedConversation) {
      sendMessage(messageInput, selectedConversation)
      setMessageInput("")
      stopTyping()
      setIsTyping(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      startTyping()
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false)
      stopTyping()
    }
  }

  const handleConversationSelect = (userId: string) => {
    setSelectedConversation(userId)

    // Mark conversation messages as read immediately
    const conversationMessages = chatHistory.filter(
      (msg) => (msg.senderId === userId || msg.recipientId === userId) && !msg.read && msg.senderId !== user?.id,
    )

    conversationMessages.forEach((msg) => markAsRead(msg.id))
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
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

  if (!user || user.email !== "demo@oneestela.com") {
    return null // Only show for admin users
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Customer Chat</span>
              {totalUnreadCount > 0 && (
                <Badge className="bg-red-500 text-white animate-pulse">{totalUnreadCount}</Badge>
              )}
              {newMessageNotifications.length > 0 && (
                <Badge className="bg-orange-500 text-white animate-bounce">{newMessageNotifications.length} New</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time chat with customers • AI escalations supported
              {!isConnected && <span className="text-yellow-600 ml-2">• Connecting...</span>}
              {isConnected && <span className="text-green-600 ml-2">• Online</span>}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Online" : "Offline"}</Badge>
            {conversations.some((c) => c.isEscalated) && (
              <Badge className="bg-purple-500 text-white">
                <Bot className="h-3 w-3 mr-1" />
                AI Escalations
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex p-0">
        <Tabs defaultValue="conversations" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mb-2">
            <TabsTrigger value="conversations" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Conversations</span>
              {totalUnreadCount > 0 && <Badge className="bg-red-500 text-white text-xs ml-1">{totalUnreadCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="flex-1 flex m-0">
            {/* Conversations List */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs text-gray-400 mt-1">Customers will appear here when they start chatting</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.userId}
                        onClick={() => handleConversationSelect(conversation.userId)}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all relative",
                          selectedConversation === conversation.userId
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50",
                          conversation.hasNewNotification && "bg-orange-50 border-orange-200",
                          conversation.isEscalated && "bg-purple-50 border-purple-200",
                        )}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{conversation.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                              conversation.isOnline ? "bg-green-400" : "bg-gray-400",
                            )}
                          />
                          {conversation.hasNewNotification && (
                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                          )}
                          {conversation.isEscalated && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                              <Bot className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={cn(
                                "font-medium text-sm truncate flex items-center space-x-1",
                                conversation.unreadCount > 0 && "font-bold",
                              )}
                            >
                              <span>{conversation.userName}</span>
                              {conversation.hasBotHistory && (
                                <Sparkles className="h-3 w-3 text-purple-500" title="Has AI chat history" />
                              )}
                            </h4>
                            <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
                          </div>
                          <p
                            className={cn(
                              "text-sm text-gray-600 truncate",
                              conversation.unreadCount > 0 && "font-medium text-gray-900",
                            )}
                          >
                            {conversation.lastMessage}
                          </p>
                          {conversation.isEscalated && (
                            <div className="flex items-center space-x-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-purple-500" />
                              <span className="text-xs text-purple-600">Escalated from AI</span>
                            </div>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs animate-pulse">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              conversations.find((c) => c.userId === selectedConversation)?.userAvatar ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            {conversations.find((c) => c.userId === selectedConversation)?.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm flex items-center space-x-2">
                            <span>{conversations.find((c) => c.userId === selectedConversation)?.userName}</span>
                            {conversations.find((c) => c.userId === selectedConversation)?.hasBotHistory && (
                              <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI History
                              </Badge>
                            )}
                            {conversations.find((c) => c.userId === selectedConversation)?.isEscalated && (
                              <Badge className="text-xs bg-purple-100 text-purple-700">
                                <Bot className="h-3 w-3 mr-1" />
                                Escalated
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                conversations.find((c) => c.userId === selectedConversation)?.isOnline
                                  ? "bg-green-400"
                                  : "bg-gray-400",
                              )}
                            />
                            <span className="text-xs text-gray-500">
                              {conversations.find((c) => c.userId === selectedConversation)?.isOnline
                                ? "Online"
                                : `Last seen ${formatLastSeen(userStatuses[selectedConversation]?.lastSeen || new Date().toISOString())}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedConversation(null)}>
                        Close Chat
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs text-gray-400">Start the conversation!</p>
                        </div>
                      ) : (
                        selectedMessages.map((message) => (
                          <div key={message.id}>
                            <div className={cn("flex", message.senderId === user.id ? "justify-end" : "justify-start")}>
                              <div
                                className={cn(
                                  "flex items-end space-x-2 max-w-[80%]",
                                  message.senderId === user.id ? "flex-row-reverse space-x-reverse" : "flex-row",
                                )}
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {message.senderType === "bot"
                                      ? "AI"
                                      : message.senderId === user.id
                                        ? "A"
                                        : message.senderName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={cn(
                                    "rounded-lg px-3 py-2 max-w-xs relative",
                                    message.senderType === "bot"
                                      ? "bg-purple-100 text-purple-900 border border-purple-200"
                                      : message.senderId === user.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-900",
                                  )}
                                >
                                  {message.senderType === "bot" && (
                                    <div className="flex items-center space-x-1 mb-1">
                                      <Bot className="h-3 w-3 text-purple-600" />
                                      <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                                    </div>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <div
                                    className={cn(
                                      "flex items-center justify-between mt-1 space-x-2",
                                      message.senderType === "bot"
                                        ? "text-purple-600"
                                        : message.senderId === user.id
                                          ? "text-blue-100"
                                          : "text-gray-500",
                                    )}
                                  >
                                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                                    {message.senderId === user.id && (
                                      <div className="flex items-center">
                                        {message.read ? (
                                          <CheckCheck className="h-3 w-3" />
                                        ) : (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {message.escalated && (
                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                      <AlertCircle className="h-2 w-2 text-white" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Typing Indicators */}
                      {typingIndicators
                        .filter((indicator) => indicator.userId === selectedConversation)
                        .map((indicator) => (
                          <div key={indicator.userId} className="flex justify-start">
                            <div className="flex items-end space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    conversations.find((c) => c.userId === selectedConversation)?.userAvatar ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                />
                                <AvatarFallback>
                                  {conversations.find((c) => c.userId === selectedConversation)?.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                  <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  />
                                  <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Type your reply..."
                        className="flex-1"
                        disabled={!isConnected}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!messageInput.trim() || !isConnected}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                    {!isConnected && <p className="text-xs text-gray-500 mt-1">Connecting to chat...</p>}
                    {isConnected && (
                      <p className="text-xs text-green-600 mt-1">✓ Connected - Messages will be delivered instantly</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Select a conversation to start chatting</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {totalUnreadCount > 0
                        ? `You have ${totalUnreadCount} unread message${totalUnreadCount > 1 ? "s" : ""}`
                        : "All caught up! No new messages."}
                    </p>
                    {conversations.some((c) => c.isEscalated) && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-center space-x-2 text-purple-700">
                          <Bot className="h-4 w-4" />
                          <span className="text-sm font-medium">AI Escalations Available</span>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                          Some conversations were transferred from our AI assistant
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
