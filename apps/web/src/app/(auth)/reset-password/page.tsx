'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
import { resetPasswordSchema, type ResetPasswordFormData } from '@ankita/validation'
import { authApi } from '@/lib/api/auth'
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid' | 'success'>('verifying')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [maskedEmail, setMaskedEmail] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token,
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  // Synchronize token into form state
  useEffect(() => {
    if (token) {
      form.setValue('token', token)
    }
  }, [token, form])

  // Validate reset token on initial page load
  useEffect(() => {
    let isMounted = true

    async function checkToken() {
      if (!token || token.trim().length === 0) {
        if (isMounted) {
          setStatus('invalid')
          setErrorMessage('No password reset token was provided. Please request a new reset link.')
        }
        return
      }

      try {
        const response: any = await authApi.verifyResetToken(token.trim())
        if (isMounted) {
          if (response?.valid || response?.data?.valid) {
            setStatus('valid')
            setMaskedEmail(response?.email || response?.data?.email || '')
          } else {
            setStatus('invalid')
            setErrorMessage(
              response?.error?.message ||
                response?.message ||
                'This password reset link is invalid, expired, or has already been used.'
            )
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('invalid')
          const message =
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'This password reset link is invalid, expired, or has already been used.'
          setErrorMessage(message)
        }
      }
    }

    checkToken()

    return () => {
      isMounted = false
    }
  }, [token])

  const passwordValue = form.watch('password') || ''
  const confirmPasswordValue = form.watch('confirmPassword') || ''

  // Real-time password criteria
  const hasMinLength = passwordValue.length >= 8
  const hasUppercase = /[A-Z]/.test(passwordValue)
  const hasLowercase = /[a-z]/.test(passwordValue)
  const hasNumber = /[0-9]/.test(passwordValue)
  const passwordsMatch = passwordValue.length > 0 && passwordValue === confirmPasswordValue

  async function onSubmit(values: ResetPasswordFormData) {
    try {
      await authApi.resetPassword({
        token: token.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      setStatus('success')
      toast.success('Your password has been successfully reset!')
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to reset password. Please check your link or request a new one.'
      toast.error(message)
    }
  }

  // 1. Verifying token state
  if (status === 'verifying') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">Verifying Reset Link...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we verify your password reset authorization.
          </p>
        </CardContent>
      </Card>
    )
  }

  // 2. Invalid or expired token state
  if (status === 'invalid') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-destructive">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Link Invalid</CardTitle>
          <CardDescription className="text-sm mt-1">
            We could not authorize your password change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 text-center">
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
            {errorMessage}
          </div>
          <p className="text-xs text-muted-foreground">
            Password reset links expire in 15 minutes and can only be used once for your security.
          </p>
          <div className="space-y-2 pt-2">
            <Link href="/forgot-password" className="w-full block">
              <Button className="w-full" variant="default">
                Request a New Reset Link
              </Button>
            </Link>
            <Link href="/login" className="w-full block">
              <Button className="w-full" variant="outline">
                Return to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 3. Password successfully reset state
  if (status === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-emerald-600">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Password Reset Complete</CardTitle>
          <CardDescription className="text-sm mt-1">
            Your Ankita Processors account password has been updated securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 text-center">
          <div className="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-md border border-emerald-200 text-left space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security Confirmed
            </div>
            <p className="text-xs text-emerald-700">
              All previous sessions have been invalidated across devices. You can now sign in using your new password.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link href="/login/customer" className="w-full block">
              <Button className="w-full text-base h-11 bg-primary hover:bg-primary/90">
                Sign In as Customer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full block">
              <Button className="w-full" variant="outline">
                Account Selection Portal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 4. Valid token — render password reset form
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
      <CardHeader className="space-y-1 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
          <Lock className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
        <CardDescription>
          {maskedEmail
            ? `Setting a new password for ${maskedEmail}`
            : 'Enter and confirm your new secure password'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="reset-password-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
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

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="reset-confirm-password-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Policy Requirements Checklist */}
            <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1.5 border border-muted">
              <span className="font-semibold text-foreground block mb-1">
                Password requirements:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-muted-foreground">
                <span className={hasMinLength ? 'text-emerald-600 font-medium' : ''}>
                  {hasMinLength ? '✓' : '•'} 8+ characters
                </span>
                <span className={hasUppercase ? 'text-emerald-600 font-medium' : ''}>
                  {hasUppercase ? '✓' : '•'} 1 uppercase
                </span>
                <span className={hasLowercase ? 'text-emerald-600 font-medium' : ''}>
                  {hasLowercase ? '✓' : '•'} 1 lowercase
                </span>
                <span className={hasNumber ? 'text-emerald-600 font-medium' : ''}>
                  {hasNumber ? '✓' : '•'} 1 number
                </span>
              </div>
              {confirmPasswordValue.length > 0 && (
                <div className="pt-1 border-t border-muted">
                  <span className={passwordsMatch ? 'text-emerald-600 font-medium' : 'text-destructive font-medium'}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            <Button
              id="reset-submit-button"
              type="submit"
              className="w-full text-base h-11"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating Password...
                </>
              ) : (
                'Save New Password'
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto py-8 px-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading password reset portal...</p>
            </CardContent>
          </Card>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
