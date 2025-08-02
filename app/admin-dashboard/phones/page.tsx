"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Plus, Download, Edit, Trash2, Globe } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { PhoneModal } from "@/components/phone-modal"
import { useToast } from "@/hooks/use-toast"
import { PhoneManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

interface PhoneData {
  id: string
  model: string
  brand: string
  status: "available" | "assigned" | "maintenance" | "retired"
  purchaseDate: string
  condition: "excellent" | "good" | "fair" | "poor"
  serialNumber: string
  price: number
  imei: string
  storage: string
  color: string
}

export default function PhonesPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [phones, setPhones] = useState<PhoneData[]>([])
  const [filteredPhones, setFilteredPhones] = useState<PhoneData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState<PhoneData | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
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
      // Correctly extract phones from backend response
      let apiPhones: any[] = [];
      if (Array.isArray(res.data)) {
        apiPhones = res.data;
      } else if (
        res.data &&
        typeof res.data === 'object' &&
        res.data.data &&
        typeof res.data.data === 'object' &&
        Array.isArray((res.data.data as any).phones)
      ) {
        apiPhones = (res.data.data as any).phones;
      } else if (
        res.data &&
        typeof res.data === 'object' &&
        Array.isArray((res.data as any).phones)
      ) {
        apiPhones = (res.data as any).phones;
      }
      setPhones(
        (apiPhones || []).map((p: any) => ({
          id: String(p.id),
          model: p.model,
          brand: p.brand,
          status: (p.status || "available").toLowerCase(),
          purchaseDate: p.purchaseDate || "",
          condition: p.condition || "good",
          serialNumber: p.serialNumber || "",
          price: p.price || 0,
          imei: p.imei || "",
          storage: p.storage || "",
          color: p.color || "",
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
          phone.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phone.imei.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const handleAddPhone = () => {
    setSelectedPhone(null)
    setIsModalOpen(true)
  }

  const handleEditPhone = (phone: PhoneData) => {
    setSelectedPhone(phone)
    setIsModalOpen(true)
  }

  const handleDeletePhone = (phoneId: string) => {
    setPhones(phones.filter((phone) => phone.id !== phoneId))
    toast({
      title: "Téléphone supprimé",
      description: "Le téléphone a été supprimé avec succès.",
    })
  }

  const handleSavePhone = (phoneData: Partial<PhoneData>) => {
    if (selectedPhone) {
      // Edit existing phone
      setPhones(phones.map((phone) => (phone.id === selectedPhone.id ? { ...phone, ...phoneData } : phone)))
      toast({
        title: "Téléphone modifié",
        description: "Les informations du téléphone ont été mises à jour.",
      })
    } else {
      // Add new phone
      const newPhone: PhoneData = {
        id: Date.now().toString(),
        model: phoneData.model || "",
        brand: phoneData.brand || "",
        status: phoneData.status || "available",
        purchaseDate: phoneData.purchaseDate || new Date().toISOString().split("T")[0],
        condition: phoneData.condition || "excellent",
        serialNumber: phoneData.serialNumber || "",
        price: phoneData.price || 0,
        imei: phoneData.imei || "",
        storage: phoneData.storage || "",
        color: phoneData.color || "",
      }
      setPhones([...phones, newPhone])
      toast({
        title: "Téléphone ajouté",
        description: "Le nouveau téléphone a été ajouté avec succès.",
      })
    }
    setIsModalOpen(false)
  }

  const handleExport = () => {
    const csvContent = [
      ["Modèle", "Marque", "Statut", "Date d'achat", "État", "N° Série", "IMEI", "Stockage", "Couleur", "Prix"],
      ...filteredPhones.map((phone) => [
        phone.model,
        phone.brand,
        phone.status,
        phone.purchaseDate,
        phone.condition,
        phone.serialNumber,
        phone.imei,
        phone.storage,
        phone.color,
        phone.price.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "telephones.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV.",
    })
  }

  const phoneColumns = [
    { key: "model", label: "Modèle" },
    { key: "brand", label: "Marque" },
    { key: "status", label: "Statut" },
    { key: "condition", label: "État" },
    { key: "serialNumber", label: "N° Série" },
    { key: "imei", label: "IMEI" },
    { key: "storage", label: "Stockage" },
    { key: "color", label: "Couleur" },
    { key: "price", label: "Prix" },
    { key: "actions", label: "Actions" },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      assigned: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      retired: "bg-gray-100 text-gray-800",
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

                <Button variant="outline" size="sm" className="bg-white/50 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>

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
                    </select>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
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
                ) : (
                <DataTable
                  data={filteredPhones}
                  columns={phoneColumns}
                  onRowClick={(phone) => handleEditPhone(phone)}
                  renderCell={(phone, key) => {
                    if (key === "status") {
                      return <Badge className={getStatusColor(phone.status)}>{phone.status}</Badge>
                    }
                    if (key === "condition") {
                      return <Badge className={getConditionColor(phone.condition)}>{phone.condition}</Badge>
                    }
                    if (key === "price") {
                      return <span>€{phone.price}</span>
                    }
                    if (key === "actions") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditPhone(phone)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePhone(phone.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }
                    return phone[key as keyof PhoneData] || "-"
                  }}
                />
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
    </div>
  )
}
