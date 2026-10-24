import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import User from '#models/user'
import UserSession from '#models/user_session'
import RememberMeToken from '#models/remember_me_token'
import SessionService from '#services/session_service'

test.group('SessionService Unit Tests', (group) => {
  let testUser: User

  group.setup(async () => {
    // Find or create a test user
    let user = await User.findBy('email', 'session_test@ankita.com')
    if (!user) {
      user = await User.create({
        name: 'Session Test User',
        email: 'session_test@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    testUser = user
  })

  group.teardown(async () => {
    if (testUser) {
      await UserSession.query().where('userId', testUser.id).delete()
      await RememberMeToken.query().where('userId', testUser.id).delete()
      await testUser.delete()
    }
  })

  group.each.setup(async () => {
    if (testUser) {
      await UserSession.query().where('userId', testUser.id).delete()
      await RememberMeToken.query().where('userId', testUser.id).delete()
    }
  })

  test('generates cryptographically secure 256-bit tokens and valid SHA-256 hashes', async ({
    assert,
  }) => {
    const token1 = SessionService.generateSecureToken()
    const token2 = SessionService.generateSecureToken()

    assert.equal(token1.length, 64) // 32 bytes hex = 64 characters
    assert.equal(token2.length, 64)
    assert.notEqual(token1, token2)

    const hash1 = SessionService.hashToken(token1)
    const hash2 = SessionService.hashToken(token1)
    assert.equal(hash1.length, 64)
    assert.equal(hash1, hash2) // Deterministic SHA-256
    assert.notEqual(hash1, token1) // Never equal to raw token
  })

  test('creates normal session (Option A) with idle and absolute expiration', async ({
    assert,
  }) => {
    const { session, rawToken } = await SessionService.createSession(testUser, {
      isRememberMe: false,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 TestBrowser',
    })

    assert.isNotNull(session.id)
    assert.equal(session.userId, testUser.id)
    assert.equal(session.role, 'CUSTOMER')
    assert.isFalse(session.isRememberMe)
    assert.isFalse(session.isRevoked)
    assert.equal(session.ipAddress, '127.0.0.1')

    // Verify hash matches raw token
    assert.equal(session.sessionIdHash, SessionService.hashToken(rawToken))

    // Idle timeout: now + 30 min (default)
    const idleDiffMinutes = session.idleExpiresAt.diff(DateTime.now(), 'minutes').minutes
    assert.isTrue(idleDiffMinutes > 28 && idleDiffMinutes <= 30.1)

    // Absolute timeout: now + 24 hours (default)
    const absDiffHours = session.expiresAt.diff(DateTime.now(), 'hours').hours
    assert.isTrue(absDiffHours > 23 && absDiffHours <= 24.1)
  })

  test('creates remember-me session (Option B) with extended expiration', async ({ assert }) => {
    const { session } = await SessionService.createSession(testUser, {
      isRememberMe: true,
    })

    assert.isTrue(session.isRememberMe)
    // Absolute expiration: now + 30 days
    const daysDiff = session.expiresAt.diff(DateTime.now(), 'days').days
    assert.isTrue(daysDiff > 29 && daysDiff <= 30.1)
  })

  test('validates active session and slides idle timeout', async ({ assert }) => {
    const { session: created, rawToken } = await SessionService.createSession(testUser, {
      isRememberMe: false,
    })

    const initialIdle = created.idleExpiresAt

    // Wait 50ms so timestamp shifts
    await new Promise((resolve) => setTimeout(resolve, 50))

    const validated = await SessionService.validateSession(rawToken)
    assert.isNotNull(validated)
    assert.equal(validated!.user.id, testUser.id)
    assert.equal(validated!.session.id, created.id)

    // Verify idle timeout slid forward
    assert.isTrue(validated!.session.idleExpiresAt.toMillis() >= initialIdle.toMillis())
  })

  test('rejects expired session and marks it revoked', async ({ assert }) => {
    const { session, rawToken } = await SessionService.createSession(testUser, {
      isRememberMe: false,
    })

    // Artificially expire the session
    session.expiresAt = DateTime.now().minus({ minutes: 5 })
    await session.save()

    const validated = await SessionService.validateSession(rawToken)
    assert.isNull(validated)

    // Check that it was marked revoked in DB
    const refreshed = await UserSession.find(session.id)
    assert.isTrue(refreshed!.isRevoked)
    assert.equal(refreshed!.revokedReason, 'ABSOLUTE_TIMEOUT')
  })

  test('rejects idle-timed-out session and marks it revoked', async ({ assert }) => {
    const { session, rawToken } = await SessionService.createSession(testUser, {
      isRememberMe: false,
    })

    // Artificially expire idle timeout
    session.idleExpiresAt = DateTime.now().minus({ minutes: 1 })
    await session.save()

    const validated = await SessionService.validateSession(rawToken)
    assert.isNull(validated)

    const refreshed = await UserSession.find(session.id)
    assert.isTrue(refreshed!.isRevoked)
    assert.equal(refreshed!.revokedReason, 'IDLE_TIMEOUT')
  })

  test('rotates session ID to prevent session fixation', async ({ assert }) => {
    const { session: oldSession, rawToken: oldRawToken } =
      await SessionService.createSession(testUser)

    const { session: newSession, rawToken: newRawToken } = await SessionService.rotateSession(
      oldSession,
      testUser
    )

    // Tokens must be completely different
    assert.notEqual(oldRawToken, newRawToken)
    assert.notEqual(oldSession.id, newSession.id)

    // Old session must be revoked
    const refreshedOld = await UserSession.find(oldSession.id)
    assert.isTrue(refreshedOld!.isRevoked)
    assert.equal(refreshedOld!.revokedReason, 'ROTATED')

    // Old token should no longer validate
    const oldCheck = await SessionService.validateSession(oldRawToken)
    assert.isNull(oldCheck)

    // New token must validate successfully
    const newCheck = await SessionService.validateSession(newRawToken)
    assert.isNotNull(newCheck)
  })

  test('revokes a single session by token (logout)', async ({ assert }) => {
    const { session, rawToken } = await SessionService.createSession(testUser)

    const revoked = await SessionService.revokeSession(rawToken, 'LOGOUT')
    assert.isTrue(revoked)

    const check = await SessionService.validateSession(rawToken)
    assert.isNull(check)

    const refreshed = await UserSession.find(session.id)
    assert.isTrue(refreshed!.isRevoked)
    assert.equal(refreshed!.revokedReason, 'LOGOUT')
  })

  test('revokes all user sessions on password change or security reset', async ({ assert }) => {
    const s1 = await SessionService.createSession(testUser)
    const s2 = await SessionService.createSession(testUser)
    const s3 = await SessionService.createSession(testUser)

    // Keep s3 active as the current session, revoke all others
    const count = await SessionService.revokeAllUserSessions(
      testUser.id,
      'PASSWORD_CHANGED',
      s3.session.id
    )
    assert.equal(count, 2)

    assert.isNull(await SessionService.validateSession(s1.rawToken))
    assert.isNull(await SessionService.validateSession(s2.rawToken))
    assert.isNotNull(await SessionService.validateSession(s3.rawToken))
  })

  test('cleans up expired and old revoked sessions', async ({ assert }) => {
    // Create an old expired session
    const oldSession = await UserSession.create({
      sessionIdHash: SessionService.hashToken('dummy-old-token'),
      userId: testUser.id,
      role: 'CUSTOMER',
      isRememberMe: false,
      isRevoked: true,
      revokedReason: 'LOGOUT',
      idleExpiresAt: DateTime.now().minus({ days: 10 }),
      expiresAt: DateTime.now().minus({ days: 10 }),
      lastActivityAt: DateTime.now().minus({ days: 10 }),
    })

    // Manually set updatedAt to 8 days ago
    oldSession.updatedAt = DateTime.now().minus({ days: 8 })
    await oldSession.save()

    const cleanup = await SessionService.cleanupExpiredSessions()
    assert.isTrue(cleanup.cleanedSessions >= 1)

    const found = await UserSession.find(oldSession.id)
    assert.isNull(found)
  })
})
