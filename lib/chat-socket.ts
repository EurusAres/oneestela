// Enhanced WebSocket client for better real-time communication
export class ChatSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: { [key: string]: Function[] } = {}
  private messageQueue: any[] = []
  private isConnected = false

  constructor(
    private userId: string,
    private userType: "client" | "admin",
  ) {}

  connect() {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate WebSocket behavior with enhanced real-time features
      this.simulateWebSocket()
    } catch (error) {
      console.error("WebSocket connection failed:", error)
      this.handleReconnect()
    }
  }

  private simulateWebSocket() {
    // Simulate WebSocket connection for demo
    console.log(`Chat WebSocket connected for ${this.userType}: ${this.userId}`)
    this.isConnected = true

    // Simulate connection success
    setTimeout(() => {
      this.emit("connected", { userId: this.userId, userType: this.userType })

      // Process any queued messages
      this.processMessageQueue()
    }, 100)

    // Enhanced simulation for real-time admin-user communication
    this.setupCrossUserCommunication()
  }

  private setupCrossUserCommunication() {
    // Listen for messages from other users via localStorage events
    window.addEventListener("storage", (e) => {
      if (e.key === "chat-broadcast") {
        const data = JSON.parse(e.newValue || "{}")

        // Only process messages not sent by this user
        if (data.senderId !== this.userId) {
          // Check if this message is for this user
          const isForThisUser =
            (this.userType === "admin" && data.senderType === "client") ||
            (this.userType === "client" && data.senderType === "admin") ||
            data.recipientId === this.userId

          if (isForThisUser) {
            setTimeout(() => {
              this.emit(data.type, data.payload)
            }, 100) // Small delay to simulate network latency
          }
        }
      }
    })

    // Simulate admin auto-response for demo
    if (this.userType === "client") {
      setTimeout(() => {
        this.emit("message", {
          id: `msg-${Date.now()}`,
          senderId: "admin-1",
          senderName: "Support Team",
          senderType: "admin",
          content: "Hello! I'm here to help you with your venue booking. How can I assist you today?",
          timestamp: new Date().toISOString(),
          read: false,
          recipientId: this.userId,
        })
      }, 2000)
    }
  }

  private broadcastToOtherUsers(type: string, payload: any) {
    // Broadcast message to other users via localStorage
    const broadcastData = {
      type,
      payload,
      senderId: this.userId,
      senderType: this.userType,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("chat-broadcast", JSON.stringify(broadcastData))

    // Clear the broadcast after a short delay to allow other tabs to process
    setTimeout(() => {
      localStorage.removeItem("chat-broadcast")
    }, 500)
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift()
      this.sendMessage(queuedMessage.content, queuedMessage.recipientId)
    }
  }

  private handleReconnect() {
    this.isConnected = false
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  sendMessage(content: string, recipientId?: string) {
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: this.userId,
      senderType: this.userType,
      content,
      timestamp: new Date().toISOString(),
      recipientId: recipientId || (this.userType === "client" ? "admin" : this.userId),
      read: false,
    }

    if (!this.isConnected) {
      // Queue message if not connected
      this.messageQueue.push({ content, recipientId })
      return message
    }

    // Broadcast message to other users immediately
    this.broadcastToOtherUsers("message", message)

    // Simulate message sent confirmation
    setTimeout(() => {
      this.emit("messageSent", message)
    }, 100)

    return message
  }

  sendTypingIndicator(isTyping: boolean, recipientId?: string) {
    const data = {
      userId: this.userId,
      userType: this.userType,
      isTyping,
      recipientId: recipientId || (this.userType === "client" ? "admin" : this.userId),
      timestamp: new Date().toISOString(),
    }

    // Broadcast typing indicator to other users
    this.broadcastToOtherUsers("typingIndicator", data)

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        if (this.isConnected) {
          this.sendTypingIndicator(false, recipientId)
        }
      }, 3000)
    }
  }

  markAsRead(messageId: string) {
    console.log("Marking message as read:", messageId)

    const readData = {
      messageId,
      readBy: this.userId,
      timestamp: new Date().toISOString(),
    }

    // Broadcast read receipt to other users
    this.broadcastToOtherUsers("messageRead", readData)

    setTimeout(() => {
      this.emit("messageRead", readData)
    }, 100)
  }

  updateOnlineStatus(isOnline: boolean) {
    console.log("Updating online status:", isOnline)

    const statusData = {
      userId: this.userId,
      userType: this.userType,
      isOnline,
      lastSeen: new Date().toISOString(),
    }

    // Broadcast status to other users
    this.broadcastToOtherUsers("statusUpdate", statusData)

    setTimeout(() => {
      this.emit("statusUpdate", statusData)
    }, 100)
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data))
    }
  }

  disconnect() {
    this.isConnected = false
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    // Remove event listeners
    window.removeEventListener("storage", this.setupCrossUserCommunication)

    console.log("WebSocket disconnected")
  }
}
