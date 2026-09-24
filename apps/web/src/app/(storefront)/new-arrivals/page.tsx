import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@ankita/ui'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'New Arrivals',
  description: 'Discover the latest additions to our collection — fresh styles just arrived.',
}

export default function NewArrivalsPage() {
  const products = MOCK_PRODUCTS.filter((p) => p.isNewArrival)

  return (
    <div className="container-wide py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>New Arrivals</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">New Arrivals</h1>
        <p className="mt-2 text-muted-foreground">Fresh styles, just in — be the first to wear the latest.</p>
      </div>
      {products.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">No new arrivals at the moment. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
