"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Bug } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Login() {
  const { signIn, debugAuth } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errorMessage) setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setDebugInfo(null)

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter both email and password")
      return
    }

    setIsLoading(true)

    try {
      console.log("Attempting login with:", formData.email)
      const { error, data } = await signIn(formData.email, formData.password)

      if (error) {
        console.error("Login error:", error)
        setErrorMessage(error.message || "An error occurred during login")

        // Get debug info
        const debug = await debugAuth()
        setDebugInfo(debug)

        return
      }

      toast({
        title: "Success",
        description: "Logged in successfully!",
      })

      // Redirect based on user role
      if (data?.user) {
        console.log("User role:", data.user.role)

        if (data.user.role === "pet_owner") {
          router.push("/pets")
        } else if (data.user.role === "doctor") {
          router.push("/doctor/schedule")
        } else if (data.user.role === "staff") {
          router.push("/staff/dashboard")
        } else {
          router.push("/")
        }
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Unexpected error during login:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")

      // Get debug info
      const debug = await debugAuth()
      setDebugInfo(debug)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDebug = async () => {
    setShowDebug(!showDebug)
    if (!debugInfo) {
      const debug = await debugAuth()
      setDebugInfo(debug)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
