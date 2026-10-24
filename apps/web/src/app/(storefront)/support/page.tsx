import type { Metadata } from 'next'
import { Headphones, Mail, Phone, MessageSquare, ArrowRight } from 'lucide-react'
import { APP_NAME } from '@ankita/config'
import Link from 'next/link'
import { Button } from '@ankita/ui'

export const metadata: Metadata = {
  title: 'Customer Support — Ankita Processors',
  description: 'Reach our dedicated support team for help with your order, returns, or product inquiries.',
}

export default function SupportPage() {
  return (
    <div className="container-wide py-12 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Headphones className="h-6 w-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Customer Support</h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          We are committed to providing you with the best shopping experience. Reach us through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card p-6 text-center space-y-3">
          <MessageSquare className="h-8 w-8 text-primary mx-auto" />
          <h2 className="font-bold">Order Queries</h2>
          <p className="text-xs text-muted-foreground">
            Track your order, request returns or check delivery status.
          </p>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/orders">View Orders</Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 text-center space-y-3">
          <Mail className="h-8 w-8 text-primary mx-auto" />
          <h2 className="font-bold">Email Helpdesk</h2>
          <p className="text-xs text-muted-foreground">
            Write to our care team. We respond within 24 business hours.
          </p>
          <Button variant="outline" size="sm" asChild className="w-full">
            <a href="mailto:support@ankitaprocessors.com">Email Us</a>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 text-center space-y-3">
          <Phone className="h-8 w-8 text-primary mx-auto" />
          <h2 className="font-bold">Direct Assistance</h2>
          <p className="text-xs text-muted-foreground">
            Mon-Sat 10:00 AM to 7:00 PM IST
          </p>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/contact">Contact Page</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Frequently Asked Questions</h3>
          <p className="text-sm text-muted-foreground">
            Get instant answers regarding shipping, sizing, payment methods, and exchange policies.
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/faq">
            Browse FAQs <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
