"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Trash2,
  Settings,
  BookMarkedIcon as MarkAsUnread,
} from "lucide-react"
import { useNotifications } from "@/contexts/NotificationsContext"
import { NotificationsApi } from "@/api/generated/apis/notifications-api";
import { getApiConfig } from "@/lib/apiClient"

interface NotificationsDropdownProps {
  userRole?: "admin" | "assigner" | "user"
}

export function NotificationsDropdown({ userRole = "user" }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, loading, error, unreadCount, refresh, markAsReadLocal, removeLocal } =
    useNotifications()

  useEffect(() => {
    refresh()
  }, [userRole, refresh])

  const getNotificationIcon = (type: (typeof notifications)[number]["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTimestamp = (value: any) => {
    if (!value) return ""
    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date.getTime())) return ""
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `Il y a ${minutes} min`
    } else if (hours < 24) {
      return `Il y a ${hours}h`
    } else {
      return `Il y a ${days}j`
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) return

      const notificationsApi = new NotificationsApi(getApiConfig(token))
      await notificationsApi.markAsRead(parseInt(id))
      markAsReadLocal(id)
    } catch (err) {
      console.error("Error marking notification as read:", err)
      markAsReadLocal(id)
    }
  }

  const markAsUnread = (id: string) => {
    // Local only toggle; backend has no unread API
    const notification = notifications.find(n => n.id === id)
    if (notification) {
      // We don't have a markAsUnreadLocal, but we can simulate it if needed
      // or just leave it as a placeholder if the context doesn't support it.
      // Looking at useNotifications, it only has markAsReadLocal.
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) return

      const notificationsApi = new NotificationsApi(getApiConfig(token))
      await notificationsApi.deleteNotification(parseInt(id))
      removeLocal(id)
    } catch (err) {
      console.error("Error deleting notification:", err)
      removeLocal(id)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) return

      const notificationsApi = new NotificationsApi(getApiConfig(token))
      await notificationsApi.markAllAsRead()
      notifications.forEach(n => markAsReadLocal(n.id))
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
      notifications.forEach(n => markAsReadLocal(n.id))
    }
  }

  const clearAllNotifications = () => {
    // Local only clear
    notifications.forEach(n => removeLocal(n.id))
  }

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/50 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} non lues
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm">Chargement des notifications...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refresh}
                    className="mt-2"
                  >
                    Réessayer
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${
                                !notification.read ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (notification.read) {
                                    markAsUnread(notification.id)
                                  } else {
                                    markAsRead(notification.id)
                                  }
                                }}
                              >
                                {notification.read ? (
                                  <MarkAsUnread className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{formatTimestamp((notification as any).createdAt)}</span>
                            {notification.actionUrl && (
                              <Badge variant="outline" className="text-xs">
                                Cliquer pour voir
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button variant="ghost" size="sm" className="w-full text-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres de notification
                </Button>
              </div>
            </>
          )}
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
