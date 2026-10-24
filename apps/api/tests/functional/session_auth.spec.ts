import { test } from '@japa/runner'
import User from '#models/user'
import UserSession from '#models/user_session'
import SessionService from '#services/session_service'

test.group('Session Auth Functional Tests', (group) => {
  let customerUser: User
  let adminUser: User

  group.setup(async () => {
    // 1. Create or ensure test customer
    let customer = await User.findBy('email', 'func_customer@ankita.com')
    if (!customer) {
      customer = await User.create({
        name: 'Functional Customer',
        email: 'func_customer@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    customerUser = customer

    // 2. Create or ensure test admin
    let admin = await User.findBy('email', 'func_admin@ankita.com')
    if (!admin) {
      admin = await User.create({
        name: 'Functional Admin',
        email: 'func_admin@ankita.com',
        password: 'Password123!',
        role: 'ADMIN',
      })
    }
    adminUser = admin
  })

  group.teardown(async () => {
    if (customerUser) {
      await UserSession.query().where('userId', customerUser.id).delete()
      await customerUser.delete()
    }
    if (adminUser) {
      await UserSession.query().where('userId', adminUser.id).delete()
      await adminUser.delete()
    }
  })

  test('login creates session in PostgreSQL and returns secure HttpOnly cookie', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: customerUser.email,
      password: 'Password123!',
      rememberMe: false,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Logged in successfully',
      user: {
        id: customerUser.id,
        role: 'CUSTOMER',
      },
    })

    // Assert session cookie is set
    const cookieHeader = response.header('set-cookie')
    assert.isDefined(cookieHeader)
    const cookieStr = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : String(cookieHeader)
    assert.isTrue(cookieStr.includes(SessionService.cookieName))
    assert.isTrue(cookieStr.toLowerCase().includes('httponly'))
    assert.isTrue(cookieStr.toLowerCase().includes('samesite=lax'))

    // Assert session record exists in database
    const sessions = await UserSession.query()
      .where('userId', customerUser.id)
      .where('isRevoked', false)
    assert.isTrue(sessions.length >= 1)
  })

  function extractToken(res: any): string {
    const cookie = res.cookie(SessionService.cookieName)
    return typeof cookie === 'object' && cookie !== null ? cookie.value : String(cookie || '')
  }

  test('validates session and allows access to protected /auth/me with cookie', async ({
    client,
  }) => {
    // 1. Login to get cookie
    const loginRes = await client.post('/api/v1/auth/login').json({
      email: customerUser.email,
      password: 'Password123!',
    })
    loginRes.assertStatus(200)

    const token = extractToken(loginRes)

    // 2. Access /auth/me with the cookie
    const meRes = await client.get('/api/v1/auth/me').cookie(SessionService.cookieName, token)
    meRes.assertStatus(200)
    meRes.assertBodyContains({
      id: customerUser.id,
      email: customerUser.email,
      role: 'CUSTOMER',
    })
  })

  test('blocks access to protected endpoint without cookie with 401', async ({ client }) => {
    const response = await client.get('/api/v1/auth/me')
    response.assertStatus(401)
    response.assertBodyContains({
      error: {
        code: 'SESSION_EXPIRED',
      },
    })
  })

  test('blocks tampered or invalid session cookie with 401 and clears cookie', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/api/v1/auth/me')
      .cookie(SessionService.cookieName, 'tampered_fake_session_token_12345')
    response.assertStatus(401)

    // Assert cookie clear command is sent
    const setCookie = response.header('set-cookie')
    assert.isDefined(setCookie)
  })

  test('enforces RBAC: Customer cannot access protected Admin routes', async ({ client }) => {
    // Login as Customer
    const loginRes = await client.post('/api/v1/auth/login').json({
      email: customerUser.email,
      password: 'Password123!',
    })
    loginRes.assertStatus(200)
    const token = extractToken(loginRes)

    // Try accessing Admin Employees endpoint
    const adminRes = await client
      .get('/api/v1/admin/employees')
      .cookie(SessionService.cookieName, token)
    adminRes.assertStatus(403)
  })

  test('logout revokes session in PostgreSQL and clears cookie', async ({ client }) => {
    // 1. Login
    const loginRes = await client.post('/api/v1/auth/login').json({
      email: customerUser.email,
      password: 'Password123!',
    })
    loginRes.assertStatus(200)
    const token = extractToken(loginRes)

    // 2. Logout
    const logoutRes = await client
      .post('/api/v1/auth/logout')
      .cookie(SessionService.cookieName, token)
    logoutRes.assertStatus(200)
    logoutRes.assertBodyContains({ message: 'Logged out successfully' })

    // 3. Trying to access /auth/me with old cookie should fail
    const meRes = await client.get('/api/v1/auth/me').cookie(SessionService.cookieName, token)
    meRes.assertStatus(401)
  })

  test('returns user active sessions via /auth/sessions', async ({ client, assert }) => {
    // Login
    const loginRes = await client.post('/api/v1/auth/login').json({
      email: customerUser.email,
      password: 'Password123!',
    })
    loginRes.assertStatus(200)
    const token = extractToken(loginRes)

    // Fetch sessions
    const sessionsRes = await client
      .get('/api/v1/auth/sessions')
      .cookie(SessionService.cookieName, token)
    sessionsRes.assertStatus(200)
    const body = sessionsRes.body()
    assert.isArray(body.sessions)
    assert.isTrue(body.sessions.length >= 1)
    assert.isTrue(body.sessions.some((s: any) => s.isCurrent === true))
  })
})
