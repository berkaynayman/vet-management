"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isBefore } from "date-fns"
import { cn } from "@/lib/utils"

type Pet = {
  _id: string
  name: string
  type: string
}

type Doctor = {
  _id: string
  first_name: string
  last_name: string
}

type TimeSlot = {
  hour: number
  minute: number
  label: string
}

export default function BookAppointmentPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState<string | undefined>(undefined)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const [formData, setFormData] = useState({
    petId: "",
    doctorId: "",
    description: "",
  })

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
      }
    }

    const fetchDoctors = async () => {
      try {
        const data = await apiClient.getUsers({ role: "doctor" })
        setDoctors(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch doctors",
          variant: "destructive",
        })
      }
    }

    fetchPets()
    fetchDoctors()
  }, [user, router, toast])

  useEffect(() => {
    // Generate time slots from 9 AM to 5 PM with 30-minute intervals
    const slots: TimeSlot[] = []
    for (let hour = 9; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push({
          hour,
          minute,
          label: timeString,
        })
      }
    }
    setTimeSlots(slots)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTimeSelect = (time: string) => {
    setTimeSlot(time)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book an appointment",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!formData.petId || !formData.doctorId || !date || !timeSlot) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Parse the time slot
      const [hours, minutes] = timeSlot.split(":").map(Number)

      // Create a new date with the selected date and time
      const appointmentDate = new Date(date)
      appointmentDate.setHours(hours, minutes, 0, 0)

      await apiClient.createAppointment({
        pet_id: formData.petId,
        doctor_id: formData.doctorId,
        appointment_date: appointmentDate.toISOString(),
        description: formData.description,
        status: "scheduled",
      })

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      })

      router.push("/appointments")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Book an Appointment</CardTitle>
            <CardDescription>Schedule a visit for your pet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="petId">Select Pet *</Label>
                {pets.length === 0 ? (
                  <div className="text-sm text-red-500">
                    You need to add a pet first.{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/pets/add")}>
                      Add a pet
                    </Button>
                  </div>
                ) : (
                  <Select value={formData.petId} onValueChange={(value) => handleSelectChange("petId", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet._id} value={pet._id}>
                          {pet.name} ({pet.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorId">Select Doctor *</Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value) => handleSelectChange("doctorId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
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
                      disabled={(date) => {
                        // Disable past dates and weekends
                        return isBefore(date, new Date()) || date.getDay() === 0 || date.getDay() === 6
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.label}
                      type="button"
                      variant={timeSlot === slot.label ? "default" : "outline"}
                      className="text-xs"
                      onClick={() => handleTimeSelect(slot.label)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Reason for Visit</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the reason for the visit"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
