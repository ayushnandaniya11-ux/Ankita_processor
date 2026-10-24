import type { MetadataRoute } from 'next'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ankitaprocessors.com'
  const currentDate = new Date()

  const staticRoutes = [
    '',
    '/products',
    '/new-arrivals',
    '/best-sellers',
    '/categories',
    '/wholesale',
    '/about',
    '/contact',
    '/faq',
    '/shipping',
    '/returns',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/products') ? 0.9 : 0.7,
  }))

  const productRoutes = MOCK_PRODUCTS.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
