"use client"

import { UnifiedAdminChatPanel } from "@/components/unified-admin-chat-panel"

export default function ChatPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Chat</h1>
        <p className="text-gray-600 mt-2">Manage customer conversations with unified AI + Human support</p>
      </div>

      <UnifiedAdminChatPanel />
    </div>
  )
}
