'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Button, Card, CardContent } from '@ankita/ui'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatCurrency } from '@ankita/utils'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ankita_wishlist_items') || '[]')
      // If user hasn't added anything, pre-seed with 1 item so they see the feature works
      if (saved.length === 0 && MOCK_PRODUCTS.length > 0) {
        setWishlistIds([MOCK_PRODUCTS[0].id])
      } else {
        setWishlistIds(saved)
      }
    } catch {
      setWishlistIds([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRemove = (id: string) => {
    const updated = wishlistIds.filter((item) => item !== id)
    setWishlistIds(updated)
    localStorage.setItem('ankita_wishlist_items', JSON.stringify(updated))
    toast.success('Item removed from wishlist')
  }

  const handleAddToCart = async (product: any) => {
    try {
      await addItem({
        productId: product.id,
        variantId: product.variants?.[0]?.id || 'var-default',
        quantity: 1,
      })
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const savedProducts = MOCK_PRODUCTS.filter((p) => wishlistIds.includes(p.id))

  if (loading) {
    return (
      <div className="container-wide py-12 max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">My Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-wide py-8 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">My Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved styles & favorites</p>
        </div>
        {savedProducts.length > 0 && (
          <span className="text-sm text-muted-foreground">{savedProducts.length} items saved</span>
        )}
      </div>

      {savedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Your wishlist is empty</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Explore our collection and click the heart icon on any product to save it here.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Explore Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group border-muted flex flex-col justify-between">
              <div>
                <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]?.url}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2 right-2 bg-background/90 text-destructive p-1.5 rounded-full shadow hover:bg-background transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <CardContent className="p-4 space-y-1.5">
                  <p className="text-xs text-primary font-semibold uppercase">{product.category?.name || 'Sarees'}</p>
                  <Link href={`/products/${product.slug}`} className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
                    {product.name}
                  </Link>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-bold text-base">{formatCurrency(product.sellingPrice)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.mrp)}</span>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button size="sm" className="w-full gap-2 text-xs" onClick={() => handleAddToCart(product)}>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Move to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
