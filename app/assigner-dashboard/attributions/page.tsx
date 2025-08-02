"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AttributionModal } from "@/components/attribution-modal"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { AttributionManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";
import { DataTable } from "@/components/data-table";

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
  status: "active" | "pending" | "returned"
  notes?: string
}

export default function AssignerAttributionsPage() {
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [filteredAttributions, setFilteredAttributions] = useState<Attribution[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingAttribution, setEditingAttribution] = useState<Attribution | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "assigner") {
      router.push("/")
      return
    }
    fetchAttributions()
  }, [router])

  useEffect(() => {
    filterAttributions()
  }, [attributions, searchTerm, statusFilter])

  const fetchAttributions = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      const api = new AttributionManagementApi(getApiConfig(token))
      const res = await api.getAttributions()
      // Correctly extract attributions from backend response
      let apiAttributions: any[] = [];
      if (Array.isArray(res.data)) {
        apiAttributions = res.data;
      } else if (
        res.data && typeof res.data === 'object' &&
        res.data.data && typeof res.data.data === 'object' &&
        Array.isArray((res.data.data as any).attributions)
      ) {
        apiAttributions = (res.data.data as any).attributions;
      } else if (
        res.data && typeof res.data === 'object' &&
        Array.isArray((res.data as any).attributions)
      ) {
        apiAttributions = (res.data as any).attributions;
      }
      setAttributions(
        (Array.isArray(apiAttributions) ? apiAttributions : []).map((a: any) => ({
          id: String(a.id),
          userId: String(a.userId),
          userName: a.userName || "",
          userEmail: a.userEmail || "",
          phoneId: a.phoneId ? String(a.phoneId) : undefined,
          phoneModel: a.phoneModel || undefined,
          simCardId: a.simCardId ? String(a.simCardId) : undefined,
          simCardNumber: a.simCardNumber || undefined,
          assignedBy: a.assignedByName || "",
          assignmentDate: a.assignmentDate || "",
          returnDate: a.returnDate || undefined,
          status: (a.status || "active").toLowerCase(),
          notes: a.notes || undefined,
        }))
      )
    } catch (err: any) {
      setError("Erreur lors du chargement des attributions.")
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
      filtered = filtered.filter((attribution) => attribution.status === statusFilter)
    }

    setFilteredAttributions(filtered)
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

  const handleDelete = (id: string) => {
    setAttributions(attributions.filter((attr) => attr.id !== id))
    toast({
      title: "Attribution supprimée",
      description: "L'attribution a été supprimée avec succès",
    })
  }

  const handleReturn = (id: string) => {
    setAttributions(
      attributions.map((attr) =>
        attr.id === id
          ? { ...attr, status: "returned" as const, returnDate: new Date().toISOString().split("T")[0] }
          : attr,
      ),
    )
    toast({
      title: "Attribution retournée",
      description: "L'attribution a été marquée comme retournée",
    })
  }

  const handleView = (attribution: Attribution) => {
    toast({
      title: "Détails de l'attribution",
      description: `Affichage des détails pour ${attribution.userName}`,
    })
  }

  const handleSaveAttribution = (attributionData: Partial<Attribution>) => {
    if (editingAttribution) {
      // Edit existing attribution
      setAttributions(
        attributions.map((attribution) =>
          attribution.id === editingAttribution.id ? { ...attribution, ...attributionData } : attribution,
        ),
      )
      toast({
        title: "Attribution modifiée",
        description: "L'attribution a été mise à jour avec succès.",
      })
    } else {
      // Add new attribution
      const newAttribution: Attribution = {
        id: Date.now().toString(),
        ...attributionData,
        assignedBy: "Randy Riley",
        assignmentDate: new Date().toISOString().split("T")[0],
        status: "active",
      } as Attribution
      setAttributions([...attributions, newAttribution])
      toast({
        title: "Attribution créée",
        description: "La nouvelle attribution a été créée avec succès.",
      })
    }
    setShowModal(false)
    setEditingAttribution(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case "returned":
        return <Badge className="bg-gray-100 text-gray-800">Retourné</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const attributionColumns = [
    {
      header: "Utilisateur",
      accessorKey: "userName",
      cell: (info: any) => (
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
              {info.row.original.userName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
            <p className="font-medium text-gray-900">{info.row.original.userName}</p>
            <p className="text-sm text-gray-500">{info.row.original.userEmail}</p>
                              </div>
                            </div>
      ),
    },
    {
      header: "Téléphone",
      accessorKey: "phoneModel",
      cell: (info: any) => (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-900">{info.row.original.phoneModel || "Non assigné"}</span>
                              </div>
      ),
    },
    {
      header: "Carte SIM",
      accessorKey: "simCardNumber",
      cell: (info: any) => (
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-green-500" />
          <span className="font-mono text-sm text-gray-900">{info.row.original.simCardNumber || "Non assignée"}</span>
                              </div>
      ),
    },
    {
      header: "Date d'attribution",
      accessorKey: "assignmentDate",
      cell: (info: any) => (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
            {new Date(info.row.original.assignmentDate).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
      ),
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: (info: any) => getStatusBadge(info.row.original.status),
    },
    {
      header: "Assigné par",
      accessorKey: "assignedBy",
      cell: (info: any) => (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{info.row.original.assignedBy}</span>
                            </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (info: any) => (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(info.row.original)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(info.row.original)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
            {info.row.original.status === "active" && (
              <DropdownMenuItem onClick={() => handleReturn(info.row.original.id)}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Retourner
                                  </DropdownMenuItem>
                                )}
            <DropdownMenuItem onClick={() => handleDelete(info.row.original.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="attributions" onLogout={handleLogout} />

        <div className="flex-1 p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attributions</CardTitle>
              <div className="flex items-center space-x-2">
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-gray-500">Chargement...</div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">{error}</div>
              ) : (
                <DataTable
                  data={filteredAttributions}
                  columns={attributionColumns}
                  onRowClick={handleView}
                  renderCell={(attr, key) => {
                    if (key === "status") {
                      return getStatusBadge(attr.status)
                    }
                    if (key === "assignmentDate") {
                      return <span>{new Date(attr.assignmentDate).toLocaleDateString("fr-FR")}</span>
                    }
                    if (key === "actions") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(attr)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(attr.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                </div>
                      )
                    }
                    return attr[key as keyof Attribution] || "-"
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AttributionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAttribution}
        attribution={editingAttribution}
      />
      <Toaster />
    </div>
  )
}
