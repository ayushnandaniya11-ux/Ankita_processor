'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ankita/ui'
import { toast } from 'sonner'
import apiClient from '@/lib/api/client'

export function InquiryDialog({ 
  open, 
  onOpenChange, 
  selectedCatalog,
  fabricQualities,
  user
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCatalog: any
  fabricQualities: any[]
  user: any
}) {
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    businessName: '',
    contactNumber: user?.phone || '',
    email: user?.email || '',
    cityState: '',
    fabricQualityId: '',
    requiredQuantity: '',
    additionalMessage: '',
  })

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, contactNumber: user.phone || '', email: user.email || '' }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contactNumber || !form.email || !form.requiredQuantity) {
      return toast.error('Please fill in all required fields.')
    }
    
    setLoading(true)
    try {
      await apiClient.post('/wholesale/inquiries', {
        ...form,
        fabricQualityId: form.fabricQualityId ? parseInt(form.fabricQualityId) : null,
        requiredQuantity: parseInt(form.requiredQuantity),
        catalogIds: selectedCatalog ? [selectedCatalog.id] : []
      })
      toast.success('Inquiry submitted successfully!')
      onOpenChange(false)
      // Reset form
      setForm(prev => ({ ...prev, requiredQuantity: '', additionalMessage: '' }))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Submit Wholesale Inquiry</DialogTitle>
            <DialogDescription>
              {selectedCatalog ? `Inquiring about ${selectedCatalog.title}` : 'General Inquiry'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cityState">City & State</Label>
                <Input id="cityState" value={form.cityState} onChange={e => setForm({...form, cityState: e.target.value})} placeholder="e.g. Surat, Gujarat" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input id="contactNumber" required value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fabricQuality">Fabric Quality</Label>
                <Select value={form.fabricQualityId} onValueChange={(val) => setForm({...form, fabricQualityId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricQualities.map((q) => (
                      <SelectItem key={q.id} value={q.id.toString()}>{q.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredQuantity">Required Quantity (Pcs) *</Label>
                <Input id="requiredQuantity" type="number" min="1" required value={form.requiredQuantity} onChange={e => setForm({...form, requiredQuantity: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalMessage">Additional Requirements</Label>
              <Textarea id="additionalMessage" placeholder="Any specific colors, modifications, or notes..." value={form.additionalMessage} onChange={e => setForm({...form, additionalMessage: e.target.value})} />
            </div>
            
            <div className="p-3 bg-muted rounded-md mt-2">
              <p className="text-xs text-muted-foreground text-center">
                Official Contact: Ankita Processors B2B Support<br/>
                Email: b2b@ankitaprocessors.com | Phone: +91 98765 43210
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Inquiry'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
