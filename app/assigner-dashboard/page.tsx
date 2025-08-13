"use client"

import { useState, useEffect } from "react"
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
  RefreshCw,
  Globe,
  Bell,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { AttributionManagementApi, UserManagementApi, PhoneManagementApi, SIMCardManagementApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"

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

export default function AssignerDashboard() {
  const { userData } = useUser()
  const [showAttributionModal, setShowAttributionModal] = useState(false)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [stats, setStats] = useState<DashboardStats>({
    activeAttributions: 0,
    pendingAttributions: 0,
    totalUsers: 0,
    satisfactionRate: 0,
    totalPhones: 0,
    totalSims: 0,
    assignedPhones: 0,
    assignedSims: 0,
    monthlyAttributions: [0, 0, 0, 0, 0, 0],
    monthlyReturns: [0, 0, 0, 0, 0, 0],
    deviceDistribution: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "assigner") {
      router.push("/")
      return
    }
    fetchDashboardData()
  }, [userData, router])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token d'authentification manquant",
          variant: "destructive",
        })
        return
      }

      const attributionApi = new AttributionManagementApi(getApiConfig(token))
      const userApi = new UserManagementApi(getApiConfig(token))
      const phoneApi = new PhoneManagementApi(getApiConfig(token))
      const simApi = new SIMCardManagementApi(getApiConfig(token))

      // Fetch all data in parallel
      const [attributionsRes, usersRes, phonesRes, simsRes] = await Promise.all([
        attributionApi.getAttributions(1, 1000, undefined, undefined, undefined, undefined),
        userApi.getUsers(1, 1000, undefined, undefined, undefined, undefined),
        phoneApi.getPhones(1, 1000),
        simApi.getSimCards(1, 1000)
      ])

      // Extract data from responses
      let attributions: any[] = []
      let users: any[] = []
      let phones: any[] = []
      let sims: any[] = []

      // Parse attributions
      if (attributionsRes.data && typeof attributionsRes.data === 'object') {
        const attrData = attributionsRes.data as any
        if (attrData.success && attrData.data) {
          attributions = (attrData.data.attributions as any[]) || []
        } else if (attrData.attributions) {
          attributions = (attrData.attributions as any[]) || []
        } else if (Array.isArray(attrData)) {
          attributions = attrData
        }
      }

      // Parse users
      if (usersRes.data && typeof usersRes.data === 'object') {
        const userData = usersRes.data as any
        if (userData.success && userData.data) {
          users = (userData.data.users as any[]) || []
        } else if (userData.users) {
          users = (userData.users as any[]) || []
        } else if (Array.isArray(userData)) {
          users = userData
        }
      }

      // Parse phones
      if (phonesRes.data && typeof phonesRes.data === 'object') {
        const phoneData = phonesRes.data as any
        if (phoneData.success && phoneData.data) {
          phones = (phoneData.data.phones as any[]) || []
        } else if (phoneData.phones) {
          phones = (phoneData.phones as any[]) || []
        } else if (Array.isArray(phoneData)) {
          phones = phoneData
        }
      }

      // Parse SIMs
      if (simsRes.data && typeof simsRes.data === 'object') {
        const simData = simsRes.data as any
        if (simData.success && simData.data) {
          sims = (simData.data.simcards as any[]) || (simData.data.simCards as any[]) || []
        } else if (simData.simcards) {
          sims = (simData.simcards as any[]) || []
        } else if (simData.simCards) {
          sims = (simData.simCards as any[]) || []
        } else if (Array.isArray(simData)) {
          sims = simData
        }
      }

      // Calculate statistics
      const activeAttributions = attributions.filter(attr => attr.status === "ACTIVE").length
      const pendingAttributions = attributions.filter(attr => attr.status === "PENDING").length
      const totalUsers = users.length
      const totalPhones = phones.length
      const totalSims = sims.length
      const assignedPhones = phones.filter(phone => phone.status === "ASSIGNED" || phone.assignedToId).length
      const assignedSims = sims.filter(sim => sim.status === "ASSIGNED" || sim.assignedToId).length

      // Calculate satisfaction rate (based on active vs returned attributions)
      const returnedAttributions = attributions.filter(attr => attr.status === "RETURNED").length
      const totalAttributions = activeAttributions + returnedAttributions
      const satisfactionRate = totalAttributions > 0 ? Math.round((activeAttributions / totalAttributions) * 100) : 100

      // Calculate device distribution
      const deviceCounts: { [key: string]: number } = {}
      phones.forEach(phone => {
        const brand = phone.brand || 'Autres'
        deviceCounts[brand] = (deviceCounts[brand] || 0) + 1
      })
      const deviceDistribution = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))

      // Generate recent activity from attributions
      const recentActivity = attributions
        .sort((a, b) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime())
        .slice(0, 4)
        .map(attr => ({
          user: attr.userName || 'Utilisateur inconnu',
          action: attr.status === "ACTIVE" ? "Attribution créée" : 
                  attr.status === "RETURNED" ? "Attribution retournée" : "Demande traitée",
          item: attr.phoneModel || attr.simCardNumber || 'Élément inconnu',
          time: new Date(attr.assignmentDate).toLocaleDateString("fr-FR"),
          avatar: (attr.userName || '').split(' ').map((n: string) => n[0]).join('').toUpperCase()
        }))

      // Generate monthly data (simplified - you can enhance this with real date filtering)
      const monthlyAttributions = [activeAttributions, Math.floor(activeAttributions * 0.8), Math.floor(activeAttributions * 0.9), 
                                  Math.floor(activeAttributions * 0.7), Math.floor(activeAttributions * 0.6), Math.floor(activeAttributions * 0.5)]
      const monthlyReturns = [returnedAttributions, Math.floor(returnedAttributions * 0.8), Math.floor(returnedAttributions * 0.9),
                             Math.floor(returnedAttributions * 0.7), Math.floor(returnedAttributions * 0.6), Math.floor(returnedAttributions * 0.5)]

      setStats({
        activeAttributions,
        pendingAttributions,
        totalUsers,
        satisfactionRate,
        totalPhones,
        totalSims,
        assignedPhones,
        assignedSims,
        monthlyAttributions,
        monthlyReturns,
        deviceDistribution,
        recentActivity
      })

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
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

             <div className="flex-1 ml-64">
         {/* Header Bar */}
         <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-2xl font-bold text-gray-900">Dashboard Assignateur</h1>
               <p className="text-gray-600">Gérez vos attributions et suivez les performances</p>
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
                     {userData.name
                       .split(" ")
                       .map((n) => n[0])
                       .join("")}
                   </AvatarFallback>
                 </Avatar>
                 <div className="hidden md:block">
                   <p className="text-sm font-medium text-gray-900">{userData.name || "Assigner"}</p>
                   <p className="text-xs text-gray-500">{userData.email || "assigner@company.com"}</p>
                 </div>
               </div>
             </div>
           </div>
         </div>

         <div className="p-8">
           {/* Dashboard Content Header */}
           <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Assignateur</h1>
              <p className="text-gray-600 mt-2">Gérez vos attributions et suivez les performances</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Rechercher..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleProjectDetails}>
                    <Eye className="h-4 w-4 mr-2" />
                    Détails du projet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditProject}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Sauvegarder" : "Modifier"}
                  </DropdownMenuItem>
                  <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Inviter
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
            {loading ? (
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
                  {loading ? (
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
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucune activité récente</p>
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
                  <KanbanBoard />
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
          fetchDashboardData() // Refresh data after save
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
