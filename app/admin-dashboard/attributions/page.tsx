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
import { AttributionManagementApi } from "@/api/generated";
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
  status: "active" | "returned" | "pending"
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
      const api = new AttributionManagementApi(getApiConfig(token))
      const res = await api.getAttributions()
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
      setAttributions(
        (Array.isArray(apiAttributions) ? apiAttributions : []).map((a: any) => ({
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
          status: (a.status || "active").toLowerCase(),
          notes: a.notes || undefined,
        }))
      )
    } catch (err: any) {
      setError("Erreur lors du chargement des attributions.")
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

  const handleDeleteAttribution = (attributionId: string) => {
    setAttributions(attributions.filter((attribution) => attribution.id !== attributionId))
    toast({
      title: "Attribution supprimée",
      description: "L'attribution a été supprimée avec succès.",
    })
  }

  const handleSaveAttribution = (attributionData: Partial<Attribution>) => {
    if (selectedAttribution) {
      setAttributions(
        attributions.map((attribution) =>
          attribution.id === selectedAttribution.id ? { ...attribution, ...attributionData } : attribution,
        ),
      )
      toast({
        title: "Attribution modifiée",
        description: "L'attribution a été mise à jour avec succès.",
      })
    } else {
      const newAttribution: Attribution = {
        id: Date.now().toString(),
        userId: attributionData.userId || "",
        userName: attributionData.userName || "",
        userEmail: attributionData.userEmail || "",
        phoneId: attributionData.phoneId,
        phoneModel: attributionData.phoneModel,
        simCardId: attributionData.simCardId,
        simCardNumber: attributionData.simCardNumber,
        assignedBy: "Randy Riley",
        assignmentDate: attributionData.assignmentDate || new Date().toISOString().split("T")[0],
        status: attributionData.status || "active",
        notes: attributionData.notes,
      }
      setAttributions([...attributions, newAttribution])
      toast({
        title: "Attribution créée",
        description: "La nouvelle attribution a été créée avec succès.",
      })
    }
    setIsModalOpen(false)
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
      active: "bg-green-100 text-green-800",
      returned: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
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
                      <option value="active">Actif</option>
                      <option value="returned">Retourné</option>
                      <option value="pending">En attente</option>
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
                    onRowClick={(attr) => handleEditAttribution(attr)}
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
                              onClick={() => handleEditAttribution(attr)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                              onClick={() => handleDeleteAttribution(attr.id)}
                            className="text-red-600 hover:text-red-700"
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
    </div>
  )
}
