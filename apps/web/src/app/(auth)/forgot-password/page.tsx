'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@ankita/ui'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@ankita/validation'
import { authApi } from '@/lib/api/auth'
import { KeyRound, MailCheck, ArrowLeft, Loader2 } from 'lucide-react'

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') // 'customer' | 'wholesaler' | 'employee'
  
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const loginHref =
    role === 'wholesaler'
      ? '/login/wholesaler'
      : role === 'employee'
      ? '/employee/login'
      : '/login/customer'

  const loginLabel =
    role === 'wholesaler'
      ? 'Wholesaler Login'
      : role === 'employee'
      ? 'Employee Login'
      : 'Customer Login'

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  })

  async function onSubmit(values: ForgotPasswordFormData) {
    try {
      await authApi.forgotPassword(values)
      setSubmitted(true)
      setSubmittedEmail(values.email)
      toast.success('If an account exists with this email, password reset instructions have been sent.')
      form.reset()
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to process password reset request. Please try again later.'
      toast.error(message)
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <MailCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription className="text-sm mt-1">
            Password reset instructions have been dispatched
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 text-center">
          <div className="p-4 bg-muted/60 text-sm rounded-lg border text-left space-y-2">
            <p className="text-muted-foreground text-xs leading-relaxed">
              If an account with{' '}
              <strong className="text-foreground font-semibold">{submittedEmail}</strong> exists in
              our system, you will receive an email with a secure link to reset your password.
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              For security, the reset link will expire in <strong className="text-foreground">15 minutes</strong>.
            </p>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Didn&apos;t receive the email? Check your spam or junk folder.</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-primary hover:underline font-medium inline-block mt-1"
            >
              Try entering another email address
            </button>
          </div>

          <div className="pt-2">
            <Link href={loginHref} className="w-full block">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to {loginLabel}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
      <CardHeader className="space-y-1 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
          <KeyRound className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
        <CardDescription>
          Enter your registered email address and we&apos;ll send you a password recovery link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registered Email</FormLabel>
                  <FormControl>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              id="forgot-submit"
              type="submit"
              className="w-full text-base h-11"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Link...
                </>
              ) : (
                'Send Password Reset Link'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 pt-4 border-t text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            Remember your password?{' '}
            <Link href={loginHref} className="font-semibold text-primary hover:underline">
              {loginLabel}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Not your account type?{' '}
            <Link href="/login" className="text-foreground hover:underline">
              Choose another portal
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto py-8 px-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading password recovery...</p>
            </CardContent>
          </Card>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </div>
  )
}
