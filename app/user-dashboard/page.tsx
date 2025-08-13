"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Globe,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  Headphones,
  Eye,
  Calendar,
  TrendingUp,
  Battery,
  Signal,
  Wifi,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useRouter } from "next/navigation"
import { UserManagementApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"

export default function UserDashboard() {
  interface DashboardResponse {
    user: {
      firstName?: string
      lastName?: string
      email?: string
      profilePicture?: string
      department?: string
    }
    phone?: {
      model?: string
      serialNumber?: string
      imei?: string
      assignedDate?: string
      status?: string
      batteryHealth?: number
      storageUsed?: number
      lastSync?: string
    } | null
    requests?: Array<{
      id?: string | number
      type?: string
      status?: string
      createdAt?: string
      description?: string
    }>
  }

  const { userData: contextUser } = useUser()
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    department: "",
  })

  const [stats, setStats] = useState({
    currentPhone: "",
    activeRequests: 0,
    completedRequests: 0,
    avgResponseTime: "",
  })

  const [currentPhone, setCurrentPhone] = useState({
    model: "",
    serialNumber: "",
    imei: "",
    assignedDate: "",
    status: "",
    batteryHealth: 0,
    storageUsed: 0,
    lastSync: "",
  })

  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "user") {
      window.location.href = "/"
      return
    }

    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        setError("Token invalide ou utilisateur non connecté")
        return
      }

      const userApi = new UserManagementApi(getApiConfig(token))
      const dashboardResponse = await userApi.getMyDashboard()
      const responseBody = dashboardResponse.data as any
      const dashboardData: DashboardResponse = responseBody.data

      const userData = dashboardData.user
      setUser({
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        email: String(userData.email || ""),
        avatar: String(userData.profilePicture || ""),
        department: String(userData.department || ""),
      })

      const phoneData = dashboardData.phone
      if (phoneData) {
        setCurrentPhone({
          model: phoneData.model || "",
          serialNumber: phoneData.serialNumber || "",
          imei: phoneData.imei || "",
          assignedDate: phoneData.assignedDate
            ? new Date(phoneData.assignedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : "",
          status: phoneData.status || "",
          batteryHealth: phoneData.batteryHealth || 0,
          storageUsed: phoneData.storageUsed || 0,
          lastSync: phoneData.lastSync ? new Date(phoneData.lastSync).toLocaleString("fr-FR") : "",
        })

        setStats((prev) => ({ ...prev, currentPhone: phoneData.model || "" }))
      } else {
        setCurrentPhone({
          model: "",
          serialNumber: "",
          imei: "",
          assignedDate: "",
          status: "Non assigné",
          batteryHealth: 0,
          storageUsed: 0,
          lastSync: "",
        })
        setStats((prev) => ({ ...prev, currentPhone: "Aucun téléphone" }))
      }

      const requestsData = dashboardData.requests || []
      const mappedRequests = Array.isArray(requestsData)
        ? requestsData.slice(0, 3).map((req: any) => ({
            id: req.id || "",
            type: req.type || "",
            status: req.status || "",
            date: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
              : "",
            description: req.description || "",
          }))
        : []
      setRecentRequests(mappedRequests)

      const activeRequests = Array.isArray(requestsData)
        ? requestsData.filter((req: any) => req.status === "PENDING" || req.status === "IN_PROGRESS").length
        : 0
      const completedRequests = Array.isArray(requestsData)
        ? requestsData.filter((req: any) => req.status === "COMPLETED" || req.status === "RESOLVED").length
        : 0
      setStats((prev) => ({ ...prev, activeRequests, completedRequests, avgResponseTime: "2.5 heures" }))
    } catch (err: any) {
      console.error("Error fetching user data:", err)
      setError(err.response?.data?.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approuvé":
        return "bg-green-100 text-green-800"
      case "en cours":
        return "bg-yellow-100 text-yellow-800"
      case "résolu":
        return "bg-blue-100 text-blue-800"
      case "rejeté":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "report":
        router.push("/user-dashboard/requests?action=report")
        break
      case "replacement":
        router.push("/user-dashboard/requests?action=replacement")
        break
      case "support":
        router.push("/user-dashboard/requests?action=support")
        break
      case "view-phone":
        router.push("/user-dashboard/my-phone")
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
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
          <Button onClick={fetchUserData} variant="outline">Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="dashboard" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-600">Bienvenue, {user.name || contextUser.name}</p>
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

                <NotificationsDropdown userRole="user" />

                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || contextUser.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      {(user.name || contextUser.name)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name || contextUser.name}</p>
                    <p className="text-xs text-gray-500">{user.department || contextUser.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Téléphone actuel</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.currentPhone}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Demandes actives</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeRequests}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Demandes résolues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.completedRequests}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Temps de réponse</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Actions rapides</span>
                  </CardTitle>
                  <CardDescription>Accès rapide aux fonctions principales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-red-50 hover:bg-red-100 border-red-200"
                      onClick={() => handleQuickAction("report")}
                    >
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <span className="text-sm font-medium">Signaler un problème</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                      onClick={() => handleQuickAction("replacement")}
                    >
                      <Phone className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">Demander remplacement</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 border-green-200"
                      onClick={() => handleQuickAction("support")}
                    >
                      <Headphones className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium">Contacter le support</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 border-purple-200"
                      onClick={() => handleQuickAction("view-phone")}
                    >
                      <Eye className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium">Voir mon téléphone</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Phone Overview */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <span>Mon téléphone</span>
                  </CardTitle>
                  <CardDescription>Aperçu de votre appareil actuel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{currentPhone.model}</p>
                      <p className="text-sm text-gray-600">Série: {currentPhone.serialNumber}</p>
                      <p className="text-sm text-gray-600">Attribué le: {currentPhone.assignedDate}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{currentPhone.status}</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Battery className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Santé de la batterie</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={currentPhone.batteryHealth} className="w-20" />
                        <span className="text-sm font-medium">{currentPhone.batteryHealth}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Signal className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Stockage utilisé</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={currentPhone.storageUsed} className="w-20" />
                        <span className="text-sm font-medium">{currentPhone.storageUsed}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Dernière synchronisation</span>
                      </div>
                      <span className="text-sm text-gray-600">{currentPhone.lastSync}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    onClick={() => router.push("/user-dashboard/my-phone")}
                  >
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <span>Demandes récentes</span>
                    </CardTitle>
                    <CardDescription>Historique de vos dernières demandes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {request.type === "Remplacement" && <Phone className="h-4 w-4 text-blue-500" />}
                          {request.type === "Support" && <Headphones className="h-4 w-4 text-green-500" />}
                          {request.type === "Problème" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{request.id}</p>
                          <p className="text-sm text-gray-600">{request.description}</p>
                          <p className="text-xs text-gray-500">{request.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
