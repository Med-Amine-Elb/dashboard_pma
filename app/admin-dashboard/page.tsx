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
import { DashboardReportingApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"

export default function AdminDashboard() {
  const { userData } = useUser()
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Dashboard data state
  const [dashboardStats, setDashboardStats] = useState({
    totalPhones: 0,
    assignedPhones: 0,
    availablePhones: 0,
    maintenancePhones: 0,
    totalUsers: 0,
    totalSimCards: 0,
    activeAttributions: 0,
    pendingRequests: 0,
    totalCost: 0,
  })

  const [chartData, setChartData] = useState({
    monthlyAttributions: [] as Array<{ name: string; value1: number; value2: number }>,
    departmentStats: [] as Array<{ name: string; value1: number; value2: number }>,
    progressData: [] as Array<{ name: string; value1: number; value: number }>,
  })

  const [notifications, setNotifications] = useState({
    newRequests: 0,
    pendingReturns: 0,
    scheduledMaintenance: 0,
  })

  const [recentTasks, setRecentTasks] = useState<Array<{
    title: string
    time: string
    color: string
  }>>([])

  const [alerts, setAlerts] = useState<Array<{
    type: string
    message: string
    count: number
  }>>([])

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const dashboardApi = new DashboardReportingApi(getApiConfig(token))

      // Fetch all dashboard data in parallel
      const [overviewRes, phoneStatsRes, userStatsRes, recentActivityRes, alertsRes] = await Promise.all([
        dashboardApi.getDashboardOverview(),
        dashboardApi.getPhoneStats(),
        dashboardApi.getUserStats(),
        dashboardApi.getRecentActivity(10),
        dashboardApi.getAlerts(),
      ])

      // Process overview data
      const overview = overviewRes.data as any
      const overviewData = overview?.data || {}
      
      // Process phone stats
      const phoneStats = phoneStatsRes.data as any
      const phoneData = phoneStats?.data || {}
      
      // Process user stats
      const userStats = userStatsRes.data as any
      const userData = userStats?.data || {}

      // Update dashboard stats
      setDashboardStats({
        totalPhones: overviewData.totals?.phones || 0,
        assignedPhones: overviewData.assigned?.phones || 0,
        availablePhones: overviewData.available?.phones || 0,
        maintenancePhones: (overviewData.totals?.phones || 0) - (overviewData.assigned?.phones || 0) - (overviewData.available?.phones || 0),
        totalUsers: overviewData.totals?.users || 0,
        totalSimCards: overviewData.totals?.simCards || 0,
        activeAttributions: overviewData.assigned?.phones || 0,
        pendingRequests: 0, // This would come from requests API
        totalCost: calculateTotalCost(phoneData),
      })

      // Update chart data
      setChartData({
        monthlyAttributions: generateMonthlyData(overviewData),
        departmentStats: generateDepartmentData(phoneData, userData),
        progressData: generateProgressData(overviewData),
      })

      // Update notifications
      setNotifications({
        newRequests: 5, // Mock data - would come from requests API
        pendingReturns: 3, // Mock data - would come from requests API
        scheduledMaintenance: 2, // Mock data - would come from maintenance API
      })

      // Process recent activity
      const recentActivity = recentActivityRes.data as any
      const activities = recentActivity?.data?.recentActivities || []
      setRecentTasks(activities.slice(0, 3).map((activity: any, index: number) => ({
        title: activity.description || `Activité ${index + 1}`,
        time: formatTime(activity.date),
        color: getTaskColor(index),
      })))

      // Process alerts
      const alertsData = alertsRes.data as any
      setAlerts(alertsData?.data || [])

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const calculateTotalCost = (phoneData: any) => {
    // This would calculate based on real phone prices
    return phoneData?.totalPhones ? phoneData.totalPhones * 25000 : 1254500 // Default value in MAD
  }

  const generateMonthlyData = (overviewData: any) => {
    // Generate monthly attribution data - this would ideally come from a specific endpoint
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"]
    return months.map((month, index) => ({
      name: month,
      value1: Math.floor(Math.random() * 40) + 60, // Mock data - would come from time-series API
      value2: Math.floor(Math.random() * 30) + 40,
    }))
  }

  const generateDepartmentData = (phoneData: any, userData: any) => {
    // Generate department distribution data
    const departments = ["IT", "Sales", "Marketing", "R&D", "Support", "Finance"]
    return departments.map(dept => ({
      name: dept,
      value1: Math.floor(Math.random() * 30) + 30,
      value2: Math.floor(Math.random() * 20) + 20,
    }))
  }

  const generateProgressData = (overviewData: any) => {
    const assigned = overviewData.assigned?.phones || 0
    const total = overviewData.totals?.phones || 1
    const percentage = Math.round((assigned / total) * 100)
    
    return [
      { name: "Assigné", value1: percentage, value: percentage },
      { name: "Disponible", value1: 100 - percentage, value: 100 - percentage },
    ]
  }

  const formatTime = (date: string) => {
    if (!date) return "Récemment"
    const now = new Date()
    const activityDate = new Date(date)
    const diff = now.getTime() - activityDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return "Récemment"
    if (hours < 24) return `Il y a ${hours}h`
    return activityDate.toLocaleDateString("fr-FR")
  }

  const getTaskColor = (index: number) => {
    const colors = [
      "bg-gradient-to-r from-red-400 to-pink-500",
      "bg-gradient-to-r from-yellow-400 to-orange-500",
      "bg-gradient-to-r from-blue-400 to-purple-500",
    ]
    return colors[index % colors.length]
  }

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
    // Refresh dashboard data
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement du tableau de bord...</h2>
          <p className="text-gray-600">Récupération des données en cours</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">Réessayer</Button>
        </div>
      </div>
    )
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
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {userData.initials || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{userData.name || "Admin"}</p>
                    <p className="text-xs text-gray-500">{userData.email || "admin@company.com"}</p>
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
                subtitle={`${notifications.newRequests} nouvelles demandes de téléphones`}
                color="bg-gradient-to-r from-yellow-400 to-orange-500"
              />
              <NotificationCard
                icon={<MessageSquare className="h-5 w-5" />}
                title="Message"
                subtitle={`${notifications.pendingReturns} retours de téléphones en attente`}
                color="bg-gradient-to-r from-emerald-400 to-green-500"
              />
              <NotificationCard
                icon={<Calendar className="h-5 w-5" />}
                title="Calendrier"
                subtitle={`${notifications.scheduledMaintenance} maintenances programmées`}
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
                      data={chartData.monthlyAttributions}
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    title="Téléphones Totaux"
                    value={dashboardStats.totalPhones.toString()}
                    percentage={`${Math.round((dashboardStats.totalPhones / (dashboardStats.totalPhones + 50)) * 100)}%`}
                    trend="up"
                    icon={<Phone className="h-5 w-5" />}
                    color="bg-blue-500"
                  />
                  <StatsCard
                    title="Téléphones Assignés"
                    value={dashboardStats.assignedPhones.toString()}
                    percentage={`${Math.round((dashboardStats.assignedPhones / dashboardStats.totalPhones) * 100)}%`}
                    trend="up"
                    icon={<CheckCircle className="h-5 w-5" />}
                    color="bg-emerald-500"
                  />
                  <StatsCard
                    title="Disponibles"
                    value={dashboardStats.availablePhones.toString()}
                    percentage={`${Math.round((dashboardStats.availablePhones / dashboardStats.totalPhones) * 100)}%`}
                    trend="up"
                    icon={<Clock className="h-5 w-5" />}
                    color="bg-purple-500"
                  />
                  <StatsCard
                    title="En Maintenance"
                    value={dashboardStats.maintenancePhones.toString()}
                    percentage={`${Math.round((dashboardStats.maintenancePhones / dashboardStats.totalPhones) * 100)}%`}
                    trend={dashboardStats.maintenancePhones > 5 ? "up" : "down"}
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
                      data={chartData.departmentStats}
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
                      <p className="text-3xl font-bold">{dashboardStats.totalCost.toLocaleString('fr-FR')}.00 MAD</p>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">+{((dashboardStats.assignedPhones / dashboardStats.totalPhones) * 10).toFixed(1)}% depuis la semaine dernière</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Chart */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Attribution</h3>
                      <span className="text-2xl font-bold text-purple-600">{Math.round((dashboardStats.assignedPhones / dashboardStats.totalPhones) * 100)}%</span>
                    </div>
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <ModernChart
                        type="doughnut"
                        data={chartData.progressData}
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
                    {recentTasks.length > 0 ? (
                      recentTasks.map((task, index) => (
                        <TaskCard
                          key={index}
                          title={task.title}
                          time={task.time}
                          color={task.color}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>Aucune activité récente</p>
                      </div>
                    )}
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
