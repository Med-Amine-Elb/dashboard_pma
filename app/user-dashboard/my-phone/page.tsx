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
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useRouter } from "next/navigation"
import { UserManagementApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"

export default function MyPhonePage() {
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
      brand?: string
      serialNumber?: string
      imei?: string
      color?: string
      storage?: string
      condition?: string
      purchaseDate?: string
      assignedDate?: string
      status?: string
      price?: number
      batteryHealth?: number
      storageUsed?: number
      lastSync?: string
      osVersion?: string
      phoneNumber?: string
      warrantyExpiry?: string
    } | null
    simCard?: {
      number?: string
      carrier?: string
      dataPlan?: string
      status?: string
    } | null
  }

  const { userData: contextUser } = useUser()
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
    callsThisMonth: 127,
    smsThisMonth: 89,
    dataUsedGB: 12.5,
    dataLimitGB: 50,
    averageCallDuration: "3m 45s",
    mostUsedApp: "Teams",
    screenTime: "6h 32m",
  })

  const [maintenanceHistory, setMaintenanceHistory] = useState([
    {
      id: "MAINT-001",
      date: "15 Nov 2024",
      type: "Mise à jour logicielle",
      description: "iOS 17.1.2 - Corrections de sécurité",
      status: "Terminé",
      technician: "Système automatique",
    },
    {
      id: "MAINT-002",
      date: "02 Nov 2024",
      type: "Vérification",
      description: "Contrôle de routine - État général",
      status: "Terminé",
      technician: "Jean Dupont",
    },
    {
      id: "MAINT-003",
      date: "20 Oct 2024",
      type: "Configuration",
      description: "Installation applications entreprise",
      status: "Terminé",
      technician: "Marie Martin",
    },
  ])

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

    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        setError("Jeton invalide ou utilisateur non connecté")
        return
      }
      const api = new UserManagementApi(getApiConfig(token))
      const res = await api.getMyDashboard()
      const body: any = res.data
      const data: DashboardResponse = body?.data

      const u = data?.user || {}
      setUser({
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        email: String(u.email || ""),
        avatar: String(u.profilePicture || ""),
        department: String(u.department || ""),
      })

      const p = data?.phone || null
      if (p) {
        setPhoneDetails((prev) => ({
          ...prev,
          model: p.model || "",
          brand: p.brand || "",
          serialNumber: p.serialNumber || "",
          imei: p.imei || "",
          color: p.color || "",
          storage: p.storage || "",
          condition: p.condition || "",
          assignedDate: p.assignedDate
            ? new Date(p.assignedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : "",
          warrantyExpiry: p.warrantyExpiry
            ? new Date(p.warrantyExpiry).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : "",
          status: p.status || "",
          batteryHealth: typeof p.batteryHealth === "number" ? p.batteryHealth : 0,
          storageUsed: typeof p.storageUsed === "number" ? p.storageUsed : 0,
          lastSync: p.lastSync ? new Date(p.lastSync).toLocaleString("fr-FR") : "",
          osVersion: p.osVersion || "",
          carrier: data?.simCard?.carrier || "",
          phoneNumber: p.phoneNumber || "",
        }))
      } else {
        setPhoneDetails((prev) => ({
          ...prev,
          model: "",
          brand: "",
          serialNumber: "",
          imei: "",
          color: "",
          storage: "",
          condition: "",
          assignedDate: "",
          warrantyExpiry: "",
          status: "Non assigné",
          batteryHealth: 0,
          storageUsed: 0,
          lastSync: "",
          osVersion: "",
          carrier: "",
          phoneNumber: "",
        }))
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase()
    switch (s) {
      case "actif":
      case "assigned":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "inactif":
      case "available":
        return "bg-blue-100 text-blue-800"
      case "lost":
      case "damaged":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    const c = (condition || "").toLowerCase()
    switch (c) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
      case "bon":
        return "bg-blue-100 text-blue-800"
      case "fair":
      case "moyen":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
      case "mauvais":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const translateCondition = (condition: string) => {
    const c = (condition || "").toLowerCase()
    switch (c) {
      case "excellent":
        return "Excellent"
      case "good":
        return "Bon"
      case "fair":
        return "Moyen"
      case "poor":
        return "Mauvais"
      default:
        return condition || "Non spécifié"
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
      case "sync":
        // Simulate sync action
        alert("Synchronisation en cours...")
        break
      default:
        break
    }
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
                <h1 className="text-2xl font-bold text-gray-900">Mon téléphone</h1>
                <p className="text-gray-600">Détails et gestion de votre appareil</p>
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
            {/* Phone Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <span>Informations générales</span>
                  </CardTitle>
                  <CardDescription>Détails de votre appareil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Modèle</p>
                        <p className="text-lg font-semibold text-gray-900">{phoneDetails.model}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Marque</p>
                        <p className="text-gray-900">{phoneDetails.brand}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Couleur</p>
                        <p className="text-gray-900">{phoneDetails.color}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Stockage</p>
                        <p className="text-gray-900">{phoneDetails.storage}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Numéro de téléphone</p>
                        <p className="text-gray-900">{phoneDetails.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Numéro de série</p>
                        <p className="text-gray-900 font-mono">{phoneDetails.serialNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">IMEI</p>
                        <p className="text-gray-900 font-mono">{phoneDetails.imei}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Version iOS</p>
                        <p className="text-gray-900">{phoneDetails.osVersion}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Opérateur</p>
                        <p className="text-gray-900">{phoneDetails.carrier}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date d'attribution</p>
                        <p className="text-gray-900">{phoneDetails.assignedDate}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Statut</p>
                        <Badge className={getStatusColor(phoneDetails.status)}>{phoneDetails.status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">État</p>
                        <Badge className={getConditionColor(phoneDetails.condition)}>{translateCondition(phoneDetails.condition)}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">Garantie expire le</p>
                      <p className="text-gray-900">{phoneDetails.warrantyExpiry}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    <span>Actions rapides</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-red-50 hover:bg-red-100 border-red-200"
                    onClick={() => handleQuickAction("report")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                    Signaler un problème
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
                    onClick={() => handleQuickAction("replacement")}
                  >
                    <Phone className="h-4 w-4 mr-2 text-blue-600" />
                    Demander remplacement
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-green-50 hover:bg-green-100 border-green-200"
                    onClick={() => handleQuickAction("support")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                    Contacter le support
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-purple-50 hover:bg-purple-100 border-purple-200"
                    onClick={() => handleQuickAction("sync")}
                  >
                    <RefreshCw className="h-4 w-4 mr-2 text-purple-600" />
                    Synchroniser
                  </Button>

                  <Separator />

                  <div className="text-center text-sm text-gray-500">
                    <p>Dernière synchronisation</p>
                    <p className="font-medium">{phoneDetails.lastSync}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Battery className="h-5 w-5 text-green-500" />
                    <span>Batterie</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Santé de la batterie</span>
                    <span className="font-semibold">{phoneDetails.batteryHealth}%</span>
                  </div>
                  <Progress value={phoneDetails.batteryHealth} className="h-2" />
                  <p className="text-xs text-gray-500">État: Excellent</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5 text-blue-500" />
                    <span>Stockage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Utilisé</span>
                    <span className="font-semibold">{phoneDetails.storageUsed}%</span>
                  </div>
                  <Progress value={phoneDetails.storageUsed} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {phoneDetails.storage && phoneDetails.storageUsed > 0 ? (
                      <>
                        {Math.round((phoneDetails.storageUsed / 100) * Number.parseInt(phoneDetails.storage.replace(/[^\d]/g, "")))} GB sur{" "}
                        {phoneDetails.storage}
                      </>
                    ) : (
                      "Données non disponibles"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <span>Sécurité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chiffrement</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verrouillage</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Toutes les protections actives</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Statistics */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Signal className="h-5 w-5 text-orange-500" />
                  <span>Statistiques d'utilisation</span>
                </CardTitle>
                <CardDescription>Utilisation ce mois-ci</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Phone className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{usageStats.callsThisMonth}</p>
                    <p className="text-sm text-gray-600">Appels</p>
                    <p className="text-xs text-gray-500">Durée moy: {usageStats.averageCallDuration}</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{usageStats.smsThisMonth}</p>
                    <p className="text-sm text-gray-600">SMS</p>
                    <p className="text-xs text-gray-500">Messages envoyés</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Wifi className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{usageStats.dataUsedGB} GB</p>
                    <p className="text-sm text-gray-600">Données</p>
                    <p className="text-xs text-gray-500">sur {usageStats.dataLimitGB} GB</p>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Settings className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{usageStats.screenTime}</p>
                    <p className="text-sm text-gray-600">Temps d'écran</p>
                    <p className="text-xs text-gray-500">App: {usageStats.mostUsedApp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance History */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <span>Historique de maintenance</span>
                </CardTitle>
                <CardDescription>Interventions et mises à jour récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceHistory.map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {maintenance.type === "Mise à jour logicielle" && (
                            <Download className="h-4 w-4 text-blue-500" />
                          )}
                          {maintenance.type === "Vérification" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {maintenance.type === "Configuration" && <Settings className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{maintenance.type}</p>
                          <p className="text-sm text-gray-600">{maintenance.description}</p>
                          <p className="text-xs text-gray-500">Par: {maintenance.technician}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{maintenance.date}</p>
                        <Badge className="bg-green-100 text-green-800">{maintenance.status}</Badge>
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
