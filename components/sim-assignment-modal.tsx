"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface SimCard {
  id: string
  number: string
  carrier: string
  plan: string
  dataLimit: string
  monthlyFee: number
}

interface User {
  id: string
  name: string
  email: string
  department: string
}

interface Phone {
  id: string
  model: string
  brand: string
}

interface SimAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (assignment: {
    userId: string
    userName: string
    phoneId?: string
    phoneName?: string
    notes?: string
  }) => void
  simCard?: SimCard | null
}

export function SimAssignmentModal({ isOpen, onClose, onSave, simCard }: SimAssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedPhoneId, setSelectedPhoneId] = useState("")
  const [notes, setNotes] = useState("")
  const [users] = useState<User[]>([
    { id: "1", name: "Jean Dupont", email: "jean.dupont@company.com", department: "IT" },
    { id: "2", name: "Marie Martin", email: "marie.martin@company.com", department: "Sales" },
    { id: "3", name: "Pierre Durand", email: "pierre.durand@company.com", department: "Marketing" },
    { id: "4", name: "Sophie Dubois", email: "sophie.dubois@company.com", department: "HR" },
  ])
  const [phones] = useState<Phone[]>([
    { id: "1", model: "iPhone 15 Pro", brand: "Apple" },
    { id: "2", model: "Galaxy S24", brand: "Samsung" },
    { id: "3", model: "Pixel 8", brand: "Google" },
    { id: "4", model: "iPhone 14", brand: "Apple" },
  ])

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId("")
      setSelectedPhoneId("")
      setNotes("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedUser = users.find((u) => u.id === selectedUserId)
    const selectedPhone = phones.find((p) => p.id === selectedPhoneId)

    if (!selectedUser) return

    onSave({
      userId: selectedUserId,
      userName: selectedUser.name,
      phoneId: selectedPhoneId || undefined,
      phoneName: selectedPhone ? `${selectedPhone.brand} ${selectedPhone.model}` : undefined,
      notes: notes || undefined,
    })
  }

  if (!simCard) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assigner une carte SIM</DialogTitle>
        </DialogHeader>

        {/* SIM Card Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Carte SIM à assigner</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Numéro:</span>
              <span className="ml-2 font-medium">{simCard.number}</span>
            </div>
            <div>
              <span className="text-gray-600">Opérateur:</span>
              <span className="ml-2 font-medium">{simCard.carrier}</span>
            </div>
            <div>
              <span className="text-gray-600">Forfait:</span>
              <span className="ml-2 font-medium">{simCard.plan}</span>
            </div>
            <div>
              <span className="text-gray-600">Data:</span>
              <span className="ml-2 font-medium">{simCard.dataLimit}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Utilisateur *</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{user.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {user.department}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone (optionnel)</Label>
            <Select value={selectedPhoneId} onValueChange={setSelectedPhoneId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un téléphone (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                {phones.map((phone) => (
                  <SelectItem key={phone.id} value={phone.id}>
                    {phone.brand} {phone.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Vous pouvez assigner la carte SIM seule ou avec un téléphone</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur l'attribution..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
              disabled={!selectedUserId}
            >
              Assigner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
