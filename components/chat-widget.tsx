"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, X, Send, Minimize2, Maximize2, Check, CheckCheck, Bot, User, Sparkles } from "lucide-react"
import { useChat } from "@/components/chat-context"
import { useAuth } from "@/components/auth-context"
import { useChatbot } from "@/components/chatbot-service"
import { cn } from "@/lib/utils"

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

export function ChatWidget() {
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
    clearChat,
  } = useChatbot()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chatMode, setChatMode] = useState<"bot" | "human">("bot")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine which messages to show based on mode and escalation
  const displayMessages = chatMode === "bot" && !isEscalated ? botMessages : getChatHistory()
  const unreadCount = getUnreadCount()
  const supportStatus = userStatuses["admin-1"] || { isOnline: false, lastSeen: new Date().toISOString() }

  // Auto-escalate when bot escalates
  useEffect(() => {
    if (isEscalated && chatMode === "bot") {
      setChatMode("human")
    }
  }, [isEscalated, chatMode])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayMessages, typingIndicators, botIsTyping])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && chatMode === "human") {
      getChatHistory()
        .filter((msg) => !msg.read && msg.senderId !== user?.id)
        .forEach((msg) => markAsRead(msg.id))
    }
  }, [isOpen, isMinimized, chatMode, getChatHistory, user?.id, markAsRead])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim()) {
      if (chatMode === "bot" && !isEscalated) {
        await sendBotMessage(messageInput)
      } else {
        sendChatMessage(messageInput)
        stopTyping()
        setIsTyping(false)
      }
      setMessageInput("")
    }
  }

  const handleFollowUpClick = async (followUp: string) => {
    if (chatMode === "bot" && !isEscalated) {
      await sendFollowUp(followUp)
    } else {
      sendChatMessage(followUp)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    if (chatMode === "human") {
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

  const handleEscalateToHuman = () => {
    escalateToHuman()
    setChatMode("human")
  }

  const handleSwitchToBot = () => {
    setChatMode("bot")
    clearChat()
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
            {chatMode === "bot" && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />}
            {unreadCount > 0 && chatMode === "human" && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <div className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {chatMode === "bot" ? "Chat with One Estela Place" : "Chat with Support"}
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
          <div
            className={cn(
              "flex items-center justify-between p-4 border-b text-white rounded-t-lg",
              chatMode === "bot" ? "bg-green-600" : "bg-blue-600",
            )}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    chatMode === "bot" ? "/placeholder.svg?height=32&width=32" : "/placeholder.svg?height=32&width=32"
                  }
                />
                <AvatarFallback>{chatMode === "bot" ? "AI" : "ST"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm flex items-center space-x-2">
                  {chatMode === "bot" ? (
                    <span>One Estela Place</span>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span>Support Team</span>
                    </>
                  )}
                </h3>
                <div className="flex items-center space-x-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      chatMode === "bot" ? "bg-green-400" : supportStatus.isOnline ? "bg-green-400" : "bg-gray-400",
                    )}
                  />
                  <span className="text-xs opacity-90">
                    {chatMode === "bot"
                      ? "Always available"
                      : supportStatus.isOnline
                        ? "Online"
                        : `Last seen ${formatLastSeen(supportStatus.lastSeen)}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {chatMode === "human" && !isConnected && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Connecting..." />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className={cn("h-8 w-8 text-white", chatMode === "bot" ? "hover:bg-green-700" : "hover:bg-blue-700")}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className={cn("h-8 w-8 text-white", chatMode === "bot" ? "hover:bg-green-700" : "hover:bg-blue-700")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Mode Switcher */}
              <div className="p-2 border-b bg-gray-50">
                <div className="flex space-x-2">
                  <Button
                    variant={chatMode === "bot" ? "default" : "outline"}
                    size="sm"
                    onClick={handleSwitchToBot}
                    className={cn("flex-1 text-xs", chatMode === "bot" && "bg-green-600 hover:bg-green-700")}
                    disabled={isEscalated}
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    One Estela Place
                  </Button>
                  <Button
                    variant={chatMode === "human" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChatMode("human")}
                    className={cn("flex-1 text-xs", chatMode === "human" && "bg-blue-600 hover:bg-blue-700")}
                  >
                    <User className="h-3 w-3 mr-1" />
                    Human Support
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 h-[280px] md:h-[340px] overflow-y-auto p-4 bg-white">
                <div className="space-y-4">
                  {displayMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div
                        className={cn(
                          "h-12 w-12 mx-auto mb-4 rounded-full flex items-center justify-center",
                          chatMode === "bot" ? "bg-green-100" : "bg-blue-100",
                        )}
                      >
                        {chatMode === "bot" ? (
                          <Bot className="h-6 w-6 text-green-600" />
                        ) : (
                          <MessageCircle className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {chatMode === "bot"
                          ? "Start a conversation with our AI assistant!"
                          : "Start a conversation with our support team!"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {chatMode === "bot"
                          ? "I can help with venue info, pricing, and bookings"
                          : "We're here to help with any questions"}
                      </p>
                    </div>
                  ) : (
                    displayMessages.map((message) => (
                      <div key={message.id}>
                        <div
                          className={cn(
                            "flex",
                            message.senderType === "bot" || message.senderId === user.id
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-end space-x-2 max-w-[85%]",
                              message.senderType === "bot" || message.senderId === user.id
                                ? "flex-row-reverse space-x-reverse"
                                : "flex-row",
                            )}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {message.senderType === "bot"
                                  ? "AI"
                                  : message.senderType === "admin"
                                    ? "ST"
                                    : message.senderName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                "rounded-lg px-3 py-2",
                                message.senderType === "bot"
                                  ? "bg-green-600 text-white"
                                  : message.senderId === user.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-900",
                              )}
                            >
                              <div className="flex items-start space-x-2">
                                {message.senderType === "bot" && <Sparkles className="h-3 w-3 mt-0.5 text-green-200" />}
                                <div className="flex-1">
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <div
                                    className={cn(
                                      "flex items-center justify-between mt-1 space-x-2",
                                      message.senderType === "bot"
                                        ? "text-green-100"
                                        : message.senderId === user.id
                                          ? "text-blue-100"
                                          : "text-gray-500",
                                    )}
                                  >
                                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                                    {message.senderId === user.id && chatMode === "human" && (
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
                            </div>
                          </div>
                        </div>

                        {/* Follow-up suggestions for bot messages */}
                        {message.senderType === "bot" && message.followUps && message.followUps.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2 justify-end">
                            {message.followUps.map((followUp, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleFollowUpClick(followUp)}
                                className="text-xs h-7 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                disabled={isEscalated}
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
                  {chatMode === "human" &&
                    typingIndicators
                      .filter((indicator) => indicator.userId !== user.id)
                      .map((indicator) => (
                        <div key={indicator.userId} className="flex justify-start">
                          <div className="flex items-end space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/placeholder.svg?height=24&width=24" />
                              <AvatarFallback>ST</AvatarFallback>
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

                  {/* Bot typing indicator */}
                  {chatMode === "bot" && botIsTyping && (
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
              </div>

              {/* Escalation Notice */}
              {chatMode === "bot" && !isEscalated && (
                <div className="px-4 py-2 bg-green-50 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-700">Need human help? I can connect you with our team.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEscalateToHuman}
                      className="text-xs h-6 border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Talk to Human
                    </Button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    placeholder={
                      chatMode === "bot" ? "Ask me about venues, pricing, or bookings..." : "Type your message..."
                    }
                    className="flex-1"
                    disabled={chatMode === "human" && !isConnected}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageInput.trim() || (chatMode === "human" && !isConnected)}
                    className={cn(
                      chatMode === "bot" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                {chatMode === "human" && !isConnected && (
                  <p className="text-xs text-gray-500 mt-1">Connecting to chat...</p>
                )}
                {chatMode === "bot" && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    Instant responses
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
