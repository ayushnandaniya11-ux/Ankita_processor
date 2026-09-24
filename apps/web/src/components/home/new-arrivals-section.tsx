import Link from 'next/link'
import { Button } from '@ankita/ui'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

export function NewArrivalsSection() {
  const products = MOCK_PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4)

  return (
    <section className="section-py">
      <div className="container-wide">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Just In
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              New Arrivals
            </h2>
          </div>
          <Link href="/new-arrivals">
            <Button variant="ghost" size="sm" className="group">
              View All
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
