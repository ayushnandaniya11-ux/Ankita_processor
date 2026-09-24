'use client'

import useSWR from 'swr'
import { useCallback } from 'react'
import { authApi } from '@/lib/api/auth'
import type { LoginRequest, RegisterRequest } from '@ankita/types'

export function useAuth() {
  const { data: user, mutate, isLoading } = useSWR(
    '/auth/me',
    () => {
      if (typeof window !== 'undefined' && !localStorage.getItem('ap_access_token')) {
        return null
      }
      return authApi.me().then((r) => r.data).catch(() => null)
    },
    { revalidateOnFocus: false }
  )

  const login = useCallback(
    async (payload: LoginRequest) => {
      const result = await authApi.login(payload)
      const { tokens, user: userData } = result.data
      localStorage.setItem('ap_access_token', tokens.accessToken)
      if (tokens.refreshToken) {
        localStorage.setItem('ap_refresh_token', tokens.refreshToken)
      }
      await mutate(userData, false)
      return result
    },
    [mutate]
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const result = await authApi.register(payload)
      const { tokens, user: userData } = result.data
      localStorage.setItem('ap_access_token', tokens.accessToken)
      if (tokens.refreshToken) {
        localStorage.setItem('ap_refresh_token', tokens.refreshToken)
      }
      await mutate(userData, false)
      return result
    },
    [mutate]
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem('ap_access_token')
      localStorage.removeItem('ap_refresh_token')
      await mutate(null, false)
    }
  }, [mutate])

  return { user, isLoading, login, register, logout, mutate }
}
