'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ankita_wishlist_items'

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const readStorage = useCallback((): string[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    setWishlistIds(readStorage())

    const handleSync = () => {
      setWishlistIds(readStorage())
    }

    window.addEventListener('ankita-wishlist-updated', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      window.removeEventListener('ankita-wishlist-updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [readStorage])

  const isWishlisted = useCallback(
    (productId: string) => {
      return wishlistIds.includes(productId)
    },
    [wishlistIds]
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      setLoading(true)
      try {
        const current = readStorage()
        const exists = current.includes(productId)
        const updated = exists
          ? current.filter((id) => id !== productId)
          : [...current, productId]

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setWishlistIds(updated)
        window.dispatchEvent(new Event('ankita-wishlist-updated'))
      } finally {
        setLoading(false)
      }
    },
    [readStorage]
  )

  return {
    wishlist: wishlistIds.map((id) => ({ productId: id })),
    isWishlisted,
    toggleWishlist,
    loading,
  }
}

