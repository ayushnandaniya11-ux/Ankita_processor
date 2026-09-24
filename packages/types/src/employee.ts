// ============================================
// Employee & RBAC Types
// ============================================

import type { BaseEntity } from './common'

export interface Employee extends BaseEntity {
  userId: string
  name: string
  email: string
  phone?: string
  roleId: string
  role?: Role
  department?: string
  isActive: boolean
  lastLoginAt?: string
  hiredAt?: string
}

export interface Role extends BaseEntity {
  name: string
  slug: string
  description?: string
  permissions: Permission[]
  isSystem: boolean
  employeeCount?: number
}

export interface Permission extends BaseEntity {
  name: string
  slug: string
  module: string
  description?: string
}

/** Pre-defined role slugs */
export type SystemRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ORDER_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'PRODUCT_MANAGER'
  | 'ACCOUNTANT'
  | 'SUPPORT'
  | 'LOGISTICS_MANAGER'

/** Permission module groupings */
export type PermissionModule =
  | 'orders'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'payments'
  | 'invoices'
  | 'employees'
  | 'settings'
  | 'logistics'
  | 'returns'
  | 'reports'
  | 'gst'

/** Permission action types */
export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'export'

export interface EmployeeFormData {
  name: string
  email: string
  phone?: string
  password?: string
  roleId: string
  department?: string
  isActive: boolean
}

export interface EmployeeListParams {
  page?: number
  perPage?: number
  search?: string
  roleId?: string
  isActive?: boolean
  sortBy?: 'name' | 'email' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface RoleFormData {
  name: string
  slug: string
  description?: string
  permissionIds: string[]
}

/** Audit log entry */
export interface AuditLog extends BaseEntity {
  userId: string
  userName: string
  action: string
  entity: string
  entityId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export interface AuditLogListParams {
  page?: number
  perPage?: number
  userId?: string
  action?: string
  entity?: string
  dateFrom?: string
  dateTo?: string
  sortOrder?: 'asc' | 'desc'
}
