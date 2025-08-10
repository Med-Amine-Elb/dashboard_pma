"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, Phone, Mail, Building, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { useToast } from "@/hooks/use-toast"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { UserDto } from "@/api/generated/models"

interface AssignerUser {
  id: string
  name: string
  email: string
  department: string
  position: string
  phone?: string
  status: "active" | "inactive"
  joinDate: string
  avatar?: string
  assignedPhone?: string
  assignedSim?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AssignerUsersPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [users, setUsers] = useState<AssignerUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AssignerUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "assigner") {
      window.location.href = "/"
      return
    }

    fetchUsers()
  }, [pagination.page, pagination.limit, statusFilter, searchTerm])

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUsers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      
      if (!token) {
        setError("Token d'authentification manquant")
        return
      }

      const api = new UserManagementApi(getApiConfig(token))
      
      // Convert status filter to API format
      let statusParam: "ACTIVE" | "INACTIVE" | undefined
      if (statusFilter !== "all") {
        // Map frontend filter values to backend API values
        const statusMapping: { [key: string]: "ACTIVE" | "INACTIVE" } = {
          "active": "ACTIVE",
          "inactive": "INACTIVE"
        }
        statusParam = statusMapping[statusFilter]
      }

      console.log("Making API request with params:", {
        page: pagination.page,
        limit: pagination.limit,
        status: statusParam,
        search: searchTerm || undefined
      })

      const res = await api.getUsers(
        pagination.page,
        pagination.limit,
        searchTerm || undefined,
        undefined, // department
        statusParam,
        undefined // role
      )

      console.log("API Response:", res)

      // Extract data from response
      let apiUsers: any[] = []
      let paginationData: any = {}

      if (res.data && typeof res.data === 'object') {
        const responseData = res.data as any
        if (responseData.success && responseData.data) {
          apiUsers = (responseData.data.users as any[]) || []
          paginationData = responseData.data.pagination || {}
        } else if (Array.isArray(responseData)) {
          apiUsers = responseData
        } else if (responseData.users) {
          apiUsers = (responseData.users as any[]) || []
          paginationData = responseData.pagination || {}
        }
      }

             console.log("Processed users:", apiUsers)
       console.log("Pagination data:", paginationData)

       // Transform API data to match our interface and fetch assignments
       const transformedUsers: AssignerUser[] = await Promise.all(apiUsers.map(async (user: any) => {
         console.log("Processing user:", user.name, "Raw user data:", user)
         
         // Fetch active assignments for this user
         let assignedPhone = undefined
         let assignedSim = undefined
         
         try {
           const attributionApi = new AttributionManagementApi(getApiConfig(token))
           const attributionsRes = await attributionApi.getAttributions(
             undefined, // page
             undefined, // limit
             "ACTIVE", // status
             parseInt(user.id), // userId
             undefined, // assignedBy
             undefined // search
           )
           
           console.log(`Attributions for user ${user.name}:`, attributionsRes.data)
           
           // Extract assignment data from attributions
           if (attributionsRes.data && typeof attributionsRes.data === 'object') {
             const responseData = attributionsRes.data as any
             let attributions: any[] = []
             
             if (responseData.success && responseData.data) {
               attributions = (responseData.data.attributions as any[]) || []
             } else if (Array.isArray(responseData)) {
               attributions = responseData
             } else if (responseData.attributions) {
               attributions = (responseData.attributions as any[]) || []
             }
             
             // Find active assignments for this user
             const userAttributions = attributions.filter((attr: any) => 
               attr.userId === parseInt(user.id) || attr.user?.id === parseInt(user.id)
             )
             
             if (userAttributions.length > 0) {
               const activeAttribution = userAttributions[0] // Take the first active attribution
               assignedPhone = activeAttribution.phoneModel || activeAttribution.phone?.model
               assignedSim = activeAttribution.simCardNumber || activeAttribution.simCard?.number
               
               console.log(`Found assignments for ${user.name}: Phone=${assignedPhone}, SIM=${assignedSim}`)
             }
           }
         } catch (error) {
           console.error(`Error fetching assignments for user ${user.name}:`, error)
         }
         
                   // Only check direct SIM card assignments if no attribution found
          if (!assignedSim) {
            try {
              console.log(`Checking direct SIM assignments for user ${user.name} (ID: ${user.id})`)
              const simCardApi = new SIMCardManagementApi(getApiConfig(token))
                             const simCardsRes = await simCardApi.getSimCards(
                 undefined, // page
                 undefined, // limit
                 "ASSIGNED", // status - only get assigned SIMs
                 undefined, // assignedTo
                 undefined // search
               )
              
              console.log(`SIM cards response for user ${user.name}:`, simCardsRes.data)
              
              if (simCardsRes.data && typeof simCardsRes.data === 'object') {
                const responseData = simCardsRes.data as any
                let simCards: any[] = []
                
                                 if (responseData.success && responseData.data) {
                   simCards = (responseData.data.simCards as any[]) || (responseData.data.simcards as any[]) || []
                 } else if (Array.isArray(responseData)) {
                   simCards = responseData
                 } else if (responseData.simCards) {
                   simCards = (responseData.simCards as any[]) || []
                 } else if (responseData.simcards) {
                   simCards = (responseData.simcards as any[]) || []
                 }
                
                console.log(`Total SIM cards found: ${simCards.length}`)
                
                // Find SIM cards directly assigned to this user
                const userSimCards = simCards.filter((sim: any) => {
                  console.log(`Checking SIM ${sim.number} - assignedToId: ${sim.assignedToId}, user.id: ${user.id}`)
                  return sim.assignedToId === parseInt(user.id) || sim.assignedTo?.id === parseInt(user.id)
                })
                
                console.log(`SIM cards assigned to ${user.name}:`, userSimCards)
                
                if (userSimCards.length > 0) {
                  const assignedSimCard = userSimCards[0] // Take the first assigned SIM
                  assignedSim = assignedSimCard.number
                  console.log(`Found direct SIM assignment for ${user.name}: SIM=${assignedSim}`)
                }
              }
            } catch (error) {
              console.error(`Error fetching direct SIM assignments for user ${user.name}:`, error)
            }
          }
         
         console.log(`User ${user.name} - Personal Phone: ${user.phone}, Assigned Phone: ${assignedPhone}, SIM: ${assignedSim}`)
         
         return {
           id: user.id?.toString() || "",
           name: user.name || "",
           email: user.email || "",
           department: user.department || "",
           position: user.position || "",
           phone: user.phone || undefined, // This is the user's personal phone
           status: mapStatusToFrontend(user.status),
           joinDate: user.joinDate || "2024-01-01",
           avatar: user.avatar || undefined,
           assignedPhone: assignedPhone || undefined,
           assignedSim: assignedSim || undefined,
         }
       }))

      setUsers(transformedUsers)
      setFilteredUsers(transformedUsers)

      // Update pagination info
      if (paginationData.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages || Math.ceil(paginationData.total / prev.limit),
        }))
      }

    } catch (error: any) {
      console.error("Error fetching users:", error)
      
      let errorMessage = "Erreur lors du chargement des utilisateurs"
      if (error.response?.status === 403) {
        errorMessage = "Accès refusé. Vérifiez vos permissions d'accès."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const mapStatusToFrontend = (apiStatus: string): "active" | "inactive" => {
    switch (apiStatus) {
      case "ACTIVE":
        return "active"
      case "INACTIVE":
        return "inactive"
      default:
        return "active"
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }))
  }

  const userColumns = [
    { key: "name", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "department", label: "Département" },
    { key: "position", label: "Poste" },
    { key: "status", label: "Statut" },
    { key: "assignedPhone", label: "Téléphone" },
    { key: "assignedSim", label: "SIM" },
    { key: "joinDate", label: "Date d'arrivée" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="users" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultation des Utilisateurs</h1>
                <p className="text-gray-600">Consultation des utilisateurs pour les attributions</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-10 w-80 bg-white/50 border-gray-200 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
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
          <div className="p-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    Liste des Utilisateurs ({pagination.total})
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchUsers}
                      disabled={loading}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>Actualiser</span>
                    </Button>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                    <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                      Mode consultation uniquement
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Chargement des utilisateurs...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error}</p>
                    <Button onClick={fetchUsers} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <>
                    <DataTable
                      data={filteredUsers}
                      columns={userColumns}
                      renderCell={(user, key) => {
                        if (key === "name") {
                          return (
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.position}</p>
                              </div>
                            </div>
                          )
                        }
                        if (key === "email") {
                          return (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                          )
                        }
                        if (key === "department") {
                          return (
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span>{user.department}</span>
                            </div>
                          )
                        }
                        if (key === "status") {
                          return <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        }
                        if (key === "assignedPhone") {
                          return user.assignedPhone ? (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{user.assignedPhone}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Non assigné</span>
                          )
                        }
                        if (key === "assignedSim") {
                          return user.assignedSim ? (
                            <span className="text-sm font-mono">{user.assignedSim}</span>
                          ) : (
                            <span className="text-gray-400">Non assignée</span>
                          )
                        }
                        if (key === "joinDate") {
                          return new Date(user.joinDate).toLocaleDateString("fr-FR")
                        }
                        return user[key as keyof AssignerUser] || "-"
                      }}
                    />

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{" "}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}{" "}
                          résultats
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Précédent
                          </Button>
                          <span className="text-sm text-gray-600">
                            Page {pagination.page} sur {pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                          >
                            Suivant
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
