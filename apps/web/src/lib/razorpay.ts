import apiClient from './api/client'

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if ((window as any).Razorpay) return resolve(true)

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export interface RetryPaymentParams {
  orderId: number | string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  onSuccess?: (result: any) => void
  onError?: (err: any) => void
}

export async function retryOnlinePayment({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}: RetryPaymentParams): Promise<any> {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    const error = new Error('Razorpay SDK failed to load. Please check your internet connection.')
    onError?.(error)
    throw error
  }

  // Request refreshed Razorpay order from backend
  const res = await apiClient.post(`/orders/${orderId}/retry-payment`)
  const { razorpayOrderId, amount, keyId, orderNo } = res.data

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_123456789',
      amount: amount.toString(),
      currency: 'INR',
      name: 'Ankita Processors',
      description: `Payment for Order #${orderNo || orderId}`,
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        try {
          const verifyRes = await apiClient.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          onSuccess?.(verifyRes.data)
          resolve(verifyRes.data)
        } catch (err: any) {
          onError?.(err)
          reject(err)
        }
      },
      prefill: {
        name: customerName || 'Valued Customer',
        email: customerEmail || 'customer@example.com',
        contact: customerPhone || '9999999999',
      },
      theme: {
        color: '#00313B',
      },
      modal: {
        ondismiss: function () {
          // User closed the modal without completing payment
        },
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.on('payment.failed', function (resp: any) {
      const err = new Error(resp?.error?.description || 'Payment Failed')
      onError?.(err)
      reject(err)
    })
    rzp.open()
  })
}
