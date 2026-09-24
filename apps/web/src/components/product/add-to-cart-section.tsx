'use client'

import { useState } from 'react'
import { Heart, ShoppingBag, Zap } from 'lucide-react'
import { Button } from '@ankita/ui'
import { cn } from '@ankita/utils'
import { toast } from 'sonner'
import type { Product } from '@ankita/types'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import Link from 'next/link'

interface AddToCartSectionProps {
  product: Product
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addItem, loading } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  // Get unique colors and sizes
  const colors = [...new Map(product.variants.map((v) => [v.color, v])).values()]
  const [selectedColor, setSelectedColor] = useState(colors[0]?.color ?? '')
  const sizes = product.variants.filter((v) => v.color === selectedColor && v.isActive)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  )
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false
  const isLowStock = selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= selectedVariant.lowStockThreshold

  async function handleAddToCart() {
    if (!selectedVariant) {
      toast.error('Please select a size')
      return
    }
    try {
      await addItem({ productId: product.id, variantId: selectedVariant.id, quantity })
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const wishlisted = isWishlisted(product.id)

  return (
    <div className="space-y-5">
      {/* Color selector */}
      <div>
        <p className="mb-2 text-sm font-medium">
          Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((v) => (
            <button
              key={v.color}
              onClick={() => { setSelectedColor(v.color); setSelectedSize('') }}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                selectedColor === v.color
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/40'
              )}
            >
              {v.colorHex && (
                <span className="inline-block h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: v.colorHex }} />
              )}
              {v.color}
            </button>
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div>
        <p className="mb-2 text-sm font-medium">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((v) => (
            <button
              key={v.size}
              onClick={() => setSelectedSize(v.size)}
              disabled={v.stock === 0}
              className={cn(
                'h-10 min-w-[2.5rem] rounded-md border px-3 text-sm font-medium transition-all',
                selectedSize === v.size
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/40',
                v.stock === 0 && 'cursor-not-allowed opacity-40 line-through'
              )}
            >
              {v.size}
            </button>
          ))}
        </div>
        {selectedVariant && isLowStock && (
          <p className="mt-2 text-xs text-amber-600">Only {selectedVariant.stock} left in stock!</p>
        )}
        {selectedVariant && !inStock && (
          <p className="mt-2 text-xs text-destructive">This variant is out of stock.</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <p className="mb-2 text-sm font-medium">Quantity</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
            aria-label="Decrease"
          >−</button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 10, q + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
            aria-label="Increase"
          >+</button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          id="add-to-cart-btn"
          className="flex-1"
          size="lg"
          onClick={handleAddToCart}
          disabled={loading || !inStock}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {!selectedSize ? 'Select Size' : !inStock ? 'Out of Stock' : loading ? 'Adding...' : 'Add to Cart'}
        </Button>
        <Button
          id="buy-now-btn"
          variant="outline"
          size="lg"
          className="flex-1"
          asChild={!!selectedVariant && inStock}
          disabled={!selectedVariant || !inStock}
        >
          <Link href={selectedVariant && inStock ? '/checkout/address' : '#'}>
            <Zap className="mr-2 h-4 w-4" />
            Buy Now
          </Link>
        </Button>
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => { toggleWishlist(product.id); toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist') }}
      >
        <Heart className={cn('mr-2 h-4 w-4', wishlisted && 'fill-rose-500 text-rose-500')} />
        {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </Button>
    </div>
  )
}
