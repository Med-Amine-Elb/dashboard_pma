"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

type NotificationItem = {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  createdAt: string
  read: boolean
  actionUrl?: string
}

interface NotificationsState {
  notifications: NotificationItem[]
  loading: boolean
  error: string | null
  unreadCount: number
  refresh: () => Promise<void>
  markAsReadLocal: (id: string) => void
  removeLocal: (id: string) => void
}

const NotificationsContext = createContext<NotificationsState | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getReadSet = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('read_notifications') : null
      if (!raw) return new Set<string>()
      return new Set<string>(JSON.parse(raw))
    } catch {
      return new Set<string>()
    }
  }

  const saveReadSet = (set: Set<string>) => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem('read_notifications', JSON.stringify(Array.from(set)))
    } catch {}
  }

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const token = typeof window !== 'undefined' ? localStorage.getItem("jwt_token") : null
      if (!token) {
        setNotifications([])
        return
      }
      const { NotificationsApi } = await import("@/api/generated")
      const { getApiConfig } = await import("@/lib/apiClient")
      const api = new NotificationsApi(getApiConfig(token))
      const res = await api.getUserNotifications(1, 50)
      const data = (res.data as any)?.data?.notifications || []
      const readSet = getReadSet()
      const mapped: NotificationItem[] = data.map((n: any) => ({
        id: String(n.id ?? crypto.randomUUID()),
        title: n.title ?? "Notification",
        message: n.message ?? n.content ?? "",
        type: (n.type ?? "info") as any,
        createdAt: n.createdAt ?? new Date().toISOString(),
        read: Boolean(n.read) || readSet.has(String(n.id ?? "")),
        actionUrl: n.actionUrl,
      }))
      setNotifications(mapped)
    } catch {
      setError("Erreur lors du chargement des notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(refresh, 60000) // 60s — reduced from 30s
  }, [refresh])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    refresh()
    startPolling()

    // Pause polling when the tab is hidden to reduce background traffic
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopPolling()
      } else {
        refresh() // Fetch immediately when tab becomes visible again
        startPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      stopPolling()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [refresh, startPolling, stopPolling])

  const markAsReadLocal = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    const set = getReadSet()
    set.add(id)
    saveReadSet(set)
  }

  const removeLocal = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    const set = getReadSet()
    set.add(id)
    saveReadSet(set)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationsContext.Provider value={{ notifications, loading, error, unreadCount, refresh, markAsReadLocal, removeLocal }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider")
  return ctx
}
