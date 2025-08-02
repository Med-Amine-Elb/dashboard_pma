"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Phone, FileText } from "lucide-react"

interface AssignmentHistory {
  id: string
  simCardId: string
  phoneId?: string
  userId: string
  userName?: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  status: "active" | "returned" | "expired"
  notes?: string
}

interface AssignmentHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  history: AssignmentHistory[]
}

export function AssignmentHistoryModal({ isOpen, onClose, history }: AssignmentHistoryModalProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      returned: "bg-blue-100 text-blue-800",
      expired: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status: string) => {
    const texts = {
      active: "Actif",
      returned: "Retourné",
      expired: "Expiré",
    }
    return texts[status as keyof typeof texts] || status
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique des Attributions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun historique</h3>
              <p className="text-gray-600">Cette carte SIM n'a pas encore été assignée.</p>
            </div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{entry.userName || `Utilisateur ${entry.userId}`}</h4>
                      <p className="text-sm text-gray-600">Assigné par {entry.assignedBy}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(entry.status)}>{getStatusText(entry.status)}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Attribution:</span>
                    <span className="font-medium">{new Date(entry.assignmentDate).toLocaleDateString("fr-FR")}</span>
                  </div>

                  {entry.returnDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Retour:</span>
                      <span className="font-medium">{new Date(entry.returnDate).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}

                  {entry.phoneId && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Avec téléphone:</span>
                      <span className="font-medium">Oui</span>
                    </div>
                  )}
                </div>

                {entry.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
