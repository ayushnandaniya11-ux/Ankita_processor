'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import {
  Button, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input,
} from '@ankita/ui'
import { registerSchema, type RegisterFormData } from '@ankita/validation'
import { useAuth } from '@/hooks/use-auth'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: RegisterFormData) {
    try {
      await register(values)
      toast.success('Account created! Welcome to Ankita Processors.')
      router.push('/')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Registration failed'
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join Ankita Processors for exclusive access</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input id="register-name" placeholder="Priya Sharma" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input id="register-email" type="email" placeholder="you@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl><Input id="register-phone" type="tel" placeholder="9876543210" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl><Input id="register-confirm-password" type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button id="register-submit" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
