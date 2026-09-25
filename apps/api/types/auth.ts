import { Authenticator } from '@adonisjs/auth'
import type { Authenticators } from '@adonisjs/auth/types'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    auth: Authenticator<Authenticators>
  }
}
