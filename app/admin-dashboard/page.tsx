"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
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
  ClipboardList,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { StatsCard } from "@/components/stats-card"
import dynamic from "next/dynamic"
import { NotificationCard } from "@/components/notification-card"
import { TaskCard } from "@/components/task-card"
import { PhoneModal } from "@/components/phone-modal"
import { DashboardHeader } from "@/components/dashboard-header"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/contexts/SidebarContext"

// Dynamically import ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })
import { DashboardReportingApi } from "@/api/generated/apis/dashboard-reporting-api";
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"
import { clearAuthCookies } from "@/lib/authCookies"

const fetcher = async () => {
  const token = localStorage.getItem("jwt_token")
  if (!token) throw new Error("No authentication token found")

  const dashboardApi = new DashboardReportingApi(getApiConfig(token))
  let overviewRes, phoneStatsRes, userStatsRes, simCardStatsRes, recentActivityRes, alertsRes;
  try {
    [overviewRes, phoneStatsRes, userStatsRes, simCardStatsRes, recentActivityRes, alertsRes] = await Promise.all([
      dashboardApi.getDashboardOverview(),
      dashboardApi.getPhoneStats(),
      dashboardApi.getUserStats(),
      dashboardApi.getSimCardStats(),
      dashboardApi.getRecentActivity(10),
      dashboardApi.getAlerts(),
    ])
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      clearAuthCookies();
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("userRole");
      window.location.href = "/";
    }
    throw error;
  }

  return {
    overviewData: (overviewRes.data as any)?.data || {},
    phoneData: (phoneStatsRes.data as any)?.data || {},
    userData: (userStatsRes.data as any)?.data || {},
    simCardData: (simCardStatsRes.data as any)?.data || {},
    recentActivityData: (recentActivityRes.data as any)?.data?.recentActivities || [],
    alertsData: (alertsRes.data as any)?.data || []
  }
}

export default function AdminDashboard() {
  const { isCollapsed } = useSidebar()
  const { userData } = useUser()
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const { data, error: swrError, isLoading, mutate } = useSWR('adminDashboardData', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000
  })

  const loading = isLoading && !data
  const error = swrError?.message || null

  const dashboardStats = useMemo(() => {
    if (!data) return { totalPhones: 0, assignedPhones: 0, availablePhones: 0, maintenancePhones: 0, totalUsers: 0, totalSimCards: 0, activeAttributions: 0, pendingRequests: 0, totalCost: 0 }
    
    const { overviewData, phoneData, simCardData } = data as any
    return {
      totalPhones: overviewData.totals?.phones || 0,
      assignedPhones: overviewData.assigned?.phones || 0,
      availablePhones: overviewData.available?.phones || 0,
      maintenancePhones: (overviewData.totals?.phones || 0) - (overviewData.assigned?.phones || 0) - (overviewData.available?.phones || 0),
      totalUsers: overviewData.totals?.users || 0,
      totalSimCards: simCardData.totalSimCards || overviewData.totals?.simCards || 0,
      activeAttributions: overviewData.assigned?.phones || 0,
      pendingRequests: overviewData.pendingRequests || 0,
      totalCost: calculateTotalCost(phoneData, simCardData),
    }
  }, [data])

  const chartData = useMemo(() => {
    if (!data) return { monthlyOption: {}, departmentOption: {}, progressOption: {} }
    
    const monthlyAttributions = generateMonthlyData(data.overviewData)
    const departmentStats = generateDepartmentData(data.phoneData, data.userData, data.overviewData, data.simCardData)
    const progressData = generateProgressData(data.overviewData)

    return {
      monthlyOption: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['Attributions', 'Retours'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: monthlyAttributions.map((m: any) => m.name) },
        yAxis: { 
          type: 'value',
          minInterval: 1,
        },
        series: [
          {
            name: 'Attributions',
            type: 'line',
            smooth: true,
            data: monthlyAttributions.map((m: any) => m.value1),
            itemStyle: { color: '#3B82F6' },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.4)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]
              }
            }
          },
          {
            name: 'Retours',
            type: 'line',
            smooth: true,
            data: monthlyAttributions.map((m: any) => m.value2),
            itemStyle: { color: '#F59E0B' },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: 'rgba(245, 158, 11, 0.4)' }, { offset: 1, color: 'rgba(245, 158, 11, 0)' }]
              }
            }
          }
        ]
      },
      departmentOption: {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
          type: 'value',
          minInterval: 1,
         },
        yAxis: { type: 'category', data: departmentStats.map((d: any) => d.name) },
        series: [
          {
            name: 'Téléphones Assignés',
            type: 'bar',
            data: departmentStats.map((d: any) => d.value1),
            itemStyle: { 
              borderRadius: [0, 4, 4, 0],
              color: (params: any) => {
                const colorPairs = [
                  ['#3B82F6', '#60A5FA'], // Blue
                  ['#10B981', '#34D399'], // Green
                  ['#F59E0B', '#FBBF24'], // Yellow/Orange
                  ['#8B5CF6', '#A78BFA'], // Purple
                  ['#EC4899', '#F472B6'], // Pink
                  ['#EF4444', '#F87171'], // Red
                  ['#06B6D4', '#22D3EE'], // Cyan
                ];
                const pair = colorPairs[params.dataIndex % colorPairs.length];
                return {
                  type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                  colorStops: [
                    { offset: 0, color: pair[0] },
                    { offset: 1, color: pair[1] }
                  ]
                };
              }
            }
          }
        ]
      },
      progressOption: {
        tooltip: { trigger: 'item' },
        series: [
          {
            name: 'Attribution',
            type: 'pie',
            radius: ['70%', '90%'],
            avoidLabelOverlap: false,
            label: { show: false },
            data: progressData.map(p => ({ value: p.value1, name: p.name })),
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
              color: (params: any) => params.dataIndex === 0 ? '#8B5CF6' : '#E5E7EB'
            }
          }
        ]
      }
    }
  }, [data])

  const notifications = useMemo(() => {
    const d = data as any
    return {
      newRequests: d?.overviewData?.pendingRequests || 0,
      pendingReturns: d?.overviewData?.pendingReturns || 0,
      scheduledMaintenance: d?.overviewData?.scheduledMaintenance || 0,
    }
  }, [data])

  const recentTasks = useMemo(() => {
    const d = data as any
    if (!d?.recentActivityData) return []
    
    let activity = d.recentActivityData
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase()
      activity = activity.filter((act: any) => 
        (act.description || '').toLowerCase().includes(lowSearch) ||
        (act.userName || '').toLowerCase().includes(lowSearch)
      )
    }

    return activity.slice(0, 3).map((activity: any, index: number) => ({
      title: activity.description || `Activité ${index + 1}`,
      time: formatTime(activity.date),
      color: getTaskColor(index),
    }))
  }, [data, searchTerm])

  const alerts = useMemo(() => {
    const baseAlerts = data?.alertsData || []
    if (!searchTerm) return baseAlerts
    const lowSearch = searchTerm.toLowerCase()
    return baseAlerts.filter((alert: any) => 
      (alert.message || '').toLowerCase().includes(lowSearch) ||
      (alert.type || '').toLowerCase().includes(lowSearch)
    )
  }, [data, searchTerm])

  // Helper functions
  function calculateTotalCost(phoneData: any, simCardData: any) {
    if (phoneData?.totalCost) return phoneData.totalCost
    const averagePhonePrice = phoneData?.averagePrice || 25000
    const averageSimPrice = simCardData?.averagePrice || 500
    const totalPhones = phoneData?.totalPhones || 0
    const totalSimCards = simCardData?.totalSimCards || 0
    return (totalPhones * averagePhonePrice) + (totalSimCards * averageSimPrice)
  }

  function generateMonthlyData(overviewData: any) {
    if (overviewData?.monthlyStats && Array.isArray(overviewData.monthlyStats)) {
      return overviewData.monthlyStats.map((month: any) => ({
        name: month.month || "Unknown",
        value1: month.attributions || 0,
        value2: month.returns || 0,
      }))
    }
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"]
    return months.map((month) => ({ name: month, value1: 0, value2: 0 }))
  }

  function generateDepartmentData(phoneData: any, userData: any, overviewData: any, simCardData: any) {
    if (userData?.departmentStats && Array.isArray(userData.departmentStats)) {
      return userData.departmentStats.map((dept: any) => ({
        name: dept.department || "Unknown",
        value1: dept.assignedPhones || 0,
        value2: dept.totalUsers || 0,
      }))
    }
    return []
  }

  function generateProgressData(overviewData: any) {
    const assigned = overviewData?.assigned?.phones || 0
    const total = overviewData?.totals?.phones || 1
    const percentage = Math.round((assigned / total) * 100)
    
    return [
      { name: "Assigné", value1: percentage, value: percentage },
      { name: "Disponible", value1: 100 - percentage, value: 100 - percentage },
    ]
  }

  function formatTime(date: string) {
    if (!date) return "Récemment"
    const now = new Date()
    const activityDate = new Date(date)
    const diff = now.getTime() - activityDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return "Récemment"
    if (hours < 24) return `Il y a ${hours}h`
    return activityDate.toLocaleDateString("fr-FR")
  }

  function getTaskColor(index: number) {
    const colors = [
      "bg-gradient-to-r from-red-400 to-pink-500",
      "bg-gradient-to-r from-yellow-400 to-orange-500",
      "bg-gradient-to-r from-blue-400 to-purple-500",
    ]
    return colors[index % colors.length]
  }

  const handleLogout = () => {
    clearAuthCookies()
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
    mutate()
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
          <Button onClick={() => mutate()} variant="outline">Réessayer</Button>
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
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
          <DashboardHeader
            title="Analytics - Gestion des Téléphones"
            description="Vue d'ensemble du parc téléphonique d'entreprise"
            userRole="admin"
            searchPlaceholder="Rechercher..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
          />

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
                    <ReactECharts
                      option={chartData.monthlyOption}
                      style={{ height: '300px' }}
                    />
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    title="Téléphones Totaux"
                    value={dashboardStats.totalPhones.toString()}
                    percentage={`${Math.round((dashboardStats.totalPhones / Math.max(dashboardStats.totalPhones + dashboardStats.totalSimCards, 1)) * 100)}%`}
                    trend="up"
                    icon={<Phone className="h-5 w-5" />}
                    color="bg-blue-500"
                  />
                  <StatsCard
                    title="Téléphones Assignés"
                    value={dashboardStats.assignedPhones.toString()}
                    percentage={`${Math.round((dashboardStats.assignedPhones / dashboardStats.totalPhones) * 100)}%`}
                    trend={dashboardStats.assignedPhones > (dashboardStats.totalPhones * 0.7) ? "up" : "down"}
                    icon={<CheckCircle className="h-5 w-5" />}
                    color="bg-emerald-500"
                  />
                  <StatsCard
                    title="Disponibles"
                    value={dashboardStats.availablePhones.toString()}
                    percentage={`${Math.round((dashboardStats.availablePhones / dashboardStats.totalPhones) * 100)}%`}
                    trend={dashboardStats.availablePhones > (dashboardStats.totalPhones * 0.2) ? "up" : "down"}
                    icon={<Clock className="h-5 w-5" />}
                    color="bg-purple-500"
                  />
                  <StatsCard
                    title="En Maintenance"
                    value={dashboardStats.maintenancePhones.toString()}
                    percentage={`${Math.round((dashboardStats.maintenancePhones / dashboardStats.totalPhones) * 100)}%`}
                    trend={dashboardStats.maintenancePhones > (dashboardStats.totalPhones * 0.1) ? "up" : "down"}
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
                    <ReactECharts
                      option={chartData.departmentOption}
                      style={{ height: '250px' }}
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
                        <span className="text-sm">+{Math.round((dashboardStats.assignedPhones / Math.max(dashboardStats.totalPhones, 1)) * 100)}% d'utilisation</span>
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
                    <div className="relative w-48 h-48 mx-auto -mt-4">
                      <ReactECharts
                        option={chartData.progressOption}
                        style={{ height: '180px' }}
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
                      recentTasks.map((task: any, index: number) => (
                        <TaskCard
                          key={index}
                          title={task.title}
                          time={task.time}
                          color={task.color}
                        />
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Aucune tâche pour aujourd'hui</p>
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
