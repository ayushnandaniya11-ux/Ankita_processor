'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@ankita/utils'
import type { ProductImage } from '@ankita/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-100">
        {activeImage?.url ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText || productName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">🛍️</div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative h-16 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                i === activeIndex ? 'border-foreground' : 'border-transparent hover:border-muted-foreground'
              )}
            >
              {img.url ? (
                <Image src={img.url} alt={img.altText || `${productName} ${i + 1}`} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-100 text-xl">🛍️</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
