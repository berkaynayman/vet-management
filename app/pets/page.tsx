"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { PawPrintIcon as Paw, Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Pet = {
  id: string
  name: string
  type: string
  breed: string
  date_of_birth: string
  gender: string
}

export default function PetsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPets = async () => {
      try {
        const data = await apiClient.getPets(user.id)
        setPets(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch pets",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPets()
  }, [user, router, toast])

  const handleDeletePet = async (petId: string) => {
    if (!confirm("Are you sure you want to delete this pet?")) {
      return
    }

    try {
      await apiClient.deletePet(petId)
      setPets(pets.filter((pet) => pet.id !== petId))

      toast({
        title: "Success",
        description: "Pet deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pet",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getPetTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "dog":
        return "🐕"
      case "cat":
        return "🐈"
      case "bird":
        return "🦜"
      case "rabbit":
        return "🐇"
      default:
        return "🐾"
    }
  }

  // Don't render anything if not authenticated - will redirect in useEffect
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Pets</h1>
          <Link href="/pets/add">
            <Button className="gap-2">
              <Plus size={16} />
              Add Pet
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading pets...</div>
        ) : pets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Paw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No Pets Added Yet</h2>
              <p className="text-gray-500 mb-6">Add your pets to manage their appointments and health records</p>
              <Link href="/pets/add">
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Your First Pet
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{getPetTypeIcon(pet.type)}</span>
                        {pet.name}
                      </CardTitle>
                      <CardDescription>{pet.breed || pet.type}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium capitalize">{pet.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-medium">{formatDate(pet.date_of_birth)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/pets/edit/${pet.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil size={14} />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-500 hover:text-red-600"
                    onClick={() => handleDeletePet(pet.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
