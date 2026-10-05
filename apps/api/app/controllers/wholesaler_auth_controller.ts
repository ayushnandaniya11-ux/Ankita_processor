import User from '#models/user'
import WholesalerProfile from '#models/wholesaler_profile'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import encryption from '@adonisjs/core/services/encryption'

const wholesaleRegisterValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    companyName: vine.string().trim().minLength(2),
    gstin: vine
      .string()
      .trim()
      .toUpperCase()
      // Basic Indian GSTIN format check
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .unique(async (db, value) => {
        const profile = await db.from('wholesaler_profiles').where('gstin', value).first()
        return !profile
      }),
    phone: vine.string().trim().minLength(10),
    email: vine
      .string()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8),
    businessAddress: vine.string().trim().minLength(5),
    city: vine.string().trim(),
    state: vine.string().trim(),
    pinCode: vine.string().trim(),
    businessType: vine.string().optional(),
    interestedCategories: vine.string().optional(),
    expectedQuantity: vine.string().optional(),
    termsAccepted: vine.boolean(),
  })
)

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
    rememberMe: vine.boolean().optional(),
  })
)

export default class WholesalerAuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(wholesaleRegisterValidator)

    const trx = await db.transaction()

    try {
      // Create user
      const user = new User()
      user.name = data.name
      user.email = data.email
      user.phone = data.phone
      user.password = data.password
      user.role = 'WHOLESALE'
      user.useTransaction(trx)
      await user.save()

      // Create wholesaler profile
      const profile = new WholesalerProfile()
      profile.userId = user.id
      profile.companyName = data.companyName
      profile.gstin = data.gstin
      profile.businessAddress = data.businessAddress
      profile.city = data.city
      profile.state = data.state
      profile.pinCode = data.pinCode
      profile.businessType = data.businessType || null
      profile.interestedCategories = data.interestedCategories || null
      profile.expectedQuantity = data.expectedQuantity || null
      profile.approvalStatus = 'PENDING'
      profile.useTransaction(trx)
      await profile.save()

      await trx.commit()

      // Note: Admin notification logic could be added here

      return response.created({
        message: 'Your wholesaler registration has been submitted successfully. Your account is awaiting approval.',
      })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({ error: 'Registration failed. Please try again later.' })
    }
  }

  async login(ctx: HttpContext) {
    const { request, response } = ctx
    const { email, password, rememberMe } = await request.validateUsing(loginValidator)

    const user = await User.findBy('email', email)
    if (!user || !user.password) {
      return response.badRequest({ error: { message: 'Invalid credentials' } })
    }
    
    const isValid = await User.verifyCredentials(email, password)
    if (!isValid) {
      return response.badRequest({ error: { message: 'Invalid credentials' } })
    }

    if (user.role !== 'WHOLESALE') {
      return response.forbidden({ error: { message: 'This account is not a wholesale account. Please login through the customer portal.' } })
    }

    const profile = await WholesalerProfile.findBy('userId', user.id)
    if (!profile) {
      return response.internalServerError({ error: { message: 'Wholesale profile missing.' } })
    }

    if (profile.approvalStatus === 'PENDING') {
      return response.forbidden({ error: { message: 'Your account is pending approval. Please wait for an administrator to review your application.' } })
    }
    
    if (profile.approvalStatus === 'REJECTED') {
      return response.forbidden({ error: { message: 'Your wholesale application was rejected. Please contact support.' } })
    }
    
    if (profile.approvalStatus === 'SUSPENDED') {
      return response.forbidden({ error: { message: 'Your wholesale account has been suspended.' } })
    }

    const expiresIn = rememberMe ? '30 days' : undefined
    const token = encryption.encrypt({ userId: user.id }, expiresIn)

    response.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined,
    })

    return response.ok({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: profile.approvalStatus
      },
    })
  }
}
