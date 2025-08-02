"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Bell,
  Globe,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Key,
  Clock,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { UserManagementApi } from "@/api/generated";
import { getApiConfig, getUserIdFromToken } from "@/lib/apiClient";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Randy Riley",
    email: "randy.riley@company.com",
    avatar: "",
    department: "IT Department",
    position: "Développeur Senior",
    employeeId: "EMP001",
    phone: "+33 6 12 34 56 78",
    extension: "1234",
    manager: "Sarah Johnson",
    location: "Paris, France",
    startDate: "15 mars 2020",
    lastLogin: "Aujourd'hui à 09:30",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "user") {
      window.location.href = "/"
      return
    }

    fetchUser()
  }, [])

  const fetchUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwt_token")
      const userId = getUserIdFromToken(token || "")
      if (!userId) throw new Error("Utilisateur non authentifié.")
      const api = new UserManagementApi(getApiConfig(token))
      const res = await api.getUserById(Number(userId))
      const u = res.data
      setUser({
        name: u.name,
        email: u.email,
        avatar: u.avatar || "",
        department: u.department || "",
        position: u.position || "",
        employeeId: u.id ? String(u.id) : "",
        phone: u.phone || "",
        extension: u.extension || "",
        manager: u.manager || "",
        location: u.address || "",
        startDate: u.joinDate || "",
        lastLogin: u.lastLogin || "",
      })
      setEditedUser({
        name: u.name,
        email: u.email,
        avatar: u.avatar || "",
        department: u.department || "",
        position: u.position || "",
        employeeId: u.id ? String(u.id) : "",
        phone: u.phone || "",
        extension: u.extension || "",
        manager: u.manager || "",
        location: u.address || "",
        startDate: u.joinDate || "",
        lastLogin: u.lastLogin || "",
      })
    } catch (err: any) {
      setError("Erreur lors du chargement du profil utilisateur.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleSave = () => {
    setUser(editedUser)
    setIsEditing(false)
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    })
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  const profileSections = [
    {
      title: "Informations Personnelles",
      fields: [
        { key: "name", label: "Nom complet", icon: User, editable: true },
        { key: "email", label: "Email", icon: Mail, editable: false },
        { key: "phone", label: "Téléphone personnel", icon: Phone, editable: true },
      ],
    },
    {
      title: "Informations Professionnelles",
      fields: [
        { key: "employeeId", label: "ID Employé", icon: Badge, editable: false },
        { key: "department", label: "Département", icon: Building, editable: false },
        { key: "position", label: "Poste", icon: User, editable: false },
        { key: "manager", label: "Manager", icon: User, editable: false },
        { key: "location", label: "Localisation", icon: MapPin, editable: false },
        { key: "startDate", label: "Date d'embauche", icon: Calendar, editable: false },
      ],
    },
  ]

  const securityInfo = [
    { label: "Dernière connexion", value: user.lastLogin, icon: Clock },
    { label: "Authentification", value: "Mot de passe + 2FA", icon: Shield },
    { label: "Permissions", value: "Utilisateur standard", icon: Key },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="profile" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-10 w-80 bg-white/50 border-gray-200 focus:border-blue-500"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Overview */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-2xl">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
                    <p className="text-gray-600 mb-2">{user.position}</p>
                    <Badge className="bg-blue-100 text-blue-800 mb-4">{user.department}</Badge>
                    <div className="text-sm text-gray-600">
                      <p>ID: {user.employeeId}</p>
                      <p>Depuis le {user.startDate}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Info */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Sécurité</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {securityInfo.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-600">{item.value}</p>
                          </div>
                        </div>
                      )
                    })}
                    <Separator />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => (window.location.href = "/user-dashboard/settings")}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Edit Actions */}
                <div className="flex justify-end space-x-3">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier le Profil
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </>
                  )}
                </div>

                {/* Profile Sections */}
                {profileSections.map((section, sectionIndex) => (
                  <Card key={sectionIndex} className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>
                        {sectionIndex === 0
                          ? "Informations personnelles modifiables"
                          : "Informations gérées par les RH"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.fields.map((field, fieldIndex) => {
                        const Icon = field.icon
                        const value = isEditing
                          ? editedUser[field.key as keyof typeof editedUser]
                          : user[field.key as keyof typeof user]

                        return (
                          <div key={fieldIndex} className="grid grid-cols-3 gap-4 items-center">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4 text-gray-500" />
                              <Label className="text-sm font-medium">{field.label}</Label>
                            </div>
                            <div className="col-span-2">
                              {isEditing && field.editable ? (
                                <Input
                                  value={value as string}
                                  onChange={(e) =>
                                    setEditedUser({
                                      ...editedUser,
                                      [field.key]: e.target.value,
                                    })
                                  }
                                  className="bg-white/50"
                                />
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-900">{value as string}</span>
                                  {!field.editable && (
                                    <Badge variant="outline" className="text-xs">
                                      Non modifiable
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}

                {/* Contact Information */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Informations de Contact</CardTitle>
                    <CardDescription>Coordonnées professionnelles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Email professionnel</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Téléphone d'entreprise</p>
                            <p className="text-sm text-gray-600">{user.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Extension</p>
                            <p className="text-sm text-gray-600">{user.extension}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Localisation</p>
                            <p className="text-sm text-gray-600">{user.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
