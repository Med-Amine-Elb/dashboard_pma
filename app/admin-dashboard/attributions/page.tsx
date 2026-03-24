"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Plus, Download, Edit, Trash2, Globe, Phone, Printer } from "lucide-react"
import { printAttributionForm } from "@/lib/attribution-print"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { AttributionModal } from "@/components/attribution-modal"
import { useToast } from "@/hooks/use-toast"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api";
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { AttributionDtoStatusEnum } from "@/api/generated/models/attribution-dto";
import { getApiConfig } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import ExcelJS from 'exceljs';

interface Attribution {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  userFunction?: string
  hierarchicalManager?: string
  hierarchicalManagerFunction?: string
  phoneId?: string
  phoneModel?: string
  phoneBrand?: string
  phoneImei?: string
  simCardId?: string
  simCardNumber?: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  status: "ACTIVE" | "RETURNED" | "PENDING"
  notes?: string
}

export default function AttributionsPage() {
  const { userData } = useUser()
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })
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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [lastCreatedAttribution, setLastCreatedAttribution] = useState<Partial<Attribution> | null>(null)
  const [allPhones, setAllPhones] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])

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

    fetchAttributions()
  }, [userData])

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
      const phoneApi = new PhoneManagementApi(getApiConfig(token))
      const userApi = new UserManagementApi(getApiConfig(token))
      
      console.log("Fetching attributions, phones and users...")
      
      let res: any;
      let phonesList: any[] = [];
      let usersList: any[] = [];

      try {
        const [attributionsRes, phonesRes, usersRes] = await Promise.allSettled([
          api.getAttributions(1, 10000),
          phoneApi.getPhones(1, 1000),
          userApi.getUsers(1, 1000)
        ]);

        if (attributionsRes.status === 'fulfilled') {
          res = attributionsRes.value;
        } else {
          throw attributionsRes.reason;
        }

        if (phonesRes.status === 'fulfilled') {
          console.log("Phones API success. Raw data:", phonesRes.value.data);
          phonesList = (phonesRes.value.data as any).phones || 
                       (phonesRes.value.data as any).data?.phones || 
                       (Array.isArray(phonesRes.value.data) ? phonesRes.value.data : []);
          console.log("Extracted phones count:", phonesList.length);
          setAllPhones(phonesList);
        }

        if (usersRes.status === 'fulfilled') {
          console.log("Users API success. Raw data:", usersRes.value.data);
          usersList = (usersRes.value.data as any).users || 
                      (usersRes.value.data as any).data?.users || 
                      (Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
          console.log("Extracted users count:", usersList.length);
          setAllUsers(usersList);
        }
      } catch (e: any) {
        console.error("Critical error in fetchAttributions:", e);
        throw e;
      }
      
      // Correctly extract attributions from backend response
      let apiAttributions: any[] = [];
      let meta: any = {}
      if (res && Array.isArray(res.data)) {
        apiAttributions = res.data;
      } else if (
        res && res.data && typeof res.data === 'object' &&
        res.data.data && typeof res.data.data === 'object' &&
        Array.isArray((res.data.data as any).attributions)
      ) {
        apiAttributions = (res.data.data as any).attributions;
        meta = (res.data.data as any).pagination || {}
      } else if (
        res && res.data && typeof res.data === 'object' &&
        Array.isArray((res.data as any).attributions)
      ) {
        apiAttributions = (res.data as any).attributions;
        meta = (res.data as any).pagination || {}
      }
      
      console.log("Processing attributions for mapping. Phones count:", phonesList.length, "Users count:", usersList.length);
      
      const mappedAttributions = (Array.isArray(apiAttributions) ? apiAttributions : []).map((a: any) => {
        // Robust ID matching: handle both number and string
        const phone = a.phoneId ? phonesList.find((p: any) => String(p.id) === String(a.phoneId)) : null;
        const beneficiary = a.userId ? usersList.find((u: any) => String(u.id) === String(a.userId)) : null;
        const manager = beneficiary?.manager ? usersList.find((u: any) => u.name === beneficiary.manager) : null;

        if (a.phoneId && !phone) {
          console.warn(`Could not find phone for attribution ${a.id}, searched phoneId: ${a.phoneId}`);
        }

        return {
          id: String(a.id),
          userId: String(a.userId),
          userName: a.userName || beneficiary?.name || "",
          userEmail: a.userEmail || beneficiary?.email || "",
          userPhone: a.userPhone || beneficiary?.phone || undefined,
          userFunction: a.userFunction || beneficiary?.position || "Agent Administratif",
          hierarchicalManager: a.hierarchicalManager || beneficiary?.manager || "Yassine ELHADI",
          hierarchicalManagerFunction: a.hierarchicalManagerFunction || manager?.position || "Chef Département Moyens Généraux",
          phoneId: a.phoneId ? String(a.phoneId) : undefined,
          phoneModel: a.phoneModel || phone?.model || "____________________",
          phoneBrand: a.phoneBrand || phone?.brand || undefined,
          phoneImei: a.phoneImei || phone?.imei || "____________________",
          simCardId: a.simCardId ? String(a.simCardId) : undefined,
          simCardNumber: a.simCardNumber || undefined,
          assignedBy: a.assignedByName || "",
          assignmentDate: a.assignmentDate || "",
          returnDate: a.returnDate || undefined,
          status: (a.status || "ACTIVE").toUpperCase(),
          notes: a.notes || undefined,
        }
      })
      
      console.log("Mapped attributions sample:", mappedAttributions.slice(0, 2))
      setAttributions(mappedAttributions)
      if (meta) {
        setTotal(meta.total ?? mappedAttributions.length)
        setTotalPages(meta.totalPages ?? Math.ceil((meta.total ?? mappedAttributions.length)/limit))
      }
      
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
    setTotal(totalFiltered)
    setTotalPages(Math.ceil(totalFiltered / limit))
    
    // Reset to page 1 when filtering
    setPage(1)
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
        const normalizeDate = (d?: string) => {
          if (!d) return undefined
          const trimmed = (d as string).trim()
          // Handle DD / MM / YYYY or DD/MM/YYYY
          const compact = trimmed.replace(/\s+/g, "")
          const ddmmyyyy = compact.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
          if (ddmmyyyy) {
            const [, dd, mm, yyyy] = ddmmyyyy
            return `${yyyy}-${mm}-${dd}`
          }
          // Already ISO YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
          const parsed = new Date(trimmed)
          if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0]
          return undefined
        }
        const updatePayload = {
          userId: attributionData.userId ? Number(attributionData.userId) : undefined,
          phoneId: attributionData.phoneId ? Number(attributionData.phoneId) : undefined,
          simCardId: attributionData.simCardId ? Number(attributionData.simCardId) : undefined,
          assignmentDate: normalizeDate(attributionData.assignmentDate as any),
          returnDate: normalizeDate(attributionData.returnDate as any),
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
        
        // Store the created attribution data for the print banner
        setLastCreatedAttribution(attributionData)
        
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
        assignedBy: a.assignedBy ?? a.assignedByUser?.name ?? a.createdBy?.name ?? "Admin",
        assignmentDate: a.assignmentDate ?? a.createdAt ?? "",
        returnDate: a.returnDate ?? "",
        status: a.status ?? "",
        notes: a.notes ?? "",
      }))
      
      // Créer un fichier Excel stylé avec ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Attributions')
      
      // Définir les couleurs pour les statuts
      const statusColors: { [key: string]: string } = {
        "ACTIVE": "E6FFE6", // Vert clair
        "RETURNED": "F0F0F0", // Gris clair
        "PENDING": "FFF8DC", // Jaune clair
      }
      
      // Définir les colonnes avec largeurs
      worksheet.columns = [
        { header: 'Utilisateur', key: 'userName', width: 20 },
        { header: 'Email', key: 'userEmail', width: 25 },
        { header: 'Téléphone', key: 'phoneModel', width: 20 },
        { header: 'Carte SIM', key: 'simCardNumber', width: 18 },
        { header: 'Assigné par', key: 'assignedBy', width: 20 },
        { header: 'Date d\'attribution', key: 'assignmentDate', width: 18 },
        { header: 'Statut', key: 'status', width: 12 }
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
          userEmail: attribution.userEmail,
          phoneModel: attribution.phoneModel || '-',
          simCardNumber: attribution.simCardNumber || '-',
          assignedBy: attribution.assignedBy,
          assignmentDate: attribution.assignmentDate,
          status: attribution.status
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
      worksheet.insertRow(1, ['📋 HISTORIQUE DES ATTRIBUTIONS'])
      const titleRow = worksheet.getRow(1)
      titleRow.height = 40
      titleRow.getCell(1).font = {
        bold: true,
        size: 16,
        color: { argb: 'FF4F81BD' }
      }
      titleRow.getCell(1).alignment = { horizontal: 'center' }
      worksheet.mergeCells('A1:G1')
      
      // Ajouter des statistiques
      const statsRow = worksheet.addRow([])
      statsRow.height = 30
      const activeAttributions = exportAttributions.filter(a => a.status === 'ACTIVE').length
      const returnedAttributions = exportAttributions.filter(a => a.status === 'RETURNED').length
      const pendingAttributions = exportAttributions.filter(a => a.status === 'PENDING').length
      
      statsRow.getCell(1).value = `📊 Statistiques: ${exportAttributions.length} attributions total, ${activeAttributions} actives, ${returnedAttributions} retournées, ${pendingAttributions} en attente`
      statsRow.getCell(1).font = { bold: true, color: { argb: 'FF666666' } }
      statsRow.getCell(1).alignment = { horizontal: 'center' }
      worksheet.mergeCells(`A${statsRow.number}:G${statsRow.number}`)
      
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

            {/* Print banner after attribution creation */}
            {lastCreatedAttribution && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between shadow">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100">
                    <Printer className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800">Attribution créée avec succès !</p>
                    <p className="text-sm text-emerald-600">Générez et imprimez la fiche d'attribution à faire signer par le collaborateur.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={async () => {
                      let imei = lastCreatedAttribution.phoneImei;
                      let brand = lastCreatedAttribution.phoneBrand;
                      
                      // Try to fetch phone details if needed
                      if ((!imei || !brand) && lastCreatedAttribution.phoneId) {
                        try {
                          const token = localStorage.getItem("jwt_token");
                          if (token) {
                            const phoneApi = new PhoneManagementApi(getApiConfig(token));
                            const phoneRes = await phoneApi.getPhoneById(Number(lastCreatedAttribution.phoneId));
                            if (phoneRes.data) {
                              imei = (phoneRes.data as any).imei;
                              brand = (phoneRes.data as any).brand;
                            }
                          }
                        } catch (e) {
                          console.error("Error fetching phone for print:", e);
                        }
                      }

                      printAttributionForm({
                        userName: lastCreatedAttribution.userName || "",
                        userEmail: lastCreatedAttribution.userEmail,
                        userFunction: (lastCreatedAttribution as any).userFunction,
                        hierarchicalManager: (lastCreatedAttribution as any).hierarchicalManager,
                        hierarchicalManagerFunction: (lastCreatedAttribution as any).hierarchicalManagerFunction,
                        phoneModel: lastCreatedAttribution.phoneModel,
                        phoneBrand: brand,
                        phoneImei: imei,
                        simCardNumber: lastCreatedAttribution.simCardNumber,
                        assignedBy: lastCreatedAttribution.assignedBy,
                        assignmentDate: lastCreatedAttribution.assignmentDate,
                        assetType: lastCreatedAttribution.phoneModel ? "phone" : undefined,
                      })
                    }}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer la fiche
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLastCreatedAttribution(null)}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )}

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
                    <Button variant="outline" onClick={handleExport} disabled={loading}>
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Export en cours..." : "Exporter"}
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
                            title="Imprimer la fiche"
                            onClick={async (e) => {
                              e.stopPropagation()
                              
                              let imei = attr.phoneImei;
                              let brand = attr.phoneBrand;
                              
                              if ((!imei || !brand) && attr.phoneId) {
                                try {
                                  const token = localStorage.getItem("jwt_token");
                                  if (token) {
                                    const phoneApi = new PhoneManagementApi(getApiConfig(token));
                                    const phoneRes = await phoneApi.getPhoneById(Number(attr.phoneId));
                                    if (phoneRes.data) {
                                      imei = (phoneRes.data as any).imei;
                                      brand = (phoneRes.data as any).brand;
                                    }
                                  }
                                } catch (err) {
                                  console.error("Error fetching phone for print button:", err);
                                }
                              }

                              printAttributionForm({
                                userName: attr.userName,
                                userEmail: attr.userEmail,
                                userFunction: attr.userFunction,
                                hierarchicalManager: attr.hierarchicalManager,
                                hierarchicalManagerFunction: attr.hierarchicalManagerFunction,
                                phoneModel: attr.phoneModel,
                                phoneBrand: brand,
                                phoneImei: imei,
                                simCardNumber: attr.simCardNumber,
                                assignedBy: attr.assignedBy,
                                assignmentDate: attr.assignmentDate,
                                assetType: attr.phoneModel ? "phone" : undefined,
                              })
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
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
                </>
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
