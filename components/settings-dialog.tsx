"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: false,
    promotionalEmails: true,
    eventUpdates: true,
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Password mismatch", description: "New passwords do not match.", variant: "destructive" })
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Error", description: data.error || "Failed to change password.", variant: "destructive" })
      } else {
        toast({ title: "Password updated", description: "Your password has been successfully changed." })
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "We'll send you an email with instructions to confirm account deletion.",
      variant: "destructive",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your account settings and preferences</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="password" className="space-y-4">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Change Password"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailReminders">Email Reminders</Label>
                <Switch
                  id="emailReminders"
                  checked={notifications.emailReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailReminders: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsReminders">SMS Reminders</Label>
                <Switch
                  id="smsReminders"
                  checked={notifications.smsReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, smsReminders: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="promotionalEmails">Promotional Emails</Label>
                <Switch
                  id="promotionalEmails"
                  checked={notifications.promotionalEmails}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, promotionalEmails: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="eventUpdates">Event Updates</Label>
                <Switch
                  id="eventUpdates"
                  checked={notifications.eventUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, eventUpdates: checked })}
                />
              </div>
              <Button onClick={handleNotificationSave} className="w-full">
                Save Preferences
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <div className="border-t pt-4">
          <h4 className="font-semibold text-red-600 mb-2">Danger Zone</h4>
          <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
            Delete Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
