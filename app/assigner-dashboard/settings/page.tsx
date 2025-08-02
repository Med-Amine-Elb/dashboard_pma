"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Monitor,
  Moon,
  Sun,
  Volume2,
  Mail,
  Smartphone,
  Eye,
  Database,
  Download,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AssignerSettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true,
      sound: true,
    },
    appearance: {
      theme: "system",
      language: "fr",
      timezone: "Europe/Paris",
    },
    privacy: {
      profileVisibility: "team",
      activityStatus: true,
      dataSharing: false,
    },
    system: {
      autoSave: true,
      backupFrequency: "daily",
      sessionTimeout: "30",
    },
  })

  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès.",
    })
  }

  const handleReset = () => {
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres par défaut ont été restaurés.",
    })
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    })
  }

  const updateAppearanceSetting = (key: string, value: string) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value,
      },
    })
  }

  const updatePrivacySetting = (key: string, value: boolean | string) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    })
  }

  const updateSystemSetting = (key: string, value: boolean | string) => {
    setSettings({
      ...settings,
      system: {
        ...settings.system,
        [key]: value,
      },
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="settings" onLogout={handleLogout} />

      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-2">Gérez vos préférences et paramètres de compte</p>
          </div>

          <div className="space-y-8">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Configurez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="email-notifications">Notifications par email</Label>
                        <p className="text-sm text-gray-500">Recevez des emails pour les mises à jour importantes</p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="push-notifications">Notifications push</Label>
                        <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => updateNotificationSetting("push", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="sound-notifications">Sons de notification</Label>
                        <p className="text-sm text-gray-500">Jouer un son pour les notifications</p>
                      </div>
                    </div>
                    <Switch
                      id="sound-notifications"
                      checked={settings.notifications.sound}
                      onCheckedChange={(checked) => updateNotificationSetting("sound", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="desktop-notifications">Notifications bureau</Label>
                        <p className="text-sm text-gray-500">Afficher sur le bureau</p>
                      </div>
                    </div>
                    <Switch
                      id="desktop-notifications"
                      checked={settings.notifications.desktop}
                      onCheckedChange={(checked) => updateNotificationSetting("desktop", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Apparence</span>
                </CardTitle>
                <CardDescription>Personnalisez l'apparence de votre interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Thème</Label>
                    <Select
                      value={settings.appearance.theme}
                      onValueChange={(value) => updateAppearanceSetting("theme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <span>Clair</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center space-x-2">
                            <Moon className="h-4 w-4" />
                            <span>Sombre</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4" />
                            <span>Système</span>
                          </div>
                        </SelectItem>
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
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Confidentialité</span>
                </CardTitle>
                <CardDescription>Contrôlez vos paramètres de confidentialité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="profile-visibility">Visibilité du profil</Label>
                        <p className="text-sm text-gray-500">Qui peut voir votre profil</p>
                      </div>
                    </div>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) => updatePrivacySetting("profileVisibility", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="team">Équipe</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="activity-status">Statut d'activité</Label>
                        <p className="text-sm text-gray-500">Afficher quand vous êtes en ligne</p>
                      </div>
                    </div>
                    <Switch
                      id="activity-status"
                      checked={settings.privacy.activityStatus}
                      onCheckedChange={(checked) => updatePrivacySetting("activityStatus", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="data-sharing">Partage de données</Label>
                        <p className="text-sm text-gray-500">Partager des données anonymes pour améliorer le service</p>
                      </div>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={settings.privacy.dataSharing}
                      onCheckedChange={(checked) => updatePrivacySetting("dataSharing", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Système</span>
                </CardTitle>
                <CardDescription>Paramètres système et de performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Download className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label htmlFor="auto-save">Sauvegarde automatique</Label>
                        <p className="text-sm text-gray-500">Sauvegarder automatiquement vos modifications</p>
                      </div>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={settings.system.autoSave}
                      onCheckedChange={(checked) => updateSystemSetting("autoSave", checked)}
                    />
                  </div>

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
                    <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.system.sessionTimeout}
                      onChange={(e) => updateSystemSetting("sessionTimeout", e.target.value)}
                      min="5"
                      max="120"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Gérer vos données et paramètres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleSave}>Sauvegarder les paramètres</Button>
                  <Button variant="outline" onClick={handleReset}>
                    Réinitialiser
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les données
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
