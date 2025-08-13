"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Plus, Download, Edit, Trash2, Globe } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { AttributionModal } from "@/components/attribution-modal"
import { useToast } from "@/hooks/use-toast"
import { AttributionManagementApi, AttributionDtoStatusEnum } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

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

export default function AttributionsPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [filteredAttributions, setFilteredAttributions] = useState<Attribution[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAttribution, setSelectedAttribution] = useState<Attribution | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [attributionToDelete, setAttributionToDelete] = useState<Attribution | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }

    fetchAttributions()
  }, [])

  useEffect(() => {
    filterAttributions()
  }, [attributions, searchTerm, statusFilter])

  const fetchAttributions = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      console.log("Stored JWT token:", token ? token.substring(0, 50) + "..." : "No token found")
      
      if (!token) {
        setError("Token d'authentification manquant")
        return
      }

      // Decode JWT token to check its content
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log("JWT Token payload:", payload)
        console.log("Token expiration:", new Date(payload.exp * 1000))
        console.log("Token is expired:", Date.now() > payload.exp * 1000)
      } catch (e) {
        console.error("Error decoding JWT token:", e)
      }

      const api = new AttributionManagementApi(getApiConfig(token))
      console.log("API config:", getApiConfig(token))
      console.log("Fetching attributions...")
      
      const res = await api.getAttributions()
      console.log("API Response:", res)
      console.log("Response data:", res.data)
      console.log("Response status:", res.status)
      
      // Correctly extract attributions from backend response
      let apiAttributions: any[] = [];
      if (Array.isArray(res.data)) {
        apiAttributions = res.data;
      } else if (
        res.data && typeof res.data === 'object' &&
        res.data.data && typeof res.data.data === 'object' &&
        Array.isArray((res.data.data as any).attributions)
      ) {
        apiAttributions = (res.data.data as any).attributions;
      } else if (
        res.data && typeof res.data === 'object' &&
        Array.isArray((res.data as any).attributions)
      ) {
        apiAttributions = (res.data as any).attributions;
      }
      
      console.log("Processed attributions:", apiAttributions)
      
      const mappedAttributions = (Array.isArray(apiAttributions) ? apiAttributions : []).map((a: any) => ({
        id: String(a.id),
        userId: String(a.userId),
        userName: a.userName || "",
        userEmail: a.userEmail || "",
        phoneId: a.phoneId ? String(a.phoneId) : undefined,
        phoneModel: a.phoneModel || undefined,
        simCardId: a.simCardId ? String(a.simCardId) : undefined,
        simCardNumber: a.simCardNumber || undefined,
        assignedBy: a.assignedByName || "",
        assignmentDate: a.assignmentDate || "",
        returnDate: a.returnDate || undefined,
        status: (a.status || "ACTIVE").toUpperCase(),
        notes: a.notes || undefined,
      }))
      
      console.log("Mapped attributions:", mappedAttributions)
      setAttributions(mappedAttributions)
      
    } catch (err: any) {
      console.error("Error fetching attributions:", err)
      console.error("Error response:", err.response)
      console.error("Error status:", err.response?.status)
      console.error("Error data:", err.response?.data)
      setError(err.response?.data?.message || "Erreur lors du chargement des attributions.")
    } finally {
      setLoading(false)
    }
  }

  const filterAttributions = () => {
    let filtered = attributions

    if (searchTerm) {
      filtered = filtered.filter(
        (attribution) =>
          attribution.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attribution.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attribution.phoneModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attribution.simCardNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((attribution) => attribution.status === statusFilter)
    }

    setFilteredAttributions(filtered)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleAddAttribution = () => {
    setSelectedAttribution(null)
    setIsModalOpen(true)
  }

  const handleEditAttribution = (attribution: Attribution) => {
    setSelectedAttribution(attribution)
    setIsModalOpen(true)
  }

  const handleDeleteAttribution = async (attributionId: string, event?: React.MouseEvent) => {
    // Prevent the row click event from triggering
    if (event) {
      event.stopPropagation()
    }
    
    // Find the attribution to delete
    const attribution = attributions.find(a => a.id === attributionId)
    if (!attribution) {
      toast({
        title: "Erreur",
        description: "Attribution non trouvée",
        variant: "destructive",
      })
      return
    }
    
    // Show delete confirmation modal
    setAttributionToDelete(attribution)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!attributionToDelete) return
    
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
      await attributionApi.deleteAttribution(Number(attributionToDelete.id))
      
      toast({
        title: "Attribution supprimée",
        description: "L'attribution a été supprimée avec succès.",
      })
      
      // Refresh the attributions list from the backend
      await fetchAttributions()
      
    } catch (err: any) {
      console.error("Error deleting attribution:", err)
      
      // Handle specific error cases
      let errorMessage = "Erreur lors de la suppression de l'attribution"
      
      if (err.response?.status === 404) {
        errorMessage = "Attribution non trouvée"
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour supprimer cette attribution"
      } else if (err.response?.status === 409) {
        errorMessage = "Impossible de supprimer cette attribution car elle est associée à d'autres données"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleteModalOpen(false)
      setAttributionToDelete(null)
    }
  }

  const handleSaveAttribution = async (attributionData: Partial<Attribution>) => {
    try {
      // Validation
      const errors: string[] = []
      
      if (!attributionData.userId || (typeof attributionData.userId === 'string' && attributionData.userId.trim() === "") || (typeof attributionData.userId === 'number' && attributionData.userId <= 0)) {
        errors.push("L'utilisateur est obligatoire")
      }
      
      if (!attributionData.assignmentDate || (typeof attributionData.assignmentDate === 'string' && attributionData.assignmentDate.trim() === "")) {
        errors.push("La date d'attribution est obligatoire")
      }
      
      if (!attributionData.status || (typeof attributionData.status === 'string' && attributionData.status.trim() === "")) {
        errors.push("Le statut est obligatoire")
      }
      
      if (errors.length > 0) {
        toast({
          title: "Erreur de validation",
          description: errors.join(", "),
          variant: "destructive",
        })
        return
      }

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
      
      console.log("Attribution data being sent:", attributionData);
      
      if (selectedAttribution) {
        // Update existing attribution
        const updatePayload = {
          userId: attributionData.userId ? Number(attributionData.userId) : undefined,
          phoneId: attributionData.phoneId ? Number(attributionData.phoneId) : undefined,
          simCardId: attributionData.simCardId ? Number(attributionData.simCardId) : undefined,
          assignmentDate: attributionData.assignmentDate || "",
          returnDate: attributionData.returnDate || undefined,
          status: ((attributionData.status || "ACTIVE") as keyof typeof AttributionDtoStatusEnum) ? (attributionData.status as AttributionDtoStatusEnum) : AttributionDtoStatusEnum.Active,
          notes: attributionData.notes || undefined,
        };
        console.log("Update payload:", updatePayload);
        console.log("Selected attribution ID:", selectedAttribution.id);
        console.log("Selected attribution ID type:", typeof selectedAttribution.id);
        await attributionApi.updateAttribution(Number(selectedAttribution.id), updatePayload)
        
        toast({
          title: "Attribution modifiée",
          description: "L'attribution a été mise à jour avec succès.",
        })
      } else {
        // Create new attribution
        const createPayload = {
          userId: attributionData.userId ? Number(attributionData.userId) : undefined,
          phoneId: attributionData.phoneId ? Number(attributionData.phoneId) : undefined,
          simCardId: attributionData.simCardId ? Number(attributionData.simCardId) : undefined,
          assignmentDate: attributionData.assignmentDate || "",
          returnDate: attributionData.returnDate || undefined,
          status: ((attributionData.status || "ACTIVE") as keyof typeof AttributionDtoStatusEnum) ? (attributionData.status as AttributionDtoStatusEnum) : AttributionDtoStatusEnum.Active,
          notes: attributionData.notes || undefined,
        };
        console.log("Create payload:", createPayload);
        await attributionApi.createAttribution(createPayload)
        
        toast({
          title: "Attribution créée",
          description: "La nouvelle attribution a été créée avec succès.",
        })
      }
      
      // Refresh the attributions list from the backend
      await fetchAttributions()
      setIsModalOpen(false)
      
    } catch (err: any) {
      console.error("Error saving attribution:", err)
      console.error("Error response:", err.response)
      console.error("Error status:", err.response?.status)
      console.error("Error data:", err.response?.data)
      
      // Handle specific error cases
      let errorMessage = "Erreur lors de la sauvegarde de l'attribution"
      
      if (err.response?.status === 400) {
        const errorData = err.response?.data
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message
        } else if (errorData?.message) {
          errorMessage = errorData.message
        }
      } else if (err.response?.status === 409) {
        errorMessage = "Une attribution similaire existe déjà"
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour effectuer cette action"
      } else if (err.response?.status === 404) {
        errorMessage = "Attribution non trouvée"
      } else if (err.message?.includes("already exists")) {
        errorMessage = "Une attribution similaire existe déjà"
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const csvContent = [
      [
        "Utilisateur",
        "Email",
        "Téléphone",
        "Carte SIM",
        "Assigné par",
        "Date d'attribution",
        "Date de retour",
        "Statut",
        "Notes",
      ],
      ...filteredAttributions.map((attribution) => [
        attribution.userName,
        attribution.userEmail,
        attribution.phoneModel || "",
        attribution.simCardNumber || "",
        attribution.assignedBy,
        attribution.assignmentDate,
        attribution.returnDate || "",
        attribution.status,
        attribution.notes || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "attributions.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV.",
    })
  }

  const attributionColumns = [
    { key: "userName", label: "Utilisateur" },
    { key: "userEmail", label: "Email" },
    { key: "phoneModel", label: "Téléphone" },
    { key: "simCardNumber", label: "Carte SIM" },
    { key: "assignedBy", label: "Assigné par" },
    { key: "assignmentDate", label: "Date d'attribution" },
    { key: "status", label: "Statut" },
    { key: "actions", label: "Actions" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      RETURNED: "bg-gray-100 text-gray-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="attributions" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Attributions</h1>
                <p className="text-gray-600">Attribution des téléphones et cartes SIM aux utilisateurs</p>
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
          <div className="p-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Liste des Attributions</CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="ACTIVE">Actif</option>
                      <option value="RETURNED">Retourné</option>
                      <option value="PENDING">En attente</option>
                    </select>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <Button
                      onClick={handleAddAttribution}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle Attribution
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center text-gray-500">Chargement...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-500">{error}</div>
                ) : (
                <DataTable
                  data={filteredAttributions}
                  columns={attributionColumns}
                  renderCell={(attr, key) => {
                    if (key === "status") {
                        return <Badge className={getStatusColor(attr.status)}>{attr.status}</Badge>
                    }
                    if (key === "assignmentDate") {
                        return <span>{new Date(attr.assignmentDate).toLocaleDateString("fr-FR")}</span>
                    }
                    if (key === "actions") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditAttribution(attr)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDeleteAttribution(attr.id, e)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }
                      return attr[key as keyof Attribution] || "-"
                  }}
                />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AttributionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAttribution}
        attribution={selectedAttribution}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && attributionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                <p className="text-sm text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Êtes-vous sûr de vouloir supprimer l'attribution :
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{attributionToDelete.userName}</p>
                <p className="text-sm text-gray-600">{attributionToDelete.userEmail}</p>
                <p className="text-sm text-gray-600">
                  {attributionToDelete.phoneModel && `Téléphone: ${attributionToDelete.phoneModel}`}
                  {attributionToDelete.simCardNumber && ` • SIM: ${attributionToDelete.simCardNumber}`}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setAttributionToDelete(null)
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
