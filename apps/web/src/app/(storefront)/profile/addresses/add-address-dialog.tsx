'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { 
  Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@ankita/ui'
import { toast } from 'sonner'

export function AddAddressDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAddress = {
      id: Date.now().toString(),
      name: formData.name,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      pincode: formData.zipCode,
      phone: formData.phone,
    }

    try {
      const existing = JSON.parse(localStorage.getItem('ankita_user_addresses') || '[]')
      existing.push(newAddress)
      localStorage.setItem('ankita_user_addresses', JSON.stringify(existing))
      localStorage.setItem('ankita_delivery_address', JSON.stringify(newAddress))
      window.dispatchEvent(new Event('address-updated'))
      toast.success('Address saved successfully!')
      setOpen(false)
      setFormData({ name: '', street: '', city: '', state: '', zipCode: '', phone: '' })
    } catch {
      toast.error('Failed to save address')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
          <DialogDescription>
            Enter your shipping and delivery address details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="addr-name">Full Name *</Label>
              <Input
                id="addr-name"
                required
                placeholder="Receiver name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addr-phone">Mobile Number *</Label>
              <Input
                id="addr-phone"
                required
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addr-street">Street Address *</Label>
              <Input
                id="addr-street"
                required
                placeholder="Flat / House No., Colony / Street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="addr-city">City *</Label>
                <Input
                  id="addr-city"
                  required
                  placeholder="e.g. Surat"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="addr-state">State *</Label>
                <Input
                  id="addr-state"
                  required
                  placeholder="e.g. Gujarat"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addr-zip">PIN Code *</Label>
              <Input
                id="addr-zip"
                required
                placeholder="6-digit PIN"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Address</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
