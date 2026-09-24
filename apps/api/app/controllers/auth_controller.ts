import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    email: vine.string().email().unique(async (db, value) => {
      const user = await db.from('users').where('email', value).first()
      return !user
    }),
    password: vine.string().minLength(8),
    phone: vine.string().optional(),
  })
)

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create(data)

    await auth.use('web').login(user)

    return response.created({
      message: 'Registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })
  }

  async login({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)

    return response.ok({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out successfully' })
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user!
    return response.ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  }
}
