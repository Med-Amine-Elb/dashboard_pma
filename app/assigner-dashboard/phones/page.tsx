"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, Phone, User, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { useToast } from "@/hooks/use-toast"
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { useUser } from "@/contexts/UserContext"
import { PhoneDto } from "@/api/generated/models"

interface PhoneDevice {
  id: string
  model: string
  brand: string
  imei: string
  serialNumber: string
  status: "available" | "assigned" | "lost" | "damaged"
  assignedTo?: string
  assignedDate?: string
  purchaseDate: string
  warrantyExpiry: string
  condition: "excellent" | "good" | "fair" | "poor"
  storage: string
  color: string
  price: number
  notes?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AssignerPhonesPage() {
  const { userData } = useUser()
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })
  const [phones, setPhones] = useState<PhoneDevice[]>([])
  const [filteredPhones, setFilteredPhones] = useState<PhoneDevice[]>([])
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

    fetchPhones()
  }, [pagination.page, pagination.limit, statusFilter, searchTerm, userData])

  const fetchPhones = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      
      if (!token) {
        setError("Token d'authentification manquant")
        return
      }

      const api = new PhoneManagementApi(getApiConfig(token))
      
      // Convert status filter to API format
      let statusParam: "AVAILABLE" | "ASSIGNED" | "LOST" | "DAMAGED" | undefined
      if (statusFilter !== "all") {
        // Map frontend filter values to backend API values
        const statusMapping: { [key: string]: "AVAILABLE" | "ASSIGNED" | "LOST" | "DAMAGED" } = {
          "available": "AVAILABLE",
          "assigned": "ASSIGNED", 
          "lost": "LOST",
          "damaged": "DAMAGED"
        }
        statusParam = statusMapping[statusFilter]
      }

      console.log("Making API request with params:", {
        page: pagination.page,
        limit: pagination.limit,
        status: statusParam,
        brand: undefined,
        model: searchTerm || undefined
      })

      const res = await api.getPhones(
        pagination.page,
        pagination.limit,
        statusParam,
        undefined, // brand
        searchTerm || undefined // model
      )

      console.log("API Response:", res)

      // Extract data from response
      let apiPhones: any[] = []
      let paginationData: any = {}

      if (res.data && typeof res.data === 'object') {
        const responseData = res.data as any
        if (responseData.success && responseData.data) {
          apiPhones = (responseData.data.phones as any[]) || []
          paginationData = responseData.data.pagination || {}
        } else if (Array.isArray(responseData)) {
          apiPhones = responseData
        } else if (responseData.phones) {
          apiPhones = (responseData.phones as any[]) || []
          paginationData = responseData.pagination || {}
        }
      }

             console.log("Processed phones:", apiPhones)
       console.log("Pagination data:", paginationData)
       
       // Debug condition values
       apiPhones.forEach((phone: any, index: number) => {
         console.log(`Phone ${index + 1} condition:`, phone.condition)
       })

             // Transform API data to match our interface
       const transformedPhones: PhoneDevice[] = apiPhones.map((phone: any) => ({
         id: phone.id?.toString() || "",
         model: phone.model || "",
         brand: phone.brand || "",
         imei: phone.imei || "",
         serialNumber: phone.imei || "", // Using IMEI as serial number for now
         status: mapStatusToFrontend(phone.status),
         assignedTo: phone.assignedToName || undefined,
         assignedDate: phone.assignedDate || undefined,
         purchaseDate: phone.purchaseDate || "2024-01-01", // Default date if not provided
         warrantyExpiry: phone.warrantyExpiry || "2026-01-01", // Default warranty date
         condition: mapConditionToFrontend(phone.condition),
         storage: phone.storage || "128GB",
         color: phone.color || "Standard",
         price: phone.price || 0,
         notes: phone.notes || undefined,
       }))

      setPhones(transformedPhones)
      setFilteredPhones(transformedPhones)

      // Update pagination info
      if (paginationData.total !== undefined) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages || Math.ceil(paginationData.total / prev.limit),
        }))
      }

    } catch (error: any) {
      console.error("Error fetching phones:", error)
      
      let errorMessage = "Erreur lors du chargement des téléphones"
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

  const mapStatusToFrontend = (apiStatus: string): "available" | "assigned" | "lost" | "damaged" => {
    switch (apiStatus) {
      case "AVAILABLE":
        return "available"
      case "ASSIGNED":
        return "assigned"
      case "LOST":
        return "lost"
      case "DAMAGED":
        return "damaged"
      default:
        return "available"
    }
  }

  const mapConditionToFrontend = (apiCondition: string): "excellent" | "good" | "fair" | "poor" => {
    if (!apiCondition) return "excellent"
    
    const condition = apiCondition.toLowerCase()
    switch (condition) {
      case "excellent":
      case "excellent":
        return "excellent"
      case "good":
      case "bon":
        return "good"
      case "fair":
      case "moyen":
      case "acceptable":
        return "fair"
      case "poor":
      case "mauvais":
      case "bad":
        return "poor"
      default:
        return "excellent"
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const phoneColumns = [
    { key: "model", label: "Modèle" },
    { key: "brand", label: "Marque" },
    { key: "storage", label: "Stockage" },
    { key: "color", label: "Couleur" },
    { key: "status", label: "Statut" },
    { key: "assignedTo", label: "Assigné à" },
    { key: "condition", label: "État" },
    { key: "price", label: "Prix" },
    { key: "purchaseDate", label: "Date d'achat" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      assigned: "bg-blue-100 text-blue-800",
      lost: "bg-orange-100 text-orange-800",
      damaged: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getConditionColor = (condition: string) => {
    console.log("Getting color for condition:", condition)
    const colors = {
      excellent: "bg-green-100 text-green-800 border border-green-300",
      good: "bg-blue-100 text-blue-800 border border-blue-300",
      fair: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      poor: "bg-red-100 text-red-800 border border-red-300",
    }
    const colorClass = colors[condition as keyof typeof colors] || "bg-gray-100 text-gray-800 border border-gray-300"
    console.log("Color class:", colorClass)
    return colorClass
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="phones" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultation des Téléphones</h1>
                <p className="text-gray-600">Consultation du parc de téléphones pour les attributions</p>
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
                    Parc de Téléphones ({pagination.total})
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="available">Disponible</option>
                      <option value="assigned">Assigné</option>
                      <option value="lost">Perdu</option>
                      <option value="damaged">Endommagé</option>
                    </select>
                    <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                      <Eye className="h-4 w-4 inline mr-2" />
                      Mode consultation uniquement
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Chargement des téléphones...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error}</p>
                    <Button onClick={fetchPhones} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <>
                    <DataTable
                      data={filteredPhones}
                      columns={phoneColumns}
                      renderCell={(phone, key) => {
                        if (key === "model") {
                          return (
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Phone className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{phone.model}</p>
                                <p className="text-sm text-gray-500">{phone.serialNumber}</p>
                              </div>
                            </div>
                          )
                        }
                        if (key === "status") {
                          return <Badge className={getStatusColor(phone.status)}>{phone.status}</Badge>
                        }
                        if (key === "condition") {
                          return <Badge className={getConditionColor(phone.condition)}>{phone.condition}</Badge>
                        }
                        if (key === "assignedTo") {
                          return phone.assignedTo ? (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-blue-500" />
                              <span>{phone.assignedTo}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Non assigné</span>
                          )
                        }
                        if (key === "price") {
                          return <span>{phone.price.toLocaleString()} MAD</span>
                        }
                        if (key === "purchaseDate") {
                          return new Date(phone.purchaseDate).toLocaleDateString("fr-FR")
                        }
                        return phone[key as keyof PhoneDevice] || "-"
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
