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
  const initialDebugOtp = searchParams.get('debugOtp') || ''
  const { verifyOtp, resendOtp } = useAuth()
  const [otp, setOtp] = useState(initialDebugOtp)
  const [debugCode, setDebugCode] = useState(initialDebugOtp)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

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
      const resData = err?.response?.data
      const message =
        resData?.error?.message ||
        resData?.errors?.[0]?.message ||
        resData?.message ||
        err?.message ||
        'Invalid OTP'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) return
    setResending(true)
    try {
      const res = await resendOtp({ userId: Number(userId) })
      toast.success(res?.message || 'New verification code sent!')
      if (res?.debugOtp) {
        setDebugCode(res.debugOtp)
        setOtp(res.debugOtp)
      }
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      const resData = err?.response?.data
      const message =
        resData?.error?.message ||
        resData?.errors?.[0]?.message ||
        resData?.message ||
        'Failed to resend OTP'
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Verify your Email</CardTitle>
        <CardDescription>We sent a 6-digit verification code to your email. Please enter it below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {debugCode && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">Dev Code</span>
                <span className="font-mono text-lg font-bold tracking-widest">{debugCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(debugCode)}
                className="text-xs bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 px-2.5 py-1 rounded font-medium transition-colors"
              >
                Autofill
              </button>
            </div>
          )}

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

          <div className="flex items-center justify-between pt-2 text-sm">
            <span className="text-muted-foreground">Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
