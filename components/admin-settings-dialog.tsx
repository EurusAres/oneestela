"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Eye, EyeOff } from "lucide-react"

interface AdminSettingsDialogProps {
  userId: string
}

export function AdminSettingsDialog({ userId }: AdminSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [emailFormData, setEmailFormData] = useState({
    newEmail: '',
    password: ''
  })
  
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const { toast } = useToast()

  // Fetch current email when dialog opens
  useEffect(() => {
    if (open) {
      fetchCurrentEmail()
    }
  }, [open])

  const fetchCurrentEmail = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setCurrentEmail(data.email || '')
        setEmailFormData({ ...emailFormData, newEmail: data.email || '' })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const resetForms = () => {
    setEmailFormData({
      newEmail: currentEmail,
      password: ''
    })
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailFormData.newEmail || !emailFormData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (emailFormData.newEmail === currentEmail) {
      toast({
        title: "No Changes",
        description: "New email is the same as current email",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newEmail: emailFormData.newEmail,
          password: emailFormData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email updated successfully",
        })
        
        // Update localStorage/sessionStorage with new email
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          user.email = emailFormData.newEmail
          localStorage.setItem("user", JSON.stringify(user))
          sessionStorage.setItem("user", JSON.stringify(user))
        }
        
        setCurrentEmail(emailFormData.newEmail)
        setEmailFormData({ newEmail: emailFormData.newEmail, password: '' })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordFormData.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    if (passwordFormData.currentPassword === passwordFormData.newPassword) {
      toast({
        title: "Validation Error",
        description: "New password must be different from current password",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        })
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while changing password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full justify-start">
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Settings</DialogTitle>
          <DialogDescription>
            Update your email address or change your password
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailUpdate}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentEmail">Current Email</Label>
                  <Input
                    id="currentEmail"
                    type="email"
                    value={currentEmail}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="newEmail">New Email *</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="Enter new email address"
                    value={emailFormData.newEmail}
                    onChange={(e) => setEmailFormData({ ...emailFormData, newEmail: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="emailPassword">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="emailPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Confirm with your password"
                      value={emailFormData.password}
                      onChange={(e) => setEmailFormData({ ...emailFormData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You'll need to log in with your new email address next time.
                  </p>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForms()
                    setOpen(false)
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Email"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="password">
            <form onSubmit={handlePasswordUpdate}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordFormData.currentPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password (min. 6 characters)"
                      value={passwordFormData.newPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Security Tips:</strong>
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                    <li>• Use at least 6 characters</li>
                    <li>• Include letters, numbers, and symbols</li>
                    <li>• Don't use personal information</li>
                    <li>• Keep your password secure</li>
                  </ul>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForms()
                    setOpen(false)
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
