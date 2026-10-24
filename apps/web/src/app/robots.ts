import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ankitaprocessors.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout/', '/employee/', '/profile/security'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
