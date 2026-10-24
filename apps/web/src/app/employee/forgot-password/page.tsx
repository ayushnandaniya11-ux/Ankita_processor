'use client'

import { useState } from 'react'
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
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@ankita/validation'
import { authApi } from '@/lib/api/auth'
import { KeyRound, MailCheck, ArrowLeft, Loader2, Briefcase } from 'lucide-react'
import { APP_NAME } from '@ankita/config'

export default function EmployeeForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

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

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      {submitted ? (
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-slate-800">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2">
              <MailCheck className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Work Email</CardTitle>
            <CardDescription className="text-sm mt-1">
              Recovery instructions dispatched
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2 text-center">
            <div className="p-4 bg-muted/60 text-sm rounded-lg border text-left space-y-2">
              <p className="text-muted-foreground text-xs leading-relaxed">
                If an employee account exists for{' '}
                <strong className="text-foreground font-semibold">{submittedEmail}</strong>, you
                will receive an email with instructions to reset your password.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                The link will expire in <strong className="text-foreground">15 minutes</strong> for
                security reasons.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link href="/employee/login" className="w-full block">
                <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employee Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-slate-800">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto bg-slate-800 text-white font-bold tracking-widest text-xs px-2.5 py-1 rounded w-fit mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> EMPLOYEE PORTAL
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Password Recovery
            </CardTitle>
            <CardDescription>
              Enter your registered work email to receive password reset instructions
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
                      <FormLabel>Work Email</FormLabel>
                      <FormControl>
                        <Input
                          id="employee-forgot-email"
                          type="email"
                          placeholder="name@ankita.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  id="employee-forgot-submit"
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-base h-11"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Instructions...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-4 border-t text-center text-sm">
              <Link
                href="/employee/login"
                className="font-medium text-slate-700 hover:text-foreground flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Employee Login
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
