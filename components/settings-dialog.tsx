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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
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
        method: 'PUT',
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
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    // Allow deletion even without password for accounts that don't have one
    if (!deletePassword && user?.password) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          password: deletePassword || '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to delete account.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
        })
        setShowDeleteConfirm(false)
        onOpenChange(false)
        // Log out and redirect to home
        logout()
        window.location.href = '/'
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletePassword("")
    }
  }

  return (
    <>
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All your bookings</li>
                <li>Payment records</li>
                <li>Reviews and messages</li>
                <li>Personal information</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="deletePassword">Enter your password to confirm</Label>
            <Input
              id="deletePassword"
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
