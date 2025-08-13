
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, Plus, CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { EventModal } from "@/components/event-modal"
import { useToast } from "@/hooks/use-toast"
import { CalendarEventControllerApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"

interface CalendarEvent {
  id: number
  title: string
  time: string
  date: string
  type: "delivery" | "maintenance" | "return" | "training"
  assignee: string
}

export default function CalendarPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }

    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        setEvents([])
        return
      }
      const api = new CalendarEventControllerApi(getApiConfig(token))
      const res = await api.getAllEvents(0, 100, "startTime", "asc")
      const body: any = res.data
      const page = body?.content || body?.data?.content || body?.data || []
      const mapped: CalendarEvent[] = (Array.isArray(page) ? page : []).map((e: any): CalendarEvent => ({
        id: Number(e.id ?? Date.now()),
        title: e.title || e.name || "Événement",
        time: e.timeRange || e.time || "09:00 - 10:00",
        date: e.date || e.startTime?.substring(0,10) || new Date().toISOString().split("T")[0],
        type: ((): CalendarEvent["type"] => {
          const t = String(e.type || e.category || "delivery").toLowerCase()
          if (t.includes("assign") || t.includes("delivery")) return "delivery"
          if (t.includes("maint")) return "maintenance"
          if (t.includes("return")) return "return"
          if (t.includes("train") || t.includes("meet")) return "training"
          return "delivery"
        })(),
        assignee: e.organizer || e.assignee || (Array.isArray(e.attendees) ? e.attendees[0] : "")
      }))
      setEvents(mapped)
    } catch (err) {
      console.error("Failed to load events", err)
      setEvents([])
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleAddEvent = () => {
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = async (eventData: any) => {
    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: eventData.title || "",
      time: eventData.time || "",
      date: eventData.date || "",
      // Map event-modal types (assignment/return/maintenance/meeting) to local types
      type: ((): CalendarEvent["type"] => {
        const t = (eventData.type || "delivery") as string
        if (t === "assignment") return "delivery"
        if (t === "meeting") return "training"
        if (t === "maintenance") return "maintenance"
        if (t === "return") return "return"
        return "delivery"
      })(),
      assignee: Array.isArray(eventData.participants) && eventData.participants.length > 0
        ? eventData.participants[0]
        : (eventData.assignee || ""),
    }
    setEvents([...events, newEvent])

    // Persist to backend
    try {
      const token = localStorage.getItem("jwt_token")
      if (token) {
        const api = new CalendarEventControllerApi(getApiConfig(token))
        await api.createEvent({
          title: newEvent.title,
          description: "",
          startTime: newEvent.date + "T" + (newEvent.time?.split(" - ")[0] || "09:00") + ":00",
          endTime: newEvent.date + "T" + (newEvent.time?.split(" - ")[1] || "10:00") + ":00",
          status: "SCHEDULED" as any,
          location: "",
          organizer: newEvent.assignee,
          attendees: [newEvent.assignee],
          type: newEvent.type.toUpperCase() as any,
        } as any)
        // Reload to reflect server truth
        await loadEvents()
      }
    } catch (e) {
      console.warn("Failed to persist event, keeping local only", e)
    }
    toast({
      title: "Événement créé",
      description: "Le nouvel événement a été ajouté au calendrier.",
    })
    setIsEventModalOpen(false)
  }

  const getEventColor = (type: string) => {
    const colors = {
      delivery: "bg-green-100 text-green-800",
      maintenance: "bg-orange-100 text-orange-800",
      return: "bg-blue-100 text-blue-800",
      training: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Calendar grid functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert to Monday = 0
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear()
  }

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear()
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  // Generate calendar grid
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = getFirstDayOfMonth(currentDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      days.push(date)
    }

    return days
  }

  // Filter events for selected date
  const getFilteredEvents = () => {
    if (!selectedDate) return events
    return getEventsForDate(selectedDate)
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="calendar" onLogout={handleLogout} />

        <div className="flex-1 ml-64 min-h-screen overflow-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Planification</h1>
                <p className="text-gray-600">Calendrier des événements et maintenances</p>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-10 w-60 lg:w-80 bg-white/50 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <Button variant="outline" size="sm" className="bg-white/50">
                  <Globe className="h-4 w-4 mr-2" />
                  FR
                </Button>

                <Button variant="outline" size="sm" className="bg-white/50 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>

                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{formatMonthYear(currentDate)}</h2>
                <p className="text-gray-600">
                  {selectedDate 
                    ? `Événements du ${selectedDate.toLocaleDateString('fr-FR')}`
                    : "Événements à venir"
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Aujourd'hui
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" onClick={handleAddEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Événement
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5" />
                        <span>Calendrier</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={goToNextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {generateCalendarDays().map((date, index) => (
                        <div
                          key={index}
                          className={`aspect-square p-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${
                            !date ? 'invisible' : ''
                          } ${
                            date && isToday(date) ? 'bg-blue-500 text-white' : ''
                          } ${
                            date && isSelectedDate(date) ? 'ring-2 ring-blue-300 bg-blue-100' : ''
                          } ${
                            date && !isToday(date) && !isSelectedDate(date) ? 'text-gray-700' : ''
                          }`}
                          onClick={() => date && handleDateClick(date)}
                        >
                          {date && (
                            <>
                              <div className={`text-sm font-medium ${
                                isToday(date) ? 'text-white' : 'text-gray-900'
                              }`}>
                                {date.getDate()}
                              </div>
                              <div className="mt-1 space-y-1">
                                {getEventsForDate(date).slice(0, 2).map((event) => (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded truncate ${getEventColor(event.type)}`}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {getEventsForDate(date).length > 2 && (
                                  <div className="text-xs text-gray-500">+{getEventsForDate(date).length - 2} autres</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Events List */}
              <div className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>
                      {selectedDate 
                        ? `Événements du ${selectedDate.toLocaleDateString('fr-FR')}`
                        : "Événements à venir"
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getFilteredEvents().length > 0 ? (
                      getFilteredEvents().map((event) => (
                        <div
                          key={event.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <Badge className={getEventColor(event.type)}>{event.type}</Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString("fr-FR")}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{event.assignee}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {selectedDate 
                          ? "Aucun événement pour cette date"
                          : "Aucun événement à venir"
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      onClick={handleAddEvent}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Planifier livraison
                    </Button>
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      onClick={handleAddEvent}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Programmer maintenance
                    </Button>
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      onClick={handleAddEvent}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Organiser formation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={handleSaveEvent} />
    </div>
  )
}
