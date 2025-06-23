"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { Calendar, Clock, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isToday, isFuture, isPast } from "date-fns"

type Appointment = {
  _id: string
  pet_id: string
  appointmentDate: string
  description: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  pet: {
    name: string
    type: string
    owner: {
      first_name: string
      last_name: string
    }
  }
}

export default function DoctorSchedulePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)
  const { apiClient } = require("@/lib/api-client")

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

    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        
        // Fetch appointments using apiClient
        const appointments = await apiClient.getAppointments({ doctorId: user._id });
        
        // Filter out cancelled appointments
        const filteredAppointments = appointments.filter(
          (appointment: any) => appointment.status !== "cancelled"
        );
        
        setAppointments(filteredAppointments || [])
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
  }, [user, authLoading, accessChecked, toast])

  const handleStartAppointment = async (appointmentId: string) => {
    try {
      // Update appointment status using apiClient
      await apiClient.updateAppointment(appointmentId, { status: "in_progress" });

      // Update local state
      setAppointments(
        appointments.map((appointment) =>
          appointment._id === appointmentId ? { ...appointment, status: "in_progress" } : appointment,
        ),
      )

      router.push(`/doctor/appointment/${appointmentId}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start appointment",
        variant: "destructive",
      })
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

  const todayAppointments = appointments.filter(
    (appointment) => isToday(new Date(appointment.appointmentDate)) && appointment.status !== "completed",
  )

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      !isToday(new Date(appointment.appointmentDate)) && isFuture(new Date(appointment.appointmentDate)),
  )

  const pastAppointments = appointments.filter(
    (appointment) =>
      (isPast(new Date(appointment.appointmentDate)) && !isToday(new Date(appointment.appointmentDate))) ||
      appointment.status === "completed",
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-gray-500">Manage your appointments and patient visits</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading appointments...</div>
        ) : (
          <Tabs defaultValue="today">
            <TabsList className="mb-6">
              <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              {todayAppointments.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-gray-500">No appointments scheduled for today</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <Card key={appointment._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">{appointment.pet.name}</CardTitle>
                            <CardDescription>
                              {appointment.pet.type} • Owner: {appointment.pet.owner.first_name}{" "}
                              {appointment.pet.owner.last_name}
                            </CardDescription>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{formatTime(appointment.appointmentDate)}</span>
                          </div>
                          {appointment.description && (
                            <div className="text-sm">
                              <span className="font-medium">Reason:</span> {appointment.description}
                            </div>
                          )}
                          {appointment.status === "scheduled" && (
                            <Button className="gap-2 mt-2" onClick={() => handleStartAppointment(appointment._id)}>
                              <FileText size={16} />
                              Start Appointment
                            </Button>
                          )}
                          {appointment.status === "in_progress" && (
                            <Button
                              className="gap-2 mt-2"
                              onClick={() => router.push(`/doctor/appointment/${appointment._id}`)}
                            >
                              <FileText size={16} />
                              Continue Appointment
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {upcomingAppointments.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-gray-500">No upcoming appointments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">{appointment.pet.name}</CardTitle>
                            <CardDescription>
                              {appointment.pet.type} • Owner: {appointment.pet.owner.first_name}{" "}
                              {appointment.pet.owner.last_name}
                            </CardDescription>
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
                    <Card key={appointment._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">{appointment.pet.name}</CardTitle>
                            <CardDescription>
                              {appointment.pet.type} • Owner: {appointment.pet.owner.first_name}{" "}
                              {appointment.pet.owner.last_name}
                            </CardDescription>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          {appointment.status === "completed" && (
                            <Button
                              variant="outline"
                              className="gap-2 mt-2"
                              onClick={() => router.push(`/doctor/appointment/${appointment._id}`)}
                            >
                              <FileText size={16} />
                              View Details
                            </Button>
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
