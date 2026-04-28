"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useChatbot } from "@/components/chatbot-service"
import { cn } from "@/lib/utils"

interface UnifiedMessage {
  id: string
  content: string
  senderType: "user" | "bot" | "admin"
  senderName: string
  timestamp: string
  followUps?: string[]
  escalated?: boolean
}

export function UnifiedChatWidget() {
  const { user } = useAuth()
  const {
    messages: botMessages,
    isTyping: botIsTyping,
    sendMessage: sendBotMessage,
    sendFollowUp,
    isEscalated,
  } = useChatbot()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [unifiedMessages, setUnifiedMessages] = useState<UnifiedMessage[]>([])
  const [isHandedOffToAdmin, setIsHandedOffToAdmin] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastSeenMsgId, setLastSeenMsgId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // ── DB helpers ──────────────────────────────────────────────────────────────

  const postToDb = useCallback(async (content: string, isSystem = false) => {
    if (!user) return
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: user.id,
        senderEmail: user.email,
        receiverId: null,
        message: content,
        messageType: isSystem ? "system" : "text",
      }),
    })
  }, [user])

  const fetchAdminReplies = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/chat?receiverId=${user.id}`)
      if (!res.ok) return
      const data = await res.json()
      const msgs: any[] = data.messages || []
      if (msgs.length === 0) return

      const newMsgs = lastSeenMsgId ? msgs.filter(m => m.id > lastSeenMsgId) : msgs
      if (newMsgs.length === 0) return

      setLastSeenMsgId(msgs[msgs.length - 1].id)

      const converted: UnifiedMessage[] = newMsgs.map(m => ({
        id: `db-admin-${m.id}`,
        content: m.message,
        senderType: "admin" as const,
        senderName: m.sender_name || "Support Team",
        timestamp: m.created_at,
      }))

      setUnifiedMessages(prev => {
        const existingIds = new Set(prev.map(x => x.id))
        const fresh = converted.filter(x => !existingIds.has(x.id))
        if (fresh.length === 0) return prev
        if (!isOpen || isMinimized) setUnreadCount(c => c + fresh.length)
        return [...prev, ...fresh].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      })
    } catch (e) {
      console.error("poll error", e)
    }
  }, [user, lastSeenMsgId, isOpen, isMinimized])

  // ── Load history from DB when widget opens ──────────────────────────────────

  const loadHistory = useCallback(async () => {
    if (!user) return
    try {
      // messages sent by user
      const [r1, r2] = await Promise.all([
        fetch(`/api/chat?senderId=${user.id}`),
        fetch(`/api/chat?receiverId=${user.id}`),
      ])
      const d1 = r1.ok ? await r1.json() : { messages: [] }
      const d2 = r2.ok ? await r2.json() : { messages: [] }
      const all: any[] = [...(d1.messages || []), ...(d2.messages || [])]
      all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const seen = new Set<number>()
      const unique = all.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true })

      if (unique.length === 0) return

      const converted: UnifiedMessage[] = unique.map(m => ({
        id: `db-${m.id}`,
        content: m.message,
        senderType: String(m.sender_id) === String(user.id) ? "user" : "admin",
        senderName: String(m.sender_id) === String(user.id) ? (user.name || "You") : (m.sender_name || "Support Team"),
        timestamp: m.created_at,
      }))

      setIsHandedOffToAdmin(true)
      setUnifiedMessages(converted)
      setLastSeenMsgId(unique[unique.length - 1].id)
    } catch (e) {
      console.error("history load error", e)
    }
  }, [user])

  // ── Initialize welcome message ───────────────────────────────────────────────

  useEffect(() => {
    if (unifiedMessages.length === 0 && !isHandedOffToAdmin) {
      setUnifiedMessages([{
        id: `welcome-${Date.now()}`,
        content: "Hello! Welcome to One Estela Place! 👋 I'm your Chat Bot. I can help you with venue availability, office space details, pricing, and reservation steps. How can I assist you today?",
        senderType: "bot",
        senderName: "Chat Bot",
        timestamp: new Date().toISOString(),
        followUps: [
          "Check venue availability",
          "View office spaces",
          "Get pricing information",
          "Learn about reservation process",
        ],
      }])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync bot messages into unified thread ────────────────────────────────────

  useEffect(() => {
    if (isHandedOffToAdmin) return
    if (botMessages.length === 0) return
    const converted: UnifiedMessage[] = botMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderType: msg.isBot ? "bot" : "user",
      senderName: msg.isBot ? "Chat Bot" : (user?.name || "You"),
      timestamp: msg.timestamp,
      followUps: msg.followUps,
      escalated: msg.escalated,
    }))
    setUnifiedMessages(converted)
  }, [botMessages, isHandedOffToAdmin, user])

  // ── Handle escalation ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isEscalated || isHandedOffToAdmin) return
    setIsHandedOffToAdmin(true)

    const handoffMsg: UnifiedMessage = {
      id: `handoff-${Date.now()}`,
      content: "🔄 Connecting you with our support team... A specialist will respond shortly.",
      senderType: "bot",
      senderName: "Chat Bot",
      timestamp: new Date().toISOString(),
      escalated: true,
    }
    setUnifiedMessages(prev => [...prev, handoffMsg])

    // Note: Escalation is handled silently without showing message to customer
  }, [isEscalated, isHandedOffToAdmin, postToDb])

  // ── Polling for admin replies ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isHandedOffToAdmin || !user) return
    pollRef.current = setInterval(fetchAdminReplies, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [isHandedOffToAdmin, user, fetchAdminReplies])

  // ── On open: load DB history + clear unread ──────────────────────────────────

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0)
      loadHistory()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll ───────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [unifiedMessages, botIsTyping])

  // ── Send message ──────────────────────────────────────────────────────────────

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    const text = messageInput.trim()
    setMessageInput("")

    if (isHandedOffToAdmin) {
      // Optimistically add to UI
      const optimistic: UnifiedMessage = {
        id: `user-opt-${Date.now()}`,
        content: text,
        senderType: "user",
        senderName: user?.name || "You",
        timestamp: new Date().toISOString(),
      }
      setUnifiedMessages(prev => [...prev, optimistic])
      await postToDb(text)
    } else {
      await sendBotMessage(text)
    }
  }

  const handleFollowUpClick = async (followUp: string) => {
    if (isHandedOffToAdmin) {
      const optimistic: UnifiedMessage = {
        id: `user-opt-${Date.now()}`,
        content: followUp,
        senderType: "user",
        senderName: user?.name || "You",
        timestamp: new Date().toISOString(),
      }
      setUnifiedMessages(prev => [...prev, optimistic])
      await postToDb(followUp)
    } else {
      await sendFollowUp(followUp)
    }
  }

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  if (!user) return null

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg relative group"
            size="icon"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <div className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isHandedOffToAdmin ? "Chat with Support Team" : "Chat with Chat Bot"}
            </div>
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border flex flex-col transition-all duration-300",
          isMinimized ? "w-80 h-14" : "w-96 h-[520px] md:w-[420px] md:h-[580px]"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {isHandedOffToAdmin ? "ST" : "CB"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">
                  {isHandedOffToAdmin ? "Support Team" : "One Estela Place"}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className={cn("w-2 h-2 rounded-full", isHandedOffToAdmin ? "bg-purple-300" : "bg-green-400")} />
                  <span className="text-xs opacity-90">
                    {isHandedOffToAdmin ? "Human support" : "Chat Bot"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 text-white hover:bg-blue-700">
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white hover:bg-blue-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Escalation banner */}
              {isHandedOffToAdmin && (
                <div className="px-4 py-2 bg-purple-50 border-b border-purple-200 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">Connected with Support Team</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-0.5">Our team will respond to your messages shortly.</p>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {unifiedMessages.map((message, index) => (
                    <div key={message.id}>
                      <div className={cn("flex", message.senderType === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "flex items-end space-x-2 max-w-[85%]",
                          message.senderType === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                        )}>
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {message.senderType === "bot" ? "CB" : message.senderType === "admin" ? "ST" : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "rounded-lg px-3 py-2",
                            message.senderType === "bot" ? "bg-green-600 text-white" :
                            message.senderType === "admin" ? "bg-purple-600 text-white" :
                            "bg-blue-600 text-white"
                          )}>
                            <div className="flex items-start space-x-1">
                              {message.senderType === "bot" && <Sparkles className="h-3 w-3 mt-0.5 text-green-200 flex-shrink-0" />}
                              {message.senderType === "admin" && <User className="h-3 w-3 mt-0.5 text-purple-200 flex-shrink-0" />}
                              <div>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs mt-1 opacity-70">{formatTime(message.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Follow-up suggestions */}
                      {message.senderType === "bot" &&
                        message.followUps &&
                        message.followUps.length > 0 &&
                        index === unifiedMessages.length - 1 &&
                        !isHandedOffToAdmin && (
                          <div className="mt-2 flex flex-wrap gap-2 justify-start">
                            {message.followUps.map((fu, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={() => handleFollowUpClick(fu)}
                                className="text-xs h-7 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              >
                                {fu}
                              </Button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}

                  {/* Bot typing */}
                  {!isHandedOffToAdmin && botIsTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end space-x-2">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">CB</AvatarFallback></Avatar>
                        <div className="bg-green-100 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder={isHandedOffToAdmin ? "Type your message..." : "Ask about venues, pricing, bookings..."}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!messageInput.trim()} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs mt-1 flex items-center gap-1">
                  {isHandedOffToAdmin
                    ? <><User className="h-3 w-3 text-purple-500" /><span className="text-purple-600">Support Team • replies may take a moment</span></>
                    : <><Bot className="h-3 w-3 text-green-500" /><span className="text-green-600">Chat Bot • always available</span></>
                  }
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
