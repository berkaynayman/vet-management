"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Shield } from "lucide-react"

type ProfileData = {
  _id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: string
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        const profileData = await apiClient.getProfile()
        setProfile(profileData)
        setFormData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          phone: profileData.phone || "",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch profile",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [user, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const updatedProfile = await apiClient.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
      })

      setProfile(updatedProfile)
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "pet_owner":
        return "Pet Owner"
      case "doctor":
        return "Doctor"
      case "staff":
        return "Staff"
      default:
        return role
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (!user) {
    return null
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">Loading profile...</div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">Profile not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-500">Manage your account information</p>
          </div>

          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Account Information
              </CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{getRoleBadge(profile.role)}</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500">Member since: {formatDate(profile.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}