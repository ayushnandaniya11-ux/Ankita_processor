import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Employee from '#models/employee'

export default class RbacMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedPermissions: string[]) {
    const user = ctx.user
    if (!user) {
      return ctx.response.unauthorized({ error: 'Unauthorized' })
    }

    if (user.role === 'SUPER_ADMIN') {
      return next() // Super admin has all permissions
    }

    if (user.role !== 'EMPLOYEE' && user.role !== 'ADMIN') {
      return ctx.response.forbidden({ error: 'Forbidden: You are not an employee' })
    }

    // Load employee and their roles/permissions
    const employee = await Employee.query()
      .where('user_id', user.id)
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .first()

    if (!employee || employee.status !== 'ACTIVE') {
      return ctx.response.forbidden({ error: 'Forbidden: Account inactive or not found' })
    }

    // Check permissions
    if (allowedPermissions && allowedPermissions.length > 0) {
      const userPermissions = new Set<string>()

      for (const role of employee.roles) {
        for (const permission of role.permissions) {
          userPermissions.add(permission.action)
        }
      }

      const hasPermission = allowedPermissions.some((perm) => userPermissions.has(perm))

      if (!hasPermission) {
        return ctx.response.forbidden({ error: 'Forbidden: Insufficient permissions' })
      }
    }

    // Pass employee to ctx for future use
    ctx.employee = employee

    return next()
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    employee?: Employee
  }
}
