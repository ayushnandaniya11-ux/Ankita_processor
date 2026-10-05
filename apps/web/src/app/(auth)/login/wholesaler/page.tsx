'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import {
  Button, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input, Checkbox,
} from '@ankita/ui'
import apiClient from '@/lib/api/client'

export default function WholesalerLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  async function onSubmit(values: any) {
    setIsSubmitting(true)
    try {
      const response = await apiClient.post('/auth/wholesale/login', values)
      toast.success('Logged in successfully!')
      router.push('/wholesaler')
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Invalid credentials or account issue'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Account Selection
        </Link>
      </div>
      <Card className="border-t-4 border-t-orange-500 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">Wholesale Portal</span>
          </div>
          <CardTitle className="text-2xl">Wholesaler Login</CardTitle>
          <CardDescription>Access your B2B account, catalogs, and orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@company.com" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          required
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Remember me for 30 days
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have a wholesale account?{' '}
              <Link href="/register/wholesaler" className="font-medium text-orange-600 hover:underline">
                Apply now
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Looking for a retail account?{' '}
              <Link href="/login/customer" className="font-medium text-foreground hover:underline">
                Customer Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
