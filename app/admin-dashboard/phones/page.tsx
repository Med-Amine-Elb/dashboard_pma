"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Plus, Download, Edit, Trash2, Globe, History, Smartphone } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { PhoneModal } from "@/components/phone-modal"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/contexts/SidebarContext"
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api";
import { getApiConfig } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { AssignmentHistoryModal } from "@/components/assignment-history-modal"
import { AssignmentHistoryApi } from "@/api/generated/apis/assignment-history-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import ExcelJS from 'exceljs';

interface PhoneData {
  id: string
  model: string
  brand: string
  status: "AVAILABLE" | "ASSIGNED" | "LOST" | "DAMAGED"
  purchaseDate: string
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
  serialNumber: string
  price: number
  imei1: string
  imei2?: string
  storage: string
  color: string
  notes?: string
  assignedTo?: string
  assignedToName?: string
  assignedToDepartment?: string
  assignedDate?: string
}

interface PhoneDtoCustom {
  brand: string;
  model: string;
  storage: string;
  color: string;
  imei1: string;
  imei2?: string;
  price: number;
  notes?: string;
}

export default function PhonesPage() {
  const { isCollapsed } = useSidebar()
  const { userData } = useUser()
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })
  const [phones, setPhones] = useState<PhoneData[]>([])
  const [filteredPhones, setFilteredPhones] = useState<PhoneData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState<PhoneData | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [phoneToDelete, setPhoneToDelete] = useState<PhoneData | null>(null)
  const { toast } = useToast()
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedPhoneHistory, setSelectedPhoneHistory] = useState<any[]>([])
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

    fetchPhones()
  }, [userData])

  useEffect(() => {
    filterPhones()
  }, [phones, searchTerm, statusFilter])

  const fetchPhones = async () => {
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

      const api = new PhoneManagementApi(getApiConfig(token))
      console.log("API config:", getApiConfig(token))
      console.log("Fetching phones...")
      
      // Fetch ALL phones (no pagination) for proper filtering
      const res = await api.getPhones(1, 10000, undefined, undefined, undefined)
      console.log("API Response:", res)
      console.log("Response data:", res.data)
      console.log("Response status:", res.status)
      
      // Extract phones + pagination
      let apiPhones: any[] = []
      let meta: any = {}
      const body: any = res.data
      if (Array.isArray(body)) {
        apiPhones = body
      } else if (body?.data?.phones) {
        apiPhones = body.data.phones
        meta = body.data.pagination || {}
      } else if (body?.phones) {
        apiPhones = body.phones
        meta = body.pagination || {}
      } else if (body?.content) {
        apiPhones = body.content
        meta = { page: (body.pageable?.pageNumber ?? 0) + 1, limit: body.size, total: body.totalElements, totalPages: body.totalPages }
      }
      
      console.log("Processed phones:", apiPhones)
      
      const mappedPhones = (apiPhones || []).map((p: any) => ({
        id: String(p.id),
        model: p.model || "",
        brand: p.brand || "",
        status: (p.status || "AVAILABLE").toUpperCase(),
        purchaseDate: p.purchaseDate || "",
        condition: (p.condition || "GOOD").toUpperCase(),
        serialNumber: p.serialNumber || "",
        price: p.price || 0,
        imei1: p.imei1 || p.imei || "",
        imei2: p.imei2 || "",
        storage: p.storage || "",
        color: p.color || "",
        notes: p.notes || "",
        assignedTo: p.assignedTo || "",
        assignedToName: p.assignedToName || "",
        assignedToDepartment: p.assignedToDepartment || "",
        assignedDate: p.assignedDate || "",
      }))
      
      console.log("Mapped phones:", mappedPhones)
      setPhones(mappedPhones)
      
    } catch (err: any) {
      console.error("Error fetching phones:", err)
      console.error("Error response:", err.response)
      console.error("Error status:", err.response?.status)
      console.error("Error data:", err.response?.data)
      setError(err.response?.data?.message || "Erreur lors du chargement des téléphones.")
    } finally {
      setLoading(false)
    }
  }

  const filterPhones = () => {
    let filtered = phones

    if (searchTerm) {
      filtered = filtered.filter(
        (phone) =>
          phone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phone.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phone.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phone.imei1.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (phone.imei2 && phone.imei2.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      // Map filter values to API status values
      const statusMap: { [key: string]: string } = {
        "available": "AVAILABLE",
        "assigned": "ASSIGNED", 
        "maintenance": "DAMAGED", // Assuming maintenance maps to damaged
        "retired": "LOST", // Assuming retired maps to lost
        "suspendue": "BLOCKED" // Suspendue means blocked
      }
      const apiStatus = statusMap[statusFilter] || statusFilter.toUpperCase()
      filtered = filtered.filter((phone) => phone.status === apiStatus)
    }

    setFilteredPhones(filtered)
    
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

  const handleAddPhone = () => {
    setSelectedPhone(null)
    setIsModalOpen(true)
  }

  const handleEditPhone = (phone: PhoneData) => {
    setSelectedPhone(phone)
    setIsModalOpen(true)
  }

  const handleDeletePhone = async (phoneId: string, event?: React.MouseEvent) => {
    
    if (event) {
      event.stopPropagation()
    }
    
    // Find the phone to delete
    const phone = phones.find(p => p.id === phoneId)
    if (!phone) {
      toast({
        title: "Erreur",
        description: "Téléphone non trouvé",
        variant: "destructive",
      })
      return
    }
    
    // Show delete confirmation modal
    setPhoneToDelete(phone)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!phoneToDelete) return
    
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

      const phoneApi = new PhoneManagementApi(getApiConfig(token))
      await phoneApi.deletePhone(Number(phoneToDelete.id))
      
      toast({
        title: "Téléphone supprimé",
        description: "Le téléphone a été supprimé avec succès.",
      })
      
      // Refresh the phones list from the backend
      await fetchPhones()
      
    } catch (err: any) {
      console.error("Error deleting phone:", err)
      
      // Handle specific error cases
      let errorMessage = "Erreur lors de la suppression du téléphone"
      
      if (err.response?.status === 404) {
        errorMessage = "Téléphone non trouvé"
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour supprimer ce téléphone"
      } else if (err.response?.status === 409) {
        errorMessage = "Impossible de supprimer ce téléphone car il est associé à d'autres données"
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
      setPhoneToDelete(null)
    }
  }

  const handleSavePhone = async (phoneData: Partial<PhoneData>) => {
    try {
      // Comprehensive validation
      const errors: string[] = []
      
      if (!phoneData.model || phoneData.model.trim() === "") {
        errors.push("Le modèle est obligatoire")
      }
      
      if (!phoneData.brand || phoneData.brand.trim() === "") {
        errors.push("La marque est obligatoire")
      }
      
      if (!phoneData.imei1 || phoneData.imei1.trim() === "") {
        errors.push("L'IMEI 1 est obligatoire")
      } else if (phoneData.imei1.length < 10) {
        errors.push("L'IMEI 1 doit contenir au moins 10 caractères")
      }
      
      if (!phoneData.serialNumber || phoneData.serialNumber.trim() === "") {
        errors.push("Le numéro de série est obligatoire")
      }
      
      if (!phoneData.purchaseDate || phoneData.purchaseDate.trim() === "") {
        errors.push("La date d'achat est obligatoire")
      }
      
      if (phoneData.price !== undefined && phoneData.price < 0) {
        errors.push("Le prix ne peut pas être négatif")
      }
      
      if (phoneData.storage && !phoneData.storage.match(/^(64GB|128GB|256GB|512GB|1TB)$/)) {
        errors.push("Le stockage doit être une des valeurs suivantes: 64GB, 128GB, 256GB, 512GB, 1TB")
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

      const phoneApi = new PhoneManagementApi(getApiConfig(token))
      
      if (selectedPhone) {
        // Update existing phone
        await phoneApi.updatePhone(Number(selectedPhone.id), {
          brand: phoneData.brand || "",
          model: phoneData.model || "",
          imei1: phoneData.imei1 || "",
          imei2: phoneData.imei2 || "",
          serialNumber: phoneData.serialNumber || "",
          status: phoneData.status || "AVAILABLE",
          condition: phoneData.condition || "EXCELLENT",
          storage: phoneData.storage || "",
          color: phoneData.color || "",
          price: phoneData.price ? Number(phoneData.price) : 0,
          notes: phoneData.notes || "",
        } as any);
        
        toast({
          title: "Téléphone modifié",
          description: "Les informations du téléphone ont été mises à jour.",
        })
      } else {
        // Create new phone
        await phoneApi.createPhone({
          brand: phoneData.brand || "",
          model: phoneData.model || "",
          imei1: phoneData.imei1 || "",
          imei2: phoneData.imei2 || "",
          serialNumber: phoneData.serialNumber || "",
          status: phoneData.status || "AVAILABLE",
          condition: phoneData.condition || "EXCELLENT",
          storage: phoneData.storage || "",
          color: phoneData.color || "",
          price: phoneData.price ? Number(phoneData.price) : 0,
          notes: phoneData.notes || "",
        } as any);
        
        toast({
          title: "Téléphone ajouté",
          description: "Le nouveau téléphone a été ajouté avec succès.",
        })
      }
      
      // Refresh the phones list from the backend
      await fetchPhones()
      setIsModalOpen(false)
      
    } catch (err: any) {
      console.error("Error saving phone:", err)
      console.error("Error response:", err.response)
      console.error("Error status:", err.response?.status)
      console.error("Error data:", err.response?.data)
      
      // Handle specific error cases
      let errorMessage = "Erreur lors de la sauvegarde du téléphone"
      
      if (err.response?.status === 400) {
        const errorData = err.response?.data
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message
        } else if (errorData?.message) {
          errorMessage = errorData.message
        }
      } else if (err.response?.status === 409) {
        errorMessage = "Un téléphone avec ce numéro de série existe déjà"
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour effectuer cette action"
      } else if (err.response?.status === 404) {
        errorMessage = "Téléphone non trouvé"
      } else if (err.message?.includes("already exists")) {
        errorMessage = "Un téléphone avec ce numéro de série existe déjà"
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

      const api = new PhoneManagementApi(getApiConfig(token))
      
      // Récupérer tous les téléphones (sans pagination)
      const res = await api.getPhones(1, 10000) // Limite très élevée pour récupérer tous les téléphones
      const body: any = res.data as any
      
      // Traiter la réponse
      let apiPhones: any[] = []
      if (body) {
        if (Array.isArray(body)) {
          apiPhones = body
        } else if (body.data && body.data.phones && Array.isArray(body.data.phones)) {
          apiPhones = body.data.phones
        } else if (body.content && Array.isArray(body.content)) {
          apiPhones = body.content
        } else if (body.phones && Array.isArray(body.phones)) {
          apiPhones = body.phones
        } else if (body.data && Array.isArray(body.data)) {
          apiPhones = body.data
        } else {
          console.warn("Unexpected response format:", body)
          apiPhones = []
        }
      }
      
      // Mapper les téléphones pour l'export
      const exportPhones = apiPhones.map((p: any) => ({
        model: p.model ?? "",
        brand: p.brand ?? "",
        status: p.status ?? "",
        purchaseDate: p.purchaseDate ?? p.createdAt ?? "",
        condition: p.condition ?? "",
        serialNumber: p.serialNumber ?? "",
        imei: p.imei ?? "",
        storage: p.storage ?? "",
        color: p.color ?? "",
        price: p.price ?? 0,
        notes: p.notes ?? "",
        assignedTo: p.assignedTo ?? "",
        assignedToName: p.assignedToName ?? "",
        assignedToDepartment: p.assignedToDepartment ?? "",
        assignedDate: p.assignedDate ?? "",
      }))
      
      // Créer un fichier Excel stylé avec ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Téléphones')
      
      // Définir les couleurs pour les statuts
      const statusColors: { [key: string]: string } = {
        "AVAILABLE": "E6FFE6", // Vert clair
        "ASSIGNED": "E6F3FF", // Bleu clair
        "LOST": "FFE6E6", // Rouge clair
        "DAMAGED": "FFE6CC", // Orange clair
      }
      
      // Définir les couleurs pour les conditions
      const conditionColors: { [key: string]: string } = {
        "EXCELLENT": "90EE90", // Vert clair
        "GOOD": "87CEEB", // Bleu clair
        "FAIR": "FFD700", // Jaune
        "POOR": "FFB6C1", // Rouge clair
      }
      
      // Définir les colonnes avec largeurs
      worksheet.columns = [
        { header: 'Modèle', key: 'model', width: 20 },
        { header: 'Marque', key: 'brand', width: 15 },
        { header: 'Statut', key: 'status', width: 12 },
        { header: 'Date d\'achat', key: 'purchaseDate', width: 15 },
        { header: 'État', key: 'condition', width: 12 },
        { header: 'N° Série', key: 'serialNumber', width: 18 },
        { header: 'IMEI', key: 'imei', width: 20 },
        { header: 'Stockage', key: 'storage', width: 12 },
        { header: 'Couleur', key: 'color', width: 12 },
        { header: 'Prix (MAD)', key: 'price', width: 12 },
        { header: 'Assigné à', key: 'assignedToName', width: 20 },
        { header: 'Département', key: 'assignedToDepartment', width: 15 },
        { header: 'Date d\'assignation', key: 'assignedDate', width: 18 }
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
      exportPhones.forEach((phone, index) => {
        const row = worksheet.addRow({
          model: phone.model,
          brand: phone.brand,
          status: phone.status,
          purchaseDate: phone.purchaseDate,
          condition: phone.condition,
          serialNumber: phone.serialNumber,
          imei: phone.imei,
          storage: phone.storage,
          color: phone.color,
          price: phone.price,
          assignedToName: phone.assignedToName || '-',
          assignedToDepartment: phone.assignedToDepartment || '-',
          assignedDate: phone.assignedDate || '-'
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
        const statusColor = statusColors[phone.status] || 'FFFFFF'
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${statusColor}` }
        }
        statusCell.font = { bold: true }
        statusCell.alignment = { horizontal: 'center' }
        
        // Styliser la cellule de condition
        const conditionCell = row.getCell('condition')
        const conditionColor = conditionColors[phone.condition] || 'FFFFFF'
        conditionCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${conditionColor}` }
        }
        conditionCell.font = { bold: true }
        conditionCell.alignment = { horizontal: 'center' }
        
        // Styliser la cellule de prix
        const priceCell = row.getCell('price')
        priceCell.numFmt = 'MAD #,##0.00'
        priceCell.font = { bold: true }
        priceCell.alignment = { horizontal: 'right' }
        
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
      worksheet.insertRow(1, ['📱 INVENTAIRE DES TÉLÉPHONES'])
      const titleRow = worksheet.getRow(1)
      titleRow.height = 40
      titleRow.getCell(1).font = {
        bold: true,
        size: 16,
        color: { argb: 'FF4F81BD' }
      }
      titleRow.getCell(1).alignment = { horizontal: 'center' }
      worksheet.mergeCells('A1:M1')
      
      // Ajouter des statistiques
      const statsRow = worksheet.addRow([])
      statsRow.height = 30
      const availablePhones = exportPhones.filter(p => p.status === 'AVAILABLE').length
      const assignedPhones = exportPhones.filter(p => p.status === 'ASSIGNED').length
      const totalValue = exportPhones.reduce((sum, p) => sum + (p.price || 0), 0)
      
      statsRow.getCell(1).value = `📊 Statistiques: ${exportPhones.length} téléphones total, ${availablePhones} disponibles, ${assignedPhones} assignés, Valeur totale: ${totalValue.toLocaleString('fr-FR')} MAD`
      statsRow.getCell(1).font = { bold: true, color: { argb: 'FF666666' } }
      statsRow.getCell(1).alignment = { horizontal: 'center' }
      worksheet.mergeCells(`A${statsRow.number}:M${statsRow.number}`)
      
      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `telephones_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export réussi",
        description: `${exportPhones.length} téléphones ont été exportés en Excel avec style.`,
      })
      
    } catch (err: any) {
      console.error("Error exporting phones:", err)
      toast({
        title: "Erreur d'export",
        description: "Erreur lors de l'export des téléphones.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const phoneColumns = [
    { key: "model", label: "Modèle" },
    { key: "brand", label: "Marque" },
    { key: "status", label: "Statut" },
    { key: "condition", label: "État" },
    { key: "serialNumber", label: "N° Série" },
    { key: "imei1", label: "IMEI 1" },
    { key: "imei2", label: "IMEI 2" },
    { key: "storage", label: "Stockage" },
    { key: "color", label: "Couleur" },
    { key: "price", label: "Prix" },
    { key: "actions", label: "Actions" },
  ]

  const getStatusColor = (status: string) => {
    const s = (status || "").toString().toUpperCase()
    switch (s) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800"
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800"
      case "DAMAGED":
        return "bg-amber-100 text-amber-800"
      case "LOST":
        return "bg-gray-200 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    }
    return colors[condition as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="phones" onLogout={handleLogout} />

        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Téléphones</h1>
                <p className="text-gray-600">Inventaire et suivi du parc téléphonique</p>
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
                  <CardTitle className="text-xl font-bold">Inventaire des Téléphones</CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="available">Disponible</option>
                      <option value="assigned">Assigné</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retiré</option>
                      <option value="suspendue">Suspendue</option>
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
                      onClick={handleAddPhone}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter Téléphone
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center text-gray-500">Chargement...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-500">{error}</div>
                ) : filteredPhones.length === 0 ? (
                  <div className="text-center py-12">
                    <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucun téléphone trouvé</p>
                    <p className="text-gray-400 mt-2">
                      {searchTerm || statusFilter !== "all"
                        ? "Essayez de modifier vos critères de recherche"
                        : "Créez votre première attribution"}
                    </p>
                  </div>
                ) : (
                  <>
                    <DataTable
                  data={filteredPhones}
                  columns={phoneColumns}
                  renderCell={(phone, key) => {
                    if (key === "status") {
                      return <Badge className={getStatusColor(phone.status)}>{phone.status}</Badge>
                    }
                    if (key === "condition") {
                      return <Badge className={getConditionColor(phone.condition)}>{phone.condition}</Badge>
                    }
                    if (key === "price") {
                      return <span>{phone.price} MAD</span>
                    }
                    if (key === "actions") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                const token = localStorage.getItem("jwt_token")
                                if (!token) {
                                  toast({ title: "Erreur", description: "Token d'authentification manquant", variant: "destructive" })
                                  return
                                }
                                const historyApi = new AssignmentHistoryApi(getApiConfig(token))
                                const usersApi = new UserManagementApi(getApiConfig(token))
                                const res = await historyApi.getPhoneHistory(parseInt(phone.id))
                                const list: any[] = Array.isArray((res.data as any)?.data) ? (res.data as any).data : (res.data as any) || []
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
                                const mapped = (list as any[]).map((h: any) => {
                                  const action = String(h.action || "ASSIGN").toUpperCase()
                                  const isReturn = action === "UNASSIGN" || action === "RETURN"
                                  const toId = h.toUserId ? Number(h.toUserId) : undefined
                                  const fromId = h.fromUserId ? Number(h.fromUserId) : undefined
                                  return {
                                    id: String(h.id ?? crypto.randomUUID()),
                                    simCardId: "",
                                    phoneId: phone.id,
                                    userId: String(toId ?? fromId ?? ""),
                                    userName: toId ? (userIdToName.get(toId) || `Utilisateur ${toId}`) : undefined,
                                    assignedBy: fromId ? (userIdToName.get(fromId) || `Utilisateur ${fromId}`) : "Système",
                                    assignmentDate: h.date || new Date().toISOString(),
                                    returnDate: isReturn ? (h.date || new Date().toISOString()) : undefined,
                                    status: isReturn ? "returned" : "active",
                                    notes: h.notes || "",
                                  }
                                })
                                setSelectedPhoneHistory(mapped)
                                setIsHistoryModalOpen(true)
                              } catch (err) {
                                console.error("Error loading phone history:", err)
                                toast({ title: "Erreur", description: "Impossible de charger l'historique", variant: "destructive" })
                              }
                            }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditPhone(phone)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDeletePhone(phone.id, e)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }
                    if (key === "imei1") {
                      return <span className="text-xs font-mono">{phone.imei1}</span>
                    }
                    if (key === "imei2") {
                      return <span className="text-xs font-mono text-gray-500">{phone.imei2 || "-"}</span>
                    }
                    return phone[key as keyof PhoneData] || "-"
                  }}
                />
                </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PhoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePhone}
        phone={selectedPhone}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && phoneToDelete && (
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
                Êtes-vous sûr de vouloir supprimer le téléphone :
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{phoneToDelete.brand} {phoneToDelete.model}</p>
                <p className="text-sm text-gray-600">N° Série: {phoneToDelete.serialNumber}</p>
                <p className="text-sm text-gray-600">IMEI 1: {phoneToDelete.imei1}</p>
                {phoneToDelete.imei2 && <p className="text-sm text-gray-600">IMEI 2: {phoneToDelete.imei2}</p>}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setPhoneToDelete(null)
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

      <AssignmentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={selectedPhoneHistory}
      />
    </div>
  )
}
 
