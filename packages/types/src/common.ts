// ============================================
// Common / Shared Types
// ============================================

/** Standard API success response */
export interface ApiResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    fields?: Record<string, string[]>
  }
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> {
  success: true
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  lastPage: number
}

/** Query params for paginated list endpoints */
export interface PaginationParams {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/** Base entity with timestamps */
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

/** Sort direction */
export type SortOrder = 'asc' | 'desc'

/** Generic select option */
export interface SelectOption {
  label: string
  value: string
}

/** Address */
export interface Address extends BaseEntity {
  userId: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  type: AddressType
}

export type AddressType = 'HOME' | 'WORK' | 'OTHER'

/** File upload */
export interface UploadedFile {
  id: string
  url: string
  filename: string
  mimeType: string
  size: number
  provider: string
}
