"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Globe, Download, FileText, Users, Smartphone, CreditCard, Activity, Calendar, Filter, BarChart3, Clock, RefreshCw, TrendingUp, PieChart } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { getApiConfig } from "@/lib/apiClient"
import { ModernChart } from "@/components/modern-chart"

interface ReportStats {
  totalReports: number
  thisMonth: number
  scheduled: number
  processing: number
  totalPhones: number
  totalSims: number
  totalUsers: number
  totalAssignments: number
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
  })

  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [loading, setLoading] = useState(false)
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
    generateReportTemplates()
    generateMockExportHistory()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const fetchStats = async () => {
    try {
      const phoneApi = new PhoneManagementApi()
      const userApi = new UserManagementApi()
      const attributionApi = new AttributionManagementApi()
      const simCardApi = new SIMCardManagementApi()

      const [phones, users, attributions, simCards] = await Promise.all([
        phoneApi.getPhones(1, 1),
        userApi.getUsers(1, 1),
        attributionApi.getAttributions(1, 1),
        simCardApi.getSimCards(1, 1)
      ])

      setStats(prev => ({
        ...prev,
        totalPhones: typeof phones.data.totalElements === 'number' ? phones.data.totalElements : 0,
        totalSims: typeof simCards.data.totalElements === 'number' ? simCards.data.totalElements : 0,
        totalUsers: typeof users.data.totalElements === 'number' ? users.data.totalElements : 0,
        totalAssignments: typeof attributions.data.totalElements === 'number' ? attributions.data.totalElements : 0,
      }))
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const generateReportTemplates = () => {
    const templates: ReportTemplate[] = [
      {
        id: 1,
        name: "Assignment Summary",
        description: "Overview of all phone assignments by department and status",
        lastGenerated: "2024-01-20",
        frequency: "Weekly",
        type: "assignment-summary"
      },
      {
        id: 2,
        name: "Device Inventory",
        description: "Complete inventory report with device status and conditions",
        lastGenerated: "2024-01-19",
        frequency: "Monthly",
        type: "device-inventory"
      },
      {
        id: 3,
        name: "User Activity",
        description: "User assignment history and device usage patterns",
        lastGenerated: "2024-01-18",
        frequency: "Bi-weekly",
        type: "user-activity"
      },
      {
        id: 4,
        name: "Cost Analysis",
        description: "Financial analysis of device costs and depreciation",
        lastGenerated: "2024-01-15",
        frequency: "Quarterly",
        type: "cost-analysis"
      },
      {
        id: 5,
        name: "SIM Card Inventory",
        description: "Complete inventory report of all SIM cards, their status, operator, and plan",
        lastGenerated: "2024-01-22",
        frequency: "Monthly",
        type: "sim-inventory"
      }
    ]
    setReportTemplates(templates)
  }

  const generateMockExportHistory = () => {
    const history: ExportHistory[] = [
      {
        id: 1,
        type: "Assignment Summary",
        fileName: "assignment_summary_2024_01_20.csv",
        date: "20/01/2024",
        status: 'completed',
        records: 89
      },
      {
        id: 2,
        type: "Device Inventory",
        fileName: "device_inventory_2024_01_19.csv",
        date: "19/01/2024",
        status: 'completed',
        records: 127
      },
      {
        id: 3,
        type: "User Activity",
        fileName: "user_activity_2024_01_18.csv",
        date: "18/01/2024",
        status: 'completed',
        records: 156
      },
      {
        id: 4,
        type: "Cost Analysis",
        fileName: "cost_analysis_2024_01_15.csv",
        date: "15/01/2024",
        status: 'completed',
        records: 45
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

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`
      
      // Add to export history
      const newExport: ExportHistory = {
        id: exportHistory.length + 1,
        type: getReportTypeLabel(reportType),
        fileName,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'completed',
        records: Math.floor(Math.random() * 200) + 50
      }
      setExportHistory([newExport, ...exportHistory])

      toast({
        title: "Rapport généré",
        description: `Rapport ${getReportTypeLabel(reportType)} généré avec succès`,
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

  // Chart data for analytics
  const assignmentTrendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Attributions',
        data: [65, 78, 90, 85, 95, 88],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const deviceStatusData = [
    { name: 'Disponible', value: 45, value1: 45 },
    { name: 'Attribué', value: 35, value1: 35 },
    { name: 'En maintenance', value: 15, value1: 15 },
    { name: 'Hors service', value: 5, value1: 5 }
  ]

  const departmentDistributionData = [
    { name: 'IT', value: 30, value1: 30 },
    { name: 'RH', value: 25, value1: 25 },
    { name: 'Marketing', value: 20, value1: 20 },
    { name: 'Finance', value: 15, value1: 15 },
    { name: 'Autres', value: 10, value1: 10 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="reports" onLogout={handleLogout} />

        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600">Generate comprehensive reports and analyze your phone management data</p>
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
                      <p className="text-sm text-gray-600">Total Reports</p>
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
                      <p className="text-sm text-gray-600">This Month</p>
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
                      <p className="text-sm text-gray-600">Scheduled</p>
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
                      <p className="text-sm text-gray-600">Processing</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Generate New Report */}
              <div className="lg:col-span-1">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Generate New Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assignment-summary">Assignment Summary</SelectItem>
                          <SelectItem value="device-inventory">Device Inventory</SelectItem>
                          <SelectItem value="user-activity">User Activity</SelectItem>
                          <SelectItem value="cost-analysis">Cost Analysis</SelectItem>
                          <SelectItem value="sim-inventory">SIM Card Inventory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-range">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                          <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                          <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {dateRange === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
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
                        Generate Report
                      </Button>
                      <Button
                        onClick={scheduleReport}
                        variant="outline"
                        className="bg-white/50"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Report Templates */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Report Templates</CardTitle>
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
                            <span className="text-xs text-gray-500">Last: {template.lastGenerated}</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setReportType(template.type)
                                generateReport()
                              }}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                            >
                              Generate
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assignment Trends */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Assignment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    type="line"
                    data={assignmentTrendData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Device Status Distribution */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Device Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    type="doughnut"
                    data={{
                      labels: deviceStatusData.map(item => item.name),
                      datasets: [{
                        data: deviceStatusData.map(item => item.value),
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(245, 158, 11, 0.8)',
                          'rgba(239, 68, 68, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Department Distribution */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ModernChart
                  type="bar"
                  data={{
                    labels: departmentDistributionData.map(item => item.name),
                    datasets: [{
                      label: 'Users per Department',
                      data: departmentDistributionData.map(item => item.value),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Reports
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
                              <p className="text-sm text-gray-600">{exportItem.type} • {exportItem.records} records</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(exportItem.status)}>
                              {exportItem.status === 'completed' ? 'Completed' : 
                               exportItem.status === 'processing' ? 'Processing' : 'Failed'}
                            </Badge>
                            <span className="text-xs text-gray-500">{exportItem.date}</span>
                          </div>
                        </div>
                        {index < exportHistory.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reports generated yet</p>
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