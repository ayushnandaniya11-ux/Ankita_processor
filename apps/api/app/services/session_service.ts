import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import User from '#models/user'
import UserSession from '#models/user_session'
import RememberMeToken from '#models/remember_me_token'

export interface CreateSessionOptions {
  isRememberMe?: boolean
  ipAddress?: string | null
  userAgent?: string | null
  ctx?: HttpContext
}

export interface SessionValidationResult {
  session: UserSession
  user: User
}

export class SessionService {
  /**
   * Cookie and timeout configurations
   */
  public static get cookieName(): string {
    return env.get('SESSION_COOKIE_NAME') || 'ankita_session'
  }

  public static get rememberCookieName(): string {
    return `${this.cookieName}_rm`
  }

  public static get idleTimeoutMinutes(): number {
    return Number(env.get('SESSION_IDLE_TIMEOUT_MINUTES')) || 30
  }

  public static get absoluteTimeoutHours(): number {
    return Number(env.get('SESSION_ABSOLUTE_TIMEOUT_HOURS')) || 24
  }

  public static get rememberMeDurationDays(): number {
    return Number(env.get('REMEMBER_ME_DURATION_DAYS')) || 30
  }

  public static get isSecureCookie(): boolean {
    const configured = env.get('SESSION_COOKIE_SECURE')
    if (configured !== undefined && configured !== null) {
      return configured === true || String(configured) === 'true'
    }
    return app.inProduction
  }

  public static get sameSiteCookie(): 'lax' | 'strict' | 'none' {
    const configured = env.get('SESSION_COOKIE_SAME_SITE')
    return configured || 'lax'
  }

  /**
   * Generate a cryptographically secure 256-bit random hex token (64 hex characters)
   */
  public static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Hash a raw token with SHA-256 for secure storage
   */
  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex')
  }

  /**
   * Extract raw session token from HttpContext (cookie or authorization header)
   */
  public static extractSessionToken(ctx: HttpContext): string | null {
    // 1. Primary: Configured session cookie (supports standard plain cookies and signed cookies)
    const primaryCookie =
      ctx.request.plainCookie(this.cookieName) || ctx.request.cookie(this.cookieName)
    if (primaryCookie && typeof primaryCookie === 'string' && primaryCookie.trim().length > 0) {
      return primaryCookie.trim()
    }

    // 2. Fallback: Authorization header (Bearer <token>)
    const authHeader = ctx.request.header('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim()
      if (token.length > 0) return token
    }

    // 3. Fallback: X-Session-Token header
    const xSession = ctx.request.header('x-session-token')
    if (xSession && typeof xSession === 'string' && xSession.trim().length > 0) {
      return xSession.trim()
    }

    return null
  }

  /**
   * Create a new server-side session in PostgreSQL and optionally set the session cookie
   */
  public static async createSession(
    user: User,
    options: CreateSessionOptions = {}
  ): Promise<{ session: UserSession; rawToken: string }> {
    const rawToken = this.generateSecureToken()
    const sessionIdHash = this.hashToken(rawToken)
    const now = DateTime.now()

    const isRememberMe = Boolean(options.isRememberMe)

    // Calculate expiration times
    const absoluteExpiresAt = isRememberMe
      ? now.plus({ days: this.rememberMeDurationDays })
      : now.plus({ hours: this.absoluteTimeoutHours })

    const idleExpiresAt = isRememberMe
      ? now.plus({ days: 7 }) // Extended idle window for Remember Me
      : now.plus({ minutes: this.idleTimeoutMinutes })

    const ipAddress = options.ipAddress || (options.ctx ? options.ctx.request.ip() : null)
    const userAgent =
      options.userAgent || (options.ctx ? options.ctx.request.header('user-agent') : null)

    const session = await UserSession.create({
      sessionIdHash,
      userId: user.id,
      role: user.role,
      ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
      isRememberMe,
      isRevoked: false,
      idleExpiresAt: idleExpiresAt > absoluteExpiresAt ? absoluteExpiresAt : idleExpiresAt,
      expiresAt: absoluteExpiresAt,
      lastActivityAt: now,
    })

    // Set cookie on response if context provided
    if (options.ctx) {
      this.setSessionCookie(options.ctx, rawToken, isRememberMe)

      // If Remember Me selected, also create a persistent rotating token pair
      if (isRememberMe) {
        await this.createRememberMeToken(options.ctx, user)
      }
    }

    return { session, rawToken }
  }

  /**
   * Validate a session token against PostgreSQL
   * Checks revocation, idle timeout, and absolute expiration
   */
  public static async validateSession(
    rawToken: string,
    options: { slideIdleTimeout?: boolean } = { slideIdleTimeout: true }
  ): Promise<SessionValidationResult | null> {
    if (!rawToken || typeof rawToken !== 'string') {
      return null
    }

    const sessionIdHash = this.hashToken(rawToken)

    const session = await UserSession.query()
      .where('sessionIdHash', sessionIdHash)
      .preload('user')
      .first()

    if (!session) {
      return null
    }

    const now = DateTime.now()

    // 1. Check if revoked
    if (session.isRevoked) {
      return null
    }

    // 2. Check absolute timeout
    if (now >= session.expiresAt) {
      session.isRevoked = true
      session.revokedReason = 'ABSOLUTE_TIMEOUT'
      await session.save()
      return null
    }

    // 3. Check idle timeout
    if (now >= session.idleExpiresAt) {
      session.isRevoked = true
      session.revokedReason = 'IDLE_TIMEOUT'
      await session.save()
      return null
    }

    // 4. Verify associated user exists and is active
    const user = session.user
    if (!user) {
      session.isRevoked = true
      session.revokedReason = 'USER_NOT_FOUND'
      await session.save()
      return null
    }

    // 5. Keep role in sync with database in case user's role was changed
    if (session.role !== user.role) {
      session.role = user.role
    }

    // 6. Slide idle timeout and update last activity if requested
    if (options.slideIdleTimeout !== false) {
      session.lastActivityAt = now

      const idleDuration = session.isRememberMe ? { days: 7 } : { minutes: this.idleTimeoutMinutes }
      const newIdleExpiry = now.plus(idleDuration)

      // Idle expiration can never exceed absolute expiration
      session.idleExpiresAt = newIdleExpiry > session.expiresAt ? session.expiresAt : newIdleExpiry

      await session.save()
    }

    return { session, user }
  }

  /**
   * Rotate a session to prevent session fixation.
   * Revokes the current session and creates a new one with a fresh ID.
   */
  public static async rotateSession(
    currentSession: UserSession,
    user: User,
    options: CreateSessionOptions = {}
  ): Promise<{ session: UserSession; rawToken: string }> {
    // Revoke previous session with ROTATED reason
    currentSession.isRevoked = true
    currentSession.revokedReason = 'ROTATED'
    await currentSession.save()

    // Create fresh replacement session
    return this.createSession(user, {
      isRememberMe: options.isRememberMe ?? currentSession.isRememberMe,
      ipAddress: options.ipAddress ?? currentSession.ipAddress,
      userAgent: options.userAgent ?? currentSession.userAgent,
      ctx: options.ctx,
    })
  }

  /**
   * Revoke a single session by raw token or hash
   */
  public static async revokeSession(rawToken: string, reason: string = 'LOGOUT'): Promise<boolean> {
    const sessionIdHash = this.hashToken(rawToken)
    const session = await UserSession.findBy('sessionIdHash', sessionIdHash)
    if (!session) return false

    session.isRevoked = true
    session.revokedReason = reason
    await session.save()
    return true
  }

  /**
   * Revoke a specific session by its primary key ID (e.g. admin action)
   */
  public static async revokeSessionById(
    sessionId: number,
    reason: string = 'ADMIN_REVOKED'
  ): Promise<boolean> {
    const session = await UserSession.find(sessionId)
    if (!session) return false

    session.isRevoked = true
    session.revokedReason = reason
    await session.save()
    return true
  }

  /**
   * Revoke all sessions for a user (e.g. password change, admin security reset)
   * Optionally keep the current session active
   */
  public static async revokeAllUserSessions(
    userId: number,
    reason: string = 'SECURITY_RESET',
    exceptSessionId?: number
  ): Promise<number> {
    const query = UserSession.query().where('userId', userId).where('isRevoked', false)

    if (exceptSessionId) {
      query.whereNot('id', exceptSessionId)
    }

    const sessions = await query
    for (const session of sessions) {
      session.isRevoked = true
      session.revokedReason = reason
      await session.save()
    }

    // Also revoke all remember-me tokens for the user
    await RememberMeToken.query().where('userId', userId).delete()

    return sessions.length
  }

  /**
   * Set secure HTTP-only cookie on response
   */
  public static setSessionCookie(
    ctx: HttpContext,
    rawToken: string,
    isRememberMe: boolean = false
  ): void {
    const maxAgeSeconds = isRememberMe ? this.rememberMeDurationDays * 86400 : undefined

    ctx.response.plainCookie(this.cookieName, rawToken, {
      httpOnly: true,
      secure: this.isSecureCookie,
      sameSite: this.sameSiteCookie,
      path: '/',
      maxAge: maxAgeSeconds,
    })

    // Clear legacy authToken if still present
    ctx.response.clearCookie('authToken', {
      httpOnly: true,
      secure: this.isSecureCookie,
      sameSite: this.sameSiteCookie,
      path: '/',
    })
  }

  /**
   * Clear session cookie from response
   */
  public static clearSessionCookie(ctx: HttpContext): void {
    ctx.response.clearCookie(this.cookieName, {
      httpOnly: true,
      secure: this.isSecureCookie,
      sameSite: this.sameSiteCookie,
      path: '/',
    })

    ctx.response.clearCookie(this.rememberCookieName, {
      httpOnly: true,
      secure: this.isSecureCookie,
      sameSite: this.sameSiteCookie,
      path: '/',
    })

    ctx.response.clearCookie('authToken', {
      httpOnly: true,
      secure: this.isSecureCookie,
      sameSite: this.sameSiteCookie,
      path: '/',
    })
  }

  /**
   * Create rotating persistent Remember Me token (Option B)
   */
  public static async createRememberMeToken(ctx: HttpContext, user: User): Promise<string> {
    const series = this.generateSecureToken().substring(0, 32)
    const token = this.generateSecureToken()
    const tokenHash = this.hashToken(token)

    const expiresAt = DateTime.now().plus({ days: this.rememberMeDurationDays })

    await RememberMeToken.create({
      userId: user.id,
      series,
      tokenHash,
      expiresAt,
      ipAddress: ctx.request.ip()?.substring(0, 45) || null,
      userAgent: ctx.request.header('user-agent')?.substring(0, 500) || null,
    })

    // Cookie value: series:token
    const cookieValue = `${series}:${token}`
    ctx.response.plainCookie(this.rememberCookieName, cookieValue, {
      httpOnly: true,
      secure: this.isSecureCookie,
      sameSite: this.sameSiteCookie,
      path: '/',
      maxAge: this.rememberMeDurationDays * 86400,
    })

    return cookieValue
  }

  /**
   * Consume and rotate Remember Me token when normal session expired
   * Detects token theft if a used series has an invalid token
   */
  public static async consumeRememberMeToken(
    ctx: HttpContext
  ): Promise<{ user: User; session: UserSession; rawToken: string } | null> {
    const cookieValue =
      ctx.request.plainCookie(this.rememberCookieName) ||
      ctx.request.cookie(this.rememberCookieName)
    if (!cookieValue || typeof cookieValue !== 'string') {
      return null
    }

    const parts = cookieValue.split(':')
    if (parts.length !== 2) {
      this.clearSessionCookie(ctx)
      return null
    }

    const [series, rawToken] = parts
    const record = await RememberMeToken.query().where('series', series).preload('user').first()

    if (!record) {
      // Series not found
      return null
    }

    // Verify token hash
    const expectedHash = this.hashToken(rawToken)
    if (record.tokenHash !== expectedHash) {
      // CRITICAL: Possible token theft detected! The series was reused with wrong token.
      // Invalidate all tokens for this user for security
      await RememberMeToken.query().where('userId', record.userId).delete()
      await this.revokeAllUserSessions(record.userId, 'POSSIBLE_REMEMBER_ME_THEFT')
      this.clearSessionCookie(ctx)
      return null
    }

    // Check expiration
    if (record.expiresAt < DateTime.now()) {
      await record.delete()
      this.clearSessionCookie(ctx)
      return null
    }

    const user = record.user
    if (!user) {
      await record.delete()
      return null
    }

    // Token is valid! Rotate it immediately (prevent replay)
    const newToken = this.generateSecureToken()
    record.tokenHash = this.hashToken(newToken)
    record.expiresAt = DateTime.now().plus({ days: this.rememberMeDurationDays })
    await record.save()

    // Update remember cookie with new token for the same series
    ctx.response.plainCookie(this.rememberCookieName, `${series}:${newToken}`, {
      httpOnly: true,
      secure: this.isSecureCookie,
      sameSite: this.sameSiteCookie,
      path: '/',
      maxAge: this.rememberMeDurationDays * 86400,
    })

    // Create a new session for this user
    const { session, rawToken: newSessionToken } = await this.createSession(user, {
      isRememberMe: true,
      ctx,
    })

    return { user, session, rawToken: newSessionToken }
  }

  /**
   * Automatic background cleanup for expired and old revoked sessions
   */
  public static async cleanupExpiredSessions(): Promise<{
    cleanedSessions: number
    cleanedRememberTokens: number
  }> {
    const now = DateTime.now()

    // 1. Delete expired sessions past 24-hour grace period
    const expiredSessions = await UserSession.query()
      .where('expiresAt', '<', now.minus({ days: 1 }).toSQL()!)
      .orWhere((query) => {
        query.where('isRevoked', true).where('updatedAt', '<', now.minus({ days: 7 }).toSQL()!)
      })
      .delete()

    // 2. Delete expired remember me tokens
    const expiredTokens = await RememberMeToken.query()
      .where('expiresAt', '<', now.toSQL()!)
      .delete()

    return {
      cleanedSessions: Number(expiredSessions[0] || 0),
      cleanedRememberTokens: Number(expiredTokens[0] || 0),
    }
  }
}

export default SessionService
