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

export default function AssignerAttributionsPage() {
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [filteredAttributions, setFilteredAttributions] = useState<Attribution[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingAttribution, setEditingAttribution] = useState<Attribution | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "assigner") {
      router.push("/")
      return
    }
    loadAttributions()
  }, [router])

  useEffect(() => {
    filterAttributions()
  }, [attributions, searchTerm, statusFilter])

  const loadAttributions = () => {
    const mockAttributions: Attribution[] = [
      {
        id: "1",
        userId: "user1",
        userName: "Marie Dubois",
        userEmail: "marie.dubois@company.com",
        phoneId: "phone1",
        phoneModel: "iPhone 13 Pro",
        simCardId: "sim1",
        simCardNumber: "+33 6 12 34 56 78",
        assignedBy: "Randy Riley",
        assignmentDate: "2024-01-10",
        status: "ACTIVE",
        notes: "Attribution complète avec téléphone et SIM",
      },
      {
        id: "2",
        userId: "user2",
        userName: "Pierre Martin",
        userEmail: "pierre.martin@company.com",
        phoneId: "phone2",
        phoneModel: "Samsung Galaxy S23",
        simCardId: "sim2",
        simCardNumber: "+33 6 98 76 54 32",
        assignedBy: "Randy Riley",
        assignmentDate: "2024-01-12",
        status: "PENDING",
        notes: "Attribution pour nouveau poste",
      },
      {
        id: "3",
        userId: "user3",
        userName: "Sophie Laurent",
        userEmail: "sophie.laurent@company.com",
        phoneId: "phone3",
        phoneModel: "iPhone 12",
        simCardId: "sim3",
        simCardNumber: "+33 6 11 22 33 44",
        assignedBy: "Randy Riley",
        assignmentDate: "2024-01-05",
        returnDate: "2024-01-14",
        status: "RETURNED",
        notes: "Retour pour changement de poste",
      },
      {
        id: "4",
        userId: "user4",
        userName: "Thomas Durand",
        userEmail: "thomas.durand@company.com",
        phoneId: "phone4",
        phoneModel: "Pixel 8",
        simCardId: "sim4",
        simCardNumber: "+33 6 55 66 77 88",
        assignedBy: "Randy Riley",
        assignmentDate: "2024-02-01",
        status: "ACTIVE",
        notes: "Attribution standard",
      },
      {
        id: "5",
        userId: "user5",
        userName: "Julie Moreau",
        userEmail: "julie.moreau@company.com",
        simCardId: "sim5",
        simCardNumber: "+33 6 99 88 77 66",
        assignedBy: "Randy Riley",
        assignmentDate: "2024-02-05",
        status: "PENDING",
        notes: "Attribution SIM uniquement",
      },
    ]
    setAttributions(mockAttributions)
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
          ? { ...attr, status: "RETURNED" as const, returnDate: new Date().toISOString().split("T")[0] }
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
        status: "ACTIVE",
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar activeItem="attributions" onLogout={handleLogout} />

      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attributions</h1>
              <p className="text-gray-600 mt-2">Gérez les attributions de téléphones et cartes SIM</p>
            </div>
            <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Attribution
            </Button>
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
                Liste des Attributions ({filteredAttributions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAttributions.length === 0 ? (
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(attribution)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(attribution)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                {attribution.status === "ACTIVE" && (
                                  <DropdownMenuItem onClick={() => handleReturn(attribution.id)}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Retourner
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDelete(attribution.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
    </div>
  )
}
