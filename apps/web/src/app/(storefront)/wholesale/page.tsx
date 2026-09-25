import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@ankita/ui'

export const metadata: Metadata = {
  title: 'Wholesale — Ankita Processors',
  description: 'Partner with Ankita Processors for wholesale women\'s clothing. Bulk pricing and exclusive wholesale rates.',
}

export default function WholesalePage() {
  return (
    <div className="container-wide py-16 max-w-4xl">
      <div className="text-center mb-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold tracking-tight mb-4">Wholesale Partnership</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of retailers who trust Ankita Processors for premium women&apos;s clothing at wholesale prices. Get access to exclusive bulk pricing, early collection previews, and dedicated support.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
        {[
          { title: 'Exclusive Pricing', desc: 'Up to 40% off retail prices with tiered wholesale rates' },
          { title: 'Min. Order ₹5,000', desc: 'Low minimum order quantity to get started' },
          { title: 'Dedicated Support', desc: 'Personal account manager for all wholesale partners' },
        ].map((feature) => (
          <div key={feature.title} className="rounded-xl border bg-card p-6 text-center">
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild>
          <Link href="/wholesale/register">Apply for Wholesale Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/wholesale/login">Login to Wholesale Portal</Link>
        </Button>
      </div>
    </div>
  )
}
