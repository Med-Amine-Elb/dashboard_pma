"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserManagementApi } from "@/api/generated/apis/user-management-api";
import { AuthenticationApi } from "@/api/generated/apis/authentication-api";
import { getApiConfig } from "@/lib/apiClient"

interface UserData {
  name: string
  email: string
  avatar: string
  department: string
  initials: string
  firstName?: string
  lastName?: string
  role?: string
}

interface UserContextType {
  userData: UserData
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    avatar: "",
    department: "",
    initials: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async () => {
    if (typeof window === "undefined") return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("jwt_token")
      const userRole = localStorage.getItem("userRole")

      if (!token) {
        throw new Error("No JWT token found")
      }

      if (userRole === "user") {
        // For users, get data from the dashboard endpoint
        const api = new UserManagementApi(getApiConfig(token))
        const res = await api.getMyDashboard()
        const body: any = res.data
        const data = body?.data

        const user = data?.user || {}
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()

        setUserData({
          name: fullName || "Utilisateur",
          email: user.email || "",
          avatar: user.profilePicture || "",
          department: user.department || "",
          initials: initials || "U",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          role: userRole,
        })
      } else {
        // For admin/assigner — use the generated AuthenticationApi SDK (unified HTTP strategy)
        const authApi = new AuthenticationApi(getApiConfig(token))
        const res = await authApi.getCurrentUser()
        const body: any = res.data
        const user = body?.data || {}
        const fullName = user.name || ""
        const initials = fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()

        setUserData({
          name: fullName || "Utilisateur",
          email: user.email || "",
          avatar: user.avatar || "",
          department: user.department || "",
          initials: initials || "U",
          role: userRole || undefined,
        })
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch user data")
      // Set fallback data from localStorage
      const storedName = localStorage.getItem("userName") || "Utilisateur"
      const storedEmail = localStorage.getItem("userEmail") || ""
      const storedRole = localStorage.getItem("userRole") || undefined
      const initials = storedName.split(" ").map(n => n[0]).join("").toUpperCase() || "U"
      setUserData({
        name: storedName,
        email: storedEmail,
        avatar: localStorage.getItem("userAvatar") || "",
        department: localStorage.getItem("userDepartment") || "",
        initials,
        role: storedRole,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const refreshUserData = async () => {
    await fetchUserData()
  }

  const value: UserContextType = {
    userData,
    loading,
    error,
    refreshUserData,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}