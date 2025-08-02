"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Edit, Trash2, Clock, User, Phone } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  priority: "low" | "medium" | "high"
  dueDate: string
  status: "todo" | "in-progress" | "review" | "done"
  type: "phone" | "sim" | "support"
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Attribution iPhone 15 Pro",
    description: "Configurer et attribuer iPhone 15 Pro à Marie Dubois",
    assignee: "Randy Riley",
    priority: "high",
    dueDate: "2024-01-15",
    status: "todo",
    type: "phone",
  },
  {
    id: "2",
    title: "Configuration SIM Orange",
    description: "Activer carte SIM Orange pour Pierre Martin",
    assignee: "Randy Riley",
    priority: "medium",
    dueDate: "2024-01-16",
    status: "in-progress",
    type: "sim",
  },
  {
    id: "3",
    title: "Support technique Galaxy S23",
    description: "Résoudre problème de connexion WiFi",
    assignee: "Randy Riley",
    priority: "low",
    dueDate: "2024-01-17",
    status: "review",
    type: "support",
  },
  {
    id: "4",
    title: "Retour iPhone 12",
    description: "Traiter le retour d'iPhone 12 de Sophie Laurent",
    assignee: "Randy Riley",
    priority: "medium",
    dueDate: "2024-01-14",
    status: "done",
    type: "phone",
  },
]

const columns = [
  { id: "todo", title: "À faire", color: "bg-gray-100" },
  { id: "in-progress", title: "En cours", color: "bg-blue-100" },
  { id: "review", title: "En révision", color: "bg-yellow-100" },
  { id: "done", title: "Terminé", color: "bg-green-100" },
]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const { toast } = useToast()

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetails(true)
    toast({
      title: "Détails de la tâche",
      description: `Affichage des détails pour "${task.title}"`,
    })
  }

  const handleEditTask = (task: Task) => {
    toast({
      title: "Modification de tâche",
      description: `Modification de la tâche "${task.title}"`,
    })
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    toast({
      title: "Tâche supprimée",
      description: "La tâche a été supprimée avec succès",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className="h-4 w-4" />
      case "sim":
        return <Phone className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="space-y-3">
            <div className={`p-3 rounded-lg ${column.color}`}>
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <p className="text-sm text-gray-600">{getTasksByStatus(column.id).length} tâches</p>
            </div>

            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <Card key={task.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(task.type)}
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTask(task)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                          {task.assignee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleViewTask(task)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Details Modal */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedTask && getTypeIcon(selectedTask.type)}
              <span>{selectedTask?.title}</span>
            </DialogTitle>
            <DialogDescription>Détails de la tâche</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Assigné à</h4>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {selectedTask.assignee
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{selectedTask.assignee}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Priorité</h4>
                  <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Date d'échéance</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{new Date(selectedTask.dueDate).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Statut</h4>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
