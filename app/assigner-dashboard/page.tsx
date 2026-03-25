"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { KanbanBoard } from "@/components/kanban-board"
import { AttributionModal } from "@/components/attribution-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  UserPlus,
  Settings,
  Phone,
  Smartphone,
  Activity,
  Plus,
  RefreshCw,
  Globe,
  Bell,
  History,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { AttributionManagementApi, UserManagementApi, PhoneManagementApi, SIMCardManagementApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"
import { clearAuthCookies } from "@/lib/authCookies"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { DashboardHeader } from "@/components/dashboard-header"

// Dynamically import ECharts components to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

interface DashboardStats {
  activeAttributions: number
  pendingAttributions: number
  totalUsers: number
  satisfactionRate: number
  totalPhones: number
  totalSims: number
  assignedPhones: number
  assignedSims: number
  monthlyAttributions: number[]
  monthlyReturns: number[]
  deviceDistribution: { name: string; value: number }[]
  recentActivity: Array<{
    user: string
    action: string
    item: string
    time: string
    avatar: string
  }>
}


const fetcher = async () => {
  const token = localStorage.getItem("jwt_token")
  if (!token) throw new Error("Token d'authentification manquant")

  const attributionApi = new AttributionManagementApi(getApiConfig(token))
  const userApi = new UserManagementApi(getApiConfig(token))
  const phoneApi = new PhoneManagementApi(getApiConfig(token))
  const simApi = new SIMCardManagementApi(getApiConfig(token))

  const safeFetch = (promise: Promise<any>) => 
    promise.catch(err => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearAuthCookies();
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("userRole");
        window.location.href = "/";
      }
      return { data: [] };
    });

  const [attributionsRes, usersRes, phonesRes, simsRes] = await Promise.all([
    safeFetch(attributionApi.getAttributions(1, 1000, undefined, undefined, undefined, undefined)),
    safeFetch(userApi.getUsers(1, 1000, undefined, undefined, undefined, undefined)),
    safeFetch(phoneApi.getPhones(1, 1000)),
    safeFetch(simApi.getSimCards(1, 1000))
  ])

  let attributions = []
  let users = []
  let phones = []
  let sims = []

  if (attributionsRes.data && typeof attributionsRes.data === 'object') {
    const attrData = attributionsRes.data
    attributions = attrData.success && attrData.data ? attrData.data.attributions : attrData.attributions || Array.isArray(attrData) ? attrData : []
  }
  if (usersRes.data && typeof usersRes.data === 'object') {
    const userData = usersRes.data
    users = userData.success && userData.data ? userData.data.users : userData.users || Array.isArray(userData) ? userData : []
  }
  if (phonesRes.data && typeof phonesRes.data === 'object') {
    const phoneData = phonesRes.data
    phones = phoneData.success && phoneData.data ? phoneData.data.phones : phoneData.phones || Array.isArray(phoneData) ? phoneData : []
  }
  if (simsRes.data && typeof simsRes.data === 'object') {
    const simData = simsRes.data
    sims = simData.success && simData.data ? simData.data.simcards || simData.data.simCards : simData.simcards || simData.simCards || Array.isArray(simData) ? simData : []
  }

  return { attributions, users, phones, sims }
}

export default function AssignerDashboard() {
  const { userData } = useUser()
  const [showAttributionModal, setShowAttributionModal] = useState(false)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  
  const { toast } = useToast()
  const router = useRouter()

  const { data, error: swrError, isLoading, mutate } = useSWR('assignerDashboardData', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000
  })

  // Handle errors manually via an effect
  useEffect(() => {
    if (swrError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive",
      })
    }
  }, [swrError, toast])

  const stats = useMemo(() => {
    if (!data) return {
      activeAttributions: 0,
      pendingAttributions: 0,
      totalUsers: 0,
      satisfactionRate: 100,
      totalPhones: 0,
      totalSims: 0,
      assignedPhones: 0,
      assignedSims: 0,
      monthlyAttributions: [0, 0, 0, 0, 0, 0],
      monthlyReturns: [0, 0, 0, 0, 0, 0],
      deviceDistribution: [],
      recentActivity: []
    }

    const { attributions, users, phones, sims } = data

    const activeAttributions = attributions.filter((attr: any) => attr.status === "ACTIVE").length
    const pendingAttributions = attributions.filter((attr: any) => attr.status === "PENDING").length
    const totalUsers = users.length
    const totalPhones = phones.length
    const totalSims = sims.length
    const assignedPhones = phones.filter((phone: any) => phone.status === "ASSIGNED" || phone.assignedToId).length
    const assignedSims = sims.filter((sim: any) => sim.status === "ASSIGNED" || sim.assignedToId).length

    const returnedAttributions = attributions.filter((attr: any) => attr.status === "RETURNED").length
    const totalAttributions = activeAttributions + returnedAttributions
    const satisfactionRate = totalAttributions > 0 ? Math.round((activeAttributions / totalAttributions) * 100) : 100

    const deviceCounts: Record<string, number> = {}
    phones.forEach((phone: any) => {
      const brand = phone.brand || 'Autres'
      deviceCounts[brand] = (deviceCounts[brand] || 0) + 1
    })
    const deviceDistribution = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))

    const recentActivity = [...attributions]
      .sort((a, b) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime())
      .filter((attr: any) => {
        if (!searchTerm) return true
        const lowSearch = searchTerm.toLowerCase()
        return (attr.userName || '').toLowerCase().includes(lowSearch) ||
               (attr.phoneModel || '').toLowerCase().includes(lowSearch) ||
               (attr.simCardNumber || '').toLowerCase().includes(lowSearch)
      })
      .slice(0, 4)
      .map((attr: any) => ({
        user: attr.userName || 'Utilisateur inconnu',
        action: attr.status === "ACTIVE" ? "Attribution créée" : 
                attr.status === "RETURNED" ? "Attribution retournée" : "Demande traitée",
        item: attr.phoneModel || attr.simCardNumber || 'Élément inconnu',
        time: new Date(attr.assignmentDate).toLocaleDateString("fr-FR"),
        avatar: (attr.userName || '').split(' ').map((n: string) => n[0]).join('').toUpperCase()
      }))

    return {
      activeAttributions,
      pendingAttributions,
      totalUsers,
      satisfactionRate,
      totalPhones,
      totalSims,
      assignedPhones,
      assignedSims,
      monthlyAttributions: [0, 0, 0, 0, 0, 0],
      monthlyReturns: [0, 0, 0, 0, 0, 0],
      deviceDistribution,
      recentActivity
    }
  }, [data, searchTerm])

  const handleLogout = () => {
    clearAuthCookies()
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleProjectDetails = () => {
    setShowProjectDetails(true)
    toast({
      title: "Détails du projet",
      description: "Affichage des détails du projet",
    })
  }

  const handleInviteUser = () => {
    if (inviteEmail) {
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${inviteEmail}`,
      })
      setInviteEmail("")
      setShowInviteModal(false)
    }
  }

  const handleEditProject = () => {
    setIsEditing(!isEditing)
    toast({
      title: isEditing ? "Mode édition désactivé" : "Mode édition activé",
      description: isEditing ? "Les modifications ont été sauvegardées" : "Vous pouvez maintenant modifier le projet",
    })
  }

  const statsCards = [
    {
      title: "Attributions actives",
      value: stats.activeAttributions.toString(),
      change: "+12%",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "En attente",
      value: stats.pendingAttributions.toString(),
      change: "-5%",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Utilisateurs gérés",
      value: stats.totalUsers.toString(),
      change: "+8%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Taux de satisfaction",
      value: `${stats.satisfactionRate}%`,
      change: "+2%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Téléphones assignés",
      value: stats.assignedPhones.toString(),
      change: `${stats.totalPhones > 0 ? Math.round((stats.assignedPhones / stats.totalPhones) * 100) : 0}%`,
      icon: Phone,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "SIMs assignées",
      value: stats.assignedSims.toString(),
      change: `${stats.totalSims > 0 ? Math.round((stats.assignedSims / stats.totalSims) * 100) : 0}%`,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const quickActions = [
    {
      title: "Attributions",
      description: "Gérer les attributions",
      icon: Phone,
      color: "bg-blue-500",
      href: "/assigner-dashboard/attributions",
    },
    {
      title: "Gestion SIM",
      description: "Gérer les cartes SIM",
      icon: CreditCard,
      color: "bg-green-500",
      href: "/assigner-dashboard/sim-assignments",
    },
    {
      title: "Utilisateurs",
      description: "Consulter les utilisateurs",
      icon: Users,
      color: "bg-purple-500",
      href: "/assigner-dashboard/users",
    },
    {
      title: "Planification",
      description: "Gérer le calendrier",
      icon: Calendar,
      color: "bg-orange-500",
      href: "/assigner-dashboard/calendar",
    },
  ]

  // ECharts options for attribution trends
  const attributionTrendsOption = {
    title: {
      text: "Tendances des Attributions",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Attributions", "Retours"],
      bottom: 10,
    },
    xAxis: {
      type: "category",
      data: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Attributions",
        type: "line",
        data: stats.monthlyAttributions,
        smooth: true,
        itemStyle: {
          color: "#3b82f6",
        },
      },
      {
        name: "Retours",
        type: "line",
        data: stats.monthlyReturns,
        smooth: true,
        itemStyle: {
          color: "#ef4444",
        },
      },
    ],
  }

  // ECharts options for device distribution
  const deviceDistributionOption = {
    title: {
      text: "Répartition des Appareils",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Appareils",
        type: "pie",
        radius: "50%",
        data: stats.deviceDistribution.length > 0 ? stats.deviceDistribution : [
          { value: 0, name: "Aucun appareil" }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  }

  // ECharts options for monthly activity
  const monthlyActivityOption = {
    title: {
      text: "Activité Mensuelle",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [stats.activeAttributions, stats.pendingAttributions, stats.assignedPhones, stats.assignedSims],
        type: "bar",
        itemStyle: {
          color: "#10b981",
        },
        barWidth: "60%",
      },
    ],
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar activeItem="board" onLogout={handleLogout} />

             {/* Main Content */}
        <div className="flex-1 ml-64 p-0">
          <DashboardHeader 
            title={`Bienvenue, ${userData?.firstName || 'Utilisateur'}`}
            description="Tableau de bord de gestion des attributions"
            userRole="assigner"
            searchPlaceholder="Rechercher une attribution..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
          />

          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Gestion des Équipements</h1>
                <p className="text-slate-500">Supervisez et gérez les attributions de téléphones et cartes SIM.</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={() => setShowAttributionModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Attribution
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onSelect={() => setTimeout(() => handleProjectDetails(), 100)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Détails du projet
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setTimeout(() => handleEditProject(), 100)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? "Désactiver l'édition" : "Activer l'édition"}
                    </DropdownMenuItem>
                    <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Inviter un utilisateur
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Inviter un utilisateur</DialogTitle>
                          <DialogDescription>
                            Envoyez une invitation à un nouvel utilisateur pour rejoindre l'équipe.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                              Adresse email
                            </label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="utilisateur@exemple.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                              Annuler
                            </Button>
                            <Button onClick={handleInviteUser}>Envoyer l'invitation</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="p-3 rounded-full bg-gray-200 animate-pulse">
                        <div className="h-6 w-6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              statsCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                          <p
                            className={`text-sm mt-1 ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                          >
                            {stat.change} ce mois
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <ReactECharts option={attributionTrendsOption} style={{ height: "300px" }} />
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <ReactECharts option={deviceDistributionOption} style={{ height: "300px" }} />
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <ReactECharts option={monthlyActivityOption} style={{ height: "300px" }} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Recent Activity & Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Activité récente
                </CardTitle>
                <CardDescription>Dernières actions effectuées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    // Loading skeleton for activities
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg">
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                            {activity.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                          <p className="text-sm text-gray-500">
                            {activity.action} • {activity.item}
                          </p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Kanban Board */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Tableau des tâches
                  </CardTitle>
                  <CardDescription>Gérez vos tâches d'attribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <KanbanBoard searchTerm={searchTerm} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AttributionModal 
        isOpen={showAttributionModal} 
        onClose={() => setShowAttributionModal(false)}
        onSave={(data) => {
          console.log("Attribution saved:", data)
          setShowAttributionModal(false)
          mutate() // Refresh data after save
        }}
        attribution={null}
      />

      {/* Project Details Modal */}
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du projet</DialogTitle>
            <DialogDescription>Informations détaillées sur le projet d'attribution</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Statistiques générales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total attributions:</span>
                    <span className="text-sm font-medium">{stats.activeAttributions + stats.pendingAttributions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de réussite:</span>
                    <span className="text-sm font-medium">{stats.satisfactionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Appareils assignés:</span>
                    <span className="text-sm font-medium">{stats.assignedPhones + stats.assignedSims}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Équipe</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">RR</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Randy Riley (Vous)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-green-500 text-white text-xs">MD</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Marie Dubois</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
