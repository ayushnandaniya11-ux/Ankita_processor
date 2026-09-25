import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@ankita/ui'

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Explore all women\'s clothing categories at Ankita Processors.',
}

const CATEGORIES = [
  { name: 'Sarees', slug: 'sarees', emoji: '🥻', count: '0 Products' },
  { name: 'Dupattas', slug: 'dupattas', emoji: '🧣', count: '0 Products' },
  { name: 'Scarves', slug: 'scarves', emoji: '🧶', count: '0 Products' },
  { name: 'Dress Material', slug: 'dress-material', emoji: '🧵', count: '0 Products' },
]

export default function CategoriesPage() {
  return (
    <div className="container-wide py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Categories</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">All Categories</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group rounded-xl border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/20"
          >
            <div className="mb-3 text-4xl">{cat.emoji}</div>
            <h2 className="font-semibold text-foreground">{cat.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{cat.count}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
