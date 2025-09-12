"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Plus, Download, Edit, Trash2, Globe, History } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { SimCardModal } from "@/components/sim-card-modal"
import { AssignmentHistoryModal } from "@/components/assignment-history-modal"
import { useToast } from "@/hooks/use-toast"
import { SIMCardManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import ExcelJS from 'exceljs';

interface SimCard {
  id: string
  number: string
  carrier: string
  plan: string
  status: "AVAILABLE" | "ASSIGNED" | "LOST" | "BLOCKED"
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
  const { userData } = useUser()
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [simToDelete, setSimToDelete] = useState<SimCard | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxToShow = 5
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, start + maxToShow - 1)
    if (end - start < maxToShow - 1) start = Math.max(1, end - maxToShow + 1)
    for (let p = start; p <= end; p++) pages.push(p)
    return pages
  }

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
      name: userData.name || "Admin",
      email: userData.email || "",
      avatar: userData.avatar || "",
    })

    fetchSimCards()
    loadAssignmentHistory()
  }, [userData])

  useEffect(() => {
    filterSimCards()
  }, [simCards, searchTerm, statusFilter, carrierFilter])

  const fetchSimCards = async () => {
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

      const api = new SIMCardManagementApi(getApiConfig(token))
      console.log("API config:", getApiConfig(token))
      console.log("Fetching SIM cards...")
      
      const res = await api.getSimCards(1, 10000)
      console.log("API Response:", res)
      console.log("Response data:", res.data)
      console.log("Response status:", res.status)
      
      // Correctly extract sim cards from backend response (use 'simcards' lowercase)
      let apiSimCards: any[] = [];
      let meta: any = {}
      if (Array.isArray(res.data)) {
        apiSimCards = res.data;
      } else if (
        res.data && typeof res.data === 'object' &&
        res.data.data && typeof res.data.data === 'object' &&
        Array.isArray((res.data.data as any).simcards)
      ) {
        apiSimCards = (res.data.data as any).simcards;
        meta = (res.data.data as any).pagination || {}
      } else if (
        res.data && typeof res.data === 'object' &&
        Array.isArray((res.data as any).simcards)
      ) {
        apiSimCards = (res.data as any).simcards;
        meta = (res.data as any).pagination || {}
      }
      
      console.log("Processed SIM cards:", apiSimCards)
      
      const mappedSimCards = (Array.isArray(apiSimCards) ? apiSimCards : []).map((s: any) => ({
        id: String(s.id),
        number: s.number,
        carrier: s.carrier || "",
        plan: s.plan || "",
        status: (s.status || "AVAILABLE").toUpperCase(),
        activationDate: s.activationDate || "",
        expiryDate: s.expiryDate || "",
        monthlyFee: s.monthlyFee || 0,
        dataLimit: s.dataLimit || "",
        iccid: s.iccid || "",
        pin: s.pin || "",
        puk: s.puk || "",
        notes: s.notes || "",
      }))
      
      console.log("Mapped SIM cards:", mappedSimCards)
      setSimCards(mappedSimCards)
      if (meta) {
        setTotal(meta.total ?? mappedSimCards.length)
        setTotalPages(meta.totalPages ?? Math.ceil((meta.total ?? mappedSimCards.length)/limit))
      }
      
    } catch (err: any) {
      console.error("Error fetching SIM cards:", err)
      console.error("Error response:", err.response)
      console.error("Error status:", err.response?.status)
      console.error("Error data:", err.response?.data)
      setError(err.response?.data?.message || "Erreur lors du chargement des cartes SIM.")
    } finally {
      setLoading(false)
    }
  }

  const loadAssignmentHistory = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        console.warn("No token available for loading assignment history")
        setAssignmentHistory([])
        return
      }

      // For now, we'll use an empty array since we don't have a specific assignment history API
      // In the future, this could be replaced with a real API call
      setAssignmentHistory([])
    } catch (error) {
      console.error("Error loading assignment history:", error)
      setAssignmentHistory([])
    }
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
      // Map filter values to API status values
      const statusMap: { [key: string]: string } = {
        "available": "AVAILABLE",
        "assigned": "ASSIGNED", 
        "inactive": "INACTIVE",
        "suspendue": "BLOCKED", // Suspendue means blocked
        "expired": "EXPIRED" // Expirée means expired
      }
      const apiStatus = statusMap[statusFilter] || statusFilter.toUpperCase()
      filtered = filtered.filter((sim) => sim.status === apiStatus)
    }

    if (carrierFilter !== "all") {
      filtered = filtered.filter((sim) => sim.carrier === carrierFilter)
    }

    setFilteredSimCards(filtered)
    
    // Update pagination based on filtered results
    const totalFiltered = filtered.length
    setTotal(totalFiltered)
    setTotalPages(Math.ceil(totalFiltered / limit))
    
    // Reset to page 1 when filtering
    setPage(1)
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

  const handleDeleteSim = async (simId: string, event?: React.MouseEvent) => {
    // Prevent the row click event from triggering
    if (event) {
      event.stopPropagation()
    }
    
    // Find the sim card to delete
    const sim = simCards.find(s => s.id === simId)
    if (!sim) {
      toast({
        title: "Erreur",
        description: "Carte SIM non trouvée",
        variant: "destructive",
      })
      return
    }
    
    // Show delete confirmation modal
    setSimToDelete(sim)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!simToDelete) return
    
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

      const simApi = new SIMCardManagementApi(getApiConfig(token))
      await simApi.deleteSimCard(Number(simToDelete.id))
      
      toast({
        title: "Carte SIM supprimée",
        description: "La carte SIM a été supprimée avec succès.",
      })
      
      // Refresh the sim cards list from the backend
      await fetchSimCards()
      
    } catch (err: any) {
      console.error("Error deleting sim card:", err)
      
      // Handle specific error cases
      let errorMessage = "Erreur lors de la suppression de la carte SIM"
      
      if (err.response?.status === 404) {
        errorMessage = "Carte SIM non trouvée"
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour supprimer cette carte SIM"
      } else if (err.response?.status === 409) {
        errorMessage = "Impossible de supprimer cette carte SIM car elle est associée à d'autres données"
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
      setSimToDelete(null)
    }
  }

  const handleViewHistory = (sim: SimCard) => {
    const history = assignmentHistory.filter((h) => h.simCardId === sim.id)
    setSelectedSimHistory(history)
    setIsHistoryModalOpen(true)
  }

  const handleSaveSim = async (simData: Partial<SimCard>) => {
    try {
      // Validation
      const errors: string[] = [];
      if (!simData.number || simData.number.trim() === "") errors.push("Le numéro de téléphone est obligatoire");
      if (!simData.carrier || simData.carrier.trim() === "") errors.push("L'opérateur est obligatoire");
      if (!simData.plan || simData.plan.trim() === "") errors.push("Le forfait est obligatoire");
      if (!simData.iccid || simData.iccid.trim() === "") errors.push("L'ICCID est obligatoire");
      if (!simData.pin || simData.pin.trim() === "") errors.push("Le PIN est obligatoire");
      if (!simData.puk || simData.puk.trim() === "") errors.push("Le PUK est obligatoire");
      if (!simData.status) errors.push("Le statut est obligatoire");
      if (!simData.activationDate) errors.push("La date d'activation est obligatoire");
      if (simData.monthlyFee !== undefined && simData.monthlyFee < 0) errors.push("Le coût mensuel ne peut pas être négatif");
      if (errors.length > 0) {
        toast({ title: "Erreur de validation", description: errors.join(", "), variant: "destructive" });
        return;
      }
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        toast({ title: "Erreur", description: "Token d'authentification manquant", variant: "destructive" });
        return;
      }
      const simApi = new SIMCardManagementApi(getApiConfig(token));
      const payload = {
        number: simData.number || "",
        carrier: simData.carrier || "",
        plan: simData.plan || "",
        status: simData.status || "AVAILABLE",
        activationDate: simData.activationDate || "",
        expiryDate: simData.expiryDate || "",
        monthlyFee: simData.monthlyFee !== undefined ? Number(simData.monthlyFee) : 0,
        dataLimit: simData.dataLimit || "",
        iccid: simData.iccid || "",
        pin: simData.pin || "",
        puk: simData.puk || "",
        poke: "", // Add empty poke field to avoid validation error
        notes: simData.notes || "",
      };
      console.log("Sending SIM card payload:", payload);
      if (selectedSim) {
        await simApi.updateSimCard(Number(selectedSim.id), payload);
        toast({ title: "Carte SIM modifiée", description: "Les informations de la carte SIM ont été mises à jour." });
      } else {
        await simApi.createSimCard(payload);
        toast({ title: "Carte SIM ajoutée", description: "La nouvelle carte SIM a été ajoutée avec succès." });
      }
      await fetchSimCards();
      setIsSimModalOpen(false);
    } catch (err: any) {
      console.error("Error saving sim card:", err);
      let errorMessage = "Erreur lors de la sauvegarde de la carte SIM";
      if (err.response?.status === 400) {
        const errorData = err.response?.data;
        if (errorData?.error?.message) errorMessage = errorData.error.message;
        else if (errorData?.message) errorMessage = errorData.message;
      } else if (err.response?.status === 409) errorMessage = "Une carte SIM avec ce numéro existe déjà";
      else if (err.response?.status === 403) errorMessage = "Vous n'avez pas les permissions pour effectuer cette action";
      else if (err.response?.status === 404) errorMessage = "Carte SIM non trouvée";
      else if (err.message?.includes("already exists")) errorMessage = "Une carte SIM avec ce numéro existe déjà";
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token d'authentification manquant",
          variant: "destructive",
        })
        return
      }

      const api = new SIMCardManagementApi(getApiConfig(token))
      
      // Récupérer toutes les cartes SIM (sans pagination)
      const res = await api.getSimCards(1, 10000) // Limite très élevée pour récupérer toutes les cartes SIM
      const body: any = res.data as any
      
      // Traiter la réponse comme dans fetchSimCards
      let apiSimCards: any[] = []
      if (body) {
        if (Array.isArray(body)) {
          apiSimCards = body
        } else if (
          body.data && typeof body.data === 'object' &&
          body.data.simcards && Array.isArray(body.data.simcards)
        ) {
          apiSimCards = body.data.simcards
        } else if (
          body && typeof body === 'object' &&
          body.simcards && Array.isArray(body.simcards)
        ) {
          apiSimCards = body.simcards
        } else if (body.content && Array.isArray(body.content)) {
          apiSimCards = body.content
        } else if (body.data && Array.isArray(body.data)) {
          apiSimCards = body.data
        } else {
          console.warn("Unexpected response format:", body)
          apiSimCards = []
        }
      }
      
      console.log("API Response body:", body) // Debug log
      console.log("Processed sim cards:", apiSimCards) // Debug log
      
      // Mapper les cartes SIM pour l'export
      const exportSimCards = apiSimCards.map((s: any) => ({
        number: s.number ?? "",
        carrier: s.carrier ?? "",
        plan: s.plan ?? "",
        status: s.status ?? "",
        activationDate: s.activationDate ?? s.createdAt ?? "",
        expiryDate: s.expiryDate ?? "",
        monthlyFee: s.monthlyFee ?? 0,
        dataLimit: s.dataLimit ?? "",
        iccid: s.iccid ?? "",
        pin: s.pin ?? "",
        puk: s.puk ?? "",
        notes: s.notes ?? "",
      }))
      
      console.log("Export sim cards:", exportSimCards) // Debug log
      
      // Créer un fichier Excel stylé avec ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Cartes SIM')
      
      // Définir les couleurs pour les statuts
      const statusColors: { [key: string]: string } = {
        "AVAILABLE": "E6FFE6", // Vert clair
        "ASSIGNED": "E6F3FF", // Bleu clair
        "LOST": "FFE6E6", // Rouge clair
        "BLOCKED": "FFE6CC", // Orange clair
      }
      
      // Définir les couleurs pour les opérateurs
      const carrierColors: { [key: string]: string } = {
        "Orange": "FFA500", // Orange
        "Maroc Telecom": "FF6B35", // Orange foncé
        "Inwi": "00CED1", // Cyan
      }
      
      // Définir les colonnes avec largeurs
      worksheet.columns = [
        { header: 'Numéro', key: 'number', width: 18 },
        { header: 'Opérateur', key: 'carrier', width: 15 },
        { header: 'Forfait', key: 'plan', width: 20 },
        { header: 'Statut', key: 'status', width: 12 },
        { header: 'Date activation', key: 'activationDate', width: 15 },
        { header: 'Date expiration', key: 'expiryDate', width: 15 },
        { header: 'Coût mensuel (MAD)', key: 'monthlyFee', width: 15 },
        { header: 'Limite données', key: 'dataLimit', width: 15 },
        { header: 'ICCID', key: 'iccid', width: 25 },
        { header: 'PIN', key: 'pin', width: 10 },
        { header: 'PUK', key: 'puk', width: 10 },
        { header: 'Notes', key: 'notes', width: 30 }
      ]
      
      // Styliser l'en-tête
      const headerRow = worksheet.getRow(1)
      headerRow.height = 30
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F81BD' } // Bleu foncé
        }
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }, // Blanc
          size: 12
        }
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF2E5C8A' } },
          left: { style: 'thin', color: { argb: 'FF2E5C8A' } },
          bottom: { style: 'thin', color: { argb: 'FF2E5C8A' } },
          right: { style: 'thin', color: { argb: 'FF2E5C8A' } }
        }
      })
      
      // Ajouter les données avec style
      exportSimCards.forEach((sim, index) => {
        const row = worksheet.addRow({
          number: sim.number,
          carrier: sim.carrier,
          plan: sim.plan,
          status: sim.status,
          activationDate: sim.activationDate,
          expiryDate: sim.expiryDate,
          monthlyFee: sim.monthlyFee,
          dataLimit: sim.dataLimit,
          iccid: sim.iccid,
          pin: sim.pin,
          puk: sim.puk,
          notes: sim.notes || '-'
        })
        
        // Styliser la ligne
        row.height = 25
        
        // Couleur alternée pour les lignes
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8F9FA' } // Gris très clair
            }
          })
        }
        
        // Styliser la cellule de statut
        const statusCell = row.getCell('status')
        const statusColor = statusColors[sim.status] || 'FFFFFF'
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${statusColor}` }
        }
        statusCell.font = { bold: true }
        statusCell.alignment = { horizontal: 'center' }
        
        // Styliser la cellule d'opérateur
        const carrierCell = row.getCell('carrier')
        const carrierColor = carrierColors[sim.carrier] || 'FFFFFF'
        carrierCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${carrierColor}` }
        }
        carrierCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        carrierCell.alignment = { horizontal: 'center' }
        
        // Styliser la cellule de coût mensuel
        const feeCell = row.getCell('monthlyFee')
        feeCell.numFmt = 'MAD #,##0.00'
        feeCell.font = { bold: true }
        feeCell.alignment = { horizontal: 'right' }
        
        // Styliser les autres cellules
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
          }
          cell.alignment = { vertical: 'middle' }
        })
      })
      
      // Ajouter un titre stylé
      worksheet.insertRow(1, ['📱 INVENTAIRE DES CARTES SIM'])
      const titleRow = worksheet.getRow(1)
      titleRow.height = 40
      titleRow.getCell(1).font = {
        bold: true,
        size: 16,
        color: { argb: 'FF4F81BD' }
      }
      titleRow.getCell(1).alignment = { horizontal: 'center' }
      worksheet.mergeCells('A1:L1')
      
      // Ajouter des statistiques
      const statsRow = worksheet.addRow([])
      statsRow.height = 30
      const availableSims = exportSimCards.filter(s => s.status === 'AVAILABLE').length
      const assignedSims = exportSimCards.filter(s => s.status === 'ASSIGNED').length
      const totalMonthlyCost = exportSimCards.reduce((sum, s) => sum + (s.monthlyFee || 0), 0)
      
      statsRow.getCell(1).value = `📊 Statistiques: ${exportSimCards.length} cartes SIM total, ${availableSims} disponibles, ${assignedSims} assignées, Coût mensuel total: ${totalMonthlyCost.toLocaleString('fr-FR')} MAD`
      statsRow.getCell(1).font = { bold: true, color: { argb: 'FF666666' } }
      statsRow.getCell(1).alignment = { horizontal: 'center' }
      worksheet.mergeCells(`A${statsRow.number}:L${statsRow.number}`)
      
      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cartes-sim_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export réussi",
        description: `${exportSimCards.length} cartes SIM ont été exportées en Excel avec style.`,
      })
      
    } catch (err: any) {
      console.error("Error exporting sim cards:", err)
      toast({
        title: "Erreur d'export",
        description: "Erreur lors de l'export des cartes SIM.",
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
    { key: "monthlyFee", label: "Coût/mois" },
    { key: "iccid", label: "ICCID" },
    { key: "pin", label: "PIN" },
    { key: "expiryDate", label: "Expiration" },
    { key: "actions", label: "Actions" },
  ]

  const getStatusColor = (status: string) => {
    const s = (status || "").toString().toUpperCase()
    switch (s) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800"
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800"
      case "BLOCKED":
        return "bg-amber-100 text-amber-800"
      case "EXPIRED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const carriers = ["Orange", "Maroc Telecom"]

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

                <NotificationsDropdown userRole="admin" />

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
                      <option value="suspendue">Suspendue</option>
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
                    <Button variant="outline" onClick={handleExport} disabled={loading}>
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Export en cours..." : "Exporter"}
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewHistory(sim)
                            }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditSim(sim)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDeleteSim(sim.id, e)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }
                    return sim[key as keyof SimCard] || "-"
                  }}
                />
                </>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && simToDelete && (
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
                Êtes-vous sûr de vouloir supprimer la carte SIM :
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{simToDelete.number}</p>
                <p className="text-sm text-gray-600">{simToDelete.carrier} • {simToDelete.plan}</p>
                <p className="text-sm text-gray-600">ICCID: {simToDelete.iccid}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSimToDelete(null)
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
