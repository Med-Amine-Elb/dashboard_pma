"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Globe,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  Phone,
  Headphones,
  Settings,
  Calendar,
  User,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { UserManagementApi } from "@/api/generated"
import { getApiConfig, getUserIdFromToken } from "@/lib/apiClient"

interface Request {
  id: string
  type: "Problème" | "Remplacement" | "Support" | "Changement"
  title: string
  description: string
  status: "En attente" | "En cours" | "Approuvé" | "Rejeté" | "Résolu"
  priority: "Faible" | "Normale" | "Élevée" | "Urgente"
  createdDate: string
  updatedDate: string
  assignedTo?: string
  comments: Array<{
    id: string
    author: string
    message: string
    timestamp: string
    isUser: boolean
  }>
}

export default function RequestsPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    department: "",
  })

  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newRequest, setNewRequest] = useState({
    type: "",
    title: "",
    description: "",
    priority: "Normale",
  })

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newComment, setNewComment] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "user") {
      window.location.href = "/"
      return
    }

    fetchUserData()
    fetchRequests()

    // Check for action parameter from URL
    const action = searchParams.get("action")
    if (action) {
      setNewRequest(prev => ({
        ...prev,
        type: action === "report" ? "Problème" : action === "replacement" ? "Remplacement" : "Support"
      }))
      setShowCreateDialog(true)
    }
  }, [searchParams])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      const userId = getUserIdFromToken(token)
      
      if (!token || !userId) {
        setError("Token invalide")
        return
      }

      const userApi = new UserManagementApi(getApiConfig(token))
      const userResponse = await userApi.getUserById(userId)
      const userData = userResponse.data
      
      setUser({
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        email: userData.email || "",
        avatar: userData.profilePicture || "",
        department: userData.department || "",
      })
    } catch (err: any) {
      console.error("Error fetching user data:", err)
    }
  }

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("jwt_token")
      const userId = getUserIdFromToken(token)
      
      if (!token || !userId) {
        setError("Token invalide")
        return
      }

      const userApi = new UserManagementApi(getApiConfig(token))
      const requestsResponse = await userApi.getUserRequests(userId)
      const requestsData = requestsResponse.data || []
      
      const mappedRequests = requestsData.map((req: any) => ({
        id: req.id || "",
        type: mapRequestType(req.type) || "Support",
        title: req.title || req.description?.substring(0, 50) || "Demande sans titre",
        description: req.description || "",
        status: mapRequestStatus(req.status) || "En attente",
        priority: mapRequestPriority(req.priority) || "Normale",
        createdDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "",
        updatedDate: req.updatedAt ? new Date(req.updatedAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "",
        assignedTo: req.assignedTo || "",
        comments: req.comments?.map((comment: any) => ({
          id: comment.id || "",
          author: comment.author || "",
          message: comment.message || "",
          timestamp: comment.timestamp ? new Date(comment.timestamp).toLocaleString("fr-FR") : "",
          isUser: comment.isUser || false,
        })) || [],
      }))

      setRequests(mappedRequests)

    } catch (err: any) {
      console.error("Error fetching requests:", err)
      setError(err.response?.data?.message || "Erreur lors du chargement des demandes")
    } finally {
      setLoading(false)
    }
  }

  const mapRequestType = (type: string) => {
    switch (type?.toLowerCase()) {
      case "problem":
      case "issue":
        return "Problème"
      case "replacement":
        return "Remplacement"
      case "support":
        return "Support"
      case "change":
        return "Changement"
      default:
        return "Support"
    }
  }

  const mapRequestStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "En attente"
      case "in_progress":
        return "En cours"
      case "approved":
        return "Approuvé"
      case "rejected":
        return "Rejeté"
      case "completed":
      case "resolved":
        return "Résolu"
      default:
        return "En attente"
    }
  }

  const mapRequestPriority = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "Faible"
      case "normal":
        return "Normale"
      case "high":
        return "Élevée"
      case "urgent":
        return "Urgente"
      default:
        return "Normale"
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "en attente":
        return "bg-yellow-100 text-yellow-800"
      case "en cours":
        return "bg-blue-100 text-blue-800"
      case "approuvé":
        return "bg-green-100 text-green-800"
      case "rejeté":
        return "bg-red-100 text-red-800"
      case "résolu":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "faible":
        return "bg-gray-100 text-gray-800"
      case "normale":
        return "bg-blue-100 text-blue-800"
      case "élevée":
        return "bg-orange-100 text-orange-800"
      case "urgente":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "problème":
        return <AlertTriangle className="h-4 w-4" />
      case "remplacement":
        return <Phone className="h-4 w-4" />
      case "support":
        return <Headphones className="h-4 w-4" />
      case "changement":
        return <Settings className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleCreateRequest = async () => {
    if (!newRequest.type || !newRequest.title || !newRequest.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("jwt_token")
      const userId = getUserIdFromToken(token)
      
      if (!token || !userId) {
        toast({
          title: "Erreur",
          description: "Token invalide",
          variant: "destructive",
        })
        return
      }

      const userApi = new UserManagementApi(getApiConfig(token))
      
      // Map the request type back to API format
      const apiType = newRequest.type === "Problème" ? "PROBLEM" : 
                     newRequest.type === "Remplacement" ? "REPLACEMENT" : 
                     newRequest.type === "Support" ? "SUPPORT" : "CHANGE"
      
      const apiPriority = newRequest.priority === "Faible" ? "LOW" :
                         newRequest.priority === "Normale" ? "NORMAL" :
                         newRequest.priority === "Élevée" ? "HIGH" : "URGENT"

      await userApi.createUserRequest(userId, {
        type: apiType,
      title: newRequest.title,
      description: newRequest.description,
        priority: apiPriority,
      })

      toast({
        title: "Succès",
        description: "Demande créée avec succès.",
      })

      setShowCreateDialog(false)
      setNewRequest({
        type: "",
        title: "",
        description: "",
        priority: "Normale",
      })

      // Refresh requests list
      fetchRequests()

    } catch (err: any) {
      console.error("Error creating request:", err)
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de la création de la demande",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (requestId: string) => {
    if (!newComment.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un commentaire.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("jwt_token")
      const userId = getUserIdFromToken(token)
      
      if (!token || !userId) {
    toast({
          title: "Erreur",
          description: "Token invalide",
          variant: "destructive",
    })
        return
  }

      const userApi = new UserManagementApi(getApiConfig(token))
      
      await userApi.addRequestComment(requestId, {
        message: newComment,
                  author: user.name,
                  isUser: true,
      })

      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès.",
      })

    setNewComment("")
      
      // Refresh requests to get updated comments
      fetchRequests()

    } catch (err: any) {
      console.error("Error adding comment:", err)
    toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de l'ajout du commentaire",
        variant: "destructive",
      })
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchRequests} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="requests" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes Demandes</h1>
                <p className="text-gray-600">Gérez vos demandes et tickets de support</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher une demande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 bg-white/50 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <Button variant="outline" size="sm" className="bg-white/50">
                  <Globe className="h-4 w-4 mr-2" />
                  FR
                </Button>

                <NotificationsDropdown userRole="user" />

                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Filters and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-white/50">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Approuvé">Approuvé</SelectItem>
                    <SelectItem value="Rejeté">Rejeté</SelectItem>
                    <SelectItem value="Résolu">Résolu</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 bg-white/50">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Problème">Problème</SelectItem>
                    <SelectItem value="Remplacement">Remplacement</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Changement">Changement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle demande
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle demande</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations pour créer une nouvelle demande de support.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Type de demande</Label>
                      <Select value={newRequest.type} onValueChange={(value) => setNewRequest(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Problème">Problème</SelectItem>
                          <SelectItem value="Remplacement">Remplacement</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Changement">Changement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Titre de la demande"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newRequest.description}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez votre problème ou demande..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priorité</Label>
                      <Select value={newRequest.priority} onValueChange={(value) => setNewRequest(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Faible">Faible</SelectItem>
                          <SelectItem value="Normale">Normale</SelectItem>
                          <SelectItem value="Élevée">Élevée</SelectItem>
                          <SelectItem value="Urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateRequest}>
                      Créer la demande
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <Card key={request.id} className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getTypeIcon(request.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{request.title}</h3>
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                              <Badge className={getPriorityColor(request.priority)}>
                                {request.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{request.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Créé le {request.createdDate}</span>
                              {request.assignedTo && (
                                <>
                                  <span>•</span>
                                  <span>Assigné à {request.assignedTo}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowDetailsDialog(true)
                            }}
                          >
                            Voir détails
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
                    <p className="text-gray-600 mb-4">
                      {requests.length === 0 
                        ? "Vous n'avez pas encore créé de demandes." 
                        : "Aucune demande ne correspond à vos critères de recherche."}
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une demande
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{selectedRequest.title}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                  <Badge className={getPriorityColor(selectedRequest.priority)}>
                    {selectedRequest.priority}
                  </Badge>
                </div>
                <p className="text-gray-600">{selectedRequest.description}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Commentaires</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedRequest.comments.length > 0 ? (
                    selectedRequest.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {comment.author.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Aucun commentaire pour le moment.</p>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleAddComment(selectedRequest.id)}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
