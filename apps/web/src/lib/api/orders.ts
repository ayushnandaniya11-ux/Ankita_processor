import apiClient from './client'
import { API_ENDPOINTS } from '@ankita/config'
import type { Order, PaginatedResponse, ApiResponse, OrderListParams, CreateOrderRequest } from '@ankita/types'

export const ordersApi = {
  list: async (params?: OrderListParams): Promise<PaginatedResponse<Order>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.orders.list, { params })
    return data
  },

  detail: async (id: string): Promise<ApiResponse<Order>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.orders.detail(id))
    return data
  },

  create: async (payload: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.orders.create, payload)
    return data
  },

  cancel: async (id: string, reason: string): Promise<ApiResponse<Order>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.orders.cancel(id), { reason })
    return data
  },

  track: async (id: string): Promise<ApiResponse<Order>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.orders.track(id))
    return data
  },

  invoice: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(API_ENDPOINTS.orders.invoice(id), {
      responseType: 'blob',
    })
    return data
  },
}
