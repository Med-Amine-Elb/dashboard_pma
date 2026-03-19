"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useUser } from "@/contexts/UserContext"

interface DashboardHeaderProps {
  title: string
  description?: string
  userRole: "admin" | "assigner" | "user"
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
}

export function DashboardHeader({
  title,
  description,
  userRole,
  searchPlaceholder = "Rechercher...",
  onSearch,
  searchValue,
}: DashboardHeaderProps) {
  const { userData } = useUser()

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>

        <div className="flex items-center space-x-4">
          {onSearch !== undefined && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10 w-80 bg-white/50 border-gray-200 focus:border-blue-500"
                value={searchValue ?? ""}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}

          <NotificationsDropdown userRole={userRole} />

          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {userData.initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{userData.name || "Utilisateur"}</p>
              <p className="text-xs text-gray-500">{userData.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
