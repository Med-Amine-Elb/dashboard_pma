"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AttributionModal } from "@/components/attribution-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  Plus,
  Phone,
  CreditCard,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Bell,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"
import { AttributionDto } from "@/api/generated/models"
import axios from "axios"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface Attribution {
  id: string
  userId: string
  userName: string
  userEmail: string
  phoneId?: string
  phoneModel?: string
  simCardId?: string
  simCardNumber?: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  status: "ACTIVE" | "RETURNED" | "PENDING"
  notes?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AssignerAttributionsPage() {
  const { userData } = useUser()
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [filteredAttributions, setFilteredAttributions] = useState<Attribution[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingAttribution, setEditingAttribution] = useState<Attribution | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
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
    fetchAttributions()
  }, [router, pagination.page, pagination.limit, statusFilter, searchTerm, userData])

  const fetchAttributions = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      
      if (!token) {
        setError("Token d'authentification manquant")
        return
      }

             const attributionApi = new AttributionManagementApi(getApiConfig(token))
       const simApi = new SIMCardManagementApi(getApiConfig(token))
       const userApi = new UserManagementApi(getApiConfig(token))
      
      // Convert status filter to API format
      let statusParam: "ACTIVE" | "PENDING" | "RETURNED" | undefined
      if (statusFilter !== "all") {
        statusParam = statusFilter.toUpperCase() as "ACTIVE" | "PENDING" | "RETURNED"
      }

      // Fetch regular attributions
      const attributionRes = await attributionApi.getAttributions(
        pagination.page,
        pagination.limit,
        statusParam,
        undefined, // userId
        undefined, // assignedBy
        searchTerm || undefined
      )

      console.log("Attribution API Response:", attributionRes)

      // Extract attribution data from response
      let apiAttributions: any[] = []
      let paginationData: any = {}

      if (attributionRes.data && typeof attributionRes.data === 'object') {
        const responseData = attributionRes.data as any
        if (responseData.success && responseData.data) {
          apiAttributions = (responseData.data.attributions as any[]) || []
          paginationData = responseData.data.pagination || {}
        } else if (Array.isArray(responseData)) {
          apiAttributions = responseData
        } else if (responseData.attributions) {
          apiAttributions = (responseData.attributions as any[]) || []
          paginationData = responseData.pagination || {}
        }
      }

             // Fetch direct SIM assignments (only if status filter is "all" or "ACTIVE")
       let directSimAssignments: any[] = []
       if (statusFilter === "all" || statusFilter === "ACTIVE") {
         try {
           const simRes = await simApi.getSimCards(
             undefined, // page
             undefined, // limit
             "ASSIGNED", // status - only assigned SIMs
             undefined, // assignedTo
             searchTerm || undefined // search
           )

           console.log("SIM API Response:", simRes)

           if (simRes.data && typeof simRes.data === 'object') {
             const simResponseData = simRes.data as any
             let simCards: any[] = []
             
             if (simResponseData.success && simResponseData.data) {
               simCards = (simResponseData.data.simcards as any[]) || (simResponseData.data.simCards as any[]) || []
             } else if (Array.isArray(simResponseData)) {
               simCards = simResponseData
             } else if (simResponseData.simcards) {
               simCards = (simResponseData.simcards as any[]) || []
             } else if (simResponseData.simCards) {
               simCards = (simResponseData.simCards as any[]) || []
             }

             // Filter out SIMs that are already in attributions
             const attributionSimIds = new Set(apiAttributions.map(attr => attr.simCardId?.toString()))
             const filteredSimCards = simCards.filter((sim: any) => 
               sim.assignedToId && 
               !attributionSimIds.has(sim.id?.toString())
             )

             // Fetch user data for each assigned SIM
             for (const sim of filteredSimCards) {
               try {
                                                       if (sim.assignedToId) {
                     const userRes = await userApi.getUsers(
                       1, // page
                       1000, // limit
                       undefined, // search
                       undefined, // department
                       undefined, // status
                       undefined // role
                     )
                     if (userRes.data && typeof userRes.data === 'object') {
                       const userData = userRes.data as any
                       let users: any[] = []
                       
                       if (userData.success && userData.data) {
                         users = (userData.data.users as any[]) || []
                       } else if (userData.users) {
                         users = (userData.users as any[]) || []
                       } else if (Array.isArray(userData)) {
                         users = userData
                       }
                       
                       // Find the specific user by ID
                       const user = users.find((u: any) => u.id === parseInt(sim.assignedToId))
                       
                       if (user) {
                         directSimAssignments.push({
                           ...sim,
                           assignedTo: user
                         })
                       } else {
                         // If user not found, still add the SIM with basic info
                         directSimAssignments.push(sim)
                       }
                     }
                   }
               } catch (userError) {
                 console.error(`Error fetching user data for SIM ${sim.id}:`, userError)
                 // Still add the SIM even if user fetch fails
                 directSimAssignments.push(sim)
               }
             }
           }
         } catch (simError) {
           console.error("Error fetching direct SIM assignments:", simError)
           // Don't fail the whole request if SIM fetch fails
         }
       }

      console.log("Processed attributions:", apiAttributions)
      console.log("Direct SIM assignments:", directSimAssignments)
      console.log("Pagination data:", paginationData)

      // Transform attribution data to match our interface
      const transformedAttributions: Attribution[] = apiAttributions.map((attr: any) => ({
        id: attr.id?.toString() || "",
        userId: attr.userId?.toString() || "",
        userName: attr.userName || "",
        userEmail: attr.userEmail || "",
        phoneId: attr.phoneId?.toString(),
        phoneModel: attr.phoneModel || "",
        simCardId: attr.simCardId?.toString(),
        simCardNumber: attr.simCardNumber || "",
        assignedBy: attr.assignedByName || attr.assignedBy || "",
        assignmentDate: attr.assignmentDate || "",
        returnDate: attr.returnDate,
        status: attr.status || "PENDING",
        notes: attr.notes || "",
      }))

      // Transform direct SIM assignments to attribution format
      const transformedDirectAssignments: Attribution[] = directSimAssignments.map((sim: any) => ({
        id: `sim-${sim.id}`, // Use a prefix to distinguish from regular attributions
        userId: sim.assignedToId?.toString() || "",
        userName: sim.assignedTo?.name || "",
        userEmail: sim.assignedTo?.email || "",
        phoneId: undefined,
        phoneModel: undefined,
        simCardId: sim.id?.toString(),
        simCardNumber: sim.number || "",
        assignedBy: "Direct Assignment", // Since we don't have this info for direct assignments
        assignmentDate: sim.assignedDate || new Date().toISOString().split('T')[0],
        returnDate: undefined,
        status: "ACTIVE" as const,
        notes: "Attribution directe depuis la page Cartes SIM",
      }))

      // Combine both types of assignments
      const allAssignments = [...transformedAttributions, ...transformedDirectAssignments]

      setAttributions(allAssignments)
      setFilteredAttributions(allAssignments)

      // Update pagination info (adjust for combined results)
      const totalItems = apiAttributions.length + directSimAssignments.length
      if (paginationData.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: totalItems,
          totalPages: Math.ceil(totalItems / prev.limit),
        }))
      }

    } catch (error: any) {
      console.error("Error fetching attributions:", error)
      setError(error.response?.data?.message || "Erreur lors du chargement des attributions")
      toast({
        title: "Erreur",
        description: "Impossible de charger les attributions",
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

  const handleEdit = (attribution: Attribution) => {
    setEditingAttribution(attribution)
    setShowModal(true)
    toast({
      title: "Modification d'attribution",
      description: `Modification de l'attribution pour ${attribution.userName}`,
    })
  }

  const handleDelete = async (id: string) => {
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

      const api = new AttributionManagementApi(getApiConfig(token))
      await api.deleteAttribution(parseInt(id))
      
      setAttributions(attributions.filter((attr) => attr.id !== id))
      toast({
        title: "Attribution supprimée",
        description: "L'attribution a été supprimée avec succès",
      })
    } catch (error: any) {
      console.error("Error deleting attribution:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'attribution",
        variant: "destructive",
      })
    }
  }

  const handleReturn = async (id: string) => {
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

      // Find the attribution to get user details for confirmation
      const attribution = attributions.find(attr => attr.id === id)
      if (!attribution) {
        toast({
          title: "Erreur",
          description: "Attribution introuvable",
          variant: "destructive",
        })
        return
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir retourner l'attribution pour ${attribution.userName} ?\n\n` +
        `Cette action va :\n` +
        `• Marquer l'attribution comme retournée\n` +
        `• Libérer le téléphone et/ou la carte SIM\n` +
        `• Enregistrer la date de retour`
      )

      if (!confirmed) {
        return
      }

      const api = new AttributionManagementApi(getApiConfig(token))
      
      // Optional: Add return notes
      const returnNotes = prompt("Notes de retour (optionnel):", "")
      
      // Use axios directly to send request body since the generated API doesn't support it
      const response = await axios.post(
        `http://localhost:8080/api/attributions/${id}/return`,
        returnNotes ? { notes: returnNotes } : {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      // Refresh the data
      fetchAttributions()
      
      toast({
        title: "Attribution retournée",
        description: `L'attribution pour ${attribution.userName} a été marquée comme retournée avec succès.`,
      })
    } catch (error: any) {
      console.error("Error returning attribution:", error)
      
      // Handle specific error cases
      let errorMessage = "Impossible de retourner l'attribution"
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.status === 404) {
        errorMessage = "Attribution introuvable"
      } else if (error.response?.status === 400) {
        errorMessage = "L'attribution n'est pas active et ne peut pas être retournée"
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleView = (attribution: Attribution) => {
    toast({
      title: "Détails de l'attribution",
      description: `Affichage des détails pour ${attribution.userName}`,
    })
  }

  const handleSaveAttribution = async (attributionData: Partial<Attribution>) => {
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

      const api = new AttributionManagementApi(getApiConfig(token))

      if (editingAttribution) {
        // Edit existing attribution
        const updateData: AttributionDto = {
          userId: parseInt(attributionData.userId || "0"),
          phoneId: attributionData.phoneId ? parseInt(attributionData.phoneId) : undefined,
          simCardId: attributionData.simCardId ? parseInt(attributionData.simCardId) : undefined,
          notes: attributionData.notes,
        }
        
        await api.updateAttribution(parseInt(editingAttribution.id), updateData)
        toast({
          title: "Attribution modifiée",
          description: "L'attribution a été mise à jour avec succès.",
        })
      } else {
        // Add new attribution
        const createData: AttributionDto = {
          userId: parseInt(attributionData.userId || "0"),
          phoneId: attributionData.phoneId ? parseInt(attributionData.phoneId) : undefined,
          simCardId: attributionData.simCardId ? parseInt(attributionData.simCardId) : undefined,
          notes: attributionData.notes,
        }
        
        await api.createAttribution(createData)
        toast({
          title: "Attribution créée",
          description: "La nouvelle attribution a été créée avec succès.",
        })
      }
      
      // Refresh the data
      fetchAttributions()
      setShowModal(false)
      setEditingAttribution(null)
    } catch (error: any) {
      console.error("Error saving attribution:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'attribution",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case "RETURNED":
        return <Badge className="bg-gray-100 text-gray-800">Retourné</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }))
  }

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxToShow = 5
    let start = Math.max(1, pagination.page - 2)
    let end = Math.min(pagination.totalPages, start + maxToShow - 1)
    if (end - start < maxToShow - 1) start = Math.max(1, end - maxToShow + 1)
    for (let p = start; p <= end; p++) pages.push(p)
    return pages
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar activeItem="attributions" onLogout={handleLogout} />

      <div className="flex-1 ml-64">
        {/* Header Bar */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attributions</h1>
              <p className="text-gray-600">Gérez les attributions de téléphones et cartes SIM</p>
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
          {/* Page Content Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attributions</h1>
              <p className="text-gray-600 mt-2">Gérez les attributions de téléphones et cartes SIM</p>
            </div>
            <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Attribution
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une attribution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="returned">Retourné</option>
            </select>
            <Button variant="outline" className="bg-white/80">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Attributions Table */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Liste des Attributions ({pagination.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Chargement des attributions...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 text-lg">{error}</p>
                  <Button onClick={fetchAttributions} className="mt-4">
                    Réessayer
                  </Button>
                </div>
              ) : filteredAttributions.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aucune attribution trouvée</p>
                  <p className="text-gray-400 mt-2">
                    {searchTerm || statusFilter !== "all"
                      ? "Essayez de modifier vos critères de recherche"
                      : "Créez votre première attribution"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Téléphone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carte SIM
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date d'attribution
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigné par
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAttributions.map((attribution) => (
                          <tr key={attribution.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                    {attribution.userName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{attribution.userName}</p>
                                  <p className="text-sm text-gray-500">{attribution.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {attribution.phoneModel ? (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm text-gray-900">{attribution.phoneModel}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Non assigné</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {attribution.simCardNumber ? (
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="h-4 w-4 text-green-500" />
                                  <span className="font-mono text-sm text-gray-900">{attribution.simCardNumber}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Non assignée</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {new Date(attribution.assignmentDate).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(attribution.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{attribution.assignedBy}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleView(attribution)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(attribution)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  {attribution.status === "ACTIVE" && (
                                    <DropdownMenuItem onClick={() => handleReturn(attribution.id)}>
                                      <RotateCcw className="mr-2 h-4 w-4" />
                                      Retourner
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleDelete(attribution.id)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                                     {/* Pagination */}
                   {pagination.totalPages > 1 && (
                     <Pagination className="justify-end mt-4">
                       <PaginationContent>
                         <PaginationItem>
                           <PaginationPrevious href="#" onClick={(e)=>{e.preventDefault(); handlePageChange(Math.max(1,pagination.page-1))}} />
                         </PaginationItem>
                         {getPageNumbers().map((p) => (
                           <PaginationItem key={p}>
                             <PaginationLink href="#" isActive={p===pagination.page} onClick={(e)=>{e.preventDefault(); handlePageChange(p)}}>
                               {p}
                             </PaginationLink>
                           </PaginationItem>
                         ))}
                         <PaginationItem>
                           <PaginationNext href="#" onClick={(e)=>{e.preventDefault(); handlePageChange(Math.min(pagination.totalPages,pagination.page+1))}} />
                         </PaginationItem>
                       </PaginationContent>
                     </Pagination>
                   )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attribution Modal */}
      <AttributionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingAttribution(null)
        }}
        onSave={handleSaveAttribution}
        attribution={editingAttribution}
      />

      <Toaster />
    </div>
  )
}
