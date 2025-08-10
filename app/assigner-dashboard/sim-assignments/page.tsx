"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, User, History, ChevronLeft, ChevronRight } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { SimAssignmentModal } from "@/components/sim-assignment-modal"
import { AssignmentHistoryModal } from "@/components/assignment-history-modal"
import { useToast } from "@/hooks/use-toast"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { SimCardDto } from "@/api/generated/models"
import axios from "axios"

interface SimCard {
  id: string
  number: string
  carrier: string
  plan: string
  status: "available" | "assigned" | "lost" | "blocked"
  assignedTo?: string
  assignedPhone?: string
  dataLimit: string
  monthlyFee: number
}

interface AssignmentHistory {
  id: string
  simCardId: string
  phoneId?: string
  userId: string
  userName: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  status: "active" | "returned" | "expired"
  notes?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function SimAssignmentsPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [simCards, setSimCards] = useState<SimCard[]>([])
  const [filteredSimCards, setFilteredSimCards] = useState<SimCard[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedSim, setSelectedSim] = useState<SimCard | null>(null)
  const [selectedSimHistory, setSelectedSimHistory] = useState<AssignmentHistory[]>([])
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

    fetchSimCards()
    loadAssignmentHistory()
  }, [pagination.page, pagination.limit, statusFilter, searchTerm])

  const fetchSimCards = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      
      if (!token) {
        setError("Token d'authentification manquant")
        return
      }

      const api = new SIMCardManagementApi(getApiConfig(token))
      
      // Convert status filter to API format
      let statusParam: "AVAILABLE" | "ASSIGNED" | "LOST" | "BLOCKED" | undefined
      if (statusFilter !== "all") {
        // Map frontend filter values to backend API values
        const statusMapping: { [key: string]: "AVAILABLE" | "ASSIGNED" | "LOST" | "BLOCKED" } = {
          "available": "AVAILABLE",
          "assigned": "ASSIGNED", 
          "lost": "LOST",
          "blocked": "BLOCKED"
        }
        statusParam = statusMapping[statusFilter]
      }

      console.log("Making API request with params:", {
        page: pagination.page,
        limit: pagination.limit,
        status: statusParam,
        search: searchTerm || undefined
      })

      const res = await api.getSimCards(
        pagination.page,
        pagination.limit,
        statusParam,
        searchTerm || undefined,
        undefined // iccid
      )

      console.log("API Response:", res)

      // Extract data from response
      let apiSimCards: any[] = []
      let paginationData: any = {}

      if (res.data && typeof res.data === 'object') {
        const responseData = res.data as any
        if (responseData.success && responseData.data) {
          apiSimCards = (responseData.data.simcards as any[]) || []
          paginationData = responseData.data.pagination || {}
        } else if (Array.isArray(responseData)) {
          apiSimCards = responseData
        } else if (responseData.simcards) {
          apiSimCards = (responseData.simcards as any[]) || []
          paginationData = responseData.pagination || {}
        }
      }

      console.log("Processed SIM cards:", apiSimCards)
      console.log("Pagination data:", paginationData)

      // Transform API data to match our interface
      const transformedSimCards: SimCard[] = apiSimCards.map((sim: any) => ({
        id: sim.id?.toString() || "",
        number: sim.number || "",
        carrier: sim.carrier || "Unknown",
        plan: sim.plan || "Standard",
        status: mapStatusToFrontend(sim.status),
        assignedTo: sim.assignedToName || undefined,
        assignedPhone: sim.assignedPhone || undefined,
        dataLimit: sim.dataLimit || "Unlimited",
        monthlyFee: sim.monthlyFee || 0,
      }))

      console.log("Transformed SIM cards:", transformedSimCards)

      setSimCards(transformedSimCards)
      setFilteredSimCards(transformedSimCards)

      // Update pagination info
      if (paginationData.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages || Math.ceil(paginationData.total / prev.limit),
        }))
      }

    } catch (error: any) {
      console.error("Error fetching SIM cards:", error)
      
      let errorMessage = "Erreur lors du chargement des cartes SIM"
      if (error.response?.status === 403) {
        errorMessage = "Accès refusé. Vérifiez vos permissions d'accès."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
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

  const mapStatusToFrontend = (apiStatus: string): "available" | "assigned" | "lost" | "blocked" => {
    switch (apiStatus) {
      case "AVAILABLE":
        return "available"
      case "ASSIGNED":
        return "assigned"
      case "LOST":
        return "lost"
      case "BLOCKED":
        return "blocked"
      default:
        return "available"
    }
  }

  const loadAssignmentHistory = () => {
    const mockHistory: AssignmentHistory[] = [
      {
        id: "1",
        simCardId: "1",
        phoneId: "1",
        userId: "user1",
        userName: "Jean Dupont",
        assignedBy: "Randy Riley",
        assignmentDate: "2024-01-15",
        status: "active",
        notes: "Attribution avec iPhone 15 Pro",
      },
      {
        id: "2",
        simCardId: "2",
        userId: "user2",
        userName: "Pierre Martin",
        assignedBy: "Randy Riley",
        assignmentDate: "2023-12-01",
        returnDate: "2024-01-10",
        status: "returned",
        notes: "Changement de poste",
      },
      {
        id: "3",
        simCardId: "3",
        phoneId: "2",
        userId: "user3",
        userName: "Marie Martin",
        assignedBy: "Randy Riley",
        assignmentDate: "2024-02-01",
        status: "active",
        notes: "Attribution avec Galaxy S24",
      },
    ]
    setAssignmentHistory(mockHistory)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleAssignSim = (sim: SimCard) => {
    setSelectedSim(sim)
    setIsAssignmentModalOpen(true)
  }

  const handleViewHistory = (sim: SimCard) => {
    const history = assignmentHistory.filter((h) => h.simCardId === sim.id)
    setSelectedSimHistory(history)
    setIsHistoryModalOpen(true)
  }

  const handleReturnSim = async (simId: string) => {
    try {
      setLoading(true) // Add loading state
      setError(null)
      
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token d'authentification manquant",
          variant: "destructive",
        })
        return
      }

      // Find the SIM card to get details for confirmation
      const simCard = simCards.find(sim => sim.id === simId)
      if (!simCard) {
        toast({
          title: "Erreur",
          description: "Carte SIM introuvable",
          variant: "destructive",
        })
        return
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir retourner la carte SIM ${simCard.number} ?\n\n` +
        `Cette action va :\n` +
        `• Marquer la carte SIM comme disponible\n` +
        `• Libérer l'utilisateur assigné\n` +
        `• Enregistrer la date de retour`
      )

      if (!confirmed) {
        return
      }

      console.log("Calling unassignSimCard API for SIM ID:", simId)
      const api = new SIMCardManagementApi(getApiConfig(token))
      const response = await api.unassignSimCard(parseInt(simId))
      
      console.log("Unassign API response:", response)
      
      // Show success message
      toast({
        title: "Carte SIM retournée",
        description: `La carte SIM ${simCard.number} a été marquée comme disponible.`,
      })
      
      // Refresh the data immediately
      console.log("Refreshing SIM cards data...")
      await fetchSimCards()
      
    } catch (error: any) {
      console.error("Error returning SIM card:", error)
      
      // Handle specific error cases
      let errorMessage = "Impossible de retourner la carte SIM"
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.status === 404) {
        errorMessage = "Carte SIM introuvable"
      } else if (error.response?.status === 400) {
        errorMessage = "La carte SIM n'est pas assignée et ne peut pas être retournée"
      } else if (error.response?.status === 403) {
        errorMessage = "Permission refusée pour cette action"
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAssignment = async (assignmentData: {
    userId: string
    userName: string
    phoneId?: string
    phoneName?: string
    notes?: string
  }) => {
    if (!selectedSim) return

    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token d'authentification manquant",
          variant: "destructive",
        })
        return
      }

      console.log("Calling assignSimCard API for SIM ID:", selectedSim.id, "User ID:", assignmentData.userId)
      const api = new SIMCardManagementApi(getApiConfig(token))
      
      // Assign SIM card to user
      const response = await api.assignSimCard(parseInt(selectedSim.id), {
        userId: parseInt(assignmentData.userId)
      })

      console.log("Assign API response:", response)

      // Show success message
      toast({
        title: "Attribution réussie",
        description: `Carte SIM assignée à ${assignmentData.userName}`,
      })

      // Close modal first
      setIsAssignmentModalOpen(false)
      
      // Refresh the data immediately
      console.log("Refreshing SIM cards data after assignment...")
      await fetchSimCards()
      
    } catch (error: any) {
      console.error("Error assigning SIM card:", error)
      
      let errorMessage = "Impossible d'assigner la carte SIM"
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.status === 400) {
        errorMessage = "Données d'attribution invalides"
      } else if (error.response?.status === 403) {
        errorMessage = "Permission refusée pour cette action"
      } else if (error.response?.status === 404) {
        errorMessage = "Carte SIM ou utilisateur introuvable"
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const simColumns = [
    { key: "number", label: "Numéro" },
    { key: "carrier", label: "Opérateur" },
    { key: "plan", label: "Forfait" },
    { key: "status", label: "Statut" },
    { key: "assignedTo", label: "Assigné à" },
    { key: "assignedPhone", label: "Téléphone" },
    { key: "dataLimit", label: "Data" },
    { key: "monthlyFee", label: "Coût/mois" },
    { key: "actions", label: "Actions" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      assigned: "bg-blue-100 text-blue-800",
      lost: "bg-orange-100 text-orange-800",
      blocked: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="sim-assignments" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cartes SIM</h1>
                <p className="text-gray-600">Gestion des attributions et retours de cartes SIM</p>
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
                    Cartes SIM Disponibles ({pagination.total})
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="available">Disponible</option>
                      <option value="assigned">Assignée</option>
                      <option value="lost">Perdue</option>
                      <option value="blocked">Bloquée</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Chargement des cartes SIM...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error}</p>
                    <Button onClick={fetchSimCards} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <>
                    <DataTable
                      data={filteredSimCards}
                      columns={simColumns}
                      renderCell={(sim, key) => {
                        if (key === "status") {
                          return <Badge className={getStatusColor(sim.status)}>{sim.status}</Badge>
                        }
                        if (key === "monthlyFee") {
                          return <span>{sim.monthlyFee} MAD</span>
                        }
                        if (key === "actions") {
                          return (
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewHistory(sim)}>
                                <History className="h-4 w-4" />
                              </Button>
                              {sim.status === "available" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleAssignSim(sim)}
                                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : null}
                                  <User className="h-4 w-4 mr-1" />
                                  Assigner
                                </Button>
                              )}
                              {sim.status === "assigned" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReturnSim(sim.id)}
                                  className="text-orange-600 hover:text-orange-700"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                                  ) : null}
                                  Retourner
                                </Button>
                              )}
                            </div>
                          )
                        }
                        return sim[key as keyof SimCard] || "-"
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

      <SimAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSave={handleSaveAssignment}
        simCard={selectedSim}
      />

      <AssignmentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={selectedSimHistory}
      />
    </div>
  )
}
