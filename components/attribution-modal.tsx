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
import { UserManagementApi, PhoneManagementApi, SIMCardManagementApi, AttributionManagementApi } from "@/api/generated";
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
  const [currentAssignments, setCurrentAssignments] = useState<{ phone?: string; sim?: string; }>({});
  const [assignedPhones, setAssignedPhones] = useState<Set<string>>(new Set());
  const [assignedSims, setAssignedSims] = useState<Set<string>>(new Set());

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
        const attributionApi = new AttributionManagementApi(getApiConfig(token));
        
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
        
        // Fetch all phones and SIMs with high limits to get complete lists
        const phonesRes = await phoneApi.getPhones(1, 1000);
        const simsRes = await simApi.getSimCards(1, 1000);
        
                 // Fetch all attributions (both active and returned) to track what's already assigned
         const attributionsRes = await attributionApi.getAttributions(
           1,        // page
           1000,     // limit
           undefined, // status - get all attributions (ACTIVE, RETURNED, PENDING)
           undefined, // userId
           undefined, // assignedBy
           undefined  // search
         );
        
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
        
        // Extract phones and SIMs data
        let apiPhones: any[] = [];
        let apiSims: any[] = [];
        
        if (phonesRes.data && typeof phonesRes.data === 'object') {
          const phoneData = phonesRes.data as any;
          if (phoneData.success && phoneData.data) {
            apiPhones = (phoneData.data.phones as any[]) || [];
          } else if (phoneData.phones) {
            apiPhones = (phoneData.phones as any[]) || [];
          } else if (Array.isArray(phoneData)) {
            apiPhones = phoneData;
          }
        }
        
        if (simsRes.data && typeof simsRes.data === 'object') {
          const simData = simsRes.data as any;
          if (simData.success && simData.data) {
            apiSims = (simData.data.simcards as any[]) || (simData.data.simCards as any[]) || [];
          } else if (simData.simcards) {
            apiSims = (simData.simcards as any[]) || [];
          } else if (simData.simCards) {
            apiSims = (simData.simCards as any[]) || [];
          } else if (Array.isArray(simData)) {
            apiSims = simData;
          }
        }
        
        // Extract attributions to track assigned items
        let attributions: any[] = [];
        if (attributionsRes.data && typeof attributionsRes.data === 'object') {
          const attrData = attributionsRes.data as any;
          if (attrData.success && attrData.data) {
            attributions = (attrData.data.attributions as any[]) || [];
          } else if (attrData.attributions) {
            attributions = (attrData.attributions as any[]) || [];
          } else if (Array.isArray(attrData)) {
            attributions = attrData;
          }
        }
        
                 // Track assigned phones and SIMs (only from ACTIVE attributions)
         const assignedPhoneIds = new Set<string>();
         const assignedSimIds = new Set<string>();
         
         attributions.forEach((attr: any) => {
           // Only consider ACTIVE attributions as currently assigned
           if (attr.status === "ACTIVE") {
             if (attr.phoneId) assignedPhoneIds.add(attr.phoneId.toString());
             if (attr.simCardId) assignedSimIds.add(attr.simCardId.toString());
           }
         });
         
         // Also check for directly assigned SIMs (from SIM cards page)
         apiSims.forEach((sim: any) => {
           if (sim.status === "ASSIGNED" && sim.assignedToId) {
             assignedSimIds.add(sim.id?.toString() || '');
           }
         });
         
         // Also check for directly assigned phones (if any)
         apiPhones.forEach((phone: any) => {
           if (phone.status === "ASSIGNED" && phone.assignedToId) {
             assignedPhoneIds.add(phone.id?.toString() || '');
           }
         });
        
        console.log("Attribution Modal - Extracted users:", apiUsers);
        console.log("Attribution Modal - Total users loaded:", apiUsers.length);
        console.log("Attribution Modal - Total phones loaded:", apiPhones.length);
        console.log("Attribution Modal - Total SIMs loaded:", apiSims.length);
        console.log("Attribution Modal - Assigned phones:", assignedPhoneIds);
        console.log("Attribution Modal - Assigned SIMs:", assignedSimIds);
        
        setUsers(apiUsers);
        setPhones(apiPhones);
        setSimCards(apiSims);
        setAssignedPhones(assignedPhoneIds);
        setAssignedSims(assignedSimIds);
      } catch (err) {
        console.error("Attribution Modal - Error fetching data:", err);
        setUsers([]); setPhones([]); setSimCards([]);
      }
    };
    fetchData();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation: Ensure required fields are present
    if (!formData.userId) {
      alert("Veuillez sélectionner un utilisateur.");
      return;
    }
    
    // Validation: Check for potential conflicts
    if (formData.simCardId && currentAssignments.sim && formData.simCardNumber !== currentAssignments.sim) {
      const confirmReplace = confirm(
        `Cet utilisateur a déjà une carte SIM assignée (${currentAssignments.sim}). ` +
        `Voulez-vous vraiment la remplacer par ${formData.simCardNumber} ?`
      );
      if (!confirmReplace) {
        return;
      }
    }
    
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

  const handleUserSelect = async (userId: string) => {
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
      
      // Fetch current assignments for this user
      await fetchCurrentAssignments(userId);
    }
  }
  
  const fetchCurrentAssignments = async (userId: string) => {
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) return;
      
      const attributionApi = new AttributionManagementApi(getApiConfig(token));
      const simApi = new SIMCardManagementApi(getApiConfig(token));
      
             // Check attributions first (both active and returned to show current assignments)
       const attributionsRes = await attributionApi.getAttributions(
         undefined, // page
         undefined, // limit
         undefined, // status - get all statuses to show current assignments
         parseInt(userId), // userId
         undefined, // assignedBy
         undefined // search
       );
      
      let currentPhone = undefined;
      let currentSim = undefined;
      
      // Extract attribution data
      if (attributionsRes.data && typeof attributionsRes.data === 'object') {
        const responseData = attributionsRes.data as any;
        let attributions: any[] = [];
        
        if (responseData.success && responseData.data) {
          attributions = (responseData.data.attributions as any[]) || [];
        } else if (Array.isArray(responseData)) {
          attributions = responseData;
        } else if (responseData.attributions) {
          attributions = (responseData.attributions as any[]) || [];
        }
        
                 if (attributions.length > 0) {
           // Get the most recent attribution (active or returned)
           const mostRecentAttribution = attributions.sort((a: any, b: any) => 
             new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime()
           )[0];
           
           currentPhone = mostRecentAttribution.phoneModel || mostRecentAttribution.phone?.model;
           currentSim = mostRecentAttribution.simCardNumber || mostRecentAttribution.simCard?.number;
           
           // Add status indicator
           if (mostRecentAttribution.status === "RETURNED") {
             currentPhone = currentPhone ? `${currentPhone} (Retourné)` : undefined;
             currentSim = currentSim ? `${currentSim} (Retourné)` : undefined;
           }
         }
      }
      
      // If no SIM found in attributions, check direct SIM assignments
      if (!currentSim) {
        const simCardsRes = await simApi.getSimCards(
          undefined, // page
          undefined, // limit
          "ASSIGNED", // status
          undefined, // assignedTo
          undefined // search
        );
        
        if (simCardsRes.data && typeof simCardsRes.data === 'object') {
          const responseData = simCardsRes.data as any;
          let simCards: any[] = [];
          
          if (responseData.success && responseData.data) {
            simCards = (responseData.data.simcards as any[]) || (responseData.data.simCards as any[]) || [];
          } else if (Array.isArray(responseData)) {
            simCards = responseData;
          } else if (responseData.simcards) {
            simCards = (responseData.simcards as any[]) || [];
          } else if (responseData.simCards) {
            simCards = (responseData.simCards as any[]) || [];
          }
          
          const userSimCards = simCards.filter((sim: any) => 
            sim.assignedToId === parseInt(userId) || sim.assignedTo?.id === parseInt(userId)
          );
          
          if (userSimCards.length > 0) {
            currentSim = userSimCards[0].number;
          }
        }
      }
      
      setCurrentAssignments({ phone: currentPhone, sim: currentSim });
      console.log(`Current assignments for user ${userId}:`, { phone: currentPhone, sim: currentSim });
      
    } catch (error) {
      console.error(`Error fetching current assignments for user ${userId}:`, error);
    }
  }

  // Enhanced phone filtering - exclude assigned phones
  const filteredPhones = phones.filter(
    (phone) => {
      // Skip if phone is already assigned
      if (assignedPhones.has(phone.id?.toString() || '')) {
        return false;
      }
      
      // Check search criteria
      const searchLower = phoneSearch.toLowerCase();
      return (
        phone.model?.toLowerCase().includes(searchLower) ||
        phone.brand?.toLowerCase().includes(searchLower) ||
        phone.serialNumber?.toLowerCase().includes(searchLower) ||
        phone.imei?.toLowerCase().includes(searchLower) ||
        phone.color?.toLowerCase().includes(searchLower) ||
        phone.storage?.toLowerCase().includes(searchLower)
      );
    }
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

  // Enhanced SIM filtering - exclude assigned SIMs and ensure one SIM per user
  const filteredSims = simCards.filter(
    (sim) => {
      // Skip if SIM is already assigned
      if (assignedSims.has(sim.id?.toString() || '')) {
        return false;
      }
      
      // Skip if user already has a SIM (one SIM per user rule)
      if (formData.userId && sim.assignedToId === parseInt(formData.userId)) {
        return false;
      }
      
      // Check search criteria
      const searchLower = simSearch.toLowerCase();
      return (
        sim.number?.toLowerCase().includes(searchLower) ||
        sim.carrier?.toLowerCase().includes(searchLower) ||
        sim.iccid?.toLowerCase().includes(searchLower)
      );
    }
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
              
              {/* Current Assignments Display */}
              {formData.userId && (currentAssignments.phone || currentAssignments.sim) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">Assignations actuelles :</div>
                  <div className="space-y-1 text-sm text-blue-700">
                    {currentAssignments.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>Téléphone : {currentAssignments.phone}</span>
                      </div>
                    )}
                    {currentAssignments.sim && (
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-3 w-3" />
                        <span>SIM : {currentAssignments.sim}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              
              {/* Warning if user already has a SIM */}
              {currentAssignments.sim && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    ⚠️ Cet utilisateur a déjà une carte SIM assignée ({currentAssignments.sim}). 
                    L'attribution d'une nouvelle carte SIM remplacera l'assignation existante.
                  </div>
                </div>
              )}
              
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
