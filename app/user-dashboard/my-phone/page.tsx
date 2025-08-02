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
  Battery,
  HardDrive,
  Wifi,
  Signal,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageSquare,
  Settings,
  Download,
  RefreshCw,
  Clock,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useRouter } from "next/navigation"
import { UserManagementApi } from "@/api/generated"
import { getApiConfig, getUserIdFromToken } from "@/lib/apiClient"

export default function MyPhonePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    department: "",
  })

  const [phoneDetails, setPhoneDetails] = useState({
    model: "",
    brand: "",
    serialNumber: "",
    imei: "",
    color: "",
    storage: "",
    assignedDate: "",
    warrantyExpiry: "",
    status: "",
    condition: "",
    lastUpdate: "",
    batteryHealth: 0,
    storageUsed: 0,
    lastSync: "",
    osVersion: "",
    carrier: "",
    phoneNumber: "",
  })

  const [usageStats, setUsageStats] = useState({
    callsThisMonth: 0,
    smsThisMonth: 0,
    dataUsedGB: 0,
    dataLimitGB: 0,
    averageCallDuration: "",
    mostUsedApp: "",
    screenTime: "",
  })

  const [maintenanceHistory, setMaintenanceHistory] = useState([])
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

    fetchPhoneData()
  }, [])

  const fetchPhoneData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("jwt_token")
      const userId = getUserIdFromToken(token)
      
      if (!token || !userId) {
        setError("Token invalide")
        return
      }

      const userApi = new UserManagementApi(getApiConfig(token))
      
      // Fetch current user data
      const userResponse = await userApi.getUserById(userId)
      const userData = userResponse.data
      
      setUser({
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        email: userData.email || "",
        avatar: userData.profilePicture || "",
        department: userData.department || "",
      })

      // Fetch user's phone data
      const phoneResponse = await userApi.getUserPhone(userId)
      const phoneData = phoneResponse.data
      
      if (phoneData) {
        setPhoneDetails({
          model: phoneData.model || "",
          brand: phoneData.brand || "",
          serialNumber: phoneData.serialNumber || "",
          imei: phoneData.imei || "",
          color: phoneData.color || "",
          storage: phoneData.storage || "",
          assignedDate: phoneData.assignedDate ? new Date(phoneData.assignedDate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }) : "",
          warrantyExpiry: phoneData.warrantyExpiry ? new Date(phoneData.warrantyExpiry).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }) : "",
          status: phoneData.status || "",
          condition: phoneData.condition || "",
          lastUpdate: phoneData.lastUpdate ? new Date(phoneData.lastUpdate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) : "",
          batteryHealth: phoneData.batteryHealth || 0,
          storageUsed: phoneData.storageUsed || 0,
          lastSync: phoneData.lastSync ? new Date(phoneData.lastSync).toLocaleString("fr-FR") : "",
          osVersion: phoneData.osVersion || "",
          carrier: phoneData.carrier || "",
          phoneNumber: phoneData.phoneNumber || "",
        })

        // Set usage stats based on phone data
        setUsageStats({
          callsThisMonth: phoneData.callsThisMonth || 0,
          smsThisMonth: phoneData.smsThisMonth || 0,
          dataUsedGB: phoneData.dataUsedGB || 0,
          dataLimitGB: phoneData.dataLimitGB || 0,
          averageCallDuration: phoneData.averageCallDuration || "",
          mostUsedApp: phoneData.mostUsedApp || "",
          screenTime: phoneData.screenTime || "",
        })
      }

      // Fetch maintenance history
      const maintenanceResponse = await userApi.getUserMaintenanceHistory(userId)
      const maintenanceData = maintenanceResponse.data || []
      
      const mappedMaintenance = maintenanceData.map((maintenance: any) => ({
        id: maintenance.id || "",
        date: maintenance.date ? new Date(maintenance.date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "",
        type: maintenance.type || "",
        description: maintenance.description || "",
        status: maintenance.status || "",
        technician: maintenance.technician || "",
      }))

      setMaintenanceHistory(mappedMaintenance)

    } catch (err: any) {
      console.error("Error fetching phone data:", err)
      setError(err.response?.data?.message || "Erreur lors du chargement des données du téléphone")
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
      case "actif":
      case "active":
        return "bg-green-100 text-green-800"
      case "inactif":
      case "inactive":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "bon":
      case "good":
        return "bg-blue-100 text-blue-800"
      case "moyen":
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "mauvais":
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "report-issue":
        router.push("/user-dashboard/requests?action=report")
        break
      case "request-replacement":
        router.push("/user-dashboard/requests?action=replacement")
        break
      case "support":
        router.push("/user-dashboard/requests?action=support")
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
          <p className="mt-4 text-gray-600">Chargement des données du téléphone...</p>
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
          <Button onClick={fetchPhoneData} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="my-phone" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Téléphone</h1>
                <p className="text-gray-600">Détails de votre appareil</p>
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
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Phone Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Phone Details Card */}
              <Card className="lg:col-span-2 bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {phoneDetails.model || "Aucun téléphone assigné"}
                  </CardTitle>
                      <CardDescription className="text-gray-600">
                        {phoneDetails.brand} • {phoneDetails.color}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(phoneDetails.status)}>
                      {phoneDetails.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Phone Image and Basic Info */}
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Smartphone className="h-16 w-16 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Numéro de série</p>
                          <p className="text-sm text-gray-900">{phoneDetails.serialNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">IMEI</p>
                          <p className="text-sm text-gray-900">{phoneDetails.imei || "N/A"}</p>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-600">Stockage</p>
                          <p className="text-sm text-gray-900">{phoneDetails.storage || "N/A"}</p>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-600">Date d'assignation</p>
                          <p className="text-sm text-gray-900">{phoneDetails.assignedDate || "N/A"}</p>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Battery className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Batterie</p>
                        <p className="text-sm text-gray-600">{phoneDetails.batteryHealth}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <HardDrive className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Stockage</p>
                        <p className="text-sm text-gray-600">{phoneDetails.storageUsed}% utilisé</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">État</p>
                        <Badge className={getConditionColor(phoneDetails.condition)}>
                          {phoneDetails.condition}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleQuickAction("report-issue")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Signaler un problème
                  </Button>
                  <Button
                    onClick={() => handleQuickAction("request-replacement")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Demander un remplacement
                  </Button>
                  <Button
                    onClick={() => handleQuickAction("support")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter le support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Usage Statistics */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Statistiques d'utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Phone className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.callsThisMonth}</p>
                    <p className="text-sm text-gray-600">Appels ce mois</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.smsThisMonth}</p>
                    <p className="text-sm text-gray-600">SMS ce mois</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Wifi className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.dataUsedGB} GB</p>
                    <p className="text-sm text-gray-600">Données utilisées</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.averageCallDuration}</p>
                    <p className="text-sm text-gray-600">Durée moyenne</p>
                  </div>
                </div>

                {/* Data Usage Progress */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Utilisation des données</span>
                    <span className="text-sm text-gray-600">
                      {usageStats.dataUsedGB} GB / {usageStats.dataLimitGB} GB
                    </span>
                  </div>
                  <Progress
                    value={(usageStats.dataUsedGB / usageStats.dataLimitGB) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Maintenance History */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Historique de maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceHistory.length > 0 ? (
                    maintenanceHistory.map((maintenance) => (
                    <div
                      key={maintenance.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Settings className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{maintenance.type}</p>
                          <p className="text-sm text-gray-600">{maintenance.description}</p>
                            <p className="text-xs text-gray-500">
                              {maintenance.date} • {maintenance.technician}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(maintenance.status)}>
                          {maintenance.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun historique de maintenance disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
