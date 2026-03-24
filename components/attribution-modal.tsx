"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, User, Phone, CreditCard, Check } from "lucide-react"
import { UserManagementApi } from "@/api/generated/apis/user-management-api"
import { PhoneManagementApi } from "@/api/generated/apis/phone-management-api"
import { SIMCardManagementApi } from "@/api/generated/apis/simcard-management-api"
import { AttributionManagementApi } from "@/api/generated/apis/attribution-management-api"
import { getApiConfig } from "@/lib/apiClient"

interface Attribution {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  userFunction?: string
  hierarchicalManager?: string
  hierarchicalManagerFunction?: string
  phoneId?: string
  phoneModel?: string
  phoneBrand?: string
  phoneImei?: string
  simCardId?: string
  simCardNumber?: string
  assignedBy: string
  assignmentDate: string
  returnDate?: string
  status: "ACTIVE" | "RETURNED" | "PENDING"
  notes?: string
}

interface AttributionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (attribution: Partial<Attribution>) => void
  attribution: Attribution | null
}

export function AttributionModal({ isOpen, onClose, onSave, attribution }: AttributionModalProps) {
  const [formData, setFormData] = useState<Partial<Attribution>>({
    status: "ACTIVE",
    assignmentDate: new Date().toISOString().split("T")[0],
  })
  const [users, setUsers] = useState<any[]>([])
  const [phones, setPhones] = useState<any[]>([])
  const [simCards, setSimCards] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [showUserSuggestions, setShowUserSuggestions] = useState(false)
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1)
  const userInputRef = useRef<HTMLInputElement>(null)
  const [phoneSearch, setPhoneSearch] = useState("")
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false)
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(-1)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const [simSearch, setSimSearch] = useState("")
  const [showSimSuggestions, setShowSimSuggestions] = useState(false)
  const [selectedSimIndex, setSelectedSimIndex] = useState(-1)
  const simInputRef = useRef<HTMLInputElement>(null)
  const [currentAssignments, setCurrentAssignments] = useState<{ phone?: string; sim?: string }>({})
  const [assignedPhones, setAssignedPhones] = useState<Set<string>>(new Set())
  const [assignedSims, setAssignedSims] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (attribution) {
      setFormData(attribution)
      setUserSearch((attribution.userName || "") + (attribution.userEmail ? " - " + attribution.userEmail : ""))
      if (attribution.phoneModel) {
        setPhoneSearch(attribution.phoneModel)
      }
      if (attribution.simCardNumber) {
        setSimSearch(attribution.simCardNumber)
      }
    } else {
      setFormData({
        status: "ACTIVE",
        assignmentDate: new Date().toISOString().split("T")[0],
      })
      setUserSearch("")
      setPhoneSearch("")
      setSimSearch("")
    }
  }, [attribution, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const token = localStorage.getItem("jwt_token")
    const fetchData = async () => {
      try {
        const userApi = new UserManagementApi(getApiConfig(token))
        const phoneApi = new PhoneManagementApi(getApiConfig(token))
        const simApi = new SIMCardManagementApi(getApiConfig(token))
        const attributionApi = new AttributionManagementApi(getApiConfig(token))

        // Fetch data with high limits using allSettled for resilience
        const results = await Promise.allSettled([
          userApi.getUsers(1, 1000),
          phoneApi.getPhones(1, 1000),
          simApi.getSimCards(1, 1000),
          attributionApi.getAttributions(1, 1000),
        ])

        const usersRes = results[0].status === 'fulfilled' ? results[0].value : { data: { users: [] } }
        const phonesRes = results[1].status === 'fulfilled' ? results[1].value : { data: { phones: [] } }
        const simsRes = results[2].status === 'fulfilled' ? results[2].value : { data: { simCards: [] } }
        const attributionsRes = results[3].status === 'fulfilled' ? results[3].value : { data: { attributions: [] } }

        const apiUsers = (usersRes.data as any).users || (usersRes.data as any).data?.users || (Array.isArray(usersRes.data) ? usersRes.data : [])
        const apiPhones = (phonesRes.data as any).phones || (phonesRes.data as any).data?.phones || (Array.isArray(phonesRes.data) ? phonesRes.data : [])
        const apiSims = (simsRes.data as any).simcards || (simsRes.data as any).simCards || (simsRes.data as any).data?.simCards || (Array.isArray(simsRes.data) ? simsRes.data : [])
        const apiAttributions = (attributionsRes.data as any).attributions || (attributionsRes.data as any).data?.attributions || (Array.isArray(attributionsRes.data) ? attributionsRes.data : [])

        const assignedPhoneIds = new Set<string>()
        const assignedSimIds = new Set<string>()

        apiAttributions.forEach((attr: any) => {
          if (attr.status === "ACTIVE") {
            if (attr.phoneId) assignedPhoneIds.add(attr.phoneId.toString())
            if (attr.simCardId) assignedSimIds.add(attr.simCardId.toString())
          }
        })

        // Also check directly assigned items
        apiPhones.forEach((p: any) => { if (p.status === "ASSIGNED") assignedPhoneIds.add(p.id.toString()) })
        apiSims.forEach((s: any) => { if (s.status === "ASSIGNED") assignedSimIds.add(s.id.toString()) })

        setUsers(apiUsers)
        setPhones(apiPhones)
        setSimCards(apiSims)
        setAssignedPhones(assignedPhoneIds)
        setAssignedSims(assignedSimIds)
      } catch (err) {
        console.error("Error fetching data for AttributionModal:", err)
      }
    }
    fetchData()
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.userId) {
      alert("Veuillez sélectionner un utilisateur.")
      return
    }
    onSave(formData)
  }

  const handleChange = (field: keyof Attribution, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const filteredUsers = users.filter((u) => {
    const search = userSearch.toLowerCase()
    return (u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search) || u.department?.toLowerCase().includes(search))
  })

  const handleUserSelect = async (userId: string) => {
    const selectedUser = users.find((u) => u.id === userId)
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        userId,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        userPhone: selectedUser.phone,
        userFunction: selectedUser.position || "Agent Administratif",
        hierarchicalManager: selectedUser.manager || "Yassine ELHADI",
        hierarchicalManagerFunction: users.find(u => u.name === selectedUser.manager)?.position || "Chef Département Moyens Généraux",
      }))
      setUserSearch(selectedUser.name + " - " + selectedUser.email)
      setShowUserSuggestions(false)
      setSelectedUserIndex(-1)
      await fetchCurrentAssignments(userId)
    }
  }

  const fetchCurrentAssignments = async (userId: string) => {
    try {
      const token = localStorage.getItem("jwt_token")
      const attributionApi = new AttributionManagementApi(getApiConfig(token))
      const res = await attributionApi.getAttributions(1, 10, undefined, parseInt(userId))
      const attrs = (res.data as any).attributions || (Array.isArray(res.data) ? res.data : [])
      if (attrs.length > 0) {
        const last = attrs.sort((a: any, b: any) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime())[0]
        setCurrentAssignments({
          phone: last.phoneModel || last.phone?.model,
          sim: last.simCardNumber || last.simCard?.number,
        })
      }
    } catch (e) {
      console.error("Error fetching assignments:", e)
    }
  }

  const filteredPhones = phones.filter((p) => {
    if (assignedPhones.has(p.id.toString())) return false
    const search = phoneSearch.toLowerCase()
    return (p.model?.toLowerCase().includes(search) || p.brand?.toLowerCase().includes(search) || p.imei?.includes(search))
  })

  const handlePhoneSelect = (phoneId: string) => {
    if (phoneId === "none") {
      setFormData((prev) => ({ ...prev, phoneId: undefined, phoneModel: undefined, phoneBrand: undefined, phoneImei: undefined }))
      setPhoneSearch("")
    } else {
      const p = phones.find((px) => px.id === phoneId)
      if (p) {
        setFormData((prev) => ({
          ...prev,
          phoneId,
          phoneModel: p.model,
          phoneBrand: p.brand,
          phoneImei: p.imei,
        }))
        setPhoneSearch(`${p.brand || ""} ${p.model || ""}`.trim())
      }
    }
    setShowPhoneSuggestions(false)
    setSelectedPhoneIndex(-1)
  }

  const filteredSims = simCards.filter((s) => {
    if (assignedSims.has(s.id.toString())) return false
    const search = simSearch.toLowerCase()
    return (s.number?.toLowerCase().includes(search) || s.iccid?.toLowerCase().includes(search))
  })

  const handleSimSelect = (simId: string) => {
    if (simId === "none") {
      setFormData((prev) => ({ ...prev, simCardId: undefined, simCardNumber: undefined }))
      setSimSearch("")
    } else {
      const s = simCards.find((sx) => sx.id === simId)
      if (s) {
        setFormData((prev) => ({ ...prev, simCardId: simId, simCardNumber: s.number }))
        setSimSearch(s.number)
      }
    }
    setShowSimSuggestions(false)
    setSelectedSimIndex(-1)
  }

  const handleUserKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setSelectedUserIndex((p) => Math.min(p + 1, filteredUsers.length - 1))
    else if (e.key === "ArrowUp") setSelectedUserIndex((p) => Math.max(p - 1, -1))
    else if (e.key === "Enter" && selectedUserIndex >= 0) handleUserSelect(filteredUsers[selectedUserIndex].id)
    else if (e.key === "Escape") setShowUserSuggestions(false)
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setSelectedPhoneIndex((p) => Math.min(p + 1, filteredPhones.length))
    else if (e.key === "ArrowUp") setSelectedPhoneIndex((p) => Math.max(p - 1, -1))
    else if (e.key === "Enter" && selectedPhoneIndex >= 0) {
      if (selectedPhoneIndex === 0) handlePhoneSelect("none")
      else handlePhoneSelect(filteredPhones[selectedPhoneIndex - 1].id)
    } else if (e.key === "Escape") setShowPhoneSuggestions(false)
  }

  const handleSimKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setSelectedSimIndex((p) => Math.min(p + 1, filteredSims.length))
    else if (e.key === "ArrowUp") setSelectedSimIndex((p) => Math.max(p - 1, -1))
    else if (e.key === "Enter" && selectedSimIndex >= 0) {
      if (selectedSimIndex === 0) handleSimSelect("none")
      else handleSimSelect(filteredSims[selectedSimIndex - 1].id)
    } else if (e.key === "Escape") setShowSimSuggestions(false)
  }

  const highlightText = (text: string, search: string) => {
    if (!search) return text
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(${escaped})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{attribution ? "Modifier l'Attribution" : "Nouvelle Attribution"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Utilisateur *</Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={userInputRef}
                    placeholder="Rechercher un utilisateur"
                    value={userSearch}
                    onChange={(e) => { setUserSearch(e.target.value); setShowUserSuggestions(true); setSelectedUserIndex(-1) }}
                    onFocus={() => setShowUserSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowUserSuggestions(false), 200)}
                    onKeyDown={handleUserKeyDown}
                    className="pl-10"
                  />
                </div>
                {showUserSuggestions && userSearch && (
                  <div className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-lg">
                    {filteredUsers.map((u, i) => (
                      <div
                        key={u.id}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 ${i === selectedUserIndex ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
                        onMouseDown={() => handleUserSelect(u.id)}
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium" dangerouslySetInnerHTML={{ __html: highlightText(u.name || "", userSearch) }} />
                          <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: highlightText(u.email || "", userSearch) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status || "ACTIVE"} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="RETURNED">Retourné</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <div className="relative">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={phoneInputRef}
                    placeholder="Rechercher un téléphone"
                    value={phoneSearch}
                    onChange={(e) => { setPhoneSearch(e.target.value); setShowPhoneSuggestions(true); setSelectedPhoneIndex(-1) }}
                    onFocus={() => setShowPhoneSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
                    onKeyDown={handlePhoneKeyDown}
                    className="pl-10"
                  />
                </div>
                {showPhoneSuggestions && phoneSearch && (
                  <div className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-lg">
                    <div className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${selectedPhoneIndex === 0 ? "bg-blue-50" : ""}`} onMouseDown={() => handlePhoneSelect("none")}>Aucun téléphone</div>
                    {filteredPhones.map((p, i) => (
                      <div key={p.id} className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${i + 1 === selectedPhoneIndex ? "bg-blue-50" : ""}`} onMouseDown={() => handlePhoneSelect(p.id)}>
                        <div className="font-medium">{p.brand} {p.model}</div>
                        <div className="text-sm text-gray-500">{p.imei}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Carte SIM</Label>
              <div className="relative">
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={simInputRef}
                    placeholder="Rechercher une SIM"
                    value={simSearch}
                    onChange={(e) => { setSimSearch(e.target.value); setShowSimSuggestions(true); setSelectedSimIndex(-1) }}
                    onFocus={() => setShowSimSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSimSuggestions(false), 200)}
                    onKeyDown={handleSimKeyDown}
                    className="pl-10"
                  />
                </div>
                {showSimSuggestions && simSearch && (
                  <div className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-lg">
                    <div className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${selectedSimIndex === 0 ? "bg-blue-50" : ""}`} onMouseDown={() => handleSimSelect("none")}>Aucune SIM</div>
                    {filteredSims.map((s, i) => (
                      <div key={s.id} className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${i + 1 === selectedSimIndex ? "bg-blue-50" : ""}`} onMouseDown={() => handleSimSelect(s.id)}>
                        <div className="font-medium">{s.number}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date d'attribution</Label>
              <Input type="date" value={formData.assignmentDate || ""} onChange={(e) => handleChange("assignmentDate", e.target.value)} required />
            </div>
            {formData.status === "RETURNED" && (
              <div className="space-y-2">
                <Label>Date de retour</Label>
                <Input type="date" value={formData.returnDate || ""} onChange={(e) => handleChange("returnDate", e.target.value)} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={formData.notes || ""} onChange={(e) => handleChange("notes", e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              {attribution ? "Modifier" : "Créer"} l'Attribution
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
