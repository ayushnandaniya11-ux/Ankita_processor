import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'
import UserSession from '#models/user_session'
import SessionService from '#services/session_service'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    user?: User
    userSession?: UserSession
  }
}

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const rawToken = SessionService.extractSessionToken(ctx)

    if (rawToken) {
      const result = await SessionService.validateSession(rawToken)
      if (result) {
        ctx.user = result.user
        ctx.userSession = result.session
        if (ctx.auth) {
          try {
            ;(ctx.auth.use('web') as any).user = result.user
          } catch {}
        }
        return next()
      }
    }

    // Attempt persistent Remember-Me token recovery if primary session was expired/missing
    const recovered = await SessionService.consumeRememberMeToken(ctx)
    if (recovered) {
      ctx.user = recovered.user
      ctx.userSession = recovered.session
      if (ctx.auth) {
        try {
          ;(ctx.auth.use('web') as any).user = recovered.user
        } catch {}
      }
      return next()
    }

    // If both failed, clean up any invalid cookies and reject
    SessionService.clearSessionCookie(ctx)
    return ctx.response.unauthorized({
      error: {
        code: 'SESSION_EXPIRED',
        message: 'Unauthorized: Session missing, invalid, or expired',
      },
    })
  }
}
