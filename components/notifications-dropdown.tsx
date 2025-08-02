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

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface NotificationsDropdownProps {
  userRole?: "admin" | "assigner" | "user"
}

export function NotificationsDropdown({ userRole = "user" }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load notifications based on user role
    const loadNotifications = () => {
      const baseNotifications: Notification[] = [
        {
          id: "1",
          title: "Demande approuvée",
          message: "Votre demande de remplacement de téléphone a été approuvée",
          type: "success",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          actionUrl: "/user-dashboard/requests",
        },
        {
          id: "2",
          title: "Maintenance programmée",
          message: "Maintenance du système prévue demain de 2h à 4h du matin",
          type: "warning",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
        },
        {
          id: "3",
          title: "Nouveau téléphone attribué",
          message: "iPhone 15 Pro - Série: IP15P789012 vous a été attribué",
          type: "info",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionUrl: "/user-dashboard/my-phone",
        },
        {
          id: "4",
          title: "Rappel: Mise à jour profil",
          message: "Veuillez mettre à jour vos informations de contact",
          type: "info",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          actionUrl: "/user-dashboard/profile",
        },
      ]

      // Add role-specific notifications
      if (userRole === "admin") {
        baseNotifications.unshift(
          {
            id: "admin-1",
            title: "Nouvelle demande en attente",
            message: "5 nouvelles demandes nécessitent votre approbation",
            type: "warning",
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            read: false,
            actionUrl: "/admin-dashboard/attributions",
          },
          {
            id: "admin-2",
            title: "Stock faible",
            message: "Stock de iPhone 15 Pro inférieur à 10 unités",
            type: "error",
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
            read: false,
            actionUrl: "/admin-dashboard/phones",
          },
        )
      } else if (userRole === "assigner") {
        baseNotifications.unshift(
          {
            id: "assigner-1",
            title: "Attribution urgente",
            message: "Demande prioritaire de Jean Dupont à traiter",
            type: "warning",
            timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
            read: false,
            actionUrl: "/assigner-dashboard/attributions",
          },
          {
            id: "assigner-2",
            title: "Retour de matériel",
            message: "3 téléphones retournés aujourd'hui à vérifier",
            type: "info",
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            read: false,
            actionUrl: "/assigner-dashboard/phones",
          },
        )
      }

      setNotifications(baseNotifications)
    }

    loadNotifications()
  }, [userRole])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: Notification["type"]) => {
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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
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

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: false } : notification)),
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notification: Notification) => {
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
              {notifications.length === 0 ? (
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
                            <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
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
