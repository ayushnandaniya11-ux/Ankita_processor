'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Button, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@ankita/ui'
import { wholesaleRegisterSchema, type WholesaleRegisterFormData } from '@ankita/validation'
import { STATE_OPTIONS } from '@ankita/config'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@ankita/config'

export default function WholesaleRegisterPage() {
  const router = useRouter()
  const form = useForm<WholesaleRegisterFormData>({
    resolver: zodResolver(wholesaleRegisterSchema),
    defaultValues: { businessName: '', ownerName: '', email: '', phone: '', gstin: '', businessAddress: '', state: '', city: '', pincode: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: WholesaleRegisterFormData) {
    try {
      await apiClient.post(API_ENDPOINTS.wholesale.register, values)
      toast.success('Application submitted! We\'ll review and get back to you within 2-3 business days.')
      router.push('/wholesale')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Registration failed'
      toast.error(msg)
    }
  }

  return (
    <div className="container-wide py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Wholesale Registration</CardTitle>
          <CardDescription>Apply for a wholesale account. We&apos;ll review your application within 2-3 business days.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="businessName" render={({ field }) => (
                  <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input id="ws-business-name" placeholder="Your Business Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem><FormLabel>Owner Name</FormLabel><FormControl><Input id="ws-owner-name" placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input id="ws-email" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input id="ws-phone" type="tel" placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gstin" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>GSTIN</FormLabel><FormControl><Input id="ws-gstin" placeholder="22AAAAA0000A1Z5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="businessAddress" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Business Address</FormLabel><FormControl><Input id="ws-address" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger id="ws-state"><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                      <SelectContent>{STATE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input id="ws-city" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pincode" render={({ field }) => (
                  <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input id="ws-pincode" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><Input id="ws-password" type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input id="ws-confirm-password" type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button id="ws-register-submit" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link href="/wholesale/login" className="font-medium text-foreground hover:underline">Login</Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
