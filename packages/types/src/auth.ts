// ============================================
// Auth Types
// ============================================

import type { BaseEntity } from './common'

export interface AuthUser extends BaseEntity {
  email: string
  phone?: string
  name: string
  role: UserRole
  isActive: boolean
  emailVerifiedAt?: string
}

export type UserRole = 'CUSTOMER' | 'WHOLESALER' | 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE'

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface RefreshTokenRequest {
  refreshToken: string
}
