"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, Search, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  sender_id: number
  receiver_id: number | null
  message: string
  message_type: string
  is_read: boolean
  created_at: string
  sender_name?: string
  sender_email?: string
}

interface Conversation {
  userId: number
  userName: string
  userEmail: string
  lastMessage: string
  lastTime: string
  unread: number
}

function formatTime(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 3600000
  if (diffH < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

export default function AdminChatPage() {
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Debug: log user state
  useEffect(() => {
    console.log('[Admin Chat] Auth state:', { 
      isLoading, 
      user: user ? { id: user.id, email: user.email, role: user.role } : 'null' 
    })
  }, [user, isLoading])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Session expired. Please log in again.</p>
            <Button onClick={() => window.location.href = '/'}>Go to Login</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const loadConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/chat/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId: number) => {
    try {
      // Fetch full conversation in both directions using combined query
      const res = await fetch(`/api/chat?senderId=${userId}&receiverId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        const all = data.messages || []
        all.sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        setMessages(all)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectConversation = async (userId: number) => {
    setSelectedUserId(userId)
    await loadMessages(userId)
    // Mark as read
    await fetch(`/api/chat/read`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senderId: userId }) })
    setConversations(prev => prev.map(c => c.userId === userId ? { ...c, unread: 0 } : c))
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Admin Chat] handleSend called', { hasInput: !!input.trim(), selectedUserId, hasUser: !!user })
    if (!input.trim() || !selectedUserId || !user) {
      console.log('[Admin Chat] Validation failed - not sending')
      return
    }
    console.log('[Admin Chat] Sending:', { userId: user.id, userEmail: user.email, selectedUserId, message: input.trim() })
    setSending(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          senderEmail: user.email,
          receiverId: selectedUserId,
          message: input.trim(),
          messageType: "text",
        }),
      })
      console.log('[Admin Chat] Response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('[Admin Chat] Success:', data)
        setInput("")
        await loadMessages(selectedUserId)
        await loadConversations()
      } else {
        const err = await res.json().catch(() => ({}))
        console.error('[Admin Chat] Error response:', err)
        if (err.code === 'SENDER_NOT_FOUND') {
          toast({ title: "Session expired", description: "Please log out and log back in.", variant: "destructive" })
        } else {
          toast({ title: "Failed to send", description: err.detail || err.error || "Unknown error", variant: "destructive" })
        }
      }
    } catch (err) {
      console.error('[Admin Chat] Fetch error:', err)
      toast({ title: "Network error", description: "Could not send message", variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  useEffect(() => { loadConversations() }, [])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations()
      if (selectedUserId) loadMessages(selectedUserId)
    }, 10000)
    return () => clearInterval(interval)
  }, [selectedUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const filtered = conversations.filter(c =>
    c.userName.toLowerCase().includes(search.toLowerCase()) ||
    c.userEmail.toLowerCase().includes(search.toLowerCase())
  )

  const selectedConv = conversations.find(c => c.userId === selectedUserId)

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Chat</h1>
            <p className="text-muted-foreground">All customer conversations in one place</p>
          </div>
          <Button variant="outline" onClick={loadConversations} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <Card className="h-[calc(100vh-220px)] flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex p-0 overflow-hidden">

            {/* Sidebar */}
            <div className="w-72 border-r flex flex-col flex-shrink-0">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filtered.map(conv => (
                      <button
                        key={conv.userId}
                        onClick={() => handleSelectConversation(conv.userId)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                          selectedUserId === conv.userId
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                            {conv.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={cn("text-sm truncate", conv.unread > 0 ? "font-bold" : "font-medium")}>
                              {conv.userName}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{formatTime(conv.lastTime)}</span>
                          </div>
                          <p className={cn("text-xs truncate", conv.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500")}>
                            {conv.lastMessage}
                          </p>
                        </div>
                        {conv.unread > 0 && (
                          <Badge className="bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full flex-shrink-0">
                            {conv.unread}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedUserId ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Select a conversation to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-3 flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                        {selectedConv?.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{selectedConv?.userName}</p>
                      <p className="text-xs text-gray-500">{selectedConv?.userEmail}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No messages yet</div>
                      ) : messages.map(msg => {
                        const isAdmin = String(msg.sender_id) === String(user?.id)
                        return (
                          <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                            <div className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                              isAdmin
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-900 rounded-bl-sm"
                            )}>
                              {!isAdmin && (
                                <p className="text-xs font-semibold mb-1 text-indigo-600">{selectedConv?.userName}</p>
                              )}
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                              <p className={cn("text-xs mt-1", isAdmin ? "text-blue-200" : "text-gray-400")}>
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={bottomRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <form onSubmit={handleSend} className="p-3 border-t flex gap-2 flex-shrink-0">
                    <Input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={sending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend(e as any)
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || sending} 
                      size="icon"
                      onClick={(e) => {
                        console.log('[Admin Chat] Send button clicked')
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
