'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Button, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input,
} from '@ankita/ui'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@ankita/validation'
import { authApi } from '@/lib/api/auth'

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordFormData) {
    try {
      await authApi.forgotPassword(values)
      toast.success('If an account exists with this email, a reset link has been sent.')
      form.reset()
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input id="forgot-email" type="email" placeholder="you@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button id="forgot-submit" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
