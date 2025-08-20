"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  Phone,
  Users,
  CreditCard,
  Calendar,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LinkIcon,
  LayoutDashboard,
  UserCheck,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"

interface SidebarProps {
  activeItem: string
  onLogout: () => void
}

export function Sidebar({ activeItem, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { userData, loading } = useUser()

  // Get user role to show appropriate menu items
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null

  const getMenuItems = () => {
    if (userRole === "admin") {
      return [
        { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin-dashboard" },
        { id: "users", label: "Utilisateurs", icon: Users, href: "/admin-dashboard/users" },
        { id: "phones", label: "Téléphones", icon: Phone, href: "/admin-dashboard/phones" },
        { id: "sim-cards", label: "Cartes SIM", icon: CreditCard, href: "/admin-dashboard/sim-cards" },
        { id: "attributions", label: "Attributions", icon: LinkIcon, href: "/admin-dashboard/attributions" },
        { id: "calendar", label: "Planification", icon: Calendar, href: "/admin-dashboard/calendar" },
      ]
    } else if (userRole === "assigner") {
      return [
        { id: "board", label: "Board", icon: UserCheck, href: "/assigner-dashboard" },
        {
          id: "attributions",
          label: "Attributions",
          icon: LinkIcon,
          href: "/assigner-dashboard/attributions",
        },
        {
          id: "sim-assignments",
          label: "Cartes SIM",
          icon: CreditCard,
          href: "/assigner-dashboard/sim-assignments",
        },
        { id: "users", label: "Utilisateurs", icon: Users, href: "/assigner-dashboard/users" },
        { id: "phones", label: "Téléphones", icon: Phone, href: "/assigner-dashboard/phones" },
        { id: "calendar", label: "Planification", icon: Calendar, href: "/assigner-dashboard/calendar" },
      ]
    } else {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/user-dashboard" },
        { id: "my-phone", label: "Mon Téléphone", icon: Phone, href: "/user-dashboard/my-phone" },
        // Requests link removed for user role
      ]
    }
  }

  const bottomMenuItems = [
    { id: "profile", label: "Profil", icon: User, href: `/${userRole}-dashboard/profile` },
  ]

  const menuItems = getMenuItems()

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white transition-all duration-300 z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">TeleManager</h2>
              <p className="text-xs text-gray-300 capitalize">{userRole} Dashboard</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-white/10"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left hover:bg-white/10 ${
                    isActive ? "bg-white/20 text-white" : "text-gray-300"
                  } ${isCollapsed ? "px-2" : "px-3"}`}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <div className="space-y-2 mb-4">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left hover:bg-white/10 ${
                    isActive ? "bg-white/20 text-white" : "text-gray-300"
                  } ${isCollapsed ? "px-2" : "px-3"}`}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                {loading ? "..." : userData.initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {loading ? "Chargement..." : userData.name || "Utilisateur"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userData.department ? `${userData.department} • ` : ""}<span className="capitalize">{userRole}</span>
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={onLogout}
          className={`w-full justify-start text-left hover:bg-red-500/20 text-red-400 hover:text-red-300 mt-2 ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  )
}
