"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Plus, Download, Edit, Trash2, Globe, RefreshCw } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { UserModal } from "@/components/user-modal"
import { useToast } from "@/hooks/use-toast"
import { UserManagementApi } from "@/api/generated";
import { UserDtoRoleEnum, UserDtoStatusEnum } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

// Local table view user model (lowercase status for display)
interface User {
  id: string
  name: string
  email: string
  department: string
  role: string
  status: "active" | "inactive"
  joinDate: string
  phone: string
  address: string
  manager: string
  position: string
}

// Modal user model (must match `components/user-modal.tsx` expectations)
type ModalUser = {
  id: string
  name: string
  email: string
  password?: string
  role: "USER" | "ADMIN" | "ASSIGNER"
  department: string
  position: string
  status: "ACTIVE" | "INACTIVE"
  joinDate: string
  phone?: string
  address?: string
  manager?: string
  avatar?: string
}

export default function UsersPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ModalUser | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
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

    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, departmentFilter])

  const fetchUsers = async () => {
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

      const api = new UserManagementApi(getApiConfig(token))
      console.log("API config:", getApiConfig(token))
      console.log("Fetching users...")
      
      const res = await api.getUsers()
      console.log("API Response:", res)
      const body: any = res.data as any
      console.log("Response data:", body)
      console.log("Response status:", res.status)

      // Handle different response formats
      let apiUsers: any[] = []
      if (body) {
        if (Array.isArray(body)) {
          apiUsers = body
        } else if (body.data && body.data.users && Array.isArray(body.data.users)) {
          // Backend format: { success: true, data: { users: [...], pagination: {...} } }
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
      
      console.log("Processed users:", apiUsers)
      
      const mappedUsers: User[] = apiUsers.map((u: any): User => ({
        id: String(u.id ?? ""),
        name: (u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`).trim(),
        email: u.email ?? "",
        department: u.department ?? "",
        role: u.role ?? "",
        status: ((u.status === "ACTIVE" || u.status === "active") ? "active" : "inactive") as "active" | "inactive",
        joinDate: u.joinDate ?? u.createdAt ?? "",
        phone: u.phone ?? "",
        address: u.address ?? "",
        manager: u.manager ?? "",
        position: u.position ?? "",
      }))
      
      console.log("Mapped users:", mappedUsers)
      setUsers(mappedUsers)
      
    } catch (err: any) {
      console.error("Error fetching users:", err)
      console.error("Error response:", err.response)
      console.error("Error status:", err.response?.status)
      console.error("Error data:", err.response?.data)
      setError(err.response?.data?.message || "Erreur lors du chargement des utilisateurs.")
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((user) => user.department === departmentFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    // Transform the user data to match UserModal's expected format
    const transformedUser: ModalUser = {
      ...user,
      status: user.status === "active" ? "ACTIVE" : "INACTIVE",
      role: (user.role?.toUpperCase() as ModalUser["role"]) || "USER",
    }
    setSelectedUser(transformedUser)
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId: string, event?: React.MouseEvent) => {
    // Prevent the row click event from triggering
    if (event) {
      event.stopPropagation()
    }
    
    // Find the user to delete
    const user = users.find(u => u.id === userId)
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non trouvé",
        variant: "destructive",
      })
      return
    }
    
    // Show delete confirmation modal
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    
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

      const userApi = new UserManagementApi(getApiConfig(token))
      await userApi.deleteUser(Number(userToDelete.id))
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      })
      
      // Refresh the users list from the backend
      await fetchUsers()
      
    } catch (err: any) {
      console.error("Error deleting user:", err)
      
      // Handle specific error cases
      let errorMessage = "Erreur lors de la suppression de l'utilisateur"
      
      if (err.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé"
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour supprimer cet utilisateur"
      } else if (err.response?.status === 409) {
        errorMessage = "Impossible de supprimer cet utilisateur car il est associé à d'autres données"
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
      setUserToDelete(null)
    }
  }

  // Wrapper passed to modal to satisfy its `(user: Partial<User>) => void` signature
  const onSaveUser = (userData: any) => {
    void handleSaveUser(userData)
  }

  const handleSaveUser = async (userData: any) => {
    try {
      // Validation
      const errors: string[] = []
      
      if (!userData.name || userData.name.trim() === "") {
        errors.push("Le nom est obligatoire")
      }
      
      if (!userData.email || userData.email.trim() === "") {
        errors.push("L'email est obligatoire")
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push("L'email n'est pas valide")
      }
      
      if (!userData.department || userData.department.trim() === "") {
        errors.push("Le département est obligatoire")
      }
      
      if (!userData.role || userData.role.trim() === "") {
        errors.push("Le rôle est obligatoire")
      }
      
      if (!selectedUser && (!userData.password || userData.password.trim() === "")) {
        errors.push("Le mot de passe est obligatoire pour un nouvel utilisateur")
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

      const userApi = new UserManagementApi(getApiConfig(token))
      
      if (selectedUser) {
        // Update existing user
        await userApi.updateUser(Number(selectedUser.id), {
          name: userData.name || "",
          email: userData.email || "",
          department: userData.department || "",
          role: (userData.role?.toUpperCase() as UserDtoRoleEnum) || UserDtoRoleEnum.User,
          status: (userData.status as UserDtoStatusEnum) || UserDtoStatusEnum.Active,
          phone: userData.phone || "",
          address: userData.address || "",
          manager: userData.manager || "",
          position: userData.position || "",
        })
        
        toast({
          title: "Utilisateur modifié",
          description: "Les informations de l'utilisateur ont été mises à jour.",
        })
      } else {
        // Create new user
        await userApi.createUser({
          name: userData.name || "",
          email: userData.email || "",
          password: userData.password || "defaultPassword123",
          department: userData.department || "",
          role: (userData.role?.toUpperCase() as UserDtoRoleEnum) || UserDtoRoleEnum.User,
          status: (userData.status as UserDtoStatusEnum) || UserDtoStatusEnum.Active,
          phone: userData.phone || "",
          address: userData.address || "",
          manager: userData.manager || "",
          position: userData.position || "",
        })
        
        toast({
          title: "Utilisateur ajouté",
          description: "Le nouvel utilisateur a été ajouté avec succès.",
        })
      }
      
      // Refresh the users list from the backend
      await fetchUsers()
      setIsModalOpen(false)
      
    } catch (err: any) {
      console.error("Error saving user:", err)
      
      // Handle specific error cases
      let errorMessage = "Erreur lors de la sauvegarde de l'utilisateur"
      
      if (err.response?.status === 400) {
        const errorData = err.response?.data
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message
        } else if (errorData?.message) {
          errorMessage = errorData.message
        }
      } else if (err.response?.status === 409) {
        errorMessage = "Un utilisateur avec cet email existe déjà"
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions pour effectuer cette action"
      } else if (err.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé"
      } else if (err.message?.includes("Email already exists")) {
        errorMessage = "Un utilisateur avec cet email existe déjà"
      } else if (err.message?.includes("User not found")) {
        errorMessage = "Utilisateur non trouvé"
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Nom", "Email", "Département", "Rôle", "Statut", "Date d'arrivée", "Téléphone", "Adresse", "Manager", "Poste"],
      ...filteredUsers.map((user) => [
        user.name,
        user.email,
        user.department,
        user.role,
        user.status,
        user.joinDate,
        user.phone,
        user.address,
        user.manager,
        user.position,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "utilisateurs.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV.",
    })
  }

  const userColumns = [
    { key: "name", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "department", label: "Département" },
    { key: "role", label: "Rôle" },
    { key: "status", label: "Statut" },
    { key: "phone", label: "Téléphone" },
    { key: "manager", label: "Manager" },
    { key: "position", label: "Poste" },
    { key: "joinDate", label: "Date d'arrivée" },
    { key: "actions", label: "Actions" },
  ]

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const departments = ["IT", "Sales", "Marketing", "HR", "Finance", "R&D"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="clients" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                <p className="text-gray-600">Gestion des employés et informations personnelles</p>
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
                  <CardTitle className="text-xl font-bold">Liste des Utilisateurs</CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="all">Tous les départements</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <Button variant="outline" onClick={fetchUsers}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rafraîchir
                    </Button>
                    <Button
                      onClick={handleAddUser}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter Utilisateur
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Chargement des utilisateurs...</p>
                  </div>
                ) : error ? (
                  <div className="py-8 text-center">
                    <p className="text-red-500 mb-2">{error}</p>
                    <Button onClick={fetchUsers} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-gray-600">
                      {filteredUsers.length} utilisateur(s) trouvé(s)
                    </div>
                <DataTable
                  data={filteredUsers}
                  columns={userColumns}
                  renderCell={(user, key) => {
                    if (key === "status") {
                      return <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    }
                    if (key === "actions") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditUser(user)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDeleteUser(user.id, e)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }
                    return user[key as keyof User] || "-"
                  }}
                />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveUser}
        user={selectedUser}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
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
                Êtes-vous sûr de vouloir supprimer l'utilisateur :
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{userToDelete.name}</p>
                <p className="text-sm text-gray-600">{userToDelete.email}</p>
                <p className="text-sm text-gray-600">{userToDelete.department} • {userToDelete.role}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setUserToDelete(null)
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
