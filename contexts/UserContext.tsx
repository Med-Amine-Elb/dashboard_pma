"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserManagementApi } from "@/api/generated"
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
        // For admin/assigner, get data from the /me endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (res.ok) {
          const body = await res.json()
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
        } else {
          throw new Error("Failed to fetch user data")
        }
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err)
      setError(err.message || "Failed to fetch user data")
      // Set fallback data
      setUserData({
        name: "Utilisateur",
        email: "",
        avatar: "",
        department: "",
        initials: "U",
        role: localStorage.getItem("userRole") || undefined,
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