import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'

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
      role: vine.enum(['CUSTOMER', 'ADMIN', 'WHOLESALE']).optional(),
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
      role: vine.enum(['CUSTOMER', 'ADMIN', 'WHOLESALE']).optional(),
    })
    const payload = await request.validateUsing(vine.compile(schema))

    user.merge(payload)
    await user.save()

    return response.ok(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }
}
