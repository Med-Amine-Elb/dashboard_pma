"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
  Calendar,
  MessageSquare,
  Globe,
  Phone,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { StatsCard } from "@/components/stats-card"
import { ModernChart } from "@/components/modern-chart"
import { NotificationCard } from "@/components/notification-card"
import { TaskCard } from "@/components/task-card"
import { PhoneModal } from "@/components/phone-modal"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleAddPhone = () => {
    setIsPhoneModalOpen(true)
  }

  const handleSavePhone = (phoneData: any) => {
    toast({
      title: "Téléphone ajouté",
      description: "Le nouveau téléphone a été ajouté avec succès.",
    })
    setIsPhoneModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeItem="analytics" onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics - Gestion des Téléphones</h1>
                <p className="text-gray-600">Vue d'ensemble du parc téléphonique d'entreprise</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
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

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">
            {/* Notification Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <NotificationCard
                icon={<Bell className="h-5 w-5" />}
                title="Notification"
                subtitle="5 nouvelles demandes de téléphones"
                color="bg-gradient-to-r from-yellow-400 to-orange-500"
              />
              <NotificationCard
                icon={<MessageSquare className="h-5 w-5" />}
                title="Message"
                subtitle="3 retours de téléphones en attente"
                color="bg-gradient-to-r from-emerald-400 to-green-500"
              />
              <NotificationCard
                icon={<Calendar className="h-5 w-5" />}
                title="Calendrier"
                subtitle="2 maintenances programmées"
                color="bg-gradient-to-r from-purple-400 to-indigo-500"
              />
              <Button
                className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                onClick={handleAddPhone}
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter Nouveau Téléphone
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Statistics */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Statistiques des Téléphones</CardTitle>
                      <CardDescription>Évolution des attributions sur 6 mois</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ModernChart
                      type="line"
                      data={[
                        { name: "Jan", value1: 65, value2: 45 },
                        { name: "Fév", value1: 78, value2: 52 },
                        { name: "Mar", value1: 82, value2: 61 },
                        { name: "Avr", value1: 95, value2: 73 },
                        { name: "Mai", value1: 88, value2: 68 },
                        { name: "Jun", value1: 102, value2: 85 },
                      ]}
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    title="Téléphones Totaux"
                    value="156"
                    percentage="76%"
                    trend="up"
                    icon={<Phone className="h-5 w-5" />}
                    color="bg-blue-500"
                  />
                  <StatsCard
                    title="Téléphones Assignés"
                    value="134"
                    percentage="34%"
                    trend="up"
                    icon={<CheckCircle className="h-5 w-5" />}
                    color="bg-emerald-500"
                  />
                  <StatsCard
                    title="Disponibles"
                    value="22"
                    percentage="76%"
                    trend="up"
                    icon={<Clock className="h-5 w-5" />}
                    color="bg-purple-500"
                  />
                  <StatsCard
                    title="En Maintenance"
                    value="8"
                    percentage="76%"
                    trend="down"
                    icon={<AlertTriangle className="h-5 w-5" />}
                    color="bg-orange-500"
                  />
                </div>

                {/* Bar Chart */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Répartition par Département</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModernChart
                      type="bar"
                      data={[
                        { name: "IT", value1: 45, value2: 35 },
                        { name: "Sales", value1: 38, value2: 28 },
                        { name: "Marketing", value1: 52, value2: 42 },
                        { name: "R&D", value1: 61, value2: 51 },
                        { name: "Support", value1: 35, value2: 25 },
                        { name: "Finance", value1: 48, value2: 38 },
                      ]}
                      height={250}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Widgets */}
              <div className="space-y-6">
                {/* Current Balance */}
                <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Coût Total Parc</h3>
                      <MoreHorizontal className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold">€125,450.00</p>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">+8.2% depuis la semaine dernière</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Chart */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">En Cours</h3>
                      <span className="text-2xl font-bold text-purple-600">50%</span>
                    </div>
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <ModernChart
                        type="doughnut"
                        data={[
                          { name: "Terminé", value: 50 },
                          { name: "Restant", value: 50 },
                        ]}
                        height={128}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Gestion des Téléphones</h4>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Parc Téléphonique Entreprise</h5>
                      <p className="text-xs text-gray-600">
                        Préparer un tableau de bord pour surveiller les performances et l'utilisation.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Tasks */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Tâches Quotidiennes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <TaskCard
                      title="Livraison iPhone 15 Pro"
                      time="09:00 - 10:00"
                      color="bg-gradient-to-r from-red-400 to-pink-500"
                    />
                    <TaskCard
                      title="Maintenance Samsung Galaxy"
                      time="11:00 - 12:00"
                      color="bg-gradient-to-r from-yellow-400 to-orange-500"
                    />
                    <TaskCard
                      title="Retour Pixel 8"
                      time="14:00 - 15:00"
                      color="bg-gradient-to-r from-blue-400 to-purple-500"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PhoneModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSave={handleSavePhone}
        phone={null}
      />
    </div>
  )
}
