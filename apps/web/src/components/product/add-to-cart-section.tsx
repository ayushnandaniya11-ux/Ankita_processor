'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@ankita/ui'
import { cn, resolveImageUrl } from '@ankita/utils'
import { toast } from 'sonner'
import type { Product, ProductVariant } from '@ankita/types'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

interface AddToCartSectionProps {
  product: Product
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const router = useRouter()
  const { addItem, loading } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [buyingNow, setBuyingNow] = useState(false)

  // Extract variants safely
  const rawVariants = product?.variants || []
  const productStock = Number((product as any)?.stock ?? 0)

  // If variants array is empty or lacks items, derive default variant
  const variants: ProductVariant[] = rawVariants.length > 0
    ? rawVariants
    : [
        {
          id: `var-${product.id}`,
          productId: product.id,
          sku: product.sku || `SKU-${product.id}`,
          color: (product as any)?.attributes?.color || 'Standard',
          colorHex: undefined,
          size: (product as any)?.attributes?.size || 'Free Size',
          mrp: product.mrp,
          sellingPrice: product.sellingPrice,
          stock: productStock,
          lowStockThreshold: 5,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

  // Unique colors
  const colors = [...new Map(variants.map((v) => [v.color, v])).values()]
  const [selectedColor, setSelectedColor] = useState(colors[0]?.color ?? 'Standard')

  // Available sizes for current color
  const sizesForColor = variants.filter((v) => v.color === selectedColor && v.isActive)
  const defaultSize = sizesForColor.find((s) => s.stock > 0)?.size || sizesForColor[0]?.size || 'Free Size'
  const [selectedSize, setSelectedSize] = useState(defaultSize)

  // Find exact matching variant
  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  ) || sizesForColor[0] || variants[0]

  // Inventory validation
  const variantStock = selectedVariant ? Number(selectedVariant.stock) : productStock
  const inStock = variantStock > 0
  const isLowStock = inStock && variantStock <= (selectedVariant?.lowStockThreshold ?? 5)

  // Quantity state with clamp
  const [quantity, setQuantity] = useState(1)

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor)
    const newSizes = variants.filter((v) => v.color === newColor && v.isActive)
    const nextAvailable = newSizes.find((s) => s.stock > 0)?.size || newSizes[0]?.size || ''
    setSelectedSize(nextAvailable)
    setQuantity(1)
  }

  const handleSizeChange = (newSize: string) => {
    setSelectedSize(newSize)
    setQuantity(1)
  }

  const getPrimaryImage = (): string => {
    return resolveImageUrl(product.imageUrl || product.images?.[0]?.url)
  }

  // Core Add to Cart Handler
  async function handleAddToCart() {
    if (!selectedVariant) {
      toast.error('Please select an available variant')
      return
    }

    if (!inStock) {
      toast.error('This item is currently out of stock')
      return
    }

    if (quantity > variantStock) {
      toast.error(`Only ${variantStock} unit(s) available in stock`)
      return
    }

    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        productName: product.name,
        productSlug: product.slug,
        productImage: getPrimaryImage(),
        sku: selectedVariant.sku || product.sku,
        color: selectedColor,
        size: selectedSize,
        unitPrice: selectedVariant.sellingPrice || product.sellingPrice,
        mrp: selectedVariant.mrp || product.mrp,
      } as any)

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">Added to Cart!</span>
          <span className="text-xs text-muted-foreground">
            {quantity} × {product.name} ({selectedColor} / {selectedSize})
          </span>
        </div>,
        {
          action: {
            label: 'View Cart',
            onClick: () => router.push('/cart'),
          },
        }
      )
    } catch {
      toast.error('Failed to add item to cart. Please try again.')
    }
  }

  // Core Buy Now Handler
  async function handleBuyNow() {
    if (!selectedVariant) {
      toast.error('Please select an available variant')
      return
    }

    if (!inStock) {
      toast.error('This item is currently out of stock')
      return
    }

    if (quantity > variantStock) {
      toast.error(`Only ${variantStock} unit(s) available in stock`)
      return
    }

    setBuyingNow(true)
    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        productName: product.name,
        productSlug: product.slug,
        productImage: getPrimaryImage(),
        sku: selectedVariant.sku || product.sku,
        color: selectedColor,
        size: selectedSize,
        unitPrice: selectedVariant.sellingPrice || product.sellingPrice,
        mrp: selectedVariant.mrp || product.mrp,
      } as any)

      // Direct navigation into checkout flow
      router.push('/checkout/address')
    } catch {
      toast.error('Could not initiate immediate checkout. Please try again.')
      setBuyingNow(false)
    }
  }

  const wishlisted = isWishlisted(product.id)

  return (
    <div className="space-y-6">
      {/* Stock status indicator */}
      <div className="flex items-center gap-2">
        {inStock ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>In Stock ({variantStock} available)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-md border border-destructive/20">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Currently Out of Stock</span>
          </div>
        )}
      </div>

      {/* Color Selector */}
      {colors.length > 0 && colors[0]?.color && colors[0]?.color !== 'Standard' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Color:</span>
            <span className="font-semibold text-primary">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => handleColorChange(c.color)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all shadow-sm',
                  selectedColor === c.color
                    ? 'border-primary bg-primary text-primary-foreground font-semibold ring-2 ring-primary/20'
                    : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
                )}
              >
                {c.colorHex && (
                  <span
                    className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: c.colorHex }}
                  />
                )}
                <span>{c.color}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {sizesForColor.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Size / Measurement:</span>
            <span className="font-semibold text-primary">{selectedSize}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((s) => {
              const isSelected = selectedSize === s.size
              const isSizeAvailable = s.stock > 0
              return (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => handleSizeChange(s.size)}
                  disabled={!isSizeAvailable}
                  className={cn(
                    'h-11 min-w-[3.25rem] rounded-lg border px-4 text-xs font-semibold transition-all shadow-sm',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/20'
                      : isSizeAvailable
                      ? 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
                      : 'border-border/40 bg-muted/50 text-muted-foreground/50 line-through cursor-not-allowed'
                  )}
                  title={!isSizeAvailable ? 'Out of stock' : undefined}
                >
                  {s.size}
                </button>
              )
            })}
          </div>
          {isLowStock && (
            <p className="text-xs font-medium text-amber-600 animate-pulse">
              Hurry, only {variantStock} left in stock!
            </p>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      {inStock && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quantity</label>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg border bg-card shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 text-base font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-bold text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(variantStock, q + 1))}
                disabled={quantity >= variantStock}
                className="h-10 w-10 text-base font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              Max {Math.min(variantStock, 10)} per customer
            </span>
          </div>
        </div>
      )}

      {/* Primary Actions: Add to Cart and Buy Now */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          id="add-to-cart-btn"
          size="lg"
          onClick={handleAddToCart}
          disabled={loading || !inStock}
          className="flex-1 gap-2 text-sm font-semibold h-12 shadow-md transition-all active:scale-[0.98]"
        >
          <ShoppingBag className="h-4 w-4" />
          {loading ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>

        <Button
          id="buy-now-btn"
          size="lg"
          variant="secondary"
          onClick={handleBuyNow}
          disabled={buyingNow || !inStock}
          className="flex-1 gap-2 text-sm font-semibold h-12 border border-primary/20 shadow-sm transition-all active:scale-[0.98]"
        >
          <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
          {buyingNow ? 'Redirecting...' : 'Buy Now'}
        </Button>
      </div>

      {/* Wishlist Button */}
      <Button
        type="button"
        variant="ghost"
        className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed hover:border-solid py-2"
        onClick={() => {
          toggleWishlist(product.id)
          toast.success(wishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist')
        }}
      >
        <Heart className={cn('h-4 w-4', wishlisted && 'fill-rose-500 text-rose-500')} />
        <span>{wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
      </Button>
    </div>
  )
}
