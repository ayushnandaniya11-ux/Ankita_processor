import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Coupon from '#models/coupon'

export default class CouponsController {
  async index({ response }: HttpContext) {
    const coupons = await Coupon.query().orderBy('id', 'desc')
    return response.ok(coupons)
  }

  async show({ params, response }: HttpContext) {
    const coupon = await Coupon.findOrFail(params.id)
    return response.ok(coupon)
  }

  async store({ request, response }: HttpContext) {
    const schema = vine.object({
      code: vine.string().trim().toUpperCase(),
      discount: vine.string().trim(),
      type: vine.enum(['Percentage', 'Fixed', 'Shipping']),
      maxUsage: vine.string().trim().optional(),
      status: vine.enum(['Active', 'Expired']).optional(),
    })
    const payload = await request.validateUsing(vine.compile(schema))

    const coupon = await Coupon.create({
      ...payload,
      maxUsage: payload.maxUsage || 'Unlimited',
      status: payload.status || 'Active',
      usage: 0,
    })
    return response.created(coupon)
  }

  async update({ params, request, response }: HttpContext) {
    const coupon = await Coupon.findOrFail(params.id)

    const schema = vine.object({
      code: vine.string().trim().toUpperCase().optional(),
      discount: vine.string().trim().optional(),
      type: vine.enum(['Percentage', 'Fixed', 'Shipping']).optional(),
      maxUsage: vine.string().trim().optional(),
      status: vine.enum(['Active', 'Expired']).optional(),
    })
    const payload = await request.validateUsing(vine.compile(schema))

    coupon.merge(payload)
    await coupon.save()

    return response.ok(coupon)
  }

  async destroy({ params, response }: HttpContext) {
    const coupon = await Coupon.findOrFail(params.id)
    await coupon.delete()
    return response.noContent()
  }
}