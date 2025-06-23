"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"

type AppointmentDetails = {
  _id: string
  appointment_id: string
  diagnosis: string | null
  treatment: string | null
  notes: string | null
}

type Appointment = {
  _id: string
  pet_id: string
  appointment_date: string
  description: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  pet: {
    name: string
    type: string
    breed: string | null
    date_of_birth: string | null
    gender: string
    owner: {
      first_name: string
      last_name: string
      phone: string
      email: string
    }
  }
  details?: AppointmentDetails
}

export default function AppointmentDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    notes: "",
  })



  // First useEffect just for access control
  useEffect(() => {
    // Wait until auth is no longer loading
    if (authLoading) return

    // Only check access once
    if (accessChecked) return

    setAccessChecked(true)

    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "doctor") {
      toast({
        title: "Access Denied",
        description: "Only doctors can access this page",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [user, authLoading, router, toast, accessChecked])

  // Second useEffect for data fetching, only runs after access check
  useEffect(() => {
    // Don't fetch data until auth is loaded and access is checked
    if (authLoading || !accessChecked || !user || user.role !== "doctor") {
      return
    }

    const fetchAppointment = async () => {
      try {
        // Fetch appointment data
        const appointmentData = await apiClient.getAppointment(appointmentId)

        if (!appointmentData) {
          toast({
            title: "Error",
            description: "Appointment not found",
            variant: "destructive",
          })
          router.push("/doctor/schedule")
          return
        }

        // Check if this appointment belongs to the current doctor
        if (appointmentData.doctor._id !== user._id) {
          toast({
            title: "Access Denied",
            description: "You don't have access to this appointment",
            variant: "destructive",
          })
          router.push("/doctor/schedule")
          return
        }

        // If appointment has details, set the form data
        if (appointmentData.details) {
          setFormData({
            diagnosis: appointmentData.details.diagnosis || "",
            treatment: appointmentData.details.treatment || "",
            notes: appointmentData.details.notes || "",
          })
        }

        setAppointment(appointmentData)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch appointment details",
          variant: "destructive",
        })
        router.push("/doctor/schedule")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointment()
  }, [user, authLoading, accessChecked, toast, appointmentId, router])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!appointment) return

    setIsSaving(true)

    try {
      // Create or update appointment details
      const detailsData = {
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        notes: formData.notes || null,
      }
      
      const updatedDetails = await apiClient.createOrUpdateAppointmentDetails(appointment._id, detailsData)

      toast({
        title: "Success",
        description: "Appointment details saved successfully",
      })

      // Update local state
      setAppointment({
        ...appointment,
        details: updatedDetails,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save appointment details",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteAppointment = async () => {
    if (!appointment) return

    if (!confirm("Are you sure you want to complete this appointment?")) {
      return
    }

    setIsSaving(true)

    try {
      // First save any unsaved details
      await handleSave()

      // Then update appointment status
      await apiClient.updateAppointment(appointment._id, { status: "completed" })

      toast({
        title: "Success",
        description: "Appointment completed successfully",
      })

      setAppointment({
        ...appointment,
        status: "completed",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete appointment",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return format(date, "PPP")
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return format(date, "p")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Don't render anything until auth is loaded and access is checked
  if (authLoading || !accessChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">Loading...</div>
        </main>
      </div>
    )
  }

  // If user is not a doctor, don't render anything (redirect happens in useEffect)
  if (!user || user.role !== "doctor") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">Loading appointment details...</div>
        </main>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">Appointment not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="gap-2 mb-4" onClick={() => router.push("/doctor/schedule")}>
            <ArrowLeft size={16} />
            Back to Schedule
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Appointment Details</h1>
              <p className="text-gray-500">
                {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_date)}
              </p>
            </div>
            {getStatusBadge(appointment.status)}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Pet Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{appointment.pet.name}</h3>
                  <p className="text-gray-500">
                    {appointment.pet.type} • {appointment.pet.breed || "No breed specified"}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender:</span>
                    <span className="font-medium capitalize">{appointment.pet.gender}</span>
                  </div>
                  {appointment.pet.date_of_birth && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-medium">{formatDate(appointment.pet.date_of_birth)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Owner Information</h4>
                  <p>
                    {appointment.pet.owner.first_name} {appointment.pet.owner.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{appointment.pet.owner.email}</p>
                  <p className="text-sm text-gray-500">{appointment.pet.owner.phone}</p>
                </div>

                {appointment.description && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Reason for Visit</h4>
                    <p className="text-sm">{appointment.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Medical Notes</CardTitle>
                <CardDescription>
                  {appointment.status === "completed"
                    ? "Appointment has been completed"
                    : "Record your findings and treatment plan"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Enter diagnosis"
                    rows={3}
                    disabled={appointment.status === "completed"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment Plan</Label>
                  <Textarea
                    id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    placeholder="Enter treatment plan"
                    rows={3}
                    disabled={appointment.status === "completed"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter any additional notes"
                    rows={3}
                    disabled={appointment.status === "completed"}
                  />
                </div>

                {appointment.status !== "completed" && (
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Notes"}
                    </Button>
                    <Button className="flex-1 gap-2" onClick={handleCompleteAppointment} disabled={isSaving}>
                      <CheckCircle size={16} />
                      {isSaving ? "Processing..." : "Complete Appointment"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
