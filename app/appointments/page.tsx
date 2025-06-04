"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { Calendar, Clock, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Appointment = {
  _id: string
  doctor_id: string
  appointmentDate: string
  description: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  pet: {
    name: string
    type: string
    _id: string
    owner: {
      first_name: string
      last_name: string
    }
  }
  doctor: {
    first_name: string
    last_name: string
  }
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchAppointments = async () => {
      try {
        // First get all pets owned by the user
        console.log('user', user)
        const pets = await apiClient.getPets(user.id)
        console.log('pets', pets)
        const petIds = await pets.map((item) => item._id)

        if (petIds.length === 0) {
          setAppointments([])
          setIsLoading(false)
          return
        }

        // Then get all appointments for those pets
        const data = await apiClient.getAppointments({ petIds })
        setAppointments(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch appointments",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [user, router, toast])

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    try {
      await apiClient.updateAppointment(appointmentId, { status: "cancelled" })

      setAppointments(
        appointments.map((appointment) =>
          appointment._id === appointmentId ? { ...appointment, status: "cancelled" } : appointment,
        ),
      )

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "cancelled":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const isUpcoming = (appointment: Appointment) => {
    return (
      new Date(appointment.appointmentDate) > new Date() &&
      appointment.status !== "cancelled" &&
      appointment.status !== "completed"
    )
  }

  const isPast = (appointment: Appointment) => {
    return (
      new Date(appointment.appointmentDate) < new Date() ||
      appointment.status === "cancelled" ||
      appointment.status === "completed"
    )
  }

  const upcomingAppointments = appointments.filter(isUpcoming)
  const pastAppointments = appointments.filter(isPast)

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <Link href="/appointments/book">
            <Button className="gap-2">
              <Plus size={16} />
              Book Appointment
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No Appointments Yet</h2>
              <p className="text-gray-500 mb-6">Book an appointment for your pet</p>
              <Link href="/appointments/book">
                <Button className="gap-2">
                  <Plus size={16} />
                  Book Your First Appointment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingAppointments.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-gray-500">No upcoming appointments</p>
                    <Link href="/appointments/book" className="mt-4 inline-block">
                      <Button className="gap-2">
                        <Plus size={16} />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">{appointment.pet.name}</CardTitle>
                            <CardDescription>{appointment.pet.type}</CardDescription>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                            <Clock className="h-4 w-4 text-gray-500 ml-2" />
                            <span>{formatTime(appointment.appointmentDate)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Doctor:</span> {appointment.doctor.first_name}{" "}
                            {appointment.doctor.last_name}
                          </div>
                          {appointment.description && (
                            <div className="text-sm">
                              <span className="font-medium">Reason:</span> {appointment.description}
                            </div>
                          )}
                          {appointment.status === "scheduled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-500 hover:text-red-600 mt-2"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <X size={14} />
                              Cancel Appointment
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastAppointments.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-gray-500">No past appointments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">{appointment.pet.name}</CardTitle>
                            <CardDescription>{appointment.pet.type}</CardDescription>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                            <Clock className="h-4 w-4 text-gray-500 ml-2" />
                            <span>{formatTime(appointment.appointmentDate)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Doctor:</span> {appointment.doctor.first_name}{" "}
                            {appointment.doctor.last_name}
                          </div>
                          {appointment.description && (
                            <div className="text-sm">
                              <span className="font-medium">Reason:</span> {appointment.description}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
