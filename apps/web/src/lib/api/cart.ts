import apiClient from './client'
import { API_ENDPOINTS } from '@ankita/config'
import type { Cart, AddToCartRequest, UpdateCartItemRequest, ApplyCouponRequest, ApiResponse } from '@ankita/types'

export const cartApi = {
  get: async (): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.cart.get)
    return data
  },

  addItem: async (payload: AddToCartRequest): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.cart.addItem, payload)
    return data
  },

  updateItem: async (itemId: string, payload: UpdateCartItemRequest): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.cart.updateItem(itemId), payload)
    return data
  },

  removeItem: async (itemId: string): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.delete(API_ENDPOINTS.cart.removeItem(itemId))
    return data
  },

  applyCoupon: async (payload: ApplyCouponRequest): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.cart.applyCoupon, payload)
    return data
  },

  removeCoupon: async (): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.delete(API_ENDPOINTS.cart.removeCoupon)
    return data
  },

  clear: async (): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(API_ENDPOINTS.cart.clear)
    return data
  },
}
