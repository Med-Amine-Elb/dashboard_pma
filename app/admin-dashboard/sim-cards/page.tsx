"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Plus, Download, Edit, Trash2, Globe, History } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { SimCardModal } from "@/components/sim-card-modal"
import { AssignmentHistoryModal } from "@/components/assignment-history-modal"
import { useToast } from "@/hooks/use-toast"
import { SIMCardManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

interface SimCard {
  id: string
  number: string
  carrier: string
  plan: string
  status: "available" | "assigned" | "suspended" | "expired"
  activationDate: string
  expiryDate: string
  monthlyFee: number
  dataLimit: string
  iccid: string
  pin: string
  puk: string
  notes?: string
}

interface AssignmentHistory {
  id: string
  simCardId: string
  phoneId?: string
  userId: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  status: "active" | "returned" | "expired"
  notes?: string
}

export default function SimCardsPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [simCards, setSimCards] = useState<SimCard[]>([])
  const [filteredSimCards, setFilteredSimCards] = useState<SimCard[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [carrierFilter, setCarrierFilter] = useState("all")
  const [isSimModalOpen, setIsSimModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedSim, setSelectedSim] = useState<SimCard | null>(null)
  const [selectedSimHistory, setSelectedSimHistory] = useState<AssignmentHistory[]>([])
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

    fetchSimCards()
    loadAssignmentHistory()
  }, [])

  useEffect(() => {
    filterSimCards()
  }, [simCards, searchTerm, statusFilter, carrierFilter])

  const fetchSimCards = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      console.log("SIM fetch: token", token)
      const api = new SIMCardManagementApi(getApiConfig(token))
      console.log("SIM fetch: api config", getApiConfig(token))
      const res = await api.getSimCards()
      console.log("SIM fetch: API response", res)
      // Correctly extract sim cards from backend response (use 'simcards' lowercase)
      let apiSimCards: any[] = [];
      if (Array.isArray(res.data)) {
        apiSimCards = res.data;
      } else if (
        res.data && typeof res.data === 'object' &&
        res.data.data && typeof res.data.data === 'object' &&
        Array.isArray((res.data.data as any).simcards)
      ) {
        apiSimCards = (res.data.data as any).simcards;
      } else if (
        res.data && typeof res.data === 'object' &&
        Array.isArray((res.data as any).simcards)
      ) {
        apiSimCards = (res.data as any).simcards;
      }
      console.log("SIM fetch: processed sim cards", apiSimCards)
      setSimCards(
        (Array.isArray(apiSimCards) ? apiSimCards : []).map((s: any) => ({
          id: String(s.id),
          number: s.number,
          carrier: s.carrier || "",
          plan: s.plan || "",
          status: (s.status || "available").toLowerCase(),
          activationDate: s.activationDate || "",
          expiryDate: s.expiryDate || "",
          monthlyFee: s.monthlyFee || 0,
          dataLimit: s.dataLimit || "",
          iccid: s.iccid || "",
          pin: s.pin || "",
          puk: s.puk || "",
          notes: s.notes || "",
        }))
      )
    } catch (err) {
      console.error("SIM fetch: error", err)
      setError("Erreur lors du chargement des cartes SIM.")
    } finally {
      setLoading(false)
    }
  }

  const loadAssignmentHistory = () => {
    const mockHistory: AssignmentHistory[] = [
      {
        id: "1",
        simCardId: "1",
        phoneId: "1",
        userId: "user1",
        assignedBy: "admin1",
        assignmentDate: "2024-01-15",
        status: "active",
        notes: "Attribution initiale",
      },
      {
        id: "2",
        simCardId: "2",
        userId: "user2",
        assignedBy: "admin1",
        assignmentDate: "2023-12-01",
        returnDate: "2024-01-10",
        status: "returned",
        notes: "Changement de poste",
      },
    ]
    setAssignmentHistory(mockHistory)
  }

  const filterSimCards = () => {
    let filtered = simCards

    if (searchTerm) {
      filtered = filtered.filter(
        (sim) =>
          sim.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sim.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sim.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sim.iccid.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sim) => sim.status === statusFilter)
    }

    if (carrierFilter !== "all") {
      filtered = filtered.filter((sim) => sim.carrier === carrierFilter)
    }

    setFilteredSimCards(filtered)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleAddSim = () => {
    setSelectedSim(null)
    setIsSimModalOpen(true)
  }

  const handleEditSim = (sim: SimCard) => {
    setSelectedSim(sim)
    setIsSimModalOpen(true)
  }

  const handleDeleteSim = (simId: string) => {
    setSimCards(simCards.filter((sim) => sim.id !== simId))
    toast({
      title: "Carte SIM supprimée",
      description: "La carte SIM a été supprimée avec succès.",
    })
  }

  const handleViewHistory = (sim: SimCard) => {
    const history = assignmentHistory.filter((h) => h.simCardId === sim.id)
    setSelectedSimHistory(history)
    setIsHistoryModalOpen(true)
  }

  const handleSaveSim = (simData: Partial<SimCard>) => {
    if (selectedSim) {
      setSimCards(simCards.map((sim) => (sim.id === selectedSim.id ? { ...sim, ...simData } : sim)))
      toast({
        title: "Carte SIM modifiée",
        description: "Les informations de la carte SIM ont été mises à jour.",
      })
    } else {
      const newSim: SimCard = {
        id: Date.now().toString(),
        number: simData.number || "",
        carrier: simData.carrier || "",
        plan: simData.plan || "",
        status: simData.status || "available",
        activationDate: simData.activationDate || new Date().toISOString().split("T")[0],
        expiryDate: simData.expiryDate || "",
        monthlyFee: simData.monthlyFee || 0,
        dataLimit: simData.dataLimit || "",
        iccid: simData.iccid || "",
        pin: simData.pin || "",
        puk: simData.puk || "",
        notes: simData.notes,
      }
      setSimCards([...simCards, newSim])
      toast({
        title: "Carte SIM ajoutée",
        description: "La nouvelle carte SIM a été ajoutée avec succès.",
      })
    }
    setIsSimModalOpen(false)
  }

  const handleExport = () => {
    const csvContent = [
      [
        "Numéro",
        "Opérateur",
        "Forfait",
        "Statut",
        "Date activation",
        "Date expiration",
        "Coût mensuel",
        "ICCID",
        "PIN",
        "PUK",
      ],
      ...filteredSimCards.map((sim) => [
        sim.number,
        sim.carrier,
        sim.plan,
        sim.status,
        sim.activationDate,
        sim.expiryDate,
        sim.monthlyFee.toString(),
        sim.iccid,
        sim.pin,
        sim.puk,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cartes-sim.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV.",
    })
  }

  const simColumns = [
    { key: "number", label: "Numéro" },
    { key: "carrier", label: "Opérateur" },
    { key: "plan", label: "Forfait" },
    { key: "status", label: "Statut" },
    { key: "monthlyFee", label: "Coût/mois" },
    { key: "iccid", label: "ICCID" },
    { key: "pin", label: "PIN" },
    { key: "expiryDate", label: "Expiration" },
    { key: "actions", label: "Actions" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      assigned: "bg-blue-100 text-blue-800",
      suspended: "bg-orange-100 text-orange-800",
      expired: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const carriers = ["Orange", "SFR", "Bouygues", "Free"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="sim-cards" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Cartes SIM</h1>
                <p className="text-gray-600">Inventaire et suivi des cartes SIM d'entreprise</p>
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
                  <CardTitle className="text-xl font-bold">Inventaire des Cartes SIM</CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="available">Disponible</option>
                      <option value="assigned">Assignée</option>
                      <option value="suspended">Suspendue</option>
                      <option value="expired">Expirée</option>
                    </select>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={carrierFilter}
                      onChange={(e) => setCarrierFilter(e.target.value)}
                    >
                      <option value="all">Tous les opérateurs</option>
                      {carriers.map((carrier) => (
                        <option key={carrier} value={carrier}>
                          {carrier}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <Button onClick={handleAddSim} className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter Carte SIM
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
                  data={filteredSimCards}
                  columns={simColumns}
                  onRowClick={(sim) => handleEditSim(sim)}
                  renderCell={(sim, key) => {
                    if (key === "status") {
                      return <Badge className={getStatusColor(sim.status)}>{sim.status}</Badge>
                    }
                    if (key === "monthlyFee") {
                      return <span>€{sim.monthlyFee}</span>
                    }
                    if (key === "expiryDate") {
                      const isExpired = new Date(sim.expiryDate) < new Date()
                      return (
                        <span className={isExpired ? "text-red-600 font-medium" : ""}>
                          {new Date(sim.expiryDate).toLocaleDateString("fr-FR")}
                        </span>
                      )
                    }
                    if (key === "actions") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewHistory(sim)}>
                            <History className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditSim(sim)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSim(sim.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }
                    return sim[key as keyof SimCard] || "-"
                  }}
                />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SimCardModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onSave={handleSaveSim}
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
