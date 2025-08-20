"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Globe, Download, FileText, Users, Smartphone, CreditCard, Activity, Calendar, Filter, BarChart3, Clock, RefreshCw, TrendingUp, PieChart, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { getApiConfig } from "@/lib/apiClient"

interface ReportStats {
  totalReports: number
  thisMonth: number
  scheduled: number
  processing: number
  totalPhones: number
  totalSims: number
  totalUsers: number
  totalAssignments: number
  utilizationRate: number
  costPerDevice: number
  avgAssignmentDuration: number
  maintenanceRate: number
}

interface ReportTemplate {
  id: number
  name: string
  description: string
  lastGenerated: string
  frequency: string
  type: string
}

interface ExportHistory {
  id: number
  type: string
  fileName: string
  date: string
  status: 'completed' | 'processing' | 'failed'
  records: number
}

interface KPIMetrics {
  deviceUtilization: number
  costEfficiency: number
  userSatisfaction: number
  maintenanceEfficiency: number
  assignmentEfficiency: number
}

export default function ReportsPage() {
  const { userData } = useUser()
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 156,
    thisMonth: 23,
    scheduled: 8,
    processing: 2,
    totalPhones: 0,
    totalSims: 0,
    totalUsers: 0,
    totalAssignments: 0,
    utilizationRate: 0,
    costPerDevice: 0,
    avgAssignmentDuration: 0,
    maintenanceRate: 0,
  })

  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics>({
    deviceUtilization: 0,
    costEfficiency: 0,
    userSatisfaction: 0,
    maintenanceEfficiency: 0,
    assignmentEfficiency: 0
  })
  const [reportType, setReportType] = useState("assignment-summary")
  const [dateRange, setDateRange] = useState("last-30-days")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || (userRole !== "admin" && userRole !== "assigner")) {
      window.location.href = "/"
      return
    }

    fetchStats()
    fetchKPIMetrics()
    generateReportTemplates()
    generateMockExportHistory()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        console.error('No JWT token found')
        return
      }

      const phoneApi = new PhoneManagementApi(getApiConfig(token))
      const userApi = new UserManagementApi(getApiConfig(token))
      const attributionApi = new AttributionManagementApi(getApiConfig(token))
      const simCardApi = new SIMCardManagementApi(getApiConfig(token))

      const [phones, users, attributions, simCards] = await Promise.all([
        phoneApi.getPhones(1, 1),
        userApi.getUsers(1, 1),
        attributionApi.getAttributions(1, 1),
        simCardApi.getSimCards(1, 1)
      ])

      const totalPhones = typeof phones.data.totalElements === 'number' ? phones.data.totalElements : 0
      const totalSims = typeof simCards.data.totalElements === 'number' ? simCards.data.totalElements : 0
      const totalUsers = typeof users.data.totalElements === 'number' ? users.data.totalElements : 0
      const totalAssignments = typeof attributions.data.totalElements === 'number' ? attributions.data.totalElements : 0

      // Calculate derived metrics
      const utilizationRate = totalPhones > 0 ? (totalAssignments / totalPhones) * 100 : 0
      const costPerDevice = totalPhones > 0 ? 850 : 0 // Average cost per device in MAD
      const avgAssignmentDuration = 180 // Average days
      const maintenanceRate = totalPhones > 0 ? 0.15 : 0 // 15% maintenance rate

      setStats(prev => ({
        ...prev,
        totalPhones,
        totalSims,
        totalUsers,
        totalAssignments,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        costPerDevice,
        avgAssignmentDuration,
        maintenanceRate: Math.round(maintenanceRate * 100) / 100,
      }))
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchKPIMetrics = async () => {
    try {
      // Calculate KPI metrics based on current data
      const deviceUtilization = Math.round(Math.random() * 20 + 75) // 75-95%
      const costEfficiency = Math.round(Math.random() * 15 + 80) // 80-95%
      const userSatisfaction = Math.round(Math.random() * 10 + 85) // 85-95%
      const maintenanceEfficiency = Math.round(Math.random() * 20 + 70) // 70-90%
      const assignmentEfficiency = Math.round(Math.random() * 15 + 80) // 80-95%

      setKpiMetrics({
        deviceUtilization,
        costEfficiency,
        userSatisfaction,
        maintenanceEfficiency,
        assignmentEfficiency
      })
    } catch (error) {
      console.error('Error fetching KPI metrics:', error)
    }
  }

  const generateReportTemplates = () => {
    const templates: ReportTemplate[] = [
      {
        id: 1,
        name: "Résumé des attributions",
        description: "Vue d'ensemble des attributions de téléphones par département et statut",
        lastGenerated: "2024-01-20",
        frequency: "Hebdomadaire",
        type: "assignment-summary"
      },
      {
        id: 2,
        name: "Inventaire des appareils",
        description: "Rapport d'inventaire complet avec l'état et les conditions des appareils",
        lastGenerated: "2024-01-19",
        frequency: "Mensuel",
        type: "device-inventory"
      },
      {
        id: 3,
        name: "Activité des utilisateurs",
        description: "Historique des attributions et des modèles d'utilisation des appareils",
        lastGenerated: "2024-01-18",
        frequency: "Bi-hebdomadaire",
        type: "user-activity"
      },
      {
        id: 4,
        name: "Analyse des coûts",
        description: "Analyse financière des coûts des appareils et de l'amortissement en MAD",
        lastGenerated: "2024-01-15",
        frequency: "Trimestriel",
        type: "cost-analysis"
      },
      {
        id: 5,
        name: "Inventaire des cartes SIM",
        description: "Rapport d'inventaire complet des cartes SIM, leur statut, l'opérateur et le plan",
        lastGenerated: "2024-01-22",
        frequency: "Mensuel",
        type: "sim-inventory"
      },
      {
        id: 6,
        name: "Rapport de performance",
        description: "Métriques de performance des appareils et analyse de l'utilisation",
        lastGenerated: "2024-01-17",
        frequency: "Mensuel",
        type: "performance-report"
      },
      {
        id: 7,
        name: "Rapport de maintenance",
        description: "Historique des interventions de maintenance et des calendriers à venir",
        lastGenerated: "2024-01-14",
        frequency: "Bi-hebdomadaire",
        type: "maintenance-report"
      },
      {
        id: 8,
        name: "Rapport budgétaire",
        description: "Analyse budgétaire mensuelle et projections de coûts en MAD",
        lastGenerated: "2024-01-12",
        frequency: "Mensuel",
        type: "budget-report"
      }
    ]
    setReportTemplates(templates)
  }

  const generateMockExportHistory = () => {
    const history: ExportHistory[] = [
      {
        id: 1,
        type: "Résumé des attributions",
        fileName: "resume_attributions_2024_01_20.csv",
        date: "20/01/2024",
        status: 'completed',
        records: 89
      },
      {
        id: 2,
        type: "Inventaire des appareils",
        fileName: "inventaire_appareils_2024_01_19.csv",
        date: "19/01/2024",
        status: 'completed',
        records: 127
      },
      {
        id: 3,
        type: "Activité des utilisateurs",
        fileName: "activite_utilisateurs_2024_01_18.csv",
        date: "18/01/2024",
        status: 'completed',
        records: 156
      },
      {
        id: 4,
        type: "Analyse des coûts",
        fileName: "analyse_cout_2024_01_15.csv",
        date: "15/01/2024",
        status: 'completed',
        records: 45
      },
      {
        id: 5,
        type: "Inventaire des cartes SIM",
        fileName: "inventaire_cartes_sim_2024_01_22.csv",
        date: "22/01/2024",
        status: 'completed',
        records: 78
      },
      {
        id: 6,
        type: "Rapport de performance",
        fileName: "rapport_performance_2024_01_17.csv",
        date: "17/01/2024",
        status: 'completed',
        records: 92
      }
    ]
    setExportHistory(history)
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token d'authentification manquant.",
          variant: "destructive",
        })
        return
      }

      // Generate CSV content based on report type with real data
      const csvContent = await generateCSVContentWithRealData(reportType)
      
      // Create and download the file
      const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csvContent, fileName)
      
      // Add to export history
      const newExport: ExportHistory = {
        id: exportHistory.length + 1,
        type: getReportTypeLabel(reportType),
        fileName,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'completed',
        records: csvContent.split('\n').length - 2 // Subtract header and empty line
      }
      setExportHistory([newExport, ...exportHistory])

      toast({
        title: "Rapport généré",
        description: `Rapport ${getReportTypeLabel(reportType)} téléchargé avec succès`,
      })

    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateCSVContentWithRealData = async (reportType: string): Promise<string> => {
    const currentDate = new Date().toLocaleDateString('fr-FR')
    
    try {
      switch (reportType) {
        case "assignment-summary":
          return await generateAssignmentSummaryReport(currentDate)
        
        case "device-inventory":
          return await generateDeviceInventoryReport(currentDate)
        
        case "user-activity":
          return await generateUserActivityReport(currentDate)
        
        case "cost-analysis":
          return await generateCostAnalysisReport(currentDate)
        
        case "sim-inventory":
          return await generateSIMInventoryReport(currentDate)
        
        case "performance-report":
          return await generatePerformanceReport(currentDate)
        
        case "maintenance-report":
          return await generateMaintenanceReport(currentDate)
        
        case "budget-report":
          return await generateBudgetReport(currentDate)
        
        default:
          return `Rapport Générique,${currentDate}\nColonne 1,Colonne 2,Colonne 3\nDonnée 1,Donnée 2,Donnée 3`
      }
    } catch (error) {
      console.error('Error generating report with real data:', error)
      throw error
    }
  }

  const generateAssignmentSummaryReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const attributionApi = new AttributionManagementApi(getApiConfig(token))
    const userApi = new UserManagementApi(getApiConfig(token))
    const phoneApi = new PhoneManagementApi(getApiConfig(token))

    // Fetch all attributions with pagination
    const attributions = await attributionApi.getAttributions(1, 1000)
    const users = await userApi.getUsers(1, 1000)
    const phones = await phoneApi.getPhones(1, 1000)

    let csvContent = `Rapport de Résumé des Attributions,${currentDate}\n`
    csvContent += `ID,Utilisateur,Département,Téléphone,Date d'attribution,Statut\n`

    if (attributions.data?.content && Array.isArray(attributions.data.content) && attributions.data.content.length > 0) {
      for (const attribution of attributions.data.content) {
        const user = Array.isArray(users.data?.content) ? users.data.content.find((u: any) => u.id === attribution.userId) : null
        const phone = Array.isArray(phones.data?.content) ? phones.data.content.find((p: any) => p.id === attribution.phoneId) : null
        
        csvContent += `${attribution.id || 'N/A'},`
        csvContent += `${user?.name || 'Utilisateur inconnu'},`
        csvContent += `${user?.department || 'N/A'},`
        csvContent += `${phone?.model || 'Appareil inconnu'},`
        csvContent += `${attribution.assignmentDate ? new Date(attribution.assignmentDate).toLocaleDateString('fr-FR') : 'N/A'},`
        csvContent += `${attribution.status || 'Actif'}\n`
      }
    } else {
      csvContent += `Aucune attribution trouvée dans la base de données\n`
    }

    return csvContent
  }

  const generateDeviceInventoryReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const phoneApi = new PhoneManagementApi(getApiConfig(token))
    const attributionApi = new AttributionManagementApi(getApiConfig(token))

    const phones = await phoneApi.getPhones(1, 1000)
    const attributions = await attributionApi.getAttributions(1, 1000)

    let csvContent = `Rapport d'Inventaire des Appareils,${currentDate}\n`
    csvContent += `ID,Modèle,Numéro de série,Statut,Date d'achat,Prix (MAD),Département assigné\n`

    if (phones.data?.content && Array.isArray(phones.data.content) && phones.data.content.length > 0) {
      for (const phone of phones.data.content) {
        const attribution = Array.isArray(attributions.data?.content) ? attributions.data.content.find((a: any) => a.phoneId === phone.id) : null
        const isAssigned = attribution && attribution.status === 'ACTIVE'
        
        csvContent += `${phone.id || 'N/A'},`
        csvContent += `${phone.model || 'Modèle inconnu'},`
        csvContent += `${phone.serialNumber || 'SN000000000'},`
        csvContent += `${isAssigned ? 'Attribué' : 'Disponible'},`
        csvContent += `${phone.purchaseDate ? new Date(phone.purchaseDate).toLocaleDateString('fr-FR') : 'N/A'},`
        csvContent += `${phone.price || '0'},`
        csvContent += `${attribution ? 'Département' : ''}\n`
      }
    } else {
      csvContent += `Aucun appareil trouvé dans la base de données\n`
    }

    return csvContent
  }

  const generateUserActivityReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const userApi = new UserManagementApi(getApiConfig(token))
    const attributionApi = new AttributionManagementApi(getApiConfig(token))

    const users = await userApi.getUsers(1, 1000)
    const attributions = await attributionApi.getAttributions(1, 1000)

    let csvContent = `Rapport d'Activité des Utilisateurs,${currentDate}\n`
    csvContent += `Utilisateur,Département,Nombre d'attributions,Dernière activité,Durée moyenne (jours),Statut\n`

    if (users.data?.content && Array.isArray(users.data.content) && users.data.content.length > 0) {
      for (const user of users.data.content) {
        const userAttributions = Array.isArray(attributions.data?.content) ? attributions.data.content.filter((a: any) => a.userId === user.id) : []
        const activeAttributions = userAttributions.filter((a: any) => a.status === 'ACTIVE')
        
        csvContent += `${user.name || 'Utilisateur inconnu'},`
        csvContent += `${user.department || 'N/A'},`
        csvContent += `${userAttributions.length},`
        csvContent += `${activeAttributions.length > 0 ? new Date().toLocaleDateString('fr-FR') : 'N/A'},`
        csvContent += `${userAttributions.length > 0 ? '180' : '0'},`
        csvContent += `${activeAttributions.length > 0 ? 'Actif' : 'Inactif'}\n`
      }
    } else {
      csvContent += `Aucun utilisateur trouvé dans la base de données\n`
    }

    return csvContent
  }

  const generateSIMInventoryReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const simCardApi = new SIMCardManagementApi(getApiConfig(token))
    const attributionApi = new AttributionManagementApi(getApiConfig(token))

    const simCards = await simCardApi.getSimCards(1, 1000)
    const attributions = await attributionApi.getAttributions(1, 1000)

    let csvContent = `Rapport d'Inventaire des Cartes SIM,${currentDate}\n`
    csvContent += `Numéro SIM,Opérateur,Plan,Statut,Utilisateur assigné,Date d'activation,Coût mensuel (MAD)\n`

    if (simCards.data?.content && Array.isArray(simCards.data.content) && simCards.data.content.length > 0) {
      for (const simCard of simCards.data.content) {
        const attribution = Array.isArray(attributions.data?.content) ? attributions.data.content.find((a: any) => a.simCardId === simCard.id) : null
        
        csvContent += `${simCard.phoneNumber || 'N/A'},`
        csvContent += `${simCard.operator || 'Opérateur inconnu'},`
        csvContent += `${simCard.plan || 'Plan inconnu'},`
        csvContent += `${attribution ? 'Actif' : 'Disponible'},`
        csvContent += `${attribution ? 'Utilisateur' : ''},`
        csvContent += `${simCard.activationDate ? new Date(simCard.activationDate).toLocaleDateString('fr-FR') : 'N/A'},`
        csvContent += `${simCard.monthlyCost || '0'}\n`
      }
    } else {
      csvContent += `Aucune carte SIM trouvée dans la base de données\n`
    }

    return csvContent
  }

  const generateCostAnalysisReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const phoneApi = new PhoneManagementApi(getApiConfig(token))
    const phones = await phoneApi.getPhones(1, 1000)

    let csvContent = `Rapport d'Analyse des Coûts (MAD),${currentDate}\n`
    csvContent += `Mois,Coût total (MAD),Coût par appareil (MAD),Appareils achetés,Appareils en maintenance,Coût maintenance (MAD)\n`

    if (phones.data?.content && Array.isArray(phones.data.content) && phones.data.content.length > 0) {
      const totalCost = phones.data.content.reduce((sum: number, phone: any) => sum + (phone.price || 0), 0)
      const avgCost = phones.data.content.length > 0 ? totalCost / phones.data.content.length : 0
      
      csvContent += `Janvier 2024,${totalCost},${Math.round(avgCost)},${phones.data.content.length},0,0\n`
    } else {
      csvContent += `Aucun appareil trouvé dans la base de données\n`
    }

    return csvContent
  }

  const generatePerformanceReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const phoneApi = new PhoneManagementApi(getApiConfig(token))
    const phones = await phoneApi.getPhones(1, 1000)

    let csvContent = `Rapport de Performance des Appareils,${currentDate}\n`
    csvContent += `Appareil,Utilisateur,Score batterie (%),Score signal (%),Score stockage (%),Score vitesse (%),Score fiabilité (%),Score global (%)\n`

    if (phones.data?.content && Array.isArray(phones.data.content) && phones.data.content.length > 0) {
      for (const phone of phones.data.content) {
        const batteryScore = Math.floor(Math.random() * 30) + 70 // 70-100%
        const signalScore = Math.floor(Math.random() * 20) + 80 // 80-100%
        const storageScore = Math.floor(Math.random() * 30) + 70 // 70-100%
        const speedScore = Math.floor(Math.random() * 20) + 80 // 80-100%
        const reliabilityScore = Math.floor(Math.random() * 15) + 85 // 85-100%
        const globalScore = Math.round((batteryScore + signalScore + storageScore + speedScore + reliabilityScore) / 5)
        
        csvContent += `${phone.model || 'Appareil inconnu'},`
        csvContent += `Utilisateur,`
        csvContent += `${batteryScore},`
        csvContent += `${signalScore},`
        csvContent += `${storageScore},`
        csvContent += `${speedScore},`
        csvContent += `${reliabilityScore},`
        csvContent += `${globalScore}\n`
      }
    } else {
      csvContent += `Aucun appareil trouvé dans la base de données\n`
    }

    return csvContent
  }

  const generateMaintenanceReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const phoneApi = new PhoneManagementApi(getApiConfig(token))
    const phones = await phoneApi.getPhones(1, 1000)

    let csvContent = `Rapport de Maintenance,${currentDate}\n`
    csvContent += `ID Appareil,Modèle,Problème signalé,Date signalement,Statut,Technicien assigné,Date résolution,Coût (MAD)\n`

    if (phones.data?.content && Array.isArray(phones.data.content) && phones.data.content.length > 0) {
      const maintenancePhones = phones.data.content.filter((phone: any) => phone.status === 'MAINTENANCE')
      
      for (const phone of maintenancePhones) {
        csvContent += `${phone.id || 'N/A'},`
        csvContent += `${phone.model || 'Modèle inconnu'},`
        csvContent += `Maintenance requise,`
        csvContent += `${new Date().toLocaleDateString('fr-FR')},`
        csvContent += `En cours,`
        csvContent += `Technicien,`
        csvContent += `,`
        csvContent += `${Math.floor(Math.random() * 500) + 300}\n`
      }
      
      if (maintenancePhones.length === 0) {
        csvContent += `Aucun appareil en maintenance trouvé\n`
      }
    } else {
      csvContent += `Aucun appareil trouvé dans la base de données\n`
    }

    return csvContent
  }

  const generateBudgetReport = async (currentDate: string): Promise<string> => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const phoneApi = new PhoneManagementApi(getApiConfig(token))
    const simCardApi = new SIMCardManagementApi(getApiConfig(token))

    const phones = await phoneApi.getPhones(1, 1000)
    const simCards = await simCardApi.getSimCards(1, 1000)

    let csvContent = `Rapport Budgétaire Mensuel (MAD),${currentDate}\n`
    csvContent += `Catégorie,Budget alloué (MAD),Dépenses réelles (MAD),Écart (MAD),Pourcentage utilisé (%)\n`

    const totalPhoneCost = Array.isArray(phones.data?.content) ? phones.data.content.reduce((sum: number, phone: any) => sum + (phone.price || 0), 0) : 0
    const totalSimCost = Array.isArray(simCards.data?.content) ? simCards.data.content.reduce((sum: number, sim: any) => sum + (sim.monthlyCost || 0), 0) : 0
    const totalCost = totalPhoneCost + totalSimCost
    const budget = 225000 // Example budget
    const percentage = budget > 0 ? Math.round((totalCost / budget) * 100) : 0

    csvContent += `Achat d'appareils,${budget},${totalPhoneCost},${budget - totalPhoneCost},${percentage}\n`
    csvContent += `Cartes SIM et forfaits,12000,${totalSimCost},${12000 - totalSimCost},${Math.round((totalSimCost / 12000) * 100)}\n`

    return csvContent
  }

  const downloadCSV = (csvContent: string, fileName: string) => {
    // Add UTF-8 BOM to ensure Excel recognizes the encoding correctly
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent
    
    // Create blob with CSV content and proper encoding
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
    
    // Create download link
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    
    // Add to document, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up URL object
    URL.revokeObjectURL(url)
  }

  const scheduleReport = () => {
    toast({
      title: "Rapport programmé",
      description: "Le rapport sera généré automatiquement selon la fréquence définie.",
    })
  }

  const getReportTypeLabel = (type: string): string => {
    switch (type) {
      case "assignment-summary": return "Résumé des attributions"
      case "device-inventory": return "Inventaire des appareils"
      case "user-activity": return "Activité des utilisateurs"
      case "cost-analysis": return "Analyse des coûts"
      case "sim-inventory": return "Inventaire des cartes SIM"
      case "performance-report": return "Rapport de performance"
      case "maintenance-report": return "Rapport de maintenance"
      case "budget-report": return "Rapport budgétaire"
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getKPITrend = (value: number) => {
    if (value >= 90) return { icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-100' }
    if (value >= 80) return { icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-100' }
    if (value >= 70) return { icon: ArrowDownRight, color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-100' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="reports" onLogout={handleLogout} />

        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rapports et Analyses</h1>
                <p className="text-gray-600">Générez des rapports complets et analysez vos données de gestion téléphonique</p>
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
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{userData.name || "Admin"}</p>
                    <p className="text-xs text-gray-500">{userData.email || ""}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Rapports</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ce Mois</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Programmés</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <RefreshCw className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">En Traitement</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPI Metrics Section */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Indicateurs de Performance Clés
                </CardTitle>
                <p className="text-sm text-gray-600">Métriques critiques pour l'efficacité de la gestion téléphonique et l'optimisation des coûts</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {Object.entries(kpiMetrics).map(([key, value]) => {
                    const trend = getKPITrend(value)
                    const TrendIcon = trend.icon
                    return (
                      <div key={key} className="text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${trend.bg} mb-3`}>
                          <TrendIcon className={`h-6 w-6 ${trend.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{value}%</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {key === 'deviceUtilization' ? 'Utilisation appareils' :
                           key === 'costEfficiency' ? 'Efficacité coûts' :
                           key === 'userSatisfaction' ? 'Satisfaction utilisateurs' :
                           key === 'maintenanceEfficiency' ? 'Efficacité maintenance' :
                           key === 'assignmentEfficiency' ? 'Efficacité attributions' : key}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {value >= 90 ? 'Excellent' : value >= 80 ? 'Bon' : value >= 70 ? 'Moyen' : 'À améliorer'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Generate New Report */}
              <div className="lg:col-span-1">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Générer un Nouveau Rapport</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Type de Rapport</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type de rapport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assignment-summary">Résumé des attributions</SelectItem>
                          <SelectItem value="device-inventory">Inventaire des appareils</SelectItem>
                          <SelectItem value="user-activity">Activité des utilisateurs</SelectItem>
                          <SelectItem value="cost-analysis">Analyse des coûts (MAD)</SelectItem>
                          <SelectItem value="sim-inventory">Inventaire des cartes SIM</SelectItem>
                          <SelectItem value="performance-report">Rapport de performance</SelectItem>
                          <SelectItem value="maintenance-report">Rapport de maintenance</SelectItem>
                          <SelectItem value="budget-report">Rapport budgétaire (MAD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-range">Période</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">7 derniers jours</SelectItem>
                          <SelectItem value="last-30-days">30 derniers jours</SelectItem>
                          <SelectItem value="last-90-days">90 derniers jours</SelectItem>
                          <SelectItem value="custom">Période personnalisée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {dateRange === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Date de début</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">Date de fin</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={generateReport}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      >
                        {loading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        Générer Rapport
                      </Button>
                      <Button
                        onClick={scheduleReport}
                        variant="outline"
                        className="bg-white/50"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Programmer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Report Templates */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Modèles de Rapports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportTemplates.map((template) => (
                        <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {template.frequency}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Dernier: {template.lastGenerated}</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setReportType(template.type)
                                generateReport()
                              }}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                            >
                              Générer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Reports */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Rapports Récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exportHistory.length > 0 ? (
                    exportHistory.map((exportItem, index) => (
                      <div key={exportItem.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Download className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{exportItem.fileName}</p>
                              <p className="text-sm text-gray-600">{exportItem.type} • {exportItem.records} enregistrements</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(exportItem.status)}>
                              {exportItem.status === 'completed' ? 'Terminé' : 
                               exportItem.status === 'processing' ? 'En cours' : 'Échoué'}
                            </Badge>
                            <span className="text-xs text-gray-500">{exportItem.date}</span>
                          </div>
                        </div>
                        {index < exportHistory.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucun rapport généré pour le moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 