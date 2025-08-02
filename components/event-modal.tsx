"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Tag } from "lucide-react"

interface Event {
  id?: string
  title: string
  description: string
  date: string
  time: string
  type: "assignment" | "return" | "maintenance" | "meeting"
  participants: string[]
  status: "scheduled" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<Event>) => void
  event?: Event | null
}

export function EventModal({ isOpen, onClose, onSave, event }: EventModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "assignment",
    participants: [],
    priority: "medium",
  })
  const [participantInput, setParticipantInput] = useState("")

  useEffect(() => {
    if (event) {
      setFormData(event)
      setParticipantInput("")
    } else {
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        type: "assignment",
        participants: [],
        priority: "medium",
      })
      setParticipantInput("")
    }
  }, [event, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleAddParticipant = () => {
    if (participantInput.trim() && !formData.participants?.includes(participantInput.trim())) {
      setFormData({
        ...formData,
        participants: [...(formData.participants || []), participantInput.trim()],
      })
      setParticipantInput("")
    }
  }

  const handleRemoveParticipant = (participant: string) => {
    setFormData({
      ...formData,
      participants: formData.participants?.filter((p) => p !== participant) || [],
    })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      assignment: "bg-blue-100 text-blue-800",
      return: "bg-green-100 text-green-800",
      maintenance: "bg-orange-100 text-orange-800",
      meeting: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{event ? "Modifier l'événement" : "Nouvel événement"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'événement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.type || "assignment"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Event["type"] })}
              >
                <option value="assignment">Attribution</option>
                <option value="return">Retour</option>
                <option value="maintenance">Maintenance</option>
                <option value="meeting">Réunion</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'événement"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Date *</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Heure *</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time || ""}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>Priorité</span>
              </Label>
              <select
                id="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority || "medium"}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Event["priority"] })}
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                placeholder="Nom du participant"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddParticipant()
                  }
                }}
              />
              <Button type="button" onClick={handleAddParticipant} variant="outline">
                Ajouter
              </Button>
            </div>
            {formData.participants && formData.participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.participants.map((participant, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleRemoveParticipant(participant)}
                  >
                    {participant} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {formData.type && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Type d'événement:</span>
              <Badge className={getTypeColor(formData.type)}>{formData.type}</Badge>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
            >
              {event ? "Modifier" : "Créer"} l'événement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
