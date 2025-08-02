import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Phone, AlertTriangle, CheckCircle, X } from "lucide-react"

interface Assignment {
  id: string
  user: string
  email: string
  department: string
  requestedModel: string
  status: "pending" | "approved" | "assigned" | "returned"
  requestDate: string
  priority: "low" | "medium" | "high"
  notes?: string
}

interface AssignmentQueueProps {
  assignments: Assignment[]
}

export function AssignmentQueue({ assignments }: AssignmentQueueProps) {
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <Clock className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const sortedAssignments = [...assignments].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return (
      priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    )
  })

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>File d'Attente des Attributions</span>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            {assignments.length} en attente
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAssignments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande en attente</h3>
              <p className="text-gray-600">Toutes les demandes d'attribution ont été traitées.</p>
            </div>
          ) : (
            sortedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{assignment.user}</h4>
                      <p className="text-sm text-gray-600">{assignment.email}</p>
                      <p className="text-sm text-gray-500">{assignment.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(assignment.priority)}>
                      <div className="flex items-center space-x-1">
                        {getPriorityIcon(assignment.priority)}
                        <span>{assignment.priority}</span>
                      </div>
                    </Badge>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Modèle demandé:</span>
                    <span className="text-gray-700">{assignment.requestedModel}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Demandé le {new Date(assignment.requestDate).toLocaleDateString("fr-FR")}
                  </div>
                  {assignment.notes && (
                    <div className="mt-2 text-sm text-gray-700">
                      <strong>Notes:</strong> {assignment.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
