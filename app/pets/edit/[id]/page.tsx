"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Pet = {
  _id: string
  name: string
  type: string
  breed?: string
  date_of_birth?: string
  gender: string
  owner_id: string
}

export default function EditPetPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const petId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [pet, setPet] = useState<Pet | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    gender: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPet = async () => {
      try {
        const petData = await apiClient.getPet(petId)
        
        // Check if user owns this pet
        if (petData.owner_id !== user._id) {
          toast({
            title: "Access Denied",
            description: "You can only edit your own pets",
            variant: "destructive",
          })
          router.push("/pets")
          return
        }

        setPet(petData)
        setFormData({
          name: petData.name,
          type: petData.type,
          breed: petData.breed || "",
          gender: petData.gender,
        })
        
        if (petData.date_of_birth) {
          setDate(new Date(petData.date_of_birth))
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch pet details",
          variant: "destructive",
        })
        router.push("/pets")
      } finally {
        setIsFetching(false)
      }
    }

    fetchPet()
  }, [user, router, toast, petId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !pet) {
      return
    }

    if (!formData.name || !formData.type || !formData.gender) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await apiClient.updatePet(pet._id, {
        name: formData.name,
        type: formData.type,
        breed: formData.breed || undefined,
        date_of_birth: date ? date.toISOString().split("T")[0] : undefined,
        gender: formData.gender,
      })

      toast({
        title: "Success",
        description: "Pet updated successfully!",
      })

      router.push("/pets")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update pet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">Loading pet details...</div>
        </main>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">Pet not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Edit Pet</CardTitle>
            <CardDescription>Update your pet's information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pet Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Pet Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/pets")}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Pet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}