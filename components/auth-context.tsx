"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: "user" | "admin" | "owner"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>
  googleSignIn: () => Promise<boolean>
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for authentication
const demoUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "user@oneestela.com",
    password: "user123",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user" as const,
  },
  {
    id: "2",
    name: "Demo Admin",
    email: "demo@oneestela.com",
    password: "demo123",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "admin" as const,
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@oneestela.com",
    password: "admin123",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "admin" as const,
  },
  {
    id: "4",
    name: "Owner",
    email: "owner@oneestela.com",
    password: "owner123",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "owner" as const,
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session and validate with server
    const checkSession = async () => {
      const savedUser = localStorage.getItem("user")
      const sessionUser = sessionStorage.getItem("user")
      
      if (savedUser || sessionUser) {
        try {
          const parsedUser = JSON.parse(savedUser || sessionUser || '{}')
          if (parsedUser && parsedUser.name && parsedUser.email) {
            // Validate session with server
            try {
              const response = await fetch("/api/auth/profile", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              })
              
              if (response.ok) {
                const serverUser = await response.json()
                // Update user data from server (in case of changes)
                const validatedUser = {
                  id: serverUser.id,
                  name: serverUser.name,
                  email: serverUser.email,
                  avatar: serverUser.avatar || "/placeholder.svg?height=40&width=40",
                  role: serverUser.role || "user",
                }
                setUser(validatedUser)
                
                // Update stored user data
                if (savedUser) {
                  localStorage.setItem("user", JSON.stringify(validatedUser))
                } else {
                  sessionStorage.setItem("user", JSON.stringify(validatedUser))
                }
              } else {
                // Session invalid, clear storage
                localStorage.removeItem("user")
                sessionStorage.removeItem("user")
                setUser(null)
              }
            } catch (error) {
              console.error("Session validation failed:", error)
              // On network error, keep local session but don't auto-login
              localStorage.removeItem("user")
              sessionStorage.removeItem("user")
              setUser(null)
            }
          } else {
            localStorage.removeItem("user")
            sessionStorage.removeItem("user")
          }
        } catch (error) {
          localStorage.removeItem("user")
          sessionStorage.removeItem("user")
        }
      }
      setIsLoading(false)
    }
    
    checkSession()
  }, [])

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const userSession = {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar || "/placeholder.svg?height=40&width=40",
          role: data.role || "user",
        }
        setUser(userSession)

        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userSession))
          localStorage.setItem("rememberedEmail", email)
        } else {
          sessionStorage.setItem("user", JSON.stringify(userSession))
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const newUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar || "/placeholder.svg?height=40&width=40",
          role: data.role || "user",
        }
        setUser(newUser)
        // Only save to sessionStorage for new signups (temporary session)
        sessionStorage.setItem("user", JSON.stringify(newUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Signup error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const googleSignIn = async (): Promise<boolean> => {
    setIsLoading(true)

    // Simulate Google OAuth
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const googleUser = {
      id: "google_" + Date.now(),
      name: "Google User",
      email: "google.user@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "user" as const,
    }

    setUser(googleUser)
    localStorage.setItem("user", JSON.stringify(googleUser))

    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")
    localStorage.removeItem("rememberedEmail")
    // Force page reload to ensure clean state
    window.location.reload()
  }

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      // Persist to whichever storage was used
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updated))
      } else {
        sessionStorage.setItem("user", JSON.stringify(updated))
      }
      return updated
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        googleSignIn,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
