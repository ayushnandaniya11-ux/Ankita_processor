import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
  Badge, Button, Separator,
} from '@ankita/ui'
import { AddToCartSection } from '@/components/product/add-to-cart-section'
import { ProductGallery } from '@/components/product/product-gallery'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatCurrency, calcDiscountPercent } from '@ankita/utils'
import { Shield, RotateCcw, Truck } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = MOCK_PRODUCTS.find((p) => p.slug === params.slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  }
}

export default function ProductDetailPage({ params }: Props) {
  const product = MOCK_PRODUCTS.find((p) => p.slug === params.slug)
  if (!product) notFound()

  const discount = calcDiscountPercent(product.mrp, product.sellingPrice)

  return (
    <div className="container-wide py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/categories/${product.category?.slug}`}>{product.category?.name}</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex gap-2">
            {product.isNewArrival && <Badge>New Arrival</Badge>}
            {product.isBestSeller && <Badge variant="secondary">Best Seller</Badge>}
          </div>

          <div>
            <h1 className="text-2xl font-bold leading-tight text-foreground">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.floor(product.avgRating) ? 'text-amber-400' : 'text-muted'}>★</span>
              ))}
            </div>
            <span className="text-sm font-medium">{product.avgRating}</span>
            <span className="text-sm text-muted-foreground">({product.totalReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">{formatCurrency(product.sellingPrice)}</span>
            {product.mrp > product.sellingPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.mrp)}</span>
                <Badge variant="destructive">{discount}% off</Badge>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Inclusive of {product.gstRate}% GST · HSN: {product.hsnCode}</p>

          <Separator />

          {/* Add to Cart + Size/Color Selector */}
          <AddToCartSection product={product} />

          <Separator />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Free shipping above ₹999' },
              { icon: RotateCcw, text: `${product.returnWindow}-day returns` },
              { icon: Shield, text: '100% Authentic' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground leading-tight">{text}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 font-semibold text-foreground">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {product.fabric && (
            <div className="flex gap-2 text-sm">
              <span className="font-medium">Fabric:</span>
              <span className="text-muted-foreground">{product.fabric}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
