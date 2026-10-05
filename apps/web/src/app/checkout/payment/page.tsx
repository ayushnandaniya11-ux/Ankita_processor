'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Banknote } from 'lucide-react'
import { Button, Card, CardContent } from '@ankita/ui'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPaymentPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const [method, setMethod] = useState<'ONLINE' | 'COD'>('ONLINE')
  const [isProcessing, setIsProcessing] = useState(false)

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsProcessing(true)
    
    // We mock address for now
    const dummyAddress = '123 Main St, Mumbai, MH, 400001'

    try {
      // 1. Create Order on Backend
      const res = await apiClient.post('/checkout', {
        items,
        paymentMethod: method,
        shippingAddress: dummyAddress,
        billingAddress: dummyAddress,
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
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_123456789', // test key
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
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999'
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
                <h3 className="font-semibold text-lg">Cash on Delivery (COD)</h3>
                <p className="text-sm text-muted-foreground">Pay with cash upon delivery.</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                {method === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card p-5 space-y-3 sticky top-24">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between"><span>Items ({items.length})</span><span>₹{totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between flex-col">
                <div className="flex justify-between">
                  <span>Shipping</span><span className="text-emerald-600 font-medium">Free</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-2 border-t text-lg">
                <span>Total</span><span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={handlePlaceOrder}
              disabled={isProcessing || items.length === 0}
            >
              {isProcessing ? 'Processing...' : method === 'ONLINE' ? 'Pay Securely' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
