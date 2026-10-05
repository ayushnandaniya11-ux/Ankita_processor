import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import nodemailer from 'nodemailer'
import encryption from '@adonisjs/core/services/encryption'

let transporter: any

async function getTransporter() {
  if (transporter) return transporter

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME || process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
      },
    })
  } else {
    // Ethereal mock email for development if no SMTP is provided
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }
  return transporter
}

async function sendOtpEmail(toEmail: string, otp: string) {
  const mailer = await getTransporter()
  const info = await mailer.sendMail({
    from: process.env.MAIL_FROM || '"Ankita Processors" <noreply@ankitaprocessor.com>',
    to: toEmail,
    subject: 'Your OTP Code',
    text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    html: `<div style="font-family: sans-serif; padding: 20px;">
             <h2>Ankita Processors</h2>
             <p>Your verification code is: <strong>${otp}</strong></p>
             <p>This code will expire in 10 minutes.</p>
           </div>`,
  })

  if (!process.env.SMTP_HOST) {
    console.log('\n====================================')
    console.log('Test Email sent! View it here: %s', nodemailer.getTestMessageUrl(info))
    console.log('====================================\n')
  }
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
    rememberMe: vine.boolean().optional(),
  })
)

const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    email: vine
      .string()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8),
    phone: vine.string().optional(),
  })
)

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create(data)

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiresAt = DateTime.now().plus({ minutes: 10 })
    await user.save()

    // Send actual email
    await sendOtpEmail(user.email, otp).catch(console.error)

    return response.ok({
      message: 'OTP sent successfully',
      requiresOtp: true,
      userId: user.id,
    })
  }

  async login(ctx: HttpContext) {
    const { request, response } = ctx
    const { email, password, rememberMe } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    if (user.role === 'WHOLESALE') {
      return response.forbidden({ error: { message: 'Wholesale accounts must log in through the Wholesale portal.' } })
    }
    
    if (user.role === 'EMPLOYEE' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return response.forbidden({ error: { message: 'Employee accounts must log in through the Employee portal.' } })
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
      },
    })
  }

  async verifyOtp({ request, response }: HttpContext) {
    const schema = vine.object({
      userId: vine.number(),
      otp: vine.string().fixedLength(6),
    })
    const { userId, otp } = await request.validateUsing(vine.compile(schema))

    const user = await User.findOrFail(userId)
    if (!user.otp || user.otp !== otp) {
      return response.badRequest({ error: { message: 'Invalid OTP' } })
    }

    if (user.otpExpiresAt && user.otpExpiresAt < DateTime.now()) {
      return response.badRequest({ error: { message: 'OTP has expired' } })
    }

    user.otp = null
    user.otpExpiresAt = null
    await user.save()

    const token = encryption.encrypt({ userId: user.id })
    response.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // No maxAge means session cookie
    })

    return response.ok({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }

  async logout(ctx: HttpContext) {
    const { response } = ctx
    response.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return response.ok({ message: 'Logged out successfully' })
  }

  async me(ctx: HttpContext) {
    const user = ctx.user!
    return ctx.response.ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  }
}
