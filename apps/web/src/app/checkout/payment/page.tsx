'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Banknote } from 'lucide-react'
import { Button, Card, CardContent } from '@ankita/ui'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'

import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPaymentPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const { user } = useAuth()
  const [method, setMethod] = useState<'ONLINE' | 'COD'>('ONLINE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingAddressText, setShippingAddressText] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    const saved = localStorage.getItem('ankita_delivery_address')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setRecipientName(parsed.name || user?.name || '')
        setRecipientPhone(parsed.phone || user?.phone || '')
        setShippingAddressText(`${parsed.name}, ${parsed.street}, ${parsed.city}, ${parsed.state} - ${parsed.pincode}. Contact: ${parsed.phone}`)
      } catch {}
    }
  }, [user])

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    const currentAddress = shippingAddressText || 'Customer Delivery Address, India'
    if (!shippingAddressText) {
      toast.error('Please specify your delivery address first')
      router.push('/checkout/address')
      return
    }

    setIsProcessing(true)

    try {
      // 1. Create Order on Backend with sanitized numeric product IDs and quantities
      const checkoutItems = items.map((it) => ({
        productId: Number(it.productId) || 1,
        quantity: Number(it.quantity) || 1,
      }))

      const res = await apiClient.post('/checkout', {
        items: checkoutItems,
        paymentMethod: method,
        shippingAddress: currentAddress,
        billingAddress: currentAddress,
        totalAmount
      })

      if (method === 'COD') {
        toast.success('Order placed successfully via COD!')
        clearCart()
        router.push('/checkout/success?orderNo=' + res.data.order.orderNo)
      } else if (method === 'ONLINE') {
        // 2. Initialize Razorpay Checkout
        const { razorpayOrderId, amount } = res.data

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_PAYMENT_PROVIDER_KEY || 'rzp_test_123456789',
          amount: amount.toString(),
          currency: 'INR',
          name: 'Ankita Processors',
          description: 'E-commerce Purchase',
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            // 3. Verify Payment on Backend
            try {
              await apiClient.post('/orders/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
              
              toast.success('Payment successful! Order placed.')
              clearCart()
              router.push('/checkout/success?orderNo=' + res.data.order.orderNo)
            } catch (verifyErr: any) {
              toast.error('Payment verification failed.')
              console.error(verifyErr)
            }
          },
          prefill: {
            name: recipientName || user?.name || 'Valued Customer',
            email: user?.email || 'customer@example.com',
            contact: recipientPhone || user?.phone || '9999999999'
          },
          theme: {
            color: '#0f172a'
          }
        }

        if (!window.Razorpay) {
          toast.error('Razorpay SDK failed to load. Please check your connection.')
          return
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response: any){
          toast.error('Payment Failed: ' + response.error.description)
        })
        rzp.open()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Failed to process order.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          {['Address', 'Payment', 'Review'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i === 1 ? 'bg-foreground text-background' : i < 1 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i === 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{step}</span>
              {i < 2 && <span className="text-muted-foreground">›</span>}
            </div>
          ))}
        </div>
        <h1 className="text-2xl font-bold">Payment Method</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card 
            className={`cursor-pointer transition-all ${method === 'ONLINE' ? 'border-primary ring-1 ring-primary' : 'hover:border-muted-foreground'}`}
            onClick={() => setMethod('ONLINE')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-full ${method === 'ONLINE' ? 'bg-primary/10' : 'bg-muted'}`}>
                <CreditCard className={`h-6 w-6 ${method === 'ONLINE' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Pay Online (Razorpay)</h3>
                <p className="text-sm text-muted-foreground">Credit Card, Debit Card, UPI, Netbanking</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                {method === 'ONLINE' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${method === 'COD' ? 'border-primary ring-1 ring-primary' : 'hover:border-muted-foreground'}`}
            onClick={() => setMethod('COD')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-full ${method === 'COD' ? 'bg-primary/10' : 'bg-muted'}`}>
                <Banknote className={`h-6 w-6 ${method === 'COD' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Cash on Delivery (COD)</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                    +₹50 COD Fee
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Pay with cash upon delivery. Standard ₹50 handling charge applies for courier COD collection.</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                {method === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-24 shadow-sm">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            {/* Itemized List */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y text-left">
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
                      ₹{(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
              <div className="flex justify-between">
                <span>Items Subtotal ({items.length})</span>
                <span className="text-foreground font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping (Delhivery Express)</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              {method === 'COD' && (
                <div className="flex justify-between items-center text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
                  <span className="font-medium text-xs">Cash on Delivery (COD) Fee:</span>
                  <span className="font-bold text-xs">+₹50.00</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground pt-2 border-t text-base">
                <span>Total Payable</span>
                <span>₹{(method === 'COD' ? totalAmount + 50 : totalAmount).toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={handlePlaceOrder}
              disabled={isProcessing || items.length === 0}
            >
              {isProcessing ? 'Processing...' : method === 'ONLINE' ? 'Pay Securely' : 'Place Order (₹' + (method === 'COD' ? totalAmount + 50 : totalAmount).toFixed(2) + ')'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
