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
import { UserManagementApi, PhoneManagementApi, SIMCardManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

interface Attribution {
  id: string
  userId: string
  userName: string
  userEmail: string
  phoneId?: string
  phoneModel?: string
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
  const [users, setUsers] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [simCards, setSimCards] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const userInputRef = useRef<HTMLInputElement>(null);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(-1);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [simSearch, setSimSearch] = useState("");
  const [showSimSuggestions, setShowSimSuggestions] = useState(false);
  const [selectedSimIndex, setSelectedSimIndex] = useState(-1);
  const simInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (attribution) {
      setFormData(attribution)
      setUserSearch(attribution.userName + " - " + attribution.userEmail);
      if (attribution.phoneModel) {
        setPhoneSearch(attribution.phoneModel);
      }
      if (attribution.simCardNumber) {
        setSimSearch(attribution.simCardNumber);
      }
    } else {
      setFormData({
        status: "ACTIVE",
        assignmentDate: new Date().toISOString().split("T")[0],
      })
      setUserSearch("");
      setPhoneSearch("");
      setSimSearch("");
    }
  }, [attribution, isOpen])

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("jwt_token");
    const fetchData = async () => {
      try {
        const userApi = new UserManagementApi(getApiConfig(token));
        const phoneApi = new PhoneManagementApi(getApiConfig(token));
        const simApi = new SIMCardManagementApi(getApiConfig(token));
        
        // Fetch all users with pagination to get complete list
        const usersRes = await userApi.getUsers(
          1,        // page
          1000,     // limit - high number to get all users
          undefined, // search
          undefined, // department
          undefined, // status
          undefined  // role
        );
        
        console.log("Attribution Modal - Users API Response:", usersRes);
        
        const phonesRes = await phoneApi.getPhones();
        const simsRes = await simApi.getSimCards();
        
        const responseData = usersRes.data as any;
        let apiUsers: any[] = [];
        
        // Handle different response structures
        if (responseData.success && responseData.data) {
          apiUsers = (responseData.data.users as any[]) || [];
        } else if (responseData.users) {
          apiUsers = (responseData.users as any[]) || [];
        } else if (Array.isArray(responseData)) {
          apiUsers = responseData;
        }
        
        console.log("Attribution Modal - Extracted users:", apiUsers);
        console.log("Attribution Modal - Total users loaded:", apiUsers.length);
        
        setUsers(apiUsers);
        setPhones((phonesRes.data.data as any)?.phones || []);
        setSimCards((simsRes.data.data as any)?.simcards || []);
      } catch (err) {
        console.error("Attribution Modal - Error fetching data:", err);
        setUsers([]); setPhones([]); setSimCards([]);
      }
    };
    fetchData();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: keyof Attribution, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Enhanced user filtering with better search
  const filteredUsers = users.filter((user) => {
    const searchLower = userSearch.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(searchLower);
    const emailMatch = user.email?.toLowerCase().includes(searchLower);
    const deptMatch = user.department?.toLowerCase().includes(searchLower);
    
    // Debug logging for search
    if (userSearch.trim()) {
      console.log(`Attribution Modal - User ${user.name}: name=${nameMatch}, email=${emailMatch}, dept=${deptMatch}`);
    }
    
    return nameMatch || emailMatch || deptMatch;
  });

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find((u) => u.id === userId)
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        userId,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
      }))
      setUserSearch(selectedUser.name + " - " + selectedUser.email);
      setShowUserSuggestions(false);
      setSelectedUserIndex(-1);
    }
  }

  // Enhanced phone filtering
  const filteredPhones = phones.filter(
    (phone) =>
      phone.model?.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      phone.brand?.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      phone.serialNumber?.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      phone.imei?.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      phone.color?.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      phone.storage?.toLowerCase().includes(phoneSearch.toLowerCase())
  );

  const handlePhoneSelect = (phoneId: string) => {
    if (phoneId === "none") {
      setFormData((prev) => ({
        ...prev,
        phoneId: undefined,
        phoneModel: undefined,
      }))
      setPhoneSearch("");
      setShowPhoneSuggestions(false);
      setSelectedPhoneIndex(-1);
    } else {
      const selectedPhone = phones.find((p) => p.id === phoneId)
      if (selectedPhone) {
        setFormData((prev) => ({
          ...prev,
          phoneId,
          phoneModel: selectedPhone.model,
        }))
        setPhoneSearch(`${selectedPhone.brand || ''} ${selectedPhone.model || ''} ${selectedPhone.storage || ''}${selectedPhone.storage ? ' ' : ''}${selectedPhone.color ? `(${selectedPhone.color})` : ''}`.trim());
        setShowPhoneSuggestions(false);
        setSelectedPhoneIndex(-1);
      }
    }
  }

  // Enhanced SIM filtering
  const filteredSims = simCards.filter(
    (sim) =>
      sim.number?.toLowerCase().includes(simSearch.toLowerCase()) ||
      sim.carrier?.toLowerCase().includes(simSearch.toLowerCase()) ||
      sim.iccid?.toLowerCase().includes(simSearch.toLowerCase())
  );

  const handleSimSelect = (simId: string) => {
    if (simId === "none") {
      setFormData((prev) => ({
        ...prev,
        simCardId: undefined,
        simCardNumber: undefined,
      }))
      setSimSearch("");
      setShowSimSuggestions(false);
      setSelectedSimIndex(-1);
    } else {
      const selectedSim = simCards.find((s) => s.id === simId)
      if (selectedSim) {
        setFormData((prev) => ({
          ...prev,
          simCardId: simId,
          simCardNumber: selectedSim.number,
        }))
        setSimSearch(selectedSim.number);
        setShowSimSuggestions(false);
        setSelectedSimIndex(-1);
      }
    }
  }

  // Keyboard navigation for user suggestions
  const handleUserKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedUserIndex(prev => Math.min(prev + 1, filteredUsers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedUserIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedUserIndex >= 0) {
      e.preventDefault();
      handleUserSelect(filteredUsers[selectedUserIndex].id);
    } else if (e.key === 'Escape') {
      setShowUserSuggestions(false);
      setSelectedUserIndex(-1);
    }
  };

  // Keyboard navigation for phone suggestions
  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedPhoneIndex(prev => Math.min(prev + 1, filteredPhones.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedPhoneIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedPhoneIndex >= 0) {
      e.preventDefault();
      if (selectedPhoneIndex === 0) {
        handlePhoneSelect("none");
      } else {
        handlePhoneSelect(filteredPhones[selectedPhoneIndex - 1].id);
      }
    } else if (e.key === 'Escape') {
      setShowPhoneSuggestions(false);
      setSelectedPhoneIndex(-1);
    }
  };

  // Keyboard navigation for SIM suggestions
  const handleSimKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSimIndex(prev => Math.min(prev + 1, filteredSims.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSimIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedSimIndex >= 0) {
      e.preventDefault();
      if (selectedSimIndex === 0) {
        handleSimSelect("none");
      } else {
        handleSimSelect(filteredSims[selectedSimIndex - 1].id);
      }
    } else if (e.key === 'Escape') {
      setShowSimSuggestions(false);
      setSelectedSimIndex(-1);
    }
  };

  // Highlight search term in text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    // Escape special regex characters to prevent "nothing to repeat" error
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{attribution ? "Modifier l'Attribution" : "Nouvelle Attribution"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user">Utilisateur *</Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={userInputRef}
                  type="text"
                  placeholder="Rechercher un utilisateur"
                  value={userSearch}
                  onChange={e => {
                    setUserSearch(e.target.value);
                    setShowUserSuggestions(true);
                      setSelectedUserIndex(-1);
                  }}
                  onFocus={() => setShowUserSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowUserSuggestions(false), 200)}
                    onKeyDown={handleUserKeyDown}
                    className="pl-10"
                />
                </div>
                {showUserSuggestions && userSearch && (
                  <div className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-lg">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 ${
                            index === selectedUserIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                          }`}
                          onMouseDown={() => handleUserSelect(user.id)}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium" dangerouslySetInnerHTML={{ 
                              __html: highlightText(user.name || '', userSearch) 
                            }} />
                            <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ 
                              __html: highlightText(user.email || '', userSearch) 
                            }} />
                            {user.department && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {user.department}
                              </Badge>
                            )}
                          </div>
                          {index === selectedUserIndex && <Check className="h-4 w-4 text-blue-500" />}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">Aucun utilisateur trouvé</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status || "ACTIVE"} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
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
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <div className="relative">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={phoneInputRef}
                  type="text"
                  placeholder="Rechercher un téléphone"
                  value={phoneSearch}
                  onChange={e => {
                    setPhoneSearch(e.target.value);
                    setShowPhoneSuggestions(true);
                      setSelectedPhoneIndex(-1);
                  }}
                  onFocus={() => setShowPhoneSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
                    onKeyDown={handlePhoneKeyDown}
                    className="pl-10"
                />
                </div>
                {showPhoneSuggestions && phoneSearch && (
                  <div className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-lg">
                    <div
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 ${
                        selectedPhoneIndex === 0 ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                      onMouseDown={() => handlePhoneSelect("none")}
                    >
                      <div className="text-gray-500 italic">Aucun téléphone</div>
                      {selectedPhoneIndex === 0 && <Check className="h-4 w-4 text-blue-500 ml-auto" />}
                    </div>
                    {filteredPhones.map((phone, index) => (
                        <div
                          key={phone.id}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 ${
                          index + 1 === selectedPhoneIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                          onMouseDown={() => handlePhoneSelect(phone.id)}
                        >
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium" dangerouslySetInnerHTML={{ 
                            __html: highlightText(`${phone.brand || ''} ${phone.model || ''}`, phoneSearch) 
                          }} />
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center space-x-2">
                              {phone.storage && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {phone.storage}
                                </span>
                              )}
                              {phone.color && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-medium">
                                  🎨 {phone.color}
                                </span>
                              )}
                              {phone.status && (
                                <Badge variant="outline" className="text-xs">
                                  {phone.status}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {phone.imei && `IMEI: ${phone.imei}`}
                              {phone.serialNumber && phone.imei && ' • '}
                              {phone.serialNumber && `S/N: ${phone.serialNumber}`}
                            </div>
                            {phone.condition && (
                              <div className="text-xs">
                                <span className={`px-2 py-1 rounded ${
                                  phone.condition === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                                  phone.condition === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                                  phone.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {phone.condition}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {index + 1 === selectedPhoneIndex && <Check className="h-4 w-4 text-blue-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simCard">Carte SIM (optionnel)</Label>
              <div className="relative">
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={simInputRef}
                  type="text"
                  placeholder="Rechercher une carte SIM"
                  value={simSearch}
                  onChange={e => {
                    setSimSearch(e.target.value);
                    setShowSimSuggestions(true);
                      setSelectedSimIndex(-1);
                  }}
                  onFocus={() => setShowSimSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSimSuggestions(false), 200)}
                    onKeyDown={handleSimKeyDown}
                    className="pl-10"
                />
                </div>
                {showSimSuggestions && simSearch && (
                  <div className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-lg">
                    <div
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 ${
                        selectedSimIndex === 0 ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                      onMouseDown={() => handleSimSelect("none")}
                    >
                      <div className="text-gray-500 italic">Aucune carte SIM</div>
                      {selectedSimIndex === 0 && <Check className="h-4 w-4 text-blue-500 ml-auto" />}
                    </div>
                    {filteredSims.map((sim, index) => (
                        <div
                          key={sim.id}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 ${
                          index + 1 === selectedSimIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                          onMouseDown={() => handleSimSelect(sim.id)}
                        >
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium" dangerouslySetInnerHTML={{ 
                            __html: highlightText(sim.number || '', simSearch) 
                          }} />
                          <div className="text-sm text-gray-500">
                            {sim.carrier && `${sim.carrier} • `}{sim.plan}
                            {sim.status && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {sim.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {index + 1 === selectedSimIndex && <Check className="h-4 w-4 text-blue-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignmentDate">Date d'attribution</Label>
              <Input
                id="assignmentDate"
                type="date"
                value={formData.assignmentDate || ""}
                onChange={(e) => handleChange("assignmentDate", e.target.value)}
                required
              />
            </div>

                                 {formData.status === "RETURNED" && (
              <div className="space-y-2">
                <Label htmlFor="returnDate">Date de retour</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate || ""}
                  onChange={(e) => handleChange("returnDate", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedBy">Assigné par</Label>
              <Input
                id="assignedBy"
                value={formData.assignedBy || (typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '')}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ajouter des notes sur cette attribution..."
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              {attribution ? "Modifier" : "Créer"} l'Attribution
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
