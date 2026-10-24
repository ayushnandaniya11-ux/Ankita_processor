'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, Label, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox } from '@ankita/ui'
import { api } from '@/lib/api'
import { APP_NAME } from '@ankita/config'
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSessionExpired = searchParams.get('session') === 'expired'

  useEffect(() => {
    if (isSessionExpired) {
      toast.error('Your session has expired. Please sign in again.')
    }
  }, [isSessionExpired])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password, rememberMe })
      const user = response.data?.user || response.data?.data?.user

      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && user?.role !== 'EMPLOYEE') {
        setError('Unauthorized: Admin access required.')
        setLoading(false)
        return
      }

      toast.success('Signed in successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Invalid credentials. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex items-center justify-center mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Ankita Processors Logo"
              width={72}
              height={72}
              className="h-16 w-16 object-contain select-none transition-transform hover:scale-105"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {APP_NAME} Admin Portal
          </CardTitle>
          <CardDescription>
            Enter your admin credentials to access the management dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSessionExpired && (
            <div className="mb-4 flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded-md border border-amber-500/20 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Your session expired or was revoked. Please sign in again.
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ankita.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Remember me (30 days persistent session)
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Lock className="mr-2 h-4 w-4" />
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground border-t p-4">
          <p>Protected System. Authorized personnel only.</p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">Loading portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
