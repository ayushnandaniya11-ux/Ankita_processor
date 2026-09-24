import apiClient from './client'
import { API_ENDPOINTS } from '@ankita/config'
import type { Product, PaginatedResponse, ApiResponse, ProductListParams } from '@ankita/types'

export const productsApi = {
  list: async (params?: ProductListParams): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.products.list, { params })
    return data
  },

  detail: async (slug: string): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.products.detail(slug))
    return data
  },

  newArrivals: async (): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.products.newArrivals)
    return data
  },

  bestSellers: async (): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.products.bestSellers)
    return data
  },

  search: async (query: string, params?: ProductListParams): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.products.search, { params: { q: query, ...params } })
    return data
  },

  create: async (payload: FormData): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.products.create, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  update: async (id: string, payload: FormData): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.put(API_ENDPOINTS.products.update(id), payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(API_ENDPOINTS.products.delete(id))
    return data
  },
}
