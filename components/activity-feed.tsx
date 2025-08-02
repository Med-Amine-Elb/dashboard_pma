import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, User, Settings, CheckCircle, AlertTriangle, Clock } from "lucide-react"

interface Activity {
  id: string
  type: "assignment" | "return" | "maintenance" | "user_action"
  title: string
  description: string
  timestamp: string
  user: string
  status: "success" | "warning" | "info" | "error"
}

const activities: Activity[] = [
  {
    id: "1",
    type: "assignment",
    title: "Nouvelle attribution",
    description: "iPhone 14 Pro attribué à Jean Dupont (IT)",
    timestamp: "Il y a 2 heures",
    user: "Marie Assignateur",
    status: "success",
  },
  {
    id: "2",
    type: "return",
    title: "Retour de téléphone",
    description: "Galaxy S22 retourné par Pierre Martin (Sales)",
    timestamp: "Il y a 4 heures",
    user: "Pierre Martin",
    status: "info",
  },
  {
    id: "3",
    type: "maintenance",
    title: "Maintenance programmée",
    description: "Pixel 7 envoyé en réparation - écran fissuré",
    timestamp: "Il y a 6 heures",
    user: "Service Technique",
    status: "warning",
  },
  {
    id: "4",
    type: "user_action",
    title: "Nouvelle demande",
    description: "Sophie Dubois a demandé un remplacement",
    timestamp: "Il y a 8 heures",
    user: "Sophie Dubois",
    status: "info",
  },
  {
    id: "5",
    type: "assignment",
    title: "Attribution approuvée",
    description: "Demande de Thomas Bernard approuvée",
    timestamp: "Hier",
    user: "Admin Système",
    status: "success",
  },
]

export function ActivityFeed() {
  const getActivityIcon = (type: string, status: string) => {
    const iconClass = "h-4 w-4"

    switch (type) {
      case "assignment":
        return <Phone className={iconClass} />
      case "return":
        return <CheckCircle className={iconClass} />
      case "maintenance":
        return <Settings className={iconClass} />
      case "user_action":
        return <User className={iconClass} />
      default:
        return <AlertTriangle className={iconClass} />
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      success: "bg-green-100 text-green-800",
      warning: "bg-orange-100 text-orange-800",
      info: "bg-blue-100 text-blue-800",
      error: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || colors.info
  }

  const getIconBgColor = (status: string) => {
    const colors = {
      success: "bg-green-500",
      warning: "bg-orange-500",
      info: "bg-blue-500",
      error: "bg-red-500",
    }
    return colors[status as keyof typeof colors] || colors.info
  }

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Activité Récente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className={`p-2 rounded-lg text-white ${getIconBgColor(activity.status)}`}>
                {getActivityIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                  <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Par {activity.user}</span>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
