import apiClient from './client'
import { API_ENDPOINTS } from '@ankita/config'
import type { AuthUser, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, LoginResponse, ApiResponse } from '@ankita/types'

export const authApi = {
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.login, payload)
    return data
  },

  register: async (payload: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.register, payload)
    return data
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.logout)
    return data
  },

  me: async (): Promise<ApiResponse<AuthUser>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.auth.me)
    return data
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.forgotPassword, payload)
    return data
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.resetPassword, payload)
    return data
  },
}
