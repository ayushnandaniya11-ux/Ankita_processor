'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { toast } from 'sonner'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@ankita/ui'
import { useAuth } from '@/hooks/use-auth'

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const { verifyOtp } = useAuth()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  if (!userId) {
    if (typeof window !== 'undefined') router.push('/login')
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits')
      return
    }

    setLoading(true)
    try {
      await verifyOtp({ userId: Number(userId), otp })
      toast.success('Verified successfully! Welcome to Ankita Processors.')
      router.push('/profile')
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Invalid OTP'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Verify your Email</CardTitle>
        <CardDescription>We sent a 6-digit verification code to your email. Please enter it below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Verification Code
            </label>
            <Input 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="123456" 
              maxLength={6} 
              className="text-center text-xl tracking-widest h-12"
              autoComplete="one-time-code"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
