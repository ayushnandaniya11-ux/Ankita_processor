'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Badge, Button } from '@ankita/ui'
import { formatCurrency, calcDiscountPercent } from '@ankita/utils'
import type { Product } from '@ankita/types'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, loading: cartLoading } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [imgError, setImgError] = useState(false)

  const primaryImage = product.images?.[0]?.url
  const discount = calcDiscountPercent(product.mrp, product.sellingPrice)
  const wishlisted = isWishlisted(product.id)

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    const firstVariant = product.variants?.[0]
    if (!firstVariant) {
      toast.error('Please select a size and color on the product page')
      return
    }
    try {
      await addItem({ productId: product.id, variantId: firstVariant.id, quantity: 1 })
      toast.success(`${product.name} added to cart`)
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    await toggleWishlist(product.id)
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-muted product-card-hover">
        {/* Image */}
        <div className="relative aspect-[3/4]">
          {primaryImage && !imgError ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🛍️</div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.isNewArrival && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0.5">New</Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">{discount}% off</Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-all hover:scale-110"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`}
            />
          </button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-background/95 backdrop-blur p-2 transition-transform duration-200 group-hover:translate-y-0">
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={handleAddToCart}
              disabled={cartLoading}
            >
              {cartLoading ? 'Adding...' : 'Quick Add'}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground truncate">{product.category?.name}</p>
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(product.sellingPrice)}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
