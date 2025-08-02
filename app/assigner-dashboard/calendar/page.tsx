"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, Plus, CalendarIcon, Clock, Users, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { EventModal } from "@/components/event-modal"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: "assignment" | "return" | "maintenance" | "meeting"
  participants: string[]
  status: "scheduled" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
}

export default function AssignerCalendarPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [events, setEvents] = useState<Event[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "assigner") {
      window.location.href = "/"
      return
    }

    loadEvents()
  }, [])

  const loadEvents = () => {
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Attribution iPhone 15 Pro",
        description: "Attribution d'un iPhone 15 Pro à Jean Dupont",
        date: "2024-01-15",
        time: "10:00",
        type: "assignment",
        participants: ["Jean Dupont", "Randy Riley"],
        status: "scheduled",
        priority: "medium",
      },
      {
        id: "2",
        title: "Retour Galaxy S22",
        description: "Retour du Galaxy S22 de Pierre Martin",
        date: "2024-01-16",
        time: "14:30",
        type: "return",
        participants: ["Pierre Martin", "Randy Riley"],
        status: "scheduled",
        priority: "low",
      },
      {
        id: "3",
        title: "Maintenance Pixel 7",
        description: "Réparation écran fissuré",
        date: "2024-01-17",
        time: "09:00",
        type: "maintenance",
        participants: ["Service Technique"],
        status: "scheduled",
        priority: "high",
      },
      {
        id: "4",
        title: "Réunion équipe",
        description: "Point mensuel sur les attributions",
        date: "2024-01-18",
        time: "15:00",
        type: "meeting",
        participants: ["Randy Riley", "Marie Assignateur", "Admin Système"],
        status: "scheduled",
        priority: "medium",
      },
    ]
    setEvents(mockEvents)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  const handleQuickAction = (type: "assignment" | "return" | "maintenance") => {
    const newEvent: Partial<Event> = {
      type,
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      status: "scheduled",
      priority: "medium",
      participants: ["Randy Riley"],
    }

    switch (type) {
      case "assignment":
        newEvent.title = "Nouvelle Attribution"
        newEvent.description = "Attribution d'un téléphone"
        break
      case "return":
        newEvent.title = "Nouveau Retour"
        newEvent.description = "Retour d'un téléphone"
        break
      case "maintenance":
        newEvent.title = "Nouvelle Maintenance"
        newEvent.description = "Maintenance d'un téléphone"
        break
    }

    setSelectedEvent(newEvent as Event)
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = (eventData: Partial<Event>) => {
    if (selectedEvent && selectedEvent.id) {
      // Edit existing event
      setEvents(events.map((event) => (event.id === selectedEvent.id ? { ...event, ...eventData } : event)))
      toast({
        title: "Événement modifié",
        description: "L'événement a été mis à jour avec succès.",
      })
    } else {
      // Add new event
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventData,
        status: "scheduled",
      } as Event
      setEvents([...events, newEvent])
      toast({
        title: "Événement créé",
        description: "Le nouvel événement a été ajouté au calendrier.",
      })
    }
    setIsEventModalOpen(false)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: string) => {
    return events.filter((event) => event.date === date)
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      assignment: "bg-blue-100 text-blue-800",
      return: "bg-green-100 text-green-800",
      maintenance: "bg-orange-100 text-orange-800",
      meeting: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "border-l-green-500",
      medium: "border-l-yellow-500",
      high: "border-l-red-500",
    }
    return colors[priority as keyof typeof colors] || "border-l-gray-500"
  }

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="calendar" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planification</h1>
                <p className="text-gray-600">Gestion du calendrier et des événements</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un événement..."
                    className="pl-10 w-80 bg-white/50 border-gray-200 focus:border-blue-500"
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
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
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
          <div className="p-6 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={handleCreateEvent}
                className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouvel Événement
              </Button>
              <Button
                onClick={() => handleQuickAction("assignment")}
                variant="outline"
                className="h-16 bg-white/50 hover:bg-white/80"
              >
                <Phone className="h-5 w-5 mr-2" />
                Attribution Rapide
              </Button>
              <Button
                onClick={() => handleQuickAction("return")}
                variant="outline"
                className="h-16 bg-white/50 hover:bg-white/80"
              >
                <Users className="h-5 w-5 mr-2" />
                Retour Rapide
              </Button>
              <Button
                onClick={() => handleQuickAction("maintenance")}
                variant="outline"
                className="h-16 bg-white/50 hover:bg-white/80"
              >
                <Clock className="h-5 w-5 mr-2" />
                Maintenance
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5" />
                        <span>
                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                          Aujourd'hui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDay }).map((_, index) => (
                        <div key={index} className="p-2 h-20"></div>
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1
                        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        const dayEvents = getEventsForDate(dateString)
                        const isToday = dateString === today

                        return (
                          <div
                            key={day}
                            className={`p-2 h-20 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 ${
                              isToday ? "bg-blue-50 border-blue-300" : ""
                            }`}
                            onClick={() => setSelectedDate(new Date(dateString))}
                          >
                            <div className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                              {day}
                            </div>
                            <div className="mt-1 space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">+{dayEvents.length - 2} autres</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Events List */}
              <div>
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Événements à venir</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events
                        .filter((event) => event.status === "scheduled")
                        .sort(
                          (a, b) =>
                            new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime(),
                        )
                        .slice(0, 5)
                        .map((event) => (
                          <div
                            key={event.id}
                            className={`p-4 border-l-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 ${getPriorityColor(event.priority)}`}
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsEventModalOpen(true)
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(event.date).toLocaleDateString("fr-FR")} à {event.time}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">{event.participants.length} participant(s)</span>
                            </div>
                          </div>
                        ))}
                      {events.filter((event) => event.status === "scheduled").length === 0 && (
                        <div className="text-center py-8">
                          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement</h3>
                          <p className="text-gray-600 mb-4">Aucun événement programmé pour le moment.</p>
                          <Button onClick={handleCreateEvent} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un événement
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
      />
    </div>
  )
}
