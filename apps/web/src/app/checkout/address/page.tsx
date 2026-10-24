'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button, Input, Label } from '@ankita/ui'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'
import { toast } from 'sonner'

export default function CheckoutAddressPage() {
  const router = useRouter()
  const { totalAmount, items, itemCount } = useCart()
  const { user } = useAuth()

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    // Check if saved in localStorage
    const saved = localStorage.getItem('ankita_delivery_address')
    if (saved) {
      try {
        setAddress(JSON.parse(saved))
      } catch {}
    } else if (user) {
      setAddress((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()

    if (!address.name.trim() || !address.phone.trim() || !address.street.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      toast.error('Please fill in all address fields')
      return
    }

    if (address.phone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    if (address.pincode.trim().length < 6) {
      toast.error('Please enter a valid 6-digit PIN code')
      return
    }

    // Persist delivery address
    localStorage.setItem('ankita_delivery_address', JSON.stringify(address))
    toast.success('Address saved')
    router.push('/checkout/payment')
  }

  const shippingFee = totalAmount >= 999 ? 0 : 70
  const finalTotal = totalAmount + shippingFee

  return (
    <div className="container-wide py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {['Address', 'Payment', 'Review'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{step}</span>
              {i < 2 && <span className="text-muted-foreground">›</span>}
            </div>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Delivery Address</h1>
        <p className="text-sm text-muted-foreground">Please provide your complete shipping address for courier delivery.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Address Input Form */}
        <div className="lg:col-span-2">
          <form id="address-form" onSubmit={handleContinue} className="rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-semibold pb-2 border-b">
              <MapPin className="h-5 w-5" />
              <span>Contact & Destination Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cust-name">Full Name *</Label>
                <Input
                  id="cust-name"
                  required
                  placeholder="Recipient Name"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cust-phone">Mobile Number *</Label>
                <Input
                  id="cust-phone"
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cust-street">House / Flat No., Building & Street Address *</Label>
              <Input
                id="cust-street"
                required
                placeholder="e.g. Flat 302, Green Avenue, MG Road"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cust-city">City / District *</Label>
                <Input
                  id="cust-city"
                  required
                  placeholder="e.g. Surat"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cust-state">State *</Label>
                <Input
                  id="cust-state"
                  required
                  placeholder="e.g. Gujarat"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cust-pin">PIN Code *</Label>
                <Input
                  id="cust-pin"
                  required
                  placeholder="e.g. 395002"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg">Order Summary</h2>

            {/* Itemized List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y">
              {items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex gap-3 items-center">
                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-muted border">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(item.productImage)} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs">🛍️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.productName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.color} · {item.size} · Qty: {item.quantity}
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm space-y-2 pt-2 border-t">
              <div className="flex justify-between text-muted-foreground">
                <span>Items ({itemCount || items.length})</span>
                <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-2 border-t text-base">
                <span>Total Payable</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <Button type="submit" form="address-form" className="w-full gap-2 mt-4" size="lg">
              Proceed to Payment <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Safe Delivery via Delhivery Direct</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
