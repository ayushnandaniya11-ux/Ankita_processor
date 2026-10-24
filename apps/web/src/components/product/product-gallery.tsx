'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, X, ImageOff } from 'lucide-react'
import { cn, resolveImageUrl } from '@ankita/utils'
import type { ProductImage } from '@ankita/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  // Format and normalize images list
  const validImages = Array.isArray(images) && images.length > 0
    ? images
    : [{ id: 'default', productId: '', url: '', sortOrder: 0, isPrimary: true }]

  // Safe active image
  const currentIndex = Math.min(Math.max(0, activeIndex), validImages.length - 1)
  const activeImage = validImages[currentIndex]

  const nextImage = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % validImages.length)
  }, [validImages.length])

  const prevImage = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }, [validImages.length])

  // Keyboard navigation for lightbox and gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') setIsLightboxOpen(false)
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'ArrowLeft') prevImage()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, nextImage, prevImage])

  const currentUrl = resolveImageUrl(activeImage?.url)
  const isCurrentFailed = !currentUrl || failedImages[currentUrl]

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-100 border shadow-sm">
        {!isCurrentFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt={(activeImage as any)?.altText || `${productName} - View ${currentIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              setFailedImages((prev) => ({ ...prev, [currentUrl]: true }))
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-12 w-12 stroke-[1.5]" />
            <span className="text-xs font-medium">Photograph Unavailable</span>
          </div>
        )}

        {/* Counter Badge */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {currentIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Zoom Lightbox Trigger Button */}
        {!isCurrentFailed && (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Enlarge image"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur transition-all hover:bg-background hover:scale-110"
          >
            <ZoomIn className="h-4 w-4 text-foreground" />
          </button>
        )}

        {/* Previous / Next Controls on Main Image */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur transition-all hover:bg-background hover:scale-110 opacity-80 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur transition-all hover:bg-background hover:scale-110 opacity-80 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Gallery */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {validImages.map((img, i) => {
            const thumbUrl = resolveImageUrl(img.url)
            const isThumbFailed = !thumbUrl || failedImages[thumbUrl]
            const isSelected = i === currentIndex

            return (
              <button
                key={img.id || i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-stone-100 transition-all focus:outline-none',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-sm scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-muted-foreground/40'
                )}
              >
                {!isThumbFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrl}
                    alt={(img as any)?.altText || `${productName} thumbnail ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-4 w-4" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && !isCurrentFailed && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close zoom preview"
            className="absolute top-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt={(activeImage as any)?.altText || productName}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
            />

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1 text-sm font-medium text-white">
                  {currentIndex + 1} / {validImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
