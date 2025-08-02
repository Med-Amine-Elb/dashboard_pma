"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import ECharts components to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

export default function AssignerDashboard() {
  const [showAttributionModal, setShowAttributionModal] = useState(false)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "assigner") {
      router.push("/")
    }
  }, [router])

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

  const stats = [
    {
      title: "Attributions actives",
      value: "24",
      change: "+12%",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "En attente",
      value: "8",
      change: "-5%",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Utilisateurs gérés",
      value: "156",
      change: "+8%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Taux de satisfaction",
      value: "98%",
      change: "+2%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
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
        data: [12, 19, 15, 25, 22, 30],
        smooth: true,
        itemStyle: {
          color: "#3b82f6",
        },
      },
      {
        name: "Retours",
        type: "line",
        data: [5, 8, 6, 12, 10, 15],
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
        data: [
          { value: 35, name: "iPhone" },
          { value: 25, name: "Samsung" },
          { value: 20, name: "Huawei" },
          { value: 15, name: "Xiaomi" },
          { value: 5, name: "Autres" },
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
        data: [45, 52, 38, 67],
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
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Assignateur</h1>
              <p className="text-gray-600 mt-2">Gérez vos attributions et suivez les performances</p>
            </div>
            <div className="flex items-center space-x-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
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
            })}
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
                  {[
                    {
                      user: "Marie Dubois",
                      action: "Attribution créée",
                      item: "iPhone 13 Pro",
                      time: "Il y a 2h",
                      avatar: "MD",
                    },
                    {
                      user: "Pierre Martin",
                      action: "SIM assignée",
                      item: "Carte SIM Orange",
                      time: "Il y a 4h",
                      avatar: "PM",
                    },
                    {
                      user: "Sophie Laurent",
                      action: "Demande traitée",
                      item: "Samsung Galaxy S23",
                      time: "Il y a 6h",
                      avatar: "SL",
                    },
                    {
                      user: "Thomas Durand",
                      action: "Attribution modifiée",
                      item: "iPad Air",
                      time: "Hier",
                      avatar: "TD",
                    },
                  ].map((activity, index) => (
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
                  ))}
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
      <AttributionModal isOpen={showAttributionModal} onClose={() => setShowAttributionModal(false)} />

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
                    <span className="text-sm font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de réussite:</span>
                    <span className="text-sm font-medium">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Temps moyen:</span>
                    <span className="text-sm font-medium">2.5h</span>
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
