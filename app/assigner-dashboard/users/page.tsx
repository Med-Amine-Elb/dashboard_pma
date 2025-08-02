"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Globe, Phone, Mail, Building } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"

interface AssignerUser {
  id: string
  name: string
  email: string
  department: string
  position: string
  phone?: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  avatar?: string
  assignedPhone?: string
  assignedSim?: string
}

export default function AssignerUsersPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [users, setUsers] = useState<AssignerUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AssignerUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "assigner") {
      window.location.href = "/"
      return
    }

    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const loadUsers = () => {
    const mockUsers: AssignerUser[] = [
      {
        id: "1",
        name: "Jean Dupont",
        email: "jean.dupont@company.com",
        department: "IT",
        position: "Développeur Senior",
        phone: "+33 6 12 34 56 78",
        status: "active",
        joinDate: "2023-01-15",
        assignedPhone: "iPhone 15 Pro",
        assignedSim: "+33 6 12 34 56 78",
      },
      {
        id: "2",
        name: "Marie Martin",
        email: "marie.martin@company.com",
        department: "Sales",
        position: "Responsable Commercial",
        phone: "+33 6 98 76 54 32",
        status: "active",
        joinDate: "2022-11-20",
        assignedPhone: "Galaxy S24",
        assignedSim: "+33 6 98 76 54 32",
      },
      {
        id: "3",
        name: "Pierre Durand",
        email: "pierre.durand@company.com",
        department: "Marketing",
        position: "Chef de Projet",
        phone: "+33 6 11 22 33 44",
        status: "pending",
        joinDate: "2024-01-10",
      },
      {
        id: "4",
        name: "Sophie Dubois",
        email: "sophie.dubois@company.com",
        department: "HR",
        position: "Responsable RH",
        phone: "+33 6 55 66 77 88",
        status: "active",
        joinDate: "2023-06-01",
      },
      {
        id: "5",
        name: "Thomas Bernard",
        email: "thomas.bernard@company.com",
        department: "Finance",
        position: "Comptable",
        phone: "+33 6 77 88 99 00",
        status: "active",
        joinDate: "2023-03-12",
      },
      {
        id: "6",
        name: "Julie Moreau",
        email: "julie.moreau@company.com",
        department: "R&D",
        position: "Ingénieur",
        phone: "+33 6 33 44 55 66",
        status: "inactive",
        joinDate: "2022-08-05",
      },
    ]
    setUsers(mockUsers)
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
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
                  <CardTitle className="text-xl font-bold">Liste des Utilisateurs</CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="pending">En attente</option>
                    </select>
                    <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                      Mode consultation uniquement
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
