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
import { getApiConfig } from "@/lib/apiClient";

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
}

export default function UsersPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
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
      console.log("Response data:", res.data)
      console.log("Response status:", res.status)
      
      // Handle different response formats
      let apiUsers = []
      if (res.data) {
        if (Array.isArray(res.data)) {
          apiUsers = res.data
        } else if (res.data.data && res.data.data.users && Array.isArray(res.data.data.users)) {
          // Backend format: { success: true, data: { users: [...], pagination: {...} } }
          apiUsers = res.data.data.users
        } else if (res.data.content && Array.isArray(res.data.content)) {
          apiUsers = res.data.content
        } else if (res.data.users && Array.isArray(res.data.users)) {
          apiUsers = res.data.users
        } else if (res.data.data && Array.isArray(res.data.data)) {
          apiUsers = res.data.data
        } else {
          console.warn("Unexpected response format:", res.data)
          apiUsers = []
        }
      }
      
      console.log("Processed users:", apiUsers)
      
      const mappedUsers = apiUsers.map((u: any) => ({
        id: String(u.id || ""),
        name: u.name || u.firstName + " " + u.lastName || "",
        email: u.email || "",
        department: u.department || "",
        role: u.role || "",
        status: u.status === "ACTIVE" ? "active" : "inactive",
        joinDate: u.joinDate || u.createdAt || "",
        phone: u.phone || "",
        address: u.address || "",
        manager: u.manager || "",
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
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
    toast({
      title: "Utilisateur supprimé",
      description: "L'utilisateur a été supprimé avec succès.",
    })
  }

  const handleSaveUser = (userData: Partial<User>) => {
    if (selectedUser) {
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, ...userData } : user)))
      toast({
        title: "Utilisateur modifié",
        description: "Les informations de l'utilisateur ont été mises à jour.",
      })
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || "",
        email: userData.email || "",
        department: userData.department || "",
        role: userData.role || "",
        status: userData.status || "active",
        joinDate: userData.joinDate || new Date().toISOString().split("T")[0],
        phone: userData.phone || "",
        address: userData.address || "",
        manager: userData.manager || "",
      }
      setUsers([...users, newUser])
      toast({
        title: "Utilisateur ajouté",
        description: "Le nouvel utilisateur a été ajouté avec succès.",
      })
    }
    setIsModalOpen(false)
  }

  const handleExport = () => {
    const csvContent = [
      ["Nom", "Email", "Département", "Rôle", "Statut", "Date d'arrivée", "Téléphone", "Adresse", "Manager"],
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
                  onRowClick={(user) => handleEditUser(user)}
                  renderCell={(user, key) => {
                    if (key === "status") {
                      return <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    }
                    if (key === "actions") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
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
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  )
}
