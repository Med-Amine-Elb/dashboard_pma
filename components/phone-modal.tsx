"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

interface Phone {
  id: string
  model: string
  brand: string
  status: "AVAILABLE" | "ASSIGNED" | "LOST" | "DAMAGED"
  assignedTo?: string
  assignedToName?: string
  assignedToDepartment?: string
  department?: string
  purchaseDate: string
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
  serialNumber: string
  price: number
  imei: string
  storage: string
  color: string
  notes?: string
}

interface PhoneModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (phone: Partial<Phone>) => void
  phone?: Phone | null
}

export function PhoneModal({ isOpen, onClose, onSave, phone }: PhoneModalProps) {
  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    imei: "",
    serialNumber: "",
    status: "AVAILABLE" as const,
    condition: "EXCELLENT" as const,
    storage: "",
    color: "",
    price: "",
    assignedTo: "",
    department: "",
    purchaseDate: "",
    notes: "",
  })
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const phoneOptions = {
    Apple: [
      "iPhone 16",
      "iPhone 16 Plus",
      "iPhone 16 Pro",
      "iPhone 16 Pro Max",
      "iPhone 16e"
    ],
    Samsung: [
      "Galaxy S25",
      "Galaxy S25+",
      "Galaxy S25 Ultra",
      "Galaxy Z Fold7",
      "Galaxy Z Flip7",
      "Galaxy Z Flip7 FE"
    ]
  };

  const storageOptions = [
    { value: "64GB", label: "64 GB" },
    { value: "128GB", label: "128 GB" },
    { value: "256GB", label: "256 GB" },
    { value: "512GB", label: "512 GB" },
    { value: "1TB", label: "1 TB" }
  ];

  const colorOptions = {
    // Apple iPhone 16 / 16 Plus
    "iPhone 16": ["Black", "White", "Pink", "Teal", "Ultramarine"],
    "iPhone 16 Plus": ["Black", "White", "Pink", "Teal", "Ultramarine"],
    // Apple iPhone 16 Pro / Pro Max
    "iPhone 16 Pro": ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"],
    "iPhone 16 Pro Max": ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"],
    // Apple iPhone 16e
    "iPhone 16e": ["Black", "White"],
    // Samsung Galaxy S25 / S25+
    "Galaxy S25": ["Icy Blue", "Mint", "Navy", "Silver Shadow", "Pink Gold", "Coral Red", "Blue Black"],
    "Galaxy S25+": ["Icy Blue", "Mint", "Navy", "Silver Shadow", "Pink Gold", "Coral Red", "Blue Black"],
    // Samsung Galaxy S25 Ultra
    "Galaxy S25 Ultra": ["Titanium Silver Blue", "Titanium Black", "Titanium White Silver", "Titanium Gray", "Titanium Jade Green", "Titanium Jet Black", "Titanium Pink Gold"],
    // Samsung Z Fold7
    "Galaxy Z Fold7": ["Blue Shadow", "Silver Shadow", "Jetblack"],
    // Samsung Z Flip7
    "Galaxy Z Flip7": ["Blue Shadow", "Jetblack", "Coral Red"],
    // Samsung Z Flip7 FE
    "Galaxy Z Flip7 FE": ["Black", "White"]
  };

  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");

  const conditions = [
    { value: "EXCELLENT", label: "Excellent" },
    { value: "GOOD", label: "Bon" },
    { value: "FAIR", label: "Correct" },
    { value: "POOR", label: "Mauvais" }
  ]

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("jwt_token");
    const fetchData = async () => {
      try {
        const userApi = new UserManagementApi(getApiConfig(token));
        const usersRes = await userApi.getUsers();
        setUsers(usersRes.data.data?.users || []);
        // Optionally fetch brands and departments from backend if you have endpoints
        // setBrands(await fetchBrands());
        // setDepartments(await fetchDepartments());
      } catch (err) {
        setUsers([]); setBrands([]); setDepartments([]);
      }
    };
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (phone) {
      setFormData({
        model: phone.model,
        brand: phone.brand,
        imei: phone.imei,
        serialNumber: phone.serialNumber || "",
        status: phone.status,
        condition: phone.condition || "EXCELLENT",
        storage: phone.storage || "",
        color: phone.color || "",
        price: phone.price ? phone.price.toString() : "",
        assignedTo: phone.assignedTo || "",
        department: phone.department || "",
        purchaseDate: phone.purchaseDate,
        notes: phone.notes || "",
      })
      setCustomBrand(phone.brand !== "Apple" && phone.brand !== "Samsung" ? phone.brand : "");
      setCustomModel((phone.brand !== "Apple" && phone.brand !== "Samsung") ? phone.model : "");
    } else {
      setFormData({
        model: "",
        brand: "",
        imei: "",
        serialNumber: "",
        status: "AVAILABLE",
        condition: "EXCELLENT",
        storage: "",
        color: "",
        price: "",
        assignedTo: "",
        department: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        notes: "",
      })
      setCustomBrand("");
      setCustomModel("");
    }
  }, [phone, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    if (formData.brand === "Autre") {
      dataToSave.brand = customBrand;
      dataToSave.model = customModel;
    }
    // Convert price to number if not empty
    dataToSave.price = dataToSave.price === "" ? 0 : Number(dataToSave.price);
    onSave(dataToSave);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{phone ? "Modifier le téléphone" : "Ajouter un téléphone"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
                             <Select value={formData.brand} onValueChange={(value) => {
                 setFormData({ ...formData, brand: value, model: "", color: "" });
                 setCustomBrand("");
                 setCustomModel("");
               }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apple">Apple</SelectItem>
                  <SelectItem value="Samsung">Samsung</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              {formData.brand === "Autre" && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="customBrand">Nom de la marque</Label>
                                     <Input
                     id="customBrand"
                     type="text"
                     placeholder="Entrer la marque"
                     value={customBrand}
                     onChange={e => {
                       setCustomBrand(e.target.value);
                       setFormData({ ...formData, brand: e.target.value, model: "", color: "" });
                     }}
                     required
                   />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              {(formData.brand === "Apple" || formData.brand === "Samsung") ? (
                <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value, color: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneOptions[formData.brand]?.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : formData.brand === "Autre" ? (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="customModel">Nom du modèle</Label>
                                     <Input
                     id="customModel"
                     type="text"
                     placeholder="Entrer le modèle"
                     value={customModel}
                     onChange={e => {
                       setCustomModel(e.target.value);
                       setFormData({ ...formData, model: e.target.value, color: "" });
                     }}
                     required
                   />
                </div>
              ) : (
                <Input
                  id="model"
                  type="text"
                  placeholder="Sélectionner une marque d'abord"
                  disabled
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI</Label>
              <Input
                id="imei"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                placeholder="ex: 123456789012345"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Numéro de série</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="ex: APL123456789"
              />
            </div>
          </div>

                     <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="storage">Stockage</Label>
               <Select
                 value={formData.storage}
                 onValueChange={(value) => setFormData({ ...formData, storage: value })}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Sélectionner le stockage" />
                 </SelectTrigger>
                 <SelectContent>
                   {storageOptions.map((option) => (
                     <SelectItem key={option.value} value={option.value}>
                       {option.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label htmlFor="color">Couleur</Label>
               <Select
                 value={formData.color}
                 onValueChange={(value) => setFormData({ ...formData, color: value })}
                 disabled={!formData.model || !colorOptions[formData.model]}
               >
                 <SelectTrigger>
                   <SelectValue placeholder={formData.model ? "Sélectionner la couleur" : "Sélectionner un modèle d'abord"} />
                 </SelectTrigger>
                 <SelectContent>
                   {formData.model && colorOptions[formData.model] ? (
                     colorOptions[formData.model].map((color) => (
                       <SelectItem key={color} value={color}>
                         {color}
                       </SelectItem>
                     ))
                   ) : null}
                 </SelectContent>
               </Select>
             </div>
           </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (MAD)</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                value={formData.price === 0 ? "" : formData.price ?? ""}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setFormData({ ...formData, price: val === "" ? undefined : val });
                }}
                placeholder="Prix (MAD)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">État</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show assigned user and department for existing phones (read-only) */}
          {phone && (phone.assignedTo || phone.department) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigné à</Label>
                <Input
                  id="assignedTo"
                  value={phone.assignedToName || phone.assignedTo || "Non assigné"}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  value={phone.assignedToDepartment || phone.department || "Non spécifié"}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Show assignment fields only for new phones or when status is ASSIGNED */}
          {!phone && formData.status === "ASSIGNED" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigné à</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

                     <div className="space-y-2">
             <Label htmlFor="purchaseDate">Date d'achat</Label>
             <Input
               id="purchaseDate"
               type="date"
               value={formData.purchaseDate}
               onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
               required
             />
           </div>

           <div className="space-y-2">
             <Label htmlFor="notes">Notes</Label>
             <Input
               id="notes"
               value={formData.notes}
               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
               placeholder="Notes additionnelles..."
             />
           </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {phone ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
