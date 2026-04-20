"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog"

interface LoginDialogProps {
  className?: string
}

export function LoginDialog({ className }: LoginDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter() // Added router for redirection

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const success = await login(email, password, rememberMe)

    if (success) {
      const userData = localStorage.getItem("user") || sessionStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        if (user.role === "owner") {
          toast({
            title: "Welcome Owner!",
            description: "Redirecting to your dashboard...",
          })
          router.push("/dashboard")
        } else if (user.role === "admin") {
          toast({
            title: "Welcome Admin!",
            description: "Redirecting to dashboard...",
          })
          router.push("/dashboard")
        } else if (user.role === "staff") {
          toast({
            title: "Welcome Staff!",
            description: "Redirecting to dashboard...",
          })
          router.push("/dashboard")
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        })
      }
      setOpen(false)
      setPassword("")
    } else {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={`border-gray-300 text-gray-900 hover:bg-gray-50 ${className}`}>
            Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login to Your Account</DialogTitle>
            <DialogDescription>Enter your credentials to access your account</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>

              <Button type="button" variant="link" className="px-0 text-sm" onClick={() => setShowForgotPassword(true)}>
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600"></div>
        </DialogContent>
      </Dialog>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    </>
  )
}
