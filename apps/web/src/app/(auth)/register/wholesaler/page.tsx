'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import {
  Button, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox
} from '@ankita/ui'
import apiClient from '@/lib/api/client'

export default function WholesalerRegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: { 
      name: '', email: '', phone: '', companyName: '', gstin: '', 
      businessAddress: '', city: '', state: '', pinCode: '', 
      password: '', confirmPassword: '', termsAccepted: false 
    },
  })

  async function onSubmit(values: any) {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!values.termsAccepted) {
      toast.error('You must accept the Terms and Conditions')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await apiClient.post('/auth/wholesale/register', values)
      toast.success(res.data.message || 'Registration successful. Awaiting approval.')
      router.push('/login')
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.errors?.[0]?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="mb-4">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Account Selection
        </Link>
      </div>
      <Card className="border-t-4 border-t-orange-500 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-orange-500" />
            <span className="text-sm font-semibold uppercase tracking-wider text-orange-500">Business Registration</span>
          </div>
          <CardTitle className="text-3xl">Apply for a Wholesale Account</CardTitle>
          <CardDescription>
            Submit your business details. Once approved by our team, you will get access to wholesale pricing and bulk ordering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Contact Details</h3>
                  
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Contact Person Full Name *</FormLabel><FormControl><Input required placeholder="Rahul Desai" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Business Email *</FormLabel><FormControl><Input type="email" required placeholder="contact@company.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Mobile Number *</FormLabel><FormControl><Input type="tel" required placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Business Information</h3>
                  
                  <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem><FormLabel>Company Name *</FormLabel><FormControl><Input required placeholder="ABC Textiles Pvt Ltd" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="gstin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN Number *</FormLabel>
                      <FormControl>
                        <Input required placeholder="22AAAAA0000A1Z5" className="uppercase" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Used for business verification.</p>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Address</h3>
                <FormField control={form.control} name="businessAddress" render={({ field }) => (
                  <FormItem><FormLabel>Business Address *</FormLabel><FormControl><Input required placeholder="123 Textile Market, Ring Road" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>City *</FormLabel><FormControl><Input required placeholder="Surat" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem><FormLabel>State *</FormLabel><FormControl><Input required placeholder="Gujarat" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="pinCode" render={({ field }) => (
                    <FormItem><FormLabel>PIN Code *</FormLabel><FormControl><Input required placeholder="395002" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" {...field} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm Password *</FormLabel><FormControl><Input type="password" required placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="termsAccepted" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium cursor-pointer">
                      Accept terms and conditions
                    </FormLabel>
                    <CardDescription>
                      I verify that the provided GSTIN is correct and belongs to my business. I agree to the B2B terms of service.
                    </CardDescription>
                  </div>
                </FormItem>
              )} />

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Application...' : 'Apply for Wholesale Account'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 pt-4 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an approved account?{' '}
              <Link href="/login/wholesaler" className="font-medium text-orange-600 hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Looking for a retail account?{' '}
              <Link href="/register/customer" className="font-medium text-foreground hover:underline">
                Register as a Customer
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
