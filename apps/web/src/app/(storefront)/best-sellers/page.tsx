import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@ankita/ui'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatApiProduct } from '@/lib/product-mapper'
import type { Product } from '@ankita/types'

export const metadata: Metadata = {
  title: 'Best Sellers',
  description: 'Shop our most loved products — tried, tested, and adored by thousands.',
}

async function getBestSellers(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'
    const res = await fetch(`${apiUrl}/products`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(formatApiProduct)
        const best = formatted.filter((p) => p.isBestSeller)
        return best.length > 0 ? best : formatted
      }
    }
  } catch {}

  return MOCK_PRODUCTS.filter((p) => p.isBestSeller)
}

export default async function BestSellersPage() {
  const products = await getBestSellers()

  return (
    <div className="container-wide py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Best Sellers</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Best Sellers</h1>
        <p className="mt-2 text-muted-foreground">Our most loved products — adored by thousands of customers.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
