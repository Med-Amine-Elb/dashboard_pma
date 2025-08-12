"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { User, Mail, Phone, Calendar, Edit, Save, X, Award, TrendingUp, Users, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { AttributionManagementApi, UserManagementApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"

export default function AssignerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: "Randy Riley",
    email: "randy.riley@company.com",
    phone: "+33 1 23 45 67 89",
    joinDate: "Janvier 2023",
    department: "IT Support",
    position: "Senior Assigner",
    avatarUrl: "",
  })
  const [stats, setStats] = useState({
    totalAttributions: 0,
    processedRequests: 0,
    managedUsers: 0,
    satisfactionRate: 0,
  })

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "assigner") {
      router.push("/")
      return
    }
    fetchProfileData()
  }, [router])

  const fetchProfileData = async () => {
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

      // Get current user ID from localStorage or token
      const currentUserId = localStorage.getItem("userId") || "1" // Default to user 1 if not set

      // Fetch all data in parallel
      const [attributionsRes, usersRes] = await Promise.all([
        attributionApi.getAttributions(1, 1000, undefined, undefined, undefined, undefined),
        userApi.getUsers(1, 1000, undefined, undefined, undefined, undefined)
      ])

      // Extract data from responses
      let attributions: any[] = []
      let users: any[] = []

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

      // Find current user (assigner)
      const currentUser = users.find(user => user.id?.toString() === currentUserId || user.role === "ASSIGNER")
      
      if (currentUser) {
        // Update profile with real user data
        setProfile({
          name: currentUser.name || "Utilisateur inconnu",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          joinDate: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long"
          }) : "Date inconnue",
          department: currentUser.department || "Non spécifié",
          position: currentUser.position || "Assignateur",
          avatarUrl: currentUser.avatarUrl || "",
        })
      }

             // Calculate statistics for this specific assigner
       const assignerAttributions = attributions.filter(attr => 
         attr.assignedBy === currentUser?.name || 
         attr.assignedBy === currentUser?.email ||
         attr.assignedBy === currentUser?.id?.toString()
       )
       
       // Get unique users that this assigner has managed
       const managedUserIds = new Set()
       assignerAttributions.forEach(attr => {
         if (attr.userId) {
           managedUserIds.add(attr.userId.toString())
         }
       })
       
       const totalAttributions = assignerAttributions.length
       const processedRequests = assignerAttributions.filter(attr => 
         attr.status === "ACTIVE" || attr.status === "RETURNED"
       ).length
       const managedUsers = managedUserIds.size // Count unique users managed by this assigner
       
       // Calculate satisfaction rate (based on active vs returned attributions)
       const activeAttributions = assignerAttributions.filter(attr => attr.status === "ACTIVE").length
       const returnedAttributions = assignerAttributions.filter(attr => attr.status === "RETURNED").length
       const totalCompleted = activeAttributions + returnedAttributions
              const satisfactionRate = totalCompleted > 0 ? Math.round((activeAttributions / totalCompleted) * 100) : 100

       // Debug logging
       console.log("Profile Data Debug:", {
         currentUser: {
           id: currentUser?.id,
           name: currentUser?.name,
           email: currentUser?.email
         },
         totalAttributions: attributions.length,
         assignerAttributions: assignerAttributions.length,
         assignerAttributionsDetails: assignerAttributions.map(attr => ({
           id: attr.id,
           assignedBy: attr.assignedBy,
           status: attr.status,
           userId: attr.userId
         })),
         stats: {
           totalAttributions,
           processedRequests,
           managedUsers,
           satisfactionRate
         }
       })

       setStats({
         totalAttributions,
         processedRequests,
         managedUsers,
         satisfactionRate,
       })

    } catch (error) {
      console.error("Error fetching profile data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
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

  const handleSave = () => {
    setIsEditing(false)
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data here if needed
  }

  const statsCards = [
    {
      title: "Attributions créées",
      value: stats.totalAttributions.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Demandes traitées",
      value: stats.processedRequests.toString(),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Utilisateurs gérés",
      value: stats.managedUsers.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Taux de satisfaction",
      value: `${stats.satisfactionRate}%`,
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="profile" onLogout={handleLogout} />

      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 mt-2">Gérez vos informations personnelles et vos préférences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Mettez à jour vos informations de profil</CardDescription>
                  </div>
                                     <div className="flex space-x-2">
                     <Button 
                       size="sm" 
                       variant="outline" 
                       onClick={fetchProfileData}
                       disabled={loading}
                       className="flex items-center space-x-2"
                     >
                       <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                       <span>Actualiser</span>
                     </Button>
                     {isEditing ? (
                       <>
                         <Button size="sm" onClick={handleSave}>
                           <Save className="h-4 w-4 mr-2" />
                           Sauvegarder
                         </Button>
                         <Button size="sm" variant="outline" onClick={handleCancel}>
                           <X className="h-4 w-4 mr-2" />
                           Annuler
                         </Button>
                       </>
                     ) : (
                       <Button size="sm" onClick={() => setIsEditing(true)}>
                         <Edit className="h-4 w-4 mr-2" />
                         Modifier
                       </Button>
                     )}
                   </div>
                </CardHeader>
                <CardContent className="space-y-6">
                                     {/* Avatar Section */}
                   <div className="flex items-center space-x-4">
                     <Avatar className="h-20 w-20">
                       <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} />
                       <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                         {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                       </AvatarFallback>
                     </Avatar>
                     <div>
                       <h3 className="text-lg font-semibold">{profile.name}</h3>
                       <p className="text-gray-600">{profile.position}</p>
                       <Badge variant="secondary" className="mt-1">
                         {profile.department}
                       </Badge>
                     </div>
                   </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats and Info */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques d'activité</CardTitle>
                  <CardDescription>Vos performances ce mois-ci</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gray-200 animate-pulse">
                          <div className="h-4 w-4"></div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    statsCards.map((stat, index) => {
                      const Icon = stat.icon
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Membre depuis</p>
                      <p className="text-sm text-gray-600">{profile.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Rôle</p>
                      <Badge variant="outline">Assignateur</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
