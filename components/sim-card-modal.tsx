"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserManagementApi, PhoneManagementApi } from "@/api/generated";
import { getApiConfig } from "@/lib/apiClient";

interface SimCard {
  id: string
  number: string
  carrier: string
  plan: string
  status: "available" | "assigned" | "suspended" | "expired"
  assignedTo?: string
  assignedPhone?: string
  activationDate: string
  expiryDate: string
  monthlyFee: number
  dataLimit: string
  iccid: string
  pin: string
  puk: string
  notes?: string
}

interface SimCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (simCard: Partial<SimCard>) => void
  simCard?: SimCard | null
}

export function SimCardModal({ isOpen, onClose, onSave, simCard }: SimCardModalProps) {
  const [formData, setFormData] = useState({
    number: "",
    carrier: "",
    plan: "",
    status: "available" as const,
    assignedTo: "",
    assignedPhone: "",
    activationDate: "",
    expiryDate: "",
    monthlyFee: 0,
    dataLimit: "",
    iccid: "",
    pin: "",
    puk: "",
    notes: "",
  })
  const [users, setUsers] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("jwt_token");
    const fetchData = async () => {
      try {
        const userApi = new UserManagementApi(getApiConfig(token));
        const phoneApi = new PhoneManagementApi(getApiConfig(token));
        const usersRes = await userApi.getUsers();
        const phonesRes = await phoneApi.getPhones();
        setUsers(usersRes.data.data?.users || []);
        setPhones(phonesRes.data.data?.phones || []);
      } catch (err) {
        setUsers([]); setPhones([]);
      }
    };
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (simCard) {
      setFormData({
        number: simCard.number,
        carrier: simCard.carrier,
        plan: simCard.plan,
        status: simCard.status,
        assignedTo: simCard.assignedTo || "",
        assignedPhone: simCard.assignedPhone || "",
        activationDate: simCard.activationDate,
        expiryDate: simCard.expiryDate,
        monthlyFee: simCard.monthlyFee,
        dataLimit: simCard.dataLimit,
        iccid: simCard.iccid || "",
        pin: simCard.pin || "",
        puk: simCard.puk || "",
        notes: simCard.notes || "",
      })
    } else {
      setFormData({
        number: "",
        carrier: "",
        plan: "",
        status: "available",
        assignedTo: "",
        assignedPhone: "",
        activationDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        monthlyFee: 0,
        dataLimit: "",
        iccid: "",
        pin: "",
        puk: "",
        notes: "",
      })
    }
  }, [simCard, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const carriers = ["Orange", "SFR", "Bouygues", "Free"]
  const plans = ["Pro 20GB", "Pro 50GB", "Business 100GB", "Enterprise 200GB", "Unlimited"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{simCard ? "Modifier la carte SIM" : "Ajouter une carte SIM"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Numéro de téléphone</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Opérateur</Label>
              <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Forfait</Label>
              <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un forfait" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataLimit">Limite de données</Label>
              <Input
                id="dataLimit"
                value={formData.dataLimit}
                onChange={(e) => setFormData({ ...formData, dataLimit: e.target.value })}
                placeholder="ex: 50GB"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Coût mensuel (€)</Label>
              <Input
                id="monthlyFee"
                type="number"
                step="0.01"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                placeholder="ex: 45.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="assigned">Assignée</SelectItem>
                  <SelectItem value="suspended">Suspendue</SelectItem>
                  <SelectItem value="expired">Expirée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activationDate">Date d'activation</Label>
              <Input
                id="activationDate"
                type="date"
                value={formData.activationDate}
                onChange={(e) => setFormData({ ...formData, activationDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Date d'expiration</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
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
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedPhone">Téléphone associé</Label>
                <Select
                  value={formData.assignedPhone}
                  onValueChange={(value) => setFormData({ ...formData, assignedPhone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un téléphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {phones.map((phone) => (
                      <SelectItem key={phone.id} value={phone.id}>
                        {phone.brand} {phone.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iccid">ICCID</Label>
              <Input
                id="iccid"
                value={formData.iccid}
                onChange={(e) => setFormData({ ...formData, iccid: e.target.value })}
                placeholder="ex: 89014103211118510720"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                placeholder="ex: 1234"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="puk">PUK</Label>
            <Input
              id="puk"
              value={formData.puk}
              onChange={(e) => setFormData({ ...formData, puk: e.target.value })}
              placeholder="ex: 12345678"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              {simCard ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
