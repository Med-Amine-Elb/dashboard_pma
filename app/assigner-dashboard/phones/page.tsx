"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, Phone, User, Eye, Edit, Trash2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { PhoneManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

interface PhoneDevice {
  id: string
  model: string
  brand: string
  imei: string
  serialNumber: string
  status: "available" | "assigned" | "maintenance" | "retired"
  assignedTo?: string
  purchaseDate: string
  warrantyExpiry: string
  condition: "excellent" | "good" | "fair" | "poor"
  storage: string
  color: string
  price: number
}

export default function AssignerPhonesPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [phones, setPhones] = useState<PhoneDevice[]>([])
  const [filteredPhones, setFilteredPhones] = useState<PhoneDevice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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

    fetchPhones()
  }, [])

  useEffect(() => {
    filterPhones()
  }, [phones, searchTerm, statusFilter])

  const fetchPhones = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      const api = new PhoneManagementApi(getApiConfig(token))
      const res = await api.getPhones()
      // Try to find the array of phones in the response
      const apiPhones = Array.isArray(res.data) ? res.data : (res.data.content || res.data.phones || [])
      setPhones(
        apiPhones.map((p: any) => ({
          id: String(p.id),
          model: p.model,
          brand: p.brand,
          imei: p.imei || "",
          serialNumber: p.serialNumber || "",
          status: (p.status || "available").toLowerCase(),
          assignedTo: p.assignedToName || "",
          purchaseDate: p.purchaseDate || "",
          warrantyExpiry: p.warrantyExpiry || "",
          condition: p.condition || "good",
          storage: p.storage || "",
          color: p.color || "",
          price: p.price || 0,
        }))
      )
    } catch (err: any) {
      setError("Erreur lors du chargement des téléphones.")
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
          phone.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((phone) => phone.status === statusFilter)
    }

    setFilteredPhones(filtered)
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
      maintenance: "bg-orange-100 text-orange-800",
      retired: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
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
                  <CardTitle className="text-xl font-bold">Parc de Téléphones</CardTitle>
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
                  <div className="py-8 text-center text-gray-500">Chargement...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-500">{error}</div>
                ) : (
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
                      return <span>€{phone.price}</span>
                    }
                    if (key === "purchaseDate") {
                      return new Date(phone.purchaseDate).toLocaleDateString("fr-FR")
                    }
                    return phone[key as keyof PhoneDevice] || "-"
                  }}
                />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
