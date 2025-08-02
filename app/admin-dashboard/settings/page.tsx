"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Globe, Save, Shield, Palette, Database } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    assignments: boolean
    maintenance: boolean
    expiry: boolean
  }
  appearance: {
    theme: "light" | "dark" | "auto"
    language: string
    timezone: string
    dateFormat: string
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
    passwordExpiry: number
    loginNotifications: boolean
  }
  system: {
    autoBackup: boolean
    backupFrequency: string
    dataRetention: number
    auditLogs: boolean
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      assignments: true,
      maintenance: true,
      expiry: true,
    },
    appearance: {
      theme: "light",
      language: "fr",
      timezone: "Europe/Paris",
      dateFormat: "DD/MM/YYYY",
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true,
    },
    system: {
      autoBackup: true,
      backupFrequency: "daily",
      dataRetention: 365,
      auditLogs: true,
    },
  })

  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleSaveSettings = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès.",
    })
  }

  const updateNotificationSetting = (key: keyof Settings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const updateAppearanceSetting = (key: keyof Settings["appearance"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }))
  }

  const updateSecuritySetting = (key: keyof Settings["security"], value: boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }))
  }

  const updateSystemSetting = (key: keyof Settings["system"], value: boolean | string | number) => {
    setSettings((prev) => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="settings" onLogout={handleLogout} />

        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-600">Configurez vos préférences système</p>
              </div>

              <div className="flex items-center space-x-4">
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
          <div className="p-6 space-y-6">
            {/* Notifications Settings */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl font-bold">Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Canaux de notification</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Notifications par email</Label>
                        <Switch
                          id="email-notifications"
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Notifications push</Label>
                        <Switch
                          id="push-notifications"
                          checked={settings.notifications.push}
                          onCheckedChange={(checked) => updateNotificationSetting("push", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications">Notifications SMS</Label>
                        <Switch
                          id="sms-notifications"
                          checked={settings.notifications.sms}
                          onCheckedChange={(checked) => updateNotificationSetting("sms", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Types de notification</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="assignments-notifications">Nouvelles attributions</Label>
                        <Switch
                          id="assignments-notifications"
                          checked={settings.notifications.assignments}
                          onCheckedChange={(checked) => updateNotificationSetting("assignments", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maintenance-notifications">Maintenance programmée</Label>
                        <Switch
                          id="maintenance-notifications"
                          checked={settings.notifications.maintenance}
                          onCheckedChange={(checked) => updateNotificationSetting("maintenance", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="expiry-notifications">Expirations SIM</Label>
                        <Switch
                          id="expiry-notifications"
                          checked={settings.notifications.expiry}
                          onCheckedChange={(checked) => updateNotificationSetting("expiry", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-xl font-bold">Apparence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Thème</Label>
                      <Select
                        value={settings.appearance.theme}
                        onValueChange={(value: any) => updateAppearanceSetting("theme", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="auto">Automatique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <Select
                        value={settings.appearance.language}
                        onValueChange={(value) => updateAppearanceSetting("language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuseau horaire</Label>
                      <Select
                        value={settings.appearance.timezone}
                        onValueChange={(value) => updateAppearanceSetting("timezone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Format de date</Label>
                      <Select
                        value={settings.appearance.dateFormat}
                        onValueChange={(value) => updateAppearanceSetting("dateFormat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-xl font-bold">Sécurité</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                      <Switch
                        id="two-factor"
                        checked={settings.security.twoFactor}
                        onCheckedChange={(checked) => updateSecuritySetting("twoFactor", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-notifications">Notifications de connexion</Label>
                      <Switch
                        id="login-notifications"
                        checked={settings.security.loginNotifications}
                        onCheckedChange={(checked) => updateSecuritySetting("loginNotifications", checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSecuritySetting("sessionTimeout", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-expiry">Expiration du mot de passe (jours)</Label>
                      <Input
                        id="password-expiry"
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => updateSecuritySetting("passwordExpiry", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-xl font-bold">Système</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-backup">Sauvegarde automatique</Label>
                      <Switch
                        id="auto-backup"
                        checked={settings.system.autoBackup}
                        onCheckedChange={(checked) => updateSystemSetting("autoBackup", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audit-logs">Journaux d'audit</Label>
                      <Switch
                        id="audit-logs"
                        checked={settings.system.auditLogs}
                        onCheckedChange={(checked) => updateSystemSetting("auditLogs", checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">Fréquence de sauvegarde</Label>
                      <Select
                        value={settings.system.backupFrequency}
                        onValueChange={(value) => updateSystemSetting("backupFrequency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Toutes les heures</SelectItem>
                          <SelectItem value="daily">Quotidienne</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-retention">Rétention des données (jours)</Label>
                      <Input
                        id="data-retention"
                        type="number"
                        value={settings.system.dataRetention}
                        onChange={(e) => updateSystemSetting("dataRetention", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les paramètres
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
