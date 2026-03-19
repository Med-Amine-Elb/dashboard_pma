"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, User, History, ChevronLeft, ChevronRight, Download, CreditCard, Plus, Phone } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { SimAssignmentModal } from "@/components/sim-assignment-modal"
import { AssignmentHistoryModal } from "@/components/assignment-history-modal"
import { useToast } from "@/hooks/use-toast"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { AssignmentHistoryApi } from "@/api/generated/apis/assignment-history-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"
import { SimCardDto } from "@/api/generated/models"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import axios from "axios"
import ExcelJS from 'exceljs'

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
  iccid: string
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
  const { userData } = useUser()
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })
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

    // Update user data from context
    setUser({
      name: userData.name || "Assigner",
      email: userData.email || "",
      avatar: userData.avatar || "",
    })

    fetchSimCards()
    loadAssignmentHistory()
  }, [userData])

  useEffect(() => {
    filterSimCards()
  }, [simCards, searchTerm, statusFilter])

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
        1,
        10000,
        undefined, // status - we'll filter client-side
        undefined, // search - we'll filter client-side
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
        iccid: sim.iccid || "",
      }))

      console.log("Transformed SIM cards:", transformedSimCards)

      setSimCards(transformedSimCards)

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
        "lost": "LOST",
        "suspendue": "BLOCKED" // Suspendue means blocked
      }
      const apiStatus = statusMap[statusFilter] || statusFilter.toUpperCase()
      filtered = filtered.filter((sim) => {
        // Convert frontend status back to API status for comparison
        const simApiStatus = mapStatusToApi(sim.status)
        return simApiStatus === apiStatus
      })
    }

    setFilteredSimCards(filtered)
    
    // Update pagination based on filtered results
    const totalFiltered = filtered.length
    setPagination(prev => ({
      ...prev,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / prev.limit)
    }))
    
    // Reset to page 1 when filtering
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const mapStatusToApi = (frontendStatus: string): string => {
    switch (frontendStatus) {
      case "available":
        return "AVAILABLE"
      case "assigned":
        return "ASSIGNED"
      case "lost":
        return "LOST"
      case "blocked":
        return "BLOCKED"
      default:
        return "AVAILABLE"
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

  const loadAssignmentHistory = async () => {
    // Deprecated: history now loads per item on demand
    setAssignmentHistory([])
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleAssignSim = (sim: SimCard) => {
    setSelectedSim(sim)
    setIsAssignmentModalOpen(true)
  }

  const handleViewHistory = async (sim: SimCard) => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({ title: "Erreur", description: "Token d'authentification manquant", variant: "destructive" })
        return
      }
      const historyApi = new AssignmentHistoryApi(getApiConfig(token))
      const usersApi = new UserManagementApi(getApiConfig(token))
      const res = await historyApi.getSimHistory(parseInt(sim.id))
      const list: any[] = Array.isArray((res.data as any)?.data) ? (res.data as any).data : (res.data as any) || []

      // Build user names cache
      const userIdSet = new Set<number>()
      ;(list as any[]).forEach((h: any) => {
        if (h.toUserId) userIdSet.add(Number(h.toUserId))
        if (h.fromUserId) userIdSet.add(Number(h.fromUserId))
      })
      const userIdToName = new Map<number, string>()
      await Promise.all(Array.from(userIdSet).map(async (uid) => {
        try {
          const ures = await usersApi.getUserById(uid)
          const udata: any = (ures.data as any)?.data || (ures.data as any)
          const name = udata?.name || udata?.fullName || udata?.username || `Utilisateur ${uid}`
          userIdToName.set(uid, name)
        } catch {
          userIdToName.set(uid, `Utilisateur ${uid}`)
        }
      }))

      const mapped: AssignmentHistory[] = (list as any[]).map((h: any) => {
        const action = String(h.action || "ASSIGN").toUpperCase()
        const isReturn = action === "UNASSIGN" || action === "RETURN"
        const toId = h.toUserId ? Number(h.toUserId) : undefined
        const fromId = h.fromUserId ? Number(h.fromUserId) : undefined
        return {
          id: String(h.id ?? crypto.randomUUID()),
          simCardId: sim.id,
          phoneId: undefined,
          userId: String(toId ?? fromId ?? ""),
          userName: toId ? (userIdToName.get(toId) || `Utilisateur ${toId}`) : undefined as unknown as string,
          assignedBy: fromId ? (userIdToName.get(fromId) || `Utilisateur ${fromId}`) : "Système",
          assignmentDate: !isReturn ? (h.date || new Date().toISOString()) : (h.date || new Date().toISOString()),
          returnDate: isReturn ? (h.date || new Date().toISOString()) : undefined,
          status: isReturn ? "returned" : "active",
          notes: h.notes || "",
        }
      })
      setSelectedSimHistory(mapped)
      setIsHistoryModalOpen(true)
    } catch (err) {
      console.error("Error loading SIM history:", err)
      toast({ title: "Erreur", description: "Impossible de charger l'historique", variant: "destructive" })
    }
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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
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

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }))
  }

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
          body.data && 
          (body.data.simCards && Array.isArray(body.data.simCards)) ||
          (body.data.simcards && Array.isArray(body.data.simcards))
        ) {
          apiSimCards = body.data.simCards || body.data.simcards || []
        } else if (body.content && Array.isArray(body.content)) {
          apiSimCards = body.content
        } else if (body.simCards && Array.isArray(body.simCards)) {
          apiSimCards = body.simCards
        } else if (body.simcards && Array.isArray(body.simcards)) {
          apiSimCards = body.simcards
        } else if (body.data && Array.isArray(body.data)) {
          apiSimCards = body.data
        } else {
          console.warn("Unexpected response format:", body)
          apiSimCards = []
        }
      }
      
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
        assignedTo: s.assignedToName ?? s.assignedTo?.name ?? "",
        assignedPhone: s.assignedPhone ?? "",
      }))
      
      // Créer un fichier Excel stylé avec ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Cartes SIM')
      
      // Définir les couleurs pour les statuts
      const statusColors: { [key: string]: string } = {
        "AVAILABLE": "E6FFE6", // Vert clair
        "ASSIGNED": "E6F3FF", // Bleu clair
        "LOST": "FFE6CC", // Orange clair
        "BLOCKED": "FFE6E6", // Rouge clair
      }
      
             // Définir les colonnes avec largeurs (exactement comme affiché dans la page)
       worksheet.columns = [
         { header: 'Numéro', key: 'number', width: 18 },
         { header: 'Opérateur', key: 'carrier', width: 15 },
         { header: 'Forfait', key: 'plan', width: 20 },
         { header: 'Statut', key: 'status', width: 12 },
         { header: 'Assigné à', key: 'assignedTo', width: 20 },
         { header: 'Téléphone', key: 'assignedPhone', width: 20 },
         { header: 'Data', key: 'dataLimit', width: 15 },
         { header: 'Coût/mois', key: 'monthlyFee', width: 15 }
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
      exportSimCards.forEach((simCard, index) => {
        const row = worksheet.addRow({
          number: simCard.number,
          carrier: simCard.carrier,
          plan: simCard.plan,
          status: simCard.status,
          assignedTo: simCard.assignedTo || '-',
          assignedPhone: simCard.assignedPhone || '-',
          dataLimit: simCard.dataLimit,
          monthlyFee: simCard.monthlyFee
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
        const statusColor = statusColors[simCard.status] || 'FFFFFF'
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${statusColor}` }
        }
        statusCell.font = { bold: true }
        statusCell.alignment = { horizontal: 'center' }
        
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
      worksheet.insertRow(1, ['💳 INVENTAIRE DES CARTES SIM'])
      const titleRow = worksheet.getRow(1)
      titleRow.height = 40
      titleRow.getCell(1).font = {
        bold: true,
        size: 16,
        color: { argb: 'FF4F81BD' }
      }
      titleRow.getCell(1).alignment = { horizontal: 'center' }
             worksheet.mergeCells('A1:H1')
      
      // Ajouter des statistiques
      const statsRow = worksheet.addRow([])
      statsRow.height = 30
      const availableSims = exportSimCards.filter(s => s.status === 'AVAILABLE').length
      const assignedSims = exportSimCards.filter(s => s.status === 'ASSIGNED').length
      const totalMonthlyCost = exportSimCards.reduce((sum, s) => sum + (s.monthlyFee || 0), 0)
      
      statsRow.getCell(1).value = `📊 Statistiques: ${exportSimCards.length} cartes SIM total, ${availableSims} disponibles, ${assignedSims} assignées, Coût mensuel total: ${totalMonthlyCost.toLocaleString('fr-FR')} MAD`
      statsRow.getCell(1).font = { bold: true, color: { argb: 'FF666666' } }
      statsRow.getCell(1).alignment = { horizontal: 'center' }
             worksheet.mergeCells(`A${statsRow.number}:H${statsRow.number}`)
      
      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cartes_sim_${new Date().toISOString().split('T')[0]}.xlsx`
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

                <NotificationsDropdown userRole="assigner" />

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
                      <option value="suspendue">Suspendue</option>
                    </select>
                    <Button 
                      variant="outline" 
                      onClick={handleExport} 
                      disabled={loading}
                      className="relative overflow-hidden group hover:bg-blue-50 transition-all duration-300"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          <span>Export en cours...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Download className="h-4 w-4 mr-2 group-hover:animate-bounce transition-all duration-300" />
                          <span>Exporter Excel</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>
                      )}
                    </Button>
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
                ) : filteredSimCards.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucune carte SIM trouvée</p>
                    <p className="text-gray-400 mt-2">
                      {searchTerm || statusFilter !== "all"
                        ? "Essayez de modifier vos critères de recherche"
                        : "Créez votre première attribution"}
                    </p>
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
