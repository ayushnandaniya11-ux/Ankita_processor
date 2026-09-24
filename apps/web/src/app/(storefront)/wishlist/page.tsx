import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@ankita/ui'

export const metadata: Metadata = { title: 'My Wishlist', description: 'Your saved items' }

export default function WishlistPage() {
  return (
    <div className="container-wide py-8 max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold">My Wishlist</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Heart className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-base font-semibold">Your wishlist is empty</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Save items you love to your wishlist and revisit them anytime.
        </p>
        <Button asChild><Link href="/new-arrivals">Explore Collection</Link></Button>
      </div>
    </div>
  )
}
