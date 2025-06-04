"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient, type User } from "@/lib/api-client"

type UserWithRole = User

type AuthContextType = {
  user: UserWithRole | null
  session: { user: UserWithRole } | null
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signOut: () => Promise<void>
  debugAuth: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [session, setSession] = useState<{ user: UserWithRole } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true)
        const currentUser = await apiClient.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setSession({ user: currentUser })
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    try {
      const { user } = await apiClient.signUp(email, password, firstName, lastName, phone)
      setUser(user)
      setSession({ user })
      return { data: { user }, error: null }
    } catch (err: any) {
      console.error("Sign up error:", err)
      return { error: err, data: null }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with:", email)
      const { user, session } = await apiClient.signIn(email, password)
      setUser(user)
      setSession({ user })
      console.log("Sign in successful:", user.id)
      return { data: { user }, error: null }
    } catch (err: any) {
      console.error("Sign in error:", err)
      return { error: err, data: null }
    }
  }

  const signOut = async () => {
    try {
      await apiClient.signOut()
      setUser(null)
      setSession(null)
      router.push("/")
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  // Debug function to help troubleshoot auth issues
  const debugAuth = async () => {
    try {
      return {
        user,
        session,
        localStorage: {
          mockUser: localStorage.getItem("mockUser"),
          authToken: localStorage.getItem("authToken")
        }
      }
    } catch (err) {
      console.error("Error in debugAuth:", err)
      return { error: err }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    debugAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
