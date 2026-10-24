import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
  Badge, Button, Separator,
} from '@ankita/ui'
import { AddToCartSection } from '@/components/product/add-to-cart-section'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductCard } from '@/components/product/product-card'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatCurrency, calcDiscountPercent } from '@ankita/utils'
import { 
  ShieldCheck, RotateCcw, Truck, ArrowLeft, Sparkles, Check, 
  Info, Scissors, Layers, Eye
} from 'lucide-react'

import type { Product } from '@ankita/types'
import { formatApiProduct } from '@/lib/product-mapper'

interface Props {
  params: { slug: string }
}

async function getProduct(slug: string): Promise<(Product & { attributes?: Record<string, any>; stock?: number }) | null> {
  const decodedSlug = decodeURIComponent(slug).trim()
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'
    const res = await fetch(`${apiUrl}/products/${encodeURIComponent(decodedSlug)}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data && (data.name || data.id)) {
        return formatApiProduct(data)
      }
    }
  } catch {}

  // Fallback to MOCK_PRODUCTS matching slug or id
  const fallback = MOCK_PRODUCTS.find((p) => p.slug === decodedSlug || p.id === decodedSlug || p.slug === slug)
  if (fallback) {
    return formatApiProduct(fallback)
  }

  return null
}

async function getRelatedProducts(categoryId?: string, currentProductId?: string): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'
    const url = categoryId 
      ? `${apiUrl}/products?category=${encodeURIComponent(categoryId)}&limit=5`
      : `${apiUrl}/products?limit=5`
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
      if (list.length > 0) {
        return list
          .filter((p: any) => String(p.id) !== String(currentProductId))
          .map(formatApiProduct)
          .slice(0, 4)
      }
    }
  } catch {}

  return MOCK_PRODUCTS.filter((p) => p.id !== currentProductId).slice(0, 4)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Product Not Found | Ankita Processors' }
  return {
    title: `${product.name} | Ankita Processors`,
    description: product.shortDescription || product.description?.slice(0, 160) || 'Handcrafted ethnic wear by Ankita Processors',
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)
  const discount = calcDiscountPercent(product.mrp, product.sellingPrice)
  const attr = product.attributes || {}

  // Extract textile and saree specifications safely
  const specs = [
    { label: 'Category', value: product.category?.name },
    { label: 'Fabric / Material', value: attr.fabric || product.fabric },
    { label: 'Color / Pattern', value: [attr.color, attr.pattern].filter(Boolean).join(' · ') || attr.color },
    { label: 'Saree Length', value: attr.size || '5.5 Meters' },
    { label: 'Blouse Piece', value: attr.blouse ? `${attr.blouse} (${attr.blouseFabric || attr.fabric || 'Matching'})` : 'Included (0.8 Meters)' },
    { label: 'Border Detail', value: [attr.border, attr.borderWidth].filter(Boolean).join(' - ') || attr.border },
    { label: 'Pallu Design', value: attr.palluDetail },
    { label: 'Weave / Loom Type', value: attr.loomType || attr.type },
    { label: 'Occasion', value: attr.occasion || 'Festive, Wedding, Traditional' },
    { label: 'Transparency', value: attr.transparency || 'Opaque' },
    { label: 'Net Quantity', value: attr.netQuantity || '1 Saree with Unstitched Blouse Piece' },
    { label: 'HSN Code', value: product.hsnCode || attr.hsnCode },
    { label: 'GST Rate', value: `${product.gstRate || attr.gstRate || 5}% (Included in price)` },
    { label: 'Country of Origin', value: 'India (Handcrafted in Surat, Gujarat)' },
  ].filter((item) => item.value && String(item.value).trim() !== '')

  return (
    <div className="container-wide py-6 md:py-10">
      {/* Top Navigation Bar: Breadcrumb + Continue Shopping */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Store</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/products?category=${encodeURIComponent(product.category.slug || product.category.name)}`}>
                      {product.category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] sm:max-w-xs truncate font-medium">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Store
          </Button>
        </Link>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7">
          <div className="sticky top-24">
            <ProductGallery images={product.images} productName={product.name} />
          </div>
        </div>

        {/* Right: Product Details, Pricing & Purchasing Actions */}
        <div className="space-y-6 lg:col-span-5">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {product.isNewArrival && (
              <Badge className="bg-primary/90 text-primary-foreground text-xs py-0.5">
                New Arrival
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="secondary" className="gap-1 text-xs py-0.5 font-medium">
                <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" /> Best Seller
              </Badge>
            )}
            {product.isFeatured && (
              <Badge variant="outline" className="text-xs py-0.5">
                Featured Collection
              </Badge>
            )}
          </div>

          {/* Title & SKU */}
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>SKU: <span className="font-mono font-medium text-foreground">{product.sku}</span></span>
              <span>·</span>
              <span>Brand: <span className="font-medium text-foreground">{product.brand || 'Ankita Processors'}</span></span>
            </div>
          </div>

          {/* Ratings & Social Proof */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
              <span className="text-sm font-bold">★ {product.avgRating}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Based on {product.totalReviews} verified customer reviews
            </span>
          </div>

          {/* Pricing Section */}
          <div className="rounded-xl bg-card border p-4 space-y-1 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-foreground">
                {formatCurrency(product.sellingPrice)}
              </span>
              {product.mrp > product.sellingPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.mrp)}
                  </span>
                  <Badge variant="destructive" className="font-bold text-xs">
                    {discount}% Off
                  </Badge>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Inclusive of all applicable taxes ({product.gstRate}% GST) · Free delivery on orders over ₹999
            </p>
          </div>

          <Separator />

          {/* Add to Cart & Buy Now Section */}
          <AddToCartSection product={product} />

          <Separator />

          {/* Brand Guarantees & Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center shadow-xs">
              <Truck className="h-5 w-5 text-primary" />
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-foreground block">Express Delivery</span>
                <span className="text-muted-foreground">Dispatched in 24h</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center shadow-xs">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-foreground block">7-Day Returns</span>
                <span className="text-muted-foreground">Hassle-free exchange</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center shadow-xs">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-foreground block">100% Genuine</span>
                <span className="text-muted-foreground">Direct from Mill</span>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-3 rounded-xl border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Product Description
            </h2>
            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description || 'Experience the elegance and authentic craftsmanship of Ankita Processors. Tailored with care using high-grade textile materials.'}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Textile Attributes Section */}
      <div className="mt-14 border rounded-2xl bg-card p-6 md:p-8 shadow-sm">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Specifications & Fabric Details
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Authentic product specifications and textile details saved in our catalog.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
          {specs.map((item) => (
            <div key={item.label} className="flex justify-between border-b pb-2 text-sm">
              <span className="text-muted-foreground font-medium">{item.label}</span>
              <span className="text-foreground font-semibold text-right max-w-[60%]">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Wash Care Instructions */}
        <div className="mt-8 rounded-xl bg-muted/40 p-4 border flex items-start gap-3">
          <Scissors className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-foreground block">Fabric Care Instructions:</span>
            <p className="text-muted-foreground">
              First wash dry clean recommended to preserve fabric luster and color vibrance. Subsequent gentle hand wash in cold water using mild detergent. Avoid direct sunlight drying and bleach.
            </p>
          </div>
        </div>
      </div>

      {/* Related Products from same or featured collections */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                You May Also Like
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Handpicked matching ethnic garments from Ankita Processors
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Catalog
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
