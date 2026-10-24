import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import SessionService from '#services/session_service'
import UserSession from '#models/user_session'

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await User.query().orderBy('id', 'desc')
    return response.ok(users)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.ok(user)
  }

  async store({ request, response }: HttpContext) {
    const schema = vine.object({
      name: vine.string().trim(),
      email: vine.string().email().normalizeEmail(),
      password: vine.string().minLength(6),
      phone: vine.string().trim().optional(),
      role: vine.enum(['CUSTOMER', 'ADMIN', 'WHOLESALE', 'SUPER_ADMIN', 'EMPLOYEE']).optional(),
    })
    const payload = await request.validateUsing(vine.compile(schema))

    const user = await User.create(payload)
    return response.created(user)
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    const schema = vine.object({
      name: vine.string().trim().optional(),
      email: vine.string().email().normalizeEmail().optional(),
      password: vine.string().minLength(6).optional(),
      phone: vine.string().trim().optional(),
      role: vine.enum(['CUSTOMER', 'ADMIN', 'WHOLESALE', 'SUPER_ADMIN', 'EMPLOYEE']).optional(),
    })
    const payload = await request.validateUsing(vine.compile(schema))

    const roleChanged = payload.role && payload.role !== user.role
    const passwordChanged = Boolean(payload.password)

    user.merge(payload)
    await user.save()

    // If role or password changed, revoke active sessions immediately to enforce privilege change
    if (roleChanged || passwordChanged) {
      await SessionService.revokeAllUserSessions(
        user.id,
        roleChanged ? 'ROLE_PRIVILEGE_CHANGED' : 'ADMIN_PASSWORD_RESET'
      )
    }

    return response.ok(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await SessionService.revokeAllUserSessions(user.id, 'USER_DELETED')
    await user.delete()
    return response.noContent()
  }

  /**
   * List all sessions for a specific user (Admin only)
   */
  async userSessions({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    const sessions = await UserSession.query()
      .where('userId', user.id)
      .orderBy('lastActivityAt', 'desc')

    return response.ok({
      userId: user.id,
      sessions: sessions.map((s) => ({
        id: s.id,
        role: s.role,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        isRememberMe: s.isRememberMe,
        isRevoked: s.isRevoked,
        revokedReason: s.revokedReason,
        lastActivityAt: s.lastActivityAt,
        expiresAt: s.expiresAt,
        idleExpiresAt: s.idleExpiresAt,
        createdAt: s.createdAt,
      })),
    })
  }

  /**
   * Revoke all active sessions for a user (Admin only)
   */
  async revokeUserSessions({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    const count = await SessionService.revokeAllUserSessions(user.id, 'ADMIN_REVOKED')

    return response.ok({
      message: `Successfully revoked ${count} session(s) for user ${user.name}`,
      revokedCount: count,
    })
  }

  /**
   * Revoke a single session by session ID (Admin only)
   */
  async revokeSessionById({ params, response }: HttpContext) {
    const success = await SessionService.revokeSessionById(params.sessionId, 'ADMIN_REVOKED')

    if (!success) {
      return response.notFound({ error: { message: 'Session not found' } })
    }

    return response.ok({ message: 'Session revoked successfully' })
  }

  /**
   * Trigger automatic cleanup of expired and old revoked sessions
   */
  async cleanupExpiredSessions({ response }: HttpContext) {
    const result = await SessionService.cleanupExpiredSessions()

    return response.ok({
      message: 'Expired sessions cleaned up successfully',
      result,
    })
  }
}
