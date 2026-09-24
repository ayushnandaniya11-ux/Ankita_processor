// ============================================
// API Types
// ============================================

/** API error codes */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'PAYMENT_FAILED'
  | 'INSUFFICIENT_STOCK'
  | 'ORDER_NOT_CANCELLABLE'
  | 'RETURN_NOT_ELIGIBLE'
  | 'FILE_UPLOAD_ERROR'
  | 'SERVICE_UNAVAILABLE'

/** HTTP methods */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** API versions */
export const API_VERSION = 'v1' as const
export const API_BASE_PATH = `/api/${API_VERSION}` as const
