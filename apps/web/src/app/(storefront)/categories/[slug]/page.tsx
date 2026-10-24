import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@ankita/ui'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatApiProduct } from '@/lib/product-mapper'
import type { Product } from '@ankita/types'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: name,
    description: `Shop ${name} at Ankita Processors — premium women's clothing.`,
  }
}

async function getCategoryProducts(slug: string): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'
    const res = await fetch(`${apiUrl}/products?category=${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map(formatApiProduct)
      }
    }
  } catch {}

  return MOCK_PRODUCTS.filter(
    (p) => p.category?.slug === slug || p.category?.name.toLowerCase() === slug.replace(/-/g, ' ').toLowerCase()
  )
}

export default async function CategoryPage({ params }: Props) {
  const categoryName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const products = await getCategoryProducts(params.slug)

  return (
    <div className="container-wide py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/categories">Categories</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{categoryName}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{categoryName}</h1>
      <p className="mb-8 text-muted-foreground">{products.length} products available</p>
      {products.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border rounded-2xl border-dashed">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
