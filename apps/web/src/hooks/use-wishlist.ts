'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@ankita/config'

const WISHLIST_KEY = '/wishlist'

export function useWishlist() {
  const { data, mutate } = useSWR(WISHLIST_KEY, () =>
    apiClient.get(API_ENDPOINTS.wishlist.list).then((r) => r.data.data)
  )

  const [loading, setLoading] = useState(false)

  const isWishlisted = useCallback(
    (productId: string) => {
      return data?.some((item: { productId: string }) => item.productId === productId) ?? false
    },
    [data]
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      setLoading(true)
      try {
        if (isWishlisted(productId)) {
          await apiClient.delete(API_ENDPOINTS.wishlist.remove(productId))
        } else {
          await apiClient.post(API_ENDPOINTS.wishlist.add, { productId })
        }
        await mutate()
      } finally {
        setLoading(false)
      }
    },
    [isWishlisted, mutate]
  )

  return {
    wishlist: data ?? [],
    isWishlisted,
    toggleWishlist,
    loading,
  }
}
