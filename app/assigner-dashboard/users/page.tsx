"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, Phone, Mail, Building, ChevronLeft, ChevronRight, RefreshCw, Download } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { useToast } from "@/hooks/use-toast"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"
import { UserDto } from "@/api/generated/models"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import ExcelJS from 'exceljs'

interface AssignerUser {
  id: string
  name: string
  email: string
  department: string
  position: string
  phone?: string
  status: "active" | "inactive"
  joinDate: string
  avatar?: string
  assignedPhone?: string
  assignedSim?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const fetcher = async () => {
  const token = localStorage.getItem("jwt_token")
  if (!token) throw new Error("Token d'authentification manquant")

  const userApi = new UserManagementApi(getApiConfig(token))
  const attributionApi = new AttributionManagementApi(getApiConfig(token))

  const safeFetch = (promise: Promise<any>) => 
    promise.catch(err => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.clear()
        window.location.href = "/"
      }
      return { data: [] }
    })

  const [usersRes, attributionsRes] = await Promise.all([
    safeFetch(userApi.getUsers(1, 1000)),
    safeFetch(attributionApi.getAttributions(1, 1000, "ACTIVE"))
  ])

  let apiUsers: any[] = []
  if (usersRes?.data) {
    const uData = usersRes.data as any
    apiUsers = uData?.success && uData?.data ? uData.data.users : uData?.users || (Array.isArray(uData) ? uData : [])
  }

  let apiAttributions: any[] = []
  if (attributionsRes?.data) {
    const aData = attributionsRes.data as any
    apiAttributions = aData?.success && aData?.data ? aData.data.attributions : aData?.attributions || (Array.isArray(aData) ? aData : [])
  }

  return apiUsers.map((user: any) => {
    const userId = parseInt(user.id)
    const attribution = apiAttributions.find(attr => (attr.userId === userId || attr.user?.id === userId))
    
    return {
      id: user.id?.toString() || "",
      name: user.name || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "",
      email: user.email || "",
      department: user.department || "",
      position: user.position || "",
      phone: user.phone || undefined,
      status: (user.status === "ACTIVE" || user.status === "active") ? "active" : "inactive",
      joinDate: user.joinDate || "2024-01-01",
      avatar: user.avatar || undefined,
      assignedPhone: attribution?.phoneModel || attribution?.phone?.model || undefined,
      assignedSim: attribution?.simCardNumber || attribution?.simCard?.number || undefined,
    } as AssignerUser
  })
}

export default function AssignerUsersPage() {
  const { userData } = useUser()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const user = useMemo(() => ({
    name: userData.name || "Assigner",
    email: userData.email || "",
    avatar: userData.avatar || "",
  }), [userData])

  const { data: users = [], error: swrError, isLoading: loading, mutate } = useSWR('assignerUsersData', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000
  })

  // Handle errors manually via an effect
  useEffect(() => {
    if (swrError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    }
  }, [swrError, toast])

  const filteredUsers = useMemo(() => {
    let filtered = users

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lowSearch) ||
          u.email.toLowerCase().includes(lowSearch) ||
          u.department.toLowerCase().includes(lowSearch) ||
          u.position.toLowerCase().includes(lowSearch),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter)
    }

    return filtered
  }, [users, searchTerm, statusFilter])

  // Sync pagination total when data changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / prev.limit),
      page: 1 // Reset to page 1 on search/filter
    }))
  }, [filteredUsers.length])

  const error = swrError?.message || null

  const fetchUsers = () => mutate() // Fallback for the Refresh button


  const [isExporting, setIsExporting] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
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
      setIsExporting(true)
      
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token d'authentification manquant",
          variant: "destructive",
        })
        return
      }

      const api = new UserManagementApi(getApiConfig(token))
      
      // Récupérer tous les utilisateurs (sans pagination)
      const res = await api.getUsers(1, 10000) // Limite très élevée pour récupérer tous les utilisateurs
      const body: any = res.data as any
      
      // Traiter la réponse comme dans fetchUsers
      let apiUsers: any[] = []
      if (body) {
        if (Array.isArray(body)) {
          apiUsers = body
        } else if (body.data && body.data.users && Array.isArray(body.data.users)) {
          apiUsers = body.data.users
        } else if (body.content && Array.isArray(body.content)) {
          apiUsers = body.content
        } else if (body.users && Array.isArray(body.users)) {
          apiUsers = body.users
        } else if (body.data && Array.isArray(body.data)) {
          apiUsers = body.data
        } else {
          console.warn("Unexpected response format:", body)
          apiUsers = []
        }
      }
      
      // Mapper les utilisateurs pour l'export avec les attributions
      const exportUsers = await Promise.all(apiUsers.map(async (u: any) => {
        // Fetch active assignments for this user
        let assignedPhone = undefined
        let assignedSim = undefined
        
        try {
          const attributionApi = new AttributionManagementApi(getApiConfig(token))
          const attributionsRes = await attributionApi.getAttributions(
            undefined, undefined, "ACTIVE", parseInt(u.id), undefined, undefined
          )
          
          if (attributionsRes.data && typeof attributionsRes.data === 'object') {
            const responseData = attributionsRes.data as any
            let attributions: any[] = []
            
            if (responseData.success && responseData.data) {
              attributions = (responseData.data.attributions as any[]) || []
            } else if (Array.isArray(responseData)) {
              attributions = responseData
            } else if (responseData.attributions) {
              attributions = (responseData.attributions as any[]) || []
            }
            
            const userAttributions = attributions.filter((attr: any) => 
              attr.userId === parseInt(u.id) || attr.user?.id === parseInt(u.id)
            )
            
            if (userAttributions.length > 0) {
              const activeAttribution = userAttributions[0]
              assignedPhone = activeAttribution.phoneModel || activeAttribution.phone?.model
              assignedSim = activeAttribution.simCardNumber || activeAttribution.simCard?.number
            }
          }
        } catch (error) {
          console.error(`Error fetching assignments for user ${u.name}:`, error)
        }
        
        return {
          name: (u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`).trim(),
          email: u.email ?? "",
          department: u.department ?? "",
          position: u.position ?? "",
          status: ((u.status === "ACTIVE" || u.status === "active") ? "Actif" : "Inactif"),
          joinDate: u.joinDate ?? u.createdAt ?? "",
          phone: u.phone ?? "",
          address: u.address ?? "",
          manager: u.manager ?? "",
          assignedPhone: assignedPhone ?? "",
          assignedSim: assignedSim ?? "",
        }
      }))
      
      // Créer un fichier Excel stylé avec ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Utilisateurs')
      
      // Définir les couleurs pour les départements
      const departmentColors: { [key: string]: string } = {
        "IT": "E6F3FF", // Bleu clair
        "RH": "E6FFE6", // Vert clair
        "Finance": "FFF2E6", // Orange clair
        "Marketing": "F0E6FF", // Violet clair
        "Sales": "FFE6E6", // Rouge clair
        "Operations": "E6FFFF", // Cyan clair
      }
      
             // Définir les colonnes avec largeurs (exactement comme affiché dans la page)
       worksheet.columns = [
         { header: 'Nom', key: 'name', width: 25 },
         { header: 'Email', key: 'email', width: 30 },
         { header: 'Département', key: 'department', width: 20 },
         { header: 'Poste', key: 'position', width: 20 },
         { header: 'Statut', key: 'status', width: 12 },
         { header: 'Téléphone', key: 'assignedPhone', width: 18 },
         { header: 'SIM', key: 'assignedSim', width: 18 },
         { header: 'Date d\'arrivée', key: 'joinDate', width: 15 }
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
      exportUsers.forEach((user, index) => {
                 const row = worksheet.addRow({
           name: user.name,
           email: user.email,
           department: user.department,
           position: user.position,
           status: user.status,
           assignedPhone: user.assignedPhone || '-',
           assignedSim: user.assignedSim || '-',
           joinDate: user.joinDate
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
        
        // Styliser la cellule de département
        const departmentCell = row.getCell('department')
        const departmentColor = departmentColors[user.department] || 'FFFFFF'
        departmentCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${departmentColor}` }
        }
        departmentCell.font = { bold: true }
        departmentCell.alignment = { horizontal: 'center' }
        
        // Styliser la cellule de statut
        const statusCell = row.getCell('status')
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: user.status === 'Actif' ? 'FFE6FFE6' : 'FFFFE6E6' }
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
      worksheet.insertRow(1, ['👥 INVENTAIRE DES UTILISATEURS'])
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
      const activeUsers = exportUsers.filter(u => u.status === 'Actif').length
      const usersWithPhone = exportUsers.filter(u => u.assignedPhone).length
      const usersWithSim = exportUsers.filter(u => u.assignedSim).length
      
      statsRow.getCell(1).value = `📊 Statistiques: ${exportUsers.length} utilisateurs total, ${activeUsers} actifs, ${usersWithPhone} avec téléphone assigné, ${usersWithSim} avec carte SIM assignée`
      statsRow.getCell(1).font = { bold: true, color: { argb: 'FF666666' } }
      statsRow.getCell(1).alignment = { horizontal: 'center' }
             worksheet.mergeCells(`A${statsRow.number}:H${statsRow.number}`)
      
      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export réussi",
        description: `${exportUsers.length} utilisateurs ont été exportés en Excel avec style.`,
      })
      
    } catch (err: any) {
      console.error("Error exporting users:", err)
      toast({
        title: "Erreur d'export",
        description: "Erreur lors de l'export des utilisateurs.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const userColumns = [
    { key: "name", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "department", label: "Département" },
    { key: "position", label: "Poste" },
    { key: "status", label: "Statut" },
    { key: "assignedPhone", label: "Téléphone" },
    { key: "assignedSim", label: "SIM" },
    { key: "joinDate", label: "Date d'arrivée" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="users" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultation des Utilisateurs</h1>
                <p className="text-gray-600">Consultation des utilisateurs pour les attributions</p>
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
                      {userData.initials || "A"}
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
                    Liste des Utilisateurs ({pagination.total})
                  </CardTitle>
                                     <div className="flex items-center space-x-4">
                     <select
                       className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                     >
                       <option value="all">Tous les statuts</option>
                       <option value="active">Actif</option>
                       <option value="inactive">Inactif</option>
                     </select>
                      <Button 
                        variant="outline" 
                        onClick={handleExport} 
                        disabled={isExporting || loading}
                        className="relative overflow-hidden group hover:bg-blue-50 transition-all duration-300"
                      >
                        {isExporting ? (
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
                     <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                       Mode consultation uniquement
                     </div>
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Chargement des utilisateurs...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error}</p>
                    <Button onClick={fetchUsers} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <>
                    <DataTable
                      data={filteredUsers}
                      columns={userColumns}
                      useExternalPagination={false} // Let DataTable handle local slicing of the 1000 results
                      renderCell={(user, key) => {
                        if (key === "name") {
                          return (
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.position}</p>
                              </div>
                            </div>
                          )
                        }
                        if (key === "email") {
                          return (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                          )
                        }
                        if (key === "department") {
                          return (
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span>{user.department}</span>
                            </div>
                          )
                        }
                        if (key === "status") {
                          return <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        }
                        if (key === "assignedPhone") {
                          return user.assignedPhone ? (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{user.assignedPhone}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Non assigné</span>
                          )
                        }
                        if (key === "assignedSim") {
                          return user.assignedSim ? (
                            <span className="text-sm font-mono">{user.assignedSim}</span>
                          ) : (
                            <span className="text-gray-400">Non assignée</span>
                          )
                        }
                        if (key === "joinDate") {
                          return new Date(user.joinDate).toLocaleDateString("fr-FR")
                        }
                        return user[key as keyof AssignerUser] || "-"
                      }}
                    />

                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
