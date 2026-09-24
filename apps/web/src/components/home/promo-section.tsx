import Link from 'next/link'
import { Button } from '@ankita/ui'
import { ArrowRight } from 'lucide-react'

export function PromoSection() {
  return (
    <section className="section-py bg-foreground text-background">
      <div className="container-wide text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">
          Exclusively Crafted
        </p>
        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          New Season Collection
        </h2>
        <p className="mt-4 text-base text-background/70 max-w-xl mx-auto">
          Step into the season with our most anticipated collection yet. Premium fabrics, exclusive prints, and silhouettes that celebrate you.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/new-arrivals">
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
            >
              Shop the Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
