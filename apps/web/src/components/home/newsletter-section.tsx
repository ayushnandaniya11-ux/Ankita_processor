'use client'

import { useState } from 'react'
import { Button, Input } from '@ankita/ui'
import { toast } from 'sonner'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // TODO: connect to API
    await new Promise((r) => setTimeout(r, 800))
    toast.success('You\'re subscribed! Welcome to the Ankita Processors family.')
    setEmail('')
    setLoading(false)
  }

  return (
    <section className="section-py border-t">
      <div className="container-wide mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Stay in the Loop
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Get Early Access & Offers
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Subscribe to our newsletter for new arrivals, exclusive discounts, styling tips, and more. No spam, ever.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
            id="newsletter-email"
          />
          <Button type="submit" disabled={loading} className="sm:w-auto w-full">
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          By subscribing, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </section>
  )
}
