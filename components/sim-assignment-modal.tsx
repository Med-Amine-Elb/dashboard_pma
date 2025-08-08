"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { UserManagementApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"

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
  const [notes, setNotes] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId("")
      setNotes("")
      setSearchTerm("")
      setIsDropdownOpen(false)
    } else {
      fetchUsers()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("jwt_token")
      if (!token) return

      const userApi = new UserManagementApi(getApiConfig(token))
      
      // Fetch all users with pagination to get complete list
      const usersRes = await userApi.getUsers(
        1,        // page
        1000,     // limit - high number to get all users
        undefined, // search
        undefined, // department
        undefined, // status
        undefined  // role
      )
      
      console.log("Users API Response:", usersRes)
      
      const responseData = usersRes.data as any
      let apiUsers: any[] = []
      
      // Handle different response structures
      if (responseData.success && responseData.data) {
        apiUsers = (responseData.data.users as any[]) || []
      } else if (responseData.users) {
        apiUsers = (responseData.users as any[]) || []
      } else if (Array.isArray(responseData)) {
        apiUsers = responseData
      }
      
      console.log("Extracted users:", apiUsers)
      
      const transformedUsers: User[] = apiUsers.map((user: any) => ({
        id: user.id?.toString() || "",
        name: user.name || user.username || "",
        email: user.email || "",
        department: user.department || "",
      }))
      
      console.log("Transformed users:", transformedUsers)
      
      setUsers(transformedUsers)
      setFilteredUsers(transformedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    
    console.log("Search term:", value)
    console.log("Available users:", users)
    
    if (!value.trim()) {
      setFilteredUsers(users)
      setIsDropdownOpen(false) // Hide dropdown when search is empty
      return
    }
    
    // Show dropdown only when user starts typing
    setIsDropdownOpen(true)
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.department.toLowerCase().includes(value.toLowerCase())
    )
    
    console.log("Filtered users:", filtered)
    setFilteredUsers(filtered)
  }

  const handleUserSelect = (user: User) => {
    setSelectedUserId(user.id)
    setSearchTerm(user.name)
    setIsDropdownOpen(false)
  }

  const handleInputFocus = () => {
    // Only show dropdown if there's a search term or if we have users to show
    if (searchTerm.trim() || users.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  const handleInputBlur = () => {
    // Delay closing to allow for click on dropdown items
    setTimeout(() => {
      setIsDropdownOpen(false)
    }, 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedUser = users.find((u) => u.id === selectedUserId)

    if (!selectedUser) return

    onSave({
      userId: selectedUserId,
      userName: selectedUser.name,
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
            <div className="relative">
                             <Input
                 id="user"
                 type="text"
                 placeholder="Rechercher un utilisateur..."
                 value={searchTerm}
                 onChange={(e) => handleSearchChange(e.target.value)}
                 onFocus={handleInputFocus}
                 onBlur={handleInputBlur}
                 required
                 className="w-full"
               />
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Chargement des utilisateurs...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {user.department}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
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
