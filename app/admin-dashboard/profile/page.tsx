"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bell, Globe, Camera, Save, Edit, Activity, Users, Smartphone, CreditCard } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { AuthenticationApi } from "@/api/generated/apis/authentication-api"
import { getApiConfig } from "@/lib/apiClient"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  department: string
  role: string
  avatar?: string
}

interface UserStats {
  totalPhones: number
  totalSims: number
  totalUsers: number
  totalAssignments: number
}

interface RecentActivity {
  id: number
  action: string
  item: string
  time: string
  type: 'phone' | 'sim' | 'user' | 'attribution'
}

export default function ProfilePage() {
  const { userData } = useUser()
  const [user, setUser] = useState<UserProfile>({
    id: "1",
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "Administrateur",
  })

  const [stats, setStats] = useState<UserStats>({
    totalPhones: 0,
    totalSims: 0,
    totalUsers: 0,
    totalAssignments: 0,
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }

    // Update user data from context
    setUser({
      id: "1",
      name: userData.name || "Admin",
      email: userData.email || "",
      phone: "",
      department: userData.department || "",
      role: "Administrateur",
    })
    setFormData({
      id: "1",
      name: userData.name || "Admin",
      email: userData.email || "",
      phone: "",
      department: userData.department || "",
      role: "Administrateur",
    })

    // Fetch real data
    fetchUserData()
    fetchRecentActivities()
    fetchStats()
  }, [userData])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token d'authentification manquant.",
          variant: "destructive",
        })
        return
      }

      // For now, just update local state
      // In a real app, you would call an API to update the user profile
      setUser(formData)
      setIsEditing(false)
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
  }

  const fetchRecentActivities = async () => {
    try {
      const attributionApi = new AttributionManagementApi()
      const phoneApi = new PhoneManagementApi()
      const userApi = new UserManagementApi()
      const simCardApi = new SIMCardManagementApi()

      // Fetch recent attributions
      const attributions = await attributionApi.getAttributions(1, 5)
      const attributionActivities = Array.isArray(attributions.data.content) 
        ? attributions.data.content.map((attribution: any, index: number) => ({
            id: index + 1,
            action: "Nouvelle attribution",
            item: `Attribution #${attribution.id}`,
            time: new Date(attribution.assignmentDate).toLocaleDateString('fr-FR'),
            type: 'attribution' as const
          }))
        : []

      // Fetch recent phones
      const phones = await phoneApi.getPhones(1, 5)
      const phoneActivities = Array.isArray(phones.data.content)
        ? phones.data.content.map((phone: any, index: number) => ({
            id: attributionActivities.length + index + 1,
            action: phone.status === 'AVAILABLE' ? "Téléphone disponible" : "Téléphone attribué",
            item: `${phone.brand} ${phone.model}`,
            time: new Date().toLocaleDateString('fr-FR'),
            type: 'phone' as const
          }))
        : []

      // Fetch recent SIM cards
      const simCards = await simCardApi.getSimCards(1, 5)
      const simCardActivities = Array.isArray(simCards.data.content)
        ? simCards.data.content.map((simCard: any, index: number) => ({
            id: attributionActivities.length + phoneActivities.length + index + 1,
            action: simCard.status === 'AVAILABLE' ? "Carte SIM disponible" : "Carte SIM attribuée",
            item: simCard.number,
            time: new Date().toLocaleDateString('fr-FR'),
            type: 'sim' as const
          }))
        : []

      // Fetch recent users
      const users = await userApi.getUsers(1, 5)
      const userActivities = Array.isArray(users.data.content)
        ? users.data.content.map((user: any, index: number) => ({
            id: attributionActivities.length + phoneActivities.length + simCardActivities.length + index + 1,
            action: "Utilisateur enregistré",
            item: user.name,
            time: new Date().toLocaleDateString('fr-FR'),
            type: 'user' as const
          }))
        : []

      // Combine and sort by time (most recent first)
      const allActivities = [...attributionActivities, ...phoneActivities, ...simCardActivities, ...userActivities]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5)

      setRecentActivities(allActivities)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      // Fallback to empty array
      setRecentActivities([])
    }
  }

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        console.error("No JWT token found")
        return
      }

      const authApi = new AuthenticationApi(getApiConfig(token))
      const response = await authApi.getCurrentUser()
      const userData = response.data.data as any

      // Update user state with complete data from backend
      const updatedUser = {
        id: String(userData?.id || "1"),
        name: userData?.name || userData?.firstName || "Admin",
        email: userData?.email || "",
        phone: userData?.phone || "",
        department: userData?.department || "",
        role: "Administrateur",
        avatar: userData?.avatar || "",
      }

      setUser(updatedUser)
      setFormData(updatedUser)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const phoneApi = new PhoneManagementApi()
      const userApi = new UserManagementApi()
      const attributionApi = new AttributionManagementApi()
      const simCardApi = new SIMCardManagementApi()

      const [phones, users, attributions, simCards] = await Promise.all([
        phoneApi.getPhones(1, 1),
        userApi.getUsers(1, 1),
        attributionApi.getAttributions(1, 1),
        simCardApi.getSimCards(1, 1)
      ])

      setStats({
        totalPhones: typeof phones.data.totalElements === 'number' ? phones.data.totalElements : 0,
        totalSims: typeof simCards.data.totalElements === 'number' ? simCards.data.totalElements : 0,
        totalUsers: typeof users.data.totalElements === 'number' ? users.data.totalElements : 0,
        totalAssignments: typeof attributions.data.totalElements === 'number' ? attributions.data.totalElements : 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="profile" onLogout={handleLogout} />

        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-gray-600">Gérez vos informations personnelles</p>
              </div>

              <div className="flex items-center space-x-4">
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Profile Card */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Informations Personnelles</CardTitle>
                  <Button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                    {isEditing ? "Sauvegarder" : "Modifier"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Changer la photo
                      </Button>
                    )}
                    <Badge className="bg-green-100 text-green-800">{user.role}</Badge>
                  </div>

                                     {/* Form Section */}
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                     {loading ? (
                       <div className="md:col-span-2 flex items-center justify-center py-8">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                         <span className="ml-2 text-gray-600">Chargement des données...</span>
                       </div>
                     ) : (
                       <>
                         <div className="space-y-2">
                           <Label htmlFor="name">Nom complet</Label>
                           <Input
                             id="name"
                             value={formData.name}
                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                             disabled={!isEditing}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="email">Email</Label>
                           <Input
                             id="email"
                             type="email"
                             value={formData.email}
                             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                             disabled={!isEditing}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="phone">Téléphone</Label>
                           <Input
                             id="phone"
                             value={formData.phone}
                             onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                             disabled={!isEditing}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="department">Département</Label>
                           <Input
                             id="department"
                             value={formData.department}
                             onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                             disabled={!isEditing}
                           />
                         </div>
                       </>
                     )}
                   </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Smartphone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphones</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPhones}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cartes SIM</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSims}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Utilisateurs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Attributions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={activity.id}>
                        <div className="flex items-center justify-between">
                                                  <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'phone' ? 'bg-blue-500' :
                            activity.type === 'sim' ? 'bg-orange-500' :
                            activity.type === 'user' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.item}</p>
                          </div>
                        </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        {index < recentActivities.length - 1 && <Separator className="mt-4" />}
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
          </div>
        </div>
      </div>
    </div>
  )
}
