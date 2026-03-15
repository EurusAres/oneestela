"use client"

import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMessages } from "@/components/message-context"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, Calendar, Clock, MessageSquare, Reply, Archive } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function MessagesPage() {
  const { getAllMessages, updateMessageStatus, getUnreadCount } = useMessages()
  const { toast } = useToast()
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [replyText, setReplyText] = useState("")

  const allMessages = getAllMessages()
  const unreadCount = getUnreadCount()

  const handleMarkAsRead = (messageId: string) => {
    updateMessageStatus(messageId, "read")
    toast({
      title: "Message marked as read",
      description: "The message status has been updated.",
    })
  }

  const handleReply = (message: any) => {
    setSelectedMessage(message)
    setShowReplyDialog(true)
    if (message.status === "new") {
      updateMessageStatus(message.id, "read")
    }
  }

  const handleSendReply = () => {
    if (selectedMessage) {
      updateMessageStatus(selectedMessage.id, "replied")
      toast({
        title: "Reply sent",
        description: `Reply sent to ${selectedMessage.email}`,
      })
      setShowReplyDialog(false)
      setReplyText("")
      setSelectedMessage(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const newMessages = allMessages.filter((msg) => msg.status === "new")
  const readMessages = allMessages.filter((msg) => msg.status === "read")
  const repliedMessages = allMessages.filter((msg) => msg.status === "replied")

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {unreadCount} new message{unreadCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allMessages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newMessages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readMessages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Replied</CardTitle>
              <Reply className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repliedMessages.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>All Contact Messages</CardTitle>
            <CardDescription>Manage customer inquiries and contact requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allMessages.map((message) => (
                <div key={message.id} className="rounded-lg border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{message.name}</h3>
                        <div className="flex space-x-2">
                          {message.priority && (
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)} Priority
                            </Badge>
                          )}
                          {message.status && (
                            <Badge className={getStatusColor(message.status)}>
                              {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          {message.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          {message.phone || "Not provided"}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {new Date(message.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {message.eventType && (
                        <div>
                          <span className="font-medium text-sm">Event Type:</span>
                          <p className="text-sm text-gray-600">{message.eventType}</p>
                        </div>
                      )}
                      {message.eventDate && (
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <div>
                            <span className="font-medium text-sm">Preferred Date:</span>
                            <p className="text-sm text-gray-600">{new Date(message.eventDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-sm">Message:</span>
                      <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleReply(message)} className="bg-blue-600 hover:bg-blue-700">
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                    {message.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(message.id)}>
                        Mark as Read
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <a href={`mailto:${message.email}`}>Send Email</a>
                    </Button>
                    {message.phone && (
                      <Button size="sm" variant="outline">
                        <a href={`tel:${message.phone}`}>Call</a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {allMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No contact messages found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
            <DialogDescription>Send a reply to {selectedMessage?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Original Message:</h4>
              <p className="text-sm text-gray-600">{selectedMessage?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReply}>Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
