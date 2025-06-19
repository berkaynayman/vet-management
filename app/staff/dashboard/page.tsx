"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { Calendar, Clock, Users, PawPrintIcon as Paw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isToday, isFuture, addDays } from "date-fns"

type Appointment = {
  _id: string
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
  doctor: {
    first_name: string
    last_name: string
  }
}

type Stats = {
  totalAppointments: number
  todayAppointments: number
  totalPets: number
  totalOwners: number
}

export default function StaffDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPets: 0,
    totalOwners: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)
undefined

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

    if (user.role !== "staff") {
      toast({
        title: "Access Denied",
        description: "Only staff members can access this page",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [user, authLoading, router, toast, accessChecked])

  // Second useEffect for data fetching, only runs after access check
  useEffect(() => {
    // Don't fetch data until auth is loaded and access is checked
    if (authLoading || !accessChecked || !user || user.role !== "staff") {
      return
    }

    const fetchAppointments = async () => {
      try {
        // Fetch all appointments
        const appointments = await apiClient.getAppointments()
        setAppointments(appointments || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch appointments",
          variant: "destructive",
        })
      }
    }

    const fetchStats = async () => {
      try {
        // Get statistics from the API
        const statsData = await apiClient.getStats()
        
        setStats({
          totalAppointments: statsData.totalAppointments || 0,
          todayAppointments: statsData.todayAppointments || 0,
          totalPets: statsData.totalPets || 0,
          totalOwners: statsData.totalOwners || 0,
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch statistics",
          variant: "destructive",
        })
      }
    }

    Promise.all([fetchAppointments(), fetchStats()]).finally(() => {
      setIsLoading(false)
    })
  }, [user, authLoading, accessChecked, toast])

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

  // If user is not a staff member, don't render anything (redirect happens in useEffect)
  if (!user || user.role !== "staff") {
    return null
  }

  const todayAppointments = appointments.filter(
    (appointment) => isToday(new Date(appointment.appointmentDate)) && appointment.status !== "cancelled",
  )

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      !isToday(new Date(appointment.appointmentDate)) &&
      isFuture(new Date(appointment.appointmentDate)) &&
      appointment.status !== "cancelled",
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-gray-500">Overview of clinic appointments and statistics</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Appointments</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalAppointments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar className="h-6 w-6 text-gray-500" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Today's Appointments</CardDescription>
                  <CardTitle className="text-3xl">{stats.todayAppointments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Clock className="h-6 w-6 text-gray-500" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Pets</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalPets}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Paw className="h-6 w-6 text-gray-500" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pet Owners</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalOwners}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Users className="h-6 w-6 text-gray-500" />
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="today">
              <TabsList className="mb-6">
                <TabsTrigger value="today">Today's Appointments</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
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
                            <div className="text-sm">
                              <span className="font-medium">Doctor:</span> Dr. {appointment.doctor.first_name}{" "}
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
                            <div className="text-sm">
                              <span className="font-medium">Doctor:</span> Dr. {appointment.doctor.first_name}{" "}
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
          </>
        )}
      </main>
    </div>
  )
}
