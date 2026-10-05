'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Label, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ankita/ui'
import { authApi } from '@/lib/api/auth'
import { APP_NAME } from '@ankita/config'
import { useAuth } from '@/hooks/use-auth'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const { mutate } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = (await authApi.login({ email, password })) as any
      const user = response.user || response.data?.user
      
      // Verification
      if (user?.role !== 'EMPLOYEE' && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        await authApi.logout()
        setError('Unauthorized: Not an employee account.')
        setLoading(false)
        return
      }
      
      await mutate()
      router.push('/employee/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 relative">
      <div className="absolute top-8 left-8">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Account Selection
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-primary text-primary-foreground font-bold tracking-widest text-xs px-2 py-1 rounded w-fit mb-2">
            EMPLOYEE PORTAL
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {APP_NAME} Workspace
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@ankita.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/employee/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground border-t p-4">
          Protected System. Unauthorized access is strictly prohibited.
        </CardFooter>
      </Card>
    </div>
  )
}
