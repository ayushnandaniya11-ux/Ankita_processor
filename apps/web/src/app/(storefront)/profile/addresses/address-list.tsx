'use client'

import { useState, useEffect } from 'react'
import { MapPin, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@ankita/ui'
import { toast } from 'sonner'

export function AddressList() {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadAddresses = () => {
    try {
      const data = JSON.parse(localStorage.getItem('ankita_user_addresses') || '[]')
      setAddresses(data)
    } catch {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
    const handleUpdate = () => loadAddresses()
    window.addEventListener('address-updated', handleUpdate)
    return () => window.removeEventListener('address-updated', handleUpdate)
  }, [])

  const handleDelete = (id: string) => {
    const filtered = addresses.filter((a) => a.id !== id)
    setAddresses(filtered)
    localStorage.setItem('ankita_user_addresses', JSON.stringify(filtered))
    toast.success('Address removed')
  }

  const handleSetDefault = (address: any) => {
    localStorage.setItem('ankita_delivery_address', JSON.stringify(address))
    toast.success('Set as primary delivery address')
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">
      <div className="h-20 bg-muted rounded-xl"></div>
      <div className="h-20 bg-muted rounded-xl"></div>
    </div>
  }

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl border-dashed">
        <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
          <MapPin className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-semibold">No addresses saved</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You haven&apos;t added any addresses yet. Add one above to make checkout faster.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="rounded-xl border bg-card p-5 space-y-3 relative group">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-foreground">{addr.name}</p>
              <p className="text-xs text-muted-foreground">{addr.phone}</p>
            </div>
            <button
              onClick={() => handleDelete(addr.id)}
              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
              title="Delete address"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
          </p>

          <div className="pt-2 border-t flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr)} className="text-xs h-8 gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              Use for Delivery
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
