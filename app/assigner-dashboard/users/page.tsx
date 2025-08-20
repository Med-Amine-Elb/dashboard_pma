"use client"

import { useState, useEffect } from "react"
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

export default function AssignerUsersPage() {
  const { userData } = useUser()
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })
  const [users, setUsers] = useState<AssignerUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AssignerUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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

    fetchUsers()
  }, [pagination.page, pagination.limit, statusFilter, searchTerm, userData])

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUsers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      
      if (!token) {
        setError("Token d'authentification manquant")
        return
      }

      const api = new UserManagementApi(getApiConfig(token))
      
      // Convert status filter to API format
      let statusParam: "ACTIVE" | "INACTIVE" | undefined
      if (statusFilter !== "all") {
        // Map frontend filter values to backend API values
        const statusMapping: { [key: string]: "ACTIVE" | "INACTIVE" } = {
          "active": "ACTIVE",
          "inactive": "INACTIVE"
        }
        statusParam = statusMapping[statusFilter]
      }

      console.log("Making API request with params:", {
        page: pagination.page,
        limit: pagination.limit,
        status: statusParam,
        search: searchTerm || undefined
      })

      const res = await api.getUsers(
        pagination.page,
        pagination.limit,
        searchTerm || undefined,
        undefined, // department
        statusParam,
        undefined // role
      )

      console.log("API Response:", res)

      // Extract data from response
      let apiUsers: any[] = []
      let paginationData: any = {}

      if (res.data && typeof res.data === 'object') {
        const responseData = res.data as any
        if (responseData.success && responseData.data) {
          apiUsers = (responseData.data.users as any[]) || []
          paginationData = responseData.data.pagination || {}
        } else if (Array.isArray(responseData)) {
          apiUsers = responseData
        } else if (responseData.users) {
          apiUsers = (responseData.users as any[]) || []
          paginationData = responseData.pagination || {}
        }
      }

             console.log("Processed users:", apiUsers)
       console.log("Pagination data:", paginationData)

       // Transform API data to match our interface and fetch assignments
       const transformedUsers: AssignerUser[] = await Promise.all(apiUsers.map(async (user: any) => {
         console.log("Processing user:", user.name, "Raw user data:", user)
         
         // Fetch active assignments for this user
         let assignedPhone = undefined
         let assignedSim = undefined
         
         try {
           const attributionApi = new AttributionManagementApi(getApiConfig(token))
           const attributionsRes = await attributionApi.getAttributions(
             undefined, // page
             undefined, // limit
             "ACTIVE", // status
             parseInt(user.id), // userId
             undefined, // assignedBy
             undefined // search
           )
           
           console.log(`Attributions for user ${user.name}:`, attributionsRes.data)
           
           // Extract assignment data from attributions
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
             
             // Find active assignments for this user
             const userAttributions = attributions.filter((attr: any) => 
               attr.userId === parseInt(user.id) || attr.user?.id === parseInt(user.id)
             )
             
             if (userAttributions.length > 0) {
               const activeAttribution = userAttributions[0] // Take the first active attribution
               assignedPhone = activeAttribution.phoneModel || activeAttribution.phone?.model
               assignedSim = activeAttribution.simCardNumber || activeAttribution.simCard?.number
               
               console.log(`Found assignments for ${user.name}: Phone=${assignedPhone}, SIM=${assignedSim}`)
             }
           }
         } catch (error) {
           console.error(`Error fetching assignments for user ${user.name}:`, error)
         }
         
                   // Only check direct SIM card assignments if no attribution found
          if (!assignedSim) {
            try {
              console.log(`Checking direct SIM assignments for user ${user.name} (ID: ${user.id})`)
              const simCardApi = new SIMCardManagementApi(getApiConfig(token))
                             const simCardsRes = await simCardApi.getSimCards(
                 undefined, // page
                 undefined, // limit
                 "ASSIGNED", // status - only get assigned SIMs
                 undefined, // assignedTo
                 undefined // search
               )
              
              console.log(`SIM cards response for user ${user.name}:`, simCardsRes.data)
              
              if (simCardsRes.data && typeof simCardsRes.data === 'object') {
                const responseData = simCardsRes.data as any
                let simCards: any[] = []
                
                                 if (responseData.success && responseData.data) {
                   simCards = (responseData.data.simCards as any[]) || (responseData.data.simcards as any[]) || []
                 } else if (Array.isArray(responseData)) {
                   simCards = responseData
                 } else if (responseData.simCards) {
                   simCards = (responseData.simCards as any[]) || []
                 } else if (responseData.simcards) {
                   simCards = (responseData.simcards as any[]) || []
                 }
                
                console.log(`Total SIM cards found: ${simCards.length}`)
                
                // Find SIM cards directly assigned to this user
                const userSimCards = simCards.filter((sim: any) => {
                  console.log(`Checking SIM ${sim.number} - assignedToId: ${sim.assignedToId}, user.id: ${user.id}`)
                  return sim.assignedToId === parseInt(user.id) || sim.assignedTo?.id === parseInt(user.id)
                })
                
                console.log(`SIM cards assigned to ${user.name}:`, userSimCards)
                
                if (userSimCards.length > 0) {
                  const assignedSimCard = userSimCards[0] // Take the first assigned SIM
                  assignedSim = assignedSimCard.number
                  console.log(`Found direct SIM assignment for ${user.name}: SIM=${assignedSim}`)
                }
              }
            } catch (error) {
              console.error(`Error fetching direct SIM assignments for user ${user.name}:`, error)
            }
          }
         
         console.log(`User ${user.name} - Personal Phone: ${user.phone}, Assigned Phone: ${assignedPhone}, SIM: ${assignedSim}`)
         
         return {
           id: user.id?.toString() || "",
           name: user.name || "",
           email: user.email || "",
           department: user.department || "",
           position: user.position || "",
           phone: user.phone || undefined, // This is the user's personal phone
           status: mapStatusToFrontend(user.status),
           joinDate: user.joinDate || "2024-01-01",
           avatar: user.avatar || undefined,
           assignedPhone: assignedPhone || undefined,
           assignedSim: assignedSim || undefined,
         }
       }))

      setUsers(transformedUsers)
      setFilteredUsers(transformedUsers)

      // Update pagination info
      if (paginationData.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages || Math.ceil(paginationData.total / prev.limit),
        }))
      }

    } catch (error: any) {
      console.error("Error fetching users:", error)
      
      let errorMessage = "Erreur lors du chargement des utilisateurs"
      if (error.response?.status === 403) {
        errorMessage = "Accès refusé. Vérifiez vos permissions d'accès."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
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

  const mapStatusToFrontend = (apiStatus: string): "active" | "inactive" => {
    switch (apiStatus) {
      case "ACTIVE":
        return "active"
      case "INACTIVE":
        return "inactive"
      default:
        return "active"
    }
  }

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
      setLoading(false)
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

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <Pagination className="justify-end mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e)=>{e.preventDefault(); handlePageChange(Math.max(1,pagination.page-1))}} />
                          </PaginationItem>
                          {getPageNumbers().map((p) => (
                            <PaginationItem key={p}>
                              <PaginationLink href="#" isActive={p===pagination.page} onClick={(e)=>{e.preventDefault(); handlePageChange(p)}}>
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext href="#" onClick={(e)=>{e.preventDefault(); handlePageChange(Math.min(pagination.totalPages,pagination.page+1))}} />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
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
