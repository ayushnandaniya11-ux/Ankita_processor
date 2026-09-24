import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product/product-card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@ankita/ui'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

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

export default function CategoryPage({ params }: Props) {
  const categoryName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const products = MOCK_PRODUCTS.filter(
    (p) => p.category?.slug === params.slug || p.isPublished
  )

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
      <p className="mb-8 text-muted-foreground">{products.length} products</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
