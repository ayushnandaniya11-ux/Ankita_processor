'use client'

import useSWR from 'swr'
import { useCallback } from 'react'
import { authApi } from '@/lib/api/auth'
import type { LoginRequest, RegisterRequest } from '@ankita/types'



export function useAuth() {
  const { data: user, mutate, isLoading } = useSWR(
    '/auth/me',
    () => authApi.me().then((r) => r.data).catch(() => null),
    { revalidateOnFocus: false }
  )

  const login = useCallback(
    async (payload: LoginRequest) => {
      const result = await authApi.login(payload) as any
      if (result.requiresOtp) return result

      await mutate(result.user, false)
      return result
    },
    [mutate]
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const result = await authApi.register(payload) as any
      if (result.requiresOtp) return result

      await mutate(result.user, false)
      return result
    },
    [mutate]
  )

  const verifyOtp = useCallback(
    async (payload: { userId: number, otp: string }) => {
      const result = await authApi.verifyOtp(payload) as any
      await mutate(result.user, false)
      return result
    },
    [mutate]
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      await mutate(null, false)
    }
  }, [mutate])

  return { user, isLoading, login, register, verifyOtp, logout, mutate }
}
