import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { NewArrivalsSection } from '@/components/home/new-arrivals-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { PromoSection } from '@/components/home/promo-section'
import { NewsletterSection } from '@/components/home/newsletter-section'

export const metadata: Metadata = {
  title: 'Ankita Processors — Premium Women\'s Clothing',
  description: 'Discover exquisite women\'s fashion — sarees, kurtis, dresses, co-ord sets and more. Shop the latest collection at Ankita Processors.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <NewArrivalsSection />
      <BestSellersSection />
      <CategoriesSection />
      <PromoSection />
      <NewsletterSection />
    </>
  )
}
