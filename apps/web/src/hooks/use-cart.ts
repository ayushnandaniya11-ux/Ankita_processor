'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { cartApi } from '@/lib/api/cart'
import type { AddToCartRequest } from '@ankita/types'

const CART_KEY = '/cart'

export function useCart() {
  const { data, mutate, isLoading } = useSWR(CART_KEY, () => cartApi.get().then((r) => r.data), {
    revalidateOnFocus: false,
  })

  const [loading, setLoading] = useState(false)

  const addItem = useCallback(
    async (payload: AddToCartRequest) => {
      setLoading(true)
      try {
        const result = await cartApi.addItem(payload)
        await mutate(result.data, false)
        return result
      } finally {
        setLoading(false)
      }
    },
    [mutate]
  )

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      setLoading(true)
      try {
        const result = await cartApi.updateItem(itemId, { quantity })
        await mutate(result.data, false)
        return result
      } finally {
        setLoading(false)
      }
    },
    [mutate]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      setLoading(true)
      try {
        const result = await cartApi.removeItem(itemId)
        await mutate(result.data, false)
        return result
      } finally {
        setLoading(false)
      }
    },
    [mutate]
  )

  const applyCoupon = useCallback(
    async (couponCode: string) => {
      const result = await cartApi.applyCoupon({ couponCode })
      await mutate(result.data, false)
      return result
    },
    [mutate]
  )

  const removeCoupon = useCallback(async () => {
    const result = await cartApi.removeCoupon()
    await mutate(result.data, false)
    return result
  }, [mutate])

  return {
    cart: data,
    itemCount: data?.itemCount ?? 0,
    isLoading,
    loading,
    addItem,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
    mutate,
  }
}
