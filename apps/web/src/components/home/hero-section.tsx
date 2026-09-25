import Link from 'next/link'
import { Button } from '@ankita/ui'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-stone-50">
      <div className="container-wide flex min-h-[520px] flex-col items-center justify-center py-20 text-center md:min-h-[580px]">
        {/* Label */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          New Season — 2026 Collection
        </p>

        {/* Heading */}
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Elegance Woven
          <br />
          <span className="italic font-light">into Every Thread</span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
          Discover our curated collection of premium women&apos;s fashion — from handcrafted sarees to contemporary co-ord sets, celebrating the modern Indian woman.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/new-arrivals">
            <Button size="lg" className="group px-8">
              Shop New Arrivals
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/categories">
            <Button size="lg" variant="outline" className="px-8">
              Explore Categories
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-14 flex items-center justify-center gap-8 divide-x divide-border">
          {[
            { value: '2,000+', label: 'Products' },
            { value: '15,000+', label: 'Happy Customers' },
            { value: '100%', label: 'Authentic' },
          ].map((stat) => (
            <div key={stat.label} className="px-8 text-center first:pl-0 last:pr-0">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-stone-200/50 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-stone-200/50 blur-2xl" />
      </div>
    </section>
  )
}
