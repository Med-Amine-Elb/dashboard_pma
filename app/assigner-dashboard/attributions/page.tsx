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
import { NotificationsDropdown } from "@/components/notifications-dropdown"
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
  Download,
  Printer,
  Mail,
  Info,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api"
import { printAttributionForm } from "@/lib/attribution-print"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"
import { useSidebar } from "@/contexts/SidebarContext"
import { AttributionDto } from "@/api/generated/models"
import axios from "axios"
import ExcelJS from 'exceljs'
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
  const { isCollapsed } = useSidebar()
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
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingAttribution, setViewingAttribution] = useState<Attribution | null>(null)
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
  }, [router, userData])

  useEffect(() => {
    filterAttributions()
  }, [attributions, searchTerm, statusFilter])

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
        1,
        10000,
        undefined, // status - we'll filter client-side
        undefined, // userId
        undefined, // assignedBy
        undefined // search - we'll filter client-side
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
      // Map filter values to API status values
      const statusMap: { [key: string]: string } = {
        "active": "ACTIVE",
        "returned": "RETURNED", 
        "pending": "PENDING"
      }
      const apiStatus = statusMap[statusFilter] || statusFilter.toUpperCase()
      filtered = filtered.filter((attribution) => attribution.status === apiStatus)
    }

    setFilteredAttributions(filtered)
    
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
    setViewingAttribution(attribution)
    setShowViewModal(true)
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
        const normalizeDate = (d?: string) => {
          if (!d) return undefined
          const trimmed = (d as string).trim()
          const compact = trimmed.replace(/\s+/g, "")
          const ddmmyyyy = compact.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
          if (ddmmyyyy) {
            const [, dd, mm, yyyy] = ddmmyyyy
            return `${yyyy}-${mm}-${dd}`
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
          const parsed = new Date(trimmed)
          if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0]
          return undefined
        }
        const updateData: AttributionDto = {
          userId: parseInt(attributionData.userId || "0"),
          phoneId: attributionData.phoneId ? parseInt(attributionData.phoneId) : undefined,
          simCardId: attributionData.simCardId ? parseInt(attributionData.simCardId) : undefined,
          assignmentDate: normalizeDate(attributionData.assignmentDate as any),
          returnDate: normalizeDate(attributionData.returnDate as any),
          status: (attributionData.status as any) || undefined,
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

      const api = new AttributionManagementApi(getApiConfig(token))
      
      // Récupérer toutes les attributions (sans pagination)
      const res = await api.getAttributions(1, 10000) // Limite très élevée pour récupérer toutes les attributions
      const body: any = res.data as any
      
      // Traiter la réponse
      let apiAttributions: any[] = []
      if (body) {
        if (Array.isArray(body)) {
          apiAttributions = body
        } else if (body.data && body.data.attributions && Array.isArray(body.data.attributions)) {
          apiAttributions = body.data.attributions
        } else if (body.content && Array.isArray(body.content)) {
          apiAttributions = body.content
        } else if (body.attributions && Array.isArray(body.attributions)) {
          apiAttributions = body.attributions
        } else if (body.data && Array.isArray(body.data)) {
          apiAttributions = body.data
        } else {
          console.warn("Unexpected response format:", body)
          apiAttributions = []
        }
      }
      
      // Mapper les attributions pour l'export
      const exportAttributions = apiAttributions.map((a: any) => ({
        userName: a.userName ?? a.user?.name ?? "",
        userEmail: a.userEmail ?? a.user?.email ?? "",
        phoneModel: a.phoneModel ?? a.phone?.model ?? "",
        simCardNumber: a.simCardNumber ?? a.simCard?.number ?? "",
        assignedBy: a.assignedByName ?? a.assignedBy ?? a.assignedByUser?.name ?? a.createdBy?.name ?? "Admin",
        assignmentDate: a.assignmentDate ?? a.createdAt ?? "",
        status: a.status ?? "",
      }))
      
      // Créer un fichier Excel stylé avec ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Attributions')
      
      // Définir les couleurs pour les statuts
      const statusColors: { [key: string]: string } = {
        "ACTIVE": "E6FFE6", // Vert clair
        "PENDING": "FFF2E6", // Orange clair
        "RETURNED": "F0F0F0", // Gris clair
      }
      
             // Définir les colonnes avec largeurs (exactement comme affiché dans la page)
       worksheet.columns = [
         { header: 'Utilisateur', key: 'userName', width: 20 },
         { header: 'Téléphone', key: 'phoneModel', width: 20 },
         { header: 'Carte SIM', key: 'simCardNumber', width: 18 },
         { header: 'Date d\'attribution', key: 'assignmentDate', width: 18 },
         { header: 'Statut', key: 'status', width: 12 },
         { header: 'Assigné par', key: 'assignedBy', width: 20 }
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
      exportAttributions.forEach((attribution, index) => {
                 const row = worksheet.addRow({
           userName: attribution.userName,
           phoneModel: attribution.phoneModel || '-',
           simCardNumber: attribution.simCardNumber || '-',
           assignmentDate: attribution.assignmentDate,
           status: attribution.status,
           assignedBy: attribution.assignedBy
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
        const statusColor = statusColors[attribution.status] || 'FFFFFF'
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${statusColor}` }
        }
        statusCell.font = { bold: true }
        statusCell.alignment = { horizontal: 'center' }
        
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
      worksheet.insertRow(1, ['🔗 INVENTAIRE DES ATTRIBUTIONS'])
      const titleRow = worksheet.getRow(1)
      titleRow.height = 40
      titleRow.getCell(1).font = {
        bold: true,
        size: 16,
        color: { argb: 'FF4F81BD' }
      }
      titleRow.getCell(1).alignment = { horizontal: 'center' }
             worksheet.mergeCells('A1:F1')
      
      // Ajouter des statistiques
      const statsRow = worksheet.addRow([])
      statsRow.height = 30
      const activeAttributions = exportAttributions.filter(a => a.status === 'ACTIVE').length
      const pendingAttributions = exportAttributions.filter(a => a.status === 'PENDING').length
      const returnedAttributions = exportAttributions.filter(a => a.status === 'RETURNED').length
      
      statsRow.getCell(1).value = `📊 Statistiques: ${exportAttributions.length} attributions total, ${activeAttributions} actives, ${pendingAttributions} en attente, ${returnedAttributions} retournées`
      statsRow.getCell(1).font = { bold: true, color: { argb: 'FF666666' } }
      statsRow.getCell(1).alignment = { horizontal: 'center' }
             worksheet.mergeCells(`A${statsRow.number}:F${statsRow.number}`)
      
      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attributions_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export réussi",
        description: `${exportAttributions.length} attributions ont été exportées en Excel avec style.`,
      })
      
    } catch (err: any) {
      console.error("Error exporting attributions:", err)
      toast({
        title: "Erreur d'export",
        description: "Erreur lors de l'export des attributions.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
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

              <NotificationsDropdown userRole="assigner" />

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
            <div className="flex items-center space-x-4">
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
              <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Attribution
              </Button>
            </div>
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
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="Imprimer la fiche"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    
                                    let imei = (attribution as any).phoneImei;
                                    let brand = (attribution as any).phoneBrand;
                                    let position = (attribution as any).userFunction;
                                    let managerName = (attribution as any).hierarchicalManager;
                                    let managerPosition = (attribution as any).hierarchicalManagerFunction;
                                    
                                    try {
                                      const token = localStorage.getItem("jwt_token");
                                      if (token) {
                                        if ((!imei || !brand) && attribution.phoneId) {
                                          const phoneApi = new PhoneManagementApi(getApiConfig(token));
                                          const phoneRes = await phoneApi.getPhoneById(Number(attribution.phoneId));
                                          const pObj = (phoneRes.data as any)?.phone || (phoneRes.data as any)?.data?.phone || (phoneRes.data as any)?.data || phoneRes.data;
                                          if (pObj) {
                                            imei = pObj.imei;
                                            brand = pObj.brand;
                                          }
                                        }

                                        if (!position || !managerName) {
                                           const userApi = new UserManagementApi(getApiConfig(token));
                                           const userRes = await userApi.getUsers(1, 10000);
                                           const usersList = (userRes.data as any).users || (userRes.data as any).data?.users || (userRes.data as any).content || (Array.isArray(userRes.data) ? userRes.data : []);
                                           const beneficiary = usersList.find((u: any) => String(u.id) === String(attribution.userId));
                                           
                                           position = position || beneficiary?.position;
                                           managerName = managerName || beneficiary?.manager;
                                           
                                           if (managerName && !managerPosition) {
                                             const mgrUser = usersList.find((u: any) => u.name === managerName);
                                             managerPosition = mgrUser?.position;
                                           }
                                        }
                                      }
                                    } catch (err) {
                                      console.error("Error fetching extra data for print:", err);
                                    }

                                    printAttributionForm({
                                      userName: attribution.userName,
                                      userEmail: attribution.userEmail,
                                      userFunction: position,
                                      hierarchicalManager: managerName,
                                      hierarchicalManagerFunction: managerPosition,
                                      phoneModel: attribution.phoneModel,
                                      phoneBrand: brand,
                                      phoneImei: imei,
                                      simCardNumber: attribution.simCardNumber,
                                      assignedBy: attribution.assignedBy,
                                      assignmentDate: attribution.assignmentDate,
                                      assetType: attribution.phoneModel ? "phone" : undefined,
                                    })
                                  }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200">
                                    <DropdownMenuItem onSelect={() => setTimeout(() => handleView(attribution), 100)} className="cursor-pointer">
                                      <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                      <span>Voir les détails</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(attribution), 100)} className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4 text-gray-500" />
                                      <span>Modifier</span>
                                    </DropdownMenuItem>
                                    {attribution.status === "ACTIVE" && (
                                      <DropdownMenuItem onSelect={() => setTimeout(() => handleReturn(attribution.id), 100)} className="cursor-pointer">
                                        <RotateCcw className="mr-2 h-4 w-4 text-amber-500" />
                                        <span>Retourner</span>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      onSelect={() => setTimeout(() => handleDelete(attribution.id), 100)} 
                                      className="text-red-600 focus:text-red-600 cursor-pointer"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Supprimer</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
      {/* Modal View Details */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl">
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center">
                  <Info className="mr-2 h-6 w-6" />
                  Détails de l'Attribution
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Informations complètes sur l'attribution, l'utilisateur et le matériel
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewingAttribution && (
            <div className="px-8 py-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Profile/User Section */}
              <div className="flex items-center space-x-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                    {viewingAttribution.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingAttribution.userName}</h3>
                  <div className="flex flex-col space-y-1 mt-1">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {viewingAttribution.userEmail}
                    </div>
                    <div className="flex items-center mt-2">
                       {getStatusBadge(viewingAttribution.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-2 gap-8 px-2">
                {/* General Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Informations Générales
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Nom:</span>
                      <span className="font-medium text-gray-900">{viewingAttribution.userName}</span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">ID Utilisateur:</span>
                      <span className="font-medium text-gray-900">{viewingAttribution.userId}</span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Téléphone:</span>
                      <span className="font-medium text-gray-900 flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-blue-500" />
                        {viewingAttribution.phoneModel || "Non assigné"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">ID Téléphone:</span>
                      <span className="font-medium text-gray-900">{viewingAttribution.phoneId || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Other Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Détails Matériel & Dates
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">N° Carte SIM:</span>
                      <span className="font-medium text-gray-900 font-mono italic">
                        {viewingAttribution.simCardNumber || "Non assignée"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Date d'Attribution:</span>
                      <span className="font-medium text-gray-900 flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {new Date(viewingAttribution.assignmentDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Date de Retour:</span>
                      <span className="font-medium text-gray-900">
                        {viewingAttribution.returnDate ? new Date(viewingAttribution.returnDate).toLocaleDateString("fr-FR") : "-"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Assigné par:</span>
                      <span className="font-medium text-gray-900">{viewingAttribution.assignedBy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity/Notes Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Notes & Activité
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[100px]">
                  {viewingAttribution.notes ? (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {viewingAttribution.notes}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <FileText className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-xs uppercase font-medium tracking-tighter">Aucune note pour cette attribution</p>
                    </div>
                  )}
                </div>
                
                {viewingAttribution.status === "RETURNED" && (
                  <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    L'équipement a été retourné avec succès.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-8 py-6 bg-gray-50/80 border-t border-gray-200 flex justify-end">
             <Button onClick={() => setShowViewModal(false)} className="bg-white hover:bg-gray-100 text-gray-700 border-gray-300">
                Fermer
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
