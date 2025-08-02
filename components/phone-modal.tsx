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
  status: "available" | "assigned" | "maintenance" | "retired"
  assignedTo?: string
  department?: string
  purchaseDate: string
  condition: "excellent" | "good" | "fair" | "poor"
  serialNumber: string
  price: number
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
    status: "available" as const,
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
        storage: phone.storage ? phone.storage.replace('GB', '') : "",
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
        status: "available",
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
    // Add GB to storage if it's not empty and doesn't already have GB
    if (dataToSave.storage && !dataToSave.storage.includes('GB')) {
      dataToSave.storage = dataToSave.storage + 'GB';
    }
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
                setFormData({ ...formData, brand: value, model: "" });
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
                    onChange={e => setCustomBrand(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              {(formData.brand === "Apple" || formData.brand === "Samsung") ? (
                <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
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
                    onChange={e => setCustomModel(e.target.value)}
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
              <Input
                id="storage"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                placeholder="ex: 128"
              />
              <p className="text-xs text-gray-500">Entrez le nombre (ex: 128) - GB sera ajouté automatiquement</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="ex: Noir"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Prix (€)"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
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

          {formData.status === "assigned" && (
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
