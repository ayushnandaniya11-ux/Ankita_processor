import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import encryption from '@adonisjs/core/services/encryption'
import User from '#models/user'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    user?: User
  }
}

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const token = ctx.request.cookie('authToken')
    if (!token) {
      return ctx.response.unauthorized({ error: { message: 'Unauthorized, missing token' } })
    }

    try {
      const payload = encryption.decrypt(token) as { userId: number }
      if (!payload || !payload.userId) {
        throw new Error('Invalid token payload')
      }

      const user = await User.find(payload.userId)
      if (!user) {
        throw new Error('User not found')
      }

      ctx.user = user
      return next()
    } catch (error) {
      ctx.response.clearCookie('authToken', { path: '/', sameSite: 'lax' })
      return ctx.response.unauthorized({ error: { message: 'Unauthorized, invalid or expired token' } })
    }
  }
}
