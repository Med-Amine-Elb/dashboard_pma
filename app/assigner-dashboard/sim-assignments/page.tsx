"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, User, History } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { SimAssignmentModal } from "@/components/sim-assignment-modal"
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
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }, [])

  useEffect(() => {
    filterSimCards()
  }, [simCards, searchTerm, statusFilter])

  const fetchSimCards = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      const api = new SIMCardManagementApi(getApiConfig(token))
      const res = await api.getSimCards()
      // Correctly extract sim cards from backend response
      let apiSimCards: any[] = [];
      if (Array.isArray(res.data)) {
        apiSimCards = res.data;
      } else if (
        res.data && typeof res.data === 'object' &&
        res.data.data && typeof res.data.data === 'object' &&
        Array.isArray((res.data.data as any).simCards)
      ) {
        apiSimCards = (res.data.data as any).simCards;
      } else if (
        res.data && typeof res.data === 'object' &&
        Array.isArray((res.data as any).simCards)
      ) {
        apiSimCards = (res.data as any).simCards;
      }
      setSimCards(
        (Array.isArray(apiSimCards) ? apiSimCards : []).map((s: any) => ({
          id: String(s.id),
          number: s.number,
          carrier: s.carrier || "",
          plan: s.plan || "",
          status: (s.status || "available").toLowerCase(),
          assignedTo: s.assignedToName || "",
          assignedPhone: s.assignedPhone || "",
          dataLimit: s.dataLimit || "",
          monthlyFee: s.monthlyFee || 0,
        }))
      )
    } catch (err: any) {
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

  const filterSimCards = () => {
    let filtered = simCards

    if (searchTerm) {
      filtered = filtered.filter(
        (sim) =>
          sim.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sim.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sim.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sim) => sim.status === statusFilter)
    }

    setFilteredSimCards(filtered)
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

  const handleReturnSim = (simId: string) => {
    setSimCards(
      simCards.map((sim) =>
        sim.id === simId
          ? {
              ...sim,
              status: "available" as const,
              assignedTo: undefined,
              assignedPhone: undefined,
            }
          : sim,
      ),
    )

    // Add to history
    const newHistoryEntry: AssignmentHistory = {
      id: Date.now().toString(),
      simCardId: simId,
      userId: "current_user",
      userName: "Current User",
      assignedBy: user.name,
      assignmentDate: new Date().toISOString().split("T")[0],
      returnDate: new Date().toISOString().split("T")[0],
      status: "returned",
      notes: "Retour initié par l'assignateur",
    }

    setAssignmentHistory([...assignmentHistory, newHistoryEntry])

    toast({
      title: "Carte SIM retournée",
      description: "La carte SIM a été marquée comme disponible.",
    })
  }

  const handleSaveAssignment = (assignmentData: {
    userId: string
    userName: string
    phoneId?: string
    phoneName?: string
    notes?: string
  }) => {
    if (!selectedSim) return

    // Update SIM card
    setSimCards(
      simCards.map((sim) =>
        sim.id === selectedSim.id
          ? {
              ...sim,
              status: "assigned" as const,
              assignedTo: assignmentData.userName,
              assignedPhone: assignmentData.phoneName,
            }
          : sim,
      ),
    )

    // Add to history
    const newHistoryEntry: AssignmentHistory = {
      id: Date.now().toString(),
      simCardId: selectedSim.id,
      phoneId: assignmentData.phoneId,
      userId: assignmentData.userId,
      userName: assignmentData.userName,
      assignedBy: user.name,
      assignmentDate: new Date().toISOString().split("T")[0],
      status: "active",
      notes: assignmentData.notes,
    }

    setAssignmentHistory([...assignmentHistory, newHistoryEntry])

    toast({
      title: "Attribution réussie",
      description: `Carte SIM assignée à ${assignmentData.userName}`,
    })

    setIsAssignmentModalOpen(false)
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
      suspended: "bg-orange-100 text-orange-800",
      expired: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
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
                <h1 className="text-2xl font-bold text-gray-900">Attribution des Cartes SIM</h1>
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
                  <CardTitle className="text-xl font-bold">Cartes SIM Disponibles</CardTitle>
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
                  renderCell={(sim, key) => {
                    if (key === "status") {
                      return <Badge className={getStatusColor(sim.status)}>{sim.status}</Badge>
                    }
                    if (key === "monthlyFee") {
                      return <span>€{sim.monthlyFee}</span>
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
                            >
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
                            >
                              Retourner
                            </Button>
                          )}
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
