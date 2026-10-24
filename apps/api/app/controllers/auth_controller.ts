import User from '#models/user'
import UserSession from '#models/user_session'
import PasswordResetToken from '#models/password_reset_token'
import SessionService from '#services/session_service'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import nodemailer from 'nodemailer'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

import fs from 'node:fs'
import path from 'node:path'

let transporter: any
let cachedTransporterKey = ''

function getFrontendUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.FRONTEND_URL ||
    process.env.WEB_URL ||
    process.env.APP_URL ||
    'http://localhost:4000'
  return url.replace(/\/+$/, '')
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  if (local.length <= 2) return `${local[0]}*@${domain}`
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`
}

function getSmtpConfig() {
  let envContent = ''
  try {
    const candidates = [
      path.resolve(process.cwd(), 'apps/api/.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../.env'),
    ]
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8')
        if (content.includes('SMTP_PASSWORD') && content.match(/SMTP_PASSWORD=\s*\S+/)) {
          envContent = content
          break
        } else if (!envContent) {
          envContent = content
        }
      }
    }
  } catch {}

  const getVal = (key: string, fallback: string = '') => {
    if (process.env[key] && process.env[key]!.trim().length > 0) {
      let val = process.env[key]!.trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      return val
    }
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
    if (match) {
      let val = match[1].trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (val.length > 0) return val
    }
    return fallback
  }

  const host = getVal('SMTP_HOST', 'smtp.gmail.com')
  const port = Number(getVal('SMTP_PORT', '465')) || 465
  const user = getVal('SMTP_USERNAME', 'ankitaprocessor@gmail.com')
  const rawPass = getVal('SMTP_PASSWORD', '')
  const pass = rawPass.replace(/\s+/g, '')
  const from = getVal('MAIL_FROM', `"Ankita Processors" <${user}>`)

  return { host, port, user, pass, from }
}

async function getTransporter() {
  const { host, port, user, pass } = getSmtpConfig()

  const currentKey = `${host}:${port}:${user}:${pass}`
  if (transporter && cachedTransporterKey === currentKey) {
    return transporter
  }

  if (host === 'smtp.gmail.com' || user.toLowerCase().includes('gmail.com')) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
      pool: true,
      maxConnections: 3,
    })
  } else if (host) {
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
    })
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    })
  }

  cachedTransporterKey = currentKey
  return transporter
}

import crypto from 'node:crypto'

const otpFailedAttempts = new Map<number, { count: number; lastAttempt: number }>()

function generateOtp(): string {
  // Cryptographically secure 6-digit random number using OS CSPRNG
  return crypto.randomInt(100000, 1000000).toString()
}

async function sendOtpEmail(
  toEmail: string,
  otp: string
): Promise<{ success: boolean; isDevConsole?: boolean; error?: string }> {
  const { user, pass, from } = getSmtpConfig()
  const hasPassword = pass.trim().length > 0

  // Prominently log OTP in server console for development and testing
  console.log('\n============================================================')
  console.log(`📧 [EMAIL SERVICE] Sender: ${user}`)
  if (!hasPassword) {
    console.log('⚠️ [SMTP NOTICE] No SMTP_PASSWORD is set in apps/api/.env.')
    console.log('   To deliver real emails to customers via ankitaprocessor@gmail.com:')
    console.log('   1. Visit https://myaccount.google.com/apppasswords')
    console.log('   2. Create a 16-character App Password (e.g. "Ankita Store")')
    console.log('   3. Add SMTP_PASSWORD=your_16_char_password into apps/api/.env')
  }
  console.log(`🔑 [OTP CODE] For ${toEmail}: ${otp}`)
  console.log('============================================================\n')

  if (!hasPassword) {
    // If SMTP password is not configured yet in development mode, log to console safely
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, isDevConsole: true }
    }
    return {
      success: false,
      error: 'Gmail SMTP App Password is not configured in environment variables.',
    }
  }

  try {
    const mailer = await getTransporter()
    const fromAddress = from

    const sendPromise = mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Your Ankita Processors Verification Code',
      text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
               <div style="text-align: center; margin-bottom: 24px;">
                 <h1 style="color: #990000; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">ANKITA PROCESSORS</h1>
                 <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Textile Processing & Manufacturing</p>
               </div>
               <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
                 <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0;">Verify Your Email Address</h2>
                 <p style="color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 20px 0;">
                   Thank you for creating an account with Ankita Processors. Please use the verification code below to complete your customer registration:
                 </p>
                 <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                   <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #990000; font-family: monospace;">
                     ${otp}
                   </span>
                   <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">This code will expire in 10 minutes</p>
                 </div>
                 <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                   If you did not attempt to register an account with Ankita Processors, you can safely ignore this email.
                 </p>
               </div>
             </div>`,
    })

    const timeoutPromise = new Promise<{ success: boolean; error: string }>((_, reject) =>
      setTimeout(() => reject(new Error('SMTP dispatch timeout (15000ms exceeded)')), 15000)
    )

    await Promise.race([sendPromise, timeoutPromise])
    console.log(`✅ [MAIL SUCCESS] OTP sent successfully to ${toEmail} from ${fromAddress}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ [AUTH] Error while sending OTP email via SMTP:', error?.message || error)
    const errMessage = error?.message || 'SMTP delivery failure'
    if (
      errMessage.includes('535') ||
      errMessage.includes('BadCredentials') ||
      errMessage.includes('Invalid login')
    ) {
      return {
        success: false,
        error:
          'Gmail authentication failed: Please verify your 16-character Google App Password in apps/api/.env (https://myaccount.google.com/apppasswords).',
      }
    }
    return { success: false, error: errMessage }
  }
}

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
    rememberMe: vine.boolean().optional(),
    portal: vine.string().optional(),
  })
)

const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    email: vine.string().email(),
    password: vine.string().minLength(8),
    phone: vine.string().optional(),
  })
)

async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string,
  userName: string
): Promise<{ success: boolean; isDevConsole?: boolean; error?: string }> {
  const { user, pass, from } = getSmtpConfig()
  const hasPassword = pass.trim().length > 0

  console.log('\n============================================================')
  console.log(`📧 [PASSWORD RESET SERVICE] Sender: ${user}`)
  console.log(`👤 Recipient: ${userName || 'Customer'} <${toEmail}>`)
  console.log(`🔗 Reset Link: ${resetUrl}`)
  console.log('============================================================\n')

  if (!hasPassword) {
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, isDevConsole: true }
    }
    return {
      success: false,
      error: 'Gmail SMTP App Password is not configured in environment variables.',
    }
  }

  try {
    const mailer = await getTransporter()
    const fromAddress = from

    const sendPromise = mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Reset Your Ankita Processors Account Password',
      text: `Hello ${userName || 'Customer'},\n\nWe received a request to reset your Ankita Processors account password.\n\nPlease click the link below or paste it into your browser to choose a new password:\n${resetUrl}\n\nThis link will expire in 15 minutes and can only be used once.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nBest regards,\nAnkita Processors Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #990000; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">ANKITA PROCESSORS</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Textile Processing & Manufacturing</p>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">Reset Your Password</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
              Hello <strong>${userName || 'Valued Customer'}</strong>,
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              We received a request to reset your password for your Ankita Processors account. Click the button below to securely set a new password:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="background-color: #990000; color: #ffffff; padding: 14px 32px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(153, 0, 0, 0.2);">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 8px 0;">
              Or copy and paste this link into your browser:
            </p>
            <p style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 12px; color: #334155; word-break: break-all; margin: 0 0 24px 0;">
              ${resetUrl}
            </p>
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
              <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
                ⏳ <strong>Security Notice:</strong> This reset link will expire in <strong>15 minutes</strong> and can only be used once. If you did not request this change, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              Ankita Processors &bull; Surat, Gujarat, India<br />
              Need help? Contact support@ankitaprocessors.com
            </p>
          </div>
        </div>
      `,
    })

    const timeoutPromise = new Promise<{ success: boolean; error: string }>((_, reject) =>
      setTimeout(() => reject(new Error('SMTP dispatch timeout (15000ms exceeded)')), 15000)
    )

    await Promise.race([sendPromise, timeoutPromise])
    console.log(`✅ [MAIL SUCCESS] Password reset email sent successfully to ${toEmail}`)
    return { success: true }
  } catch (error: any) {
    console.error(
      '❌ [AUTH] Error while sending Password Reset email via SMTP:',
      error?.message || error
    )
    return { success: false, error: error?.message || 'SMTP delivery failure' }
  }
}

const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
  })
)

const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().trim().minLength(1),
    password: vine.string().minLength(8),
  })
)

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const existingUser = await User.findBy('email', data.email)
    let user: User

    if (existingUser) {
      if (!existingUser.otp) {
        // User already has a fully verified account
        return response.conflict({
          error: { message: 'An account with this email already exists. Please sign in instead.' },
        })
      }
      // User registered before but has not finished OTP verification yet.
      // Allow updating credentials and reissue a fresh OTP.
      user = existingUser
      user.name = data.name
      if (data.phone) user.phone = data.phone
      user.password = data.password
    } else {
      user = new User()
      user.name = data.name
      user.email = data.email
      user.phone = data.phone || null
      user.password = data.password
      user.role = 'CUSTOMER'
    }

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiresAt = DateTime.now().plus({ minutes: 10 })
    await user.save()

    const delivery = await sendOtpEmail(user.email, otp)
    if (!delivery.success) {
      return response.internalServerError({
        error: {
          message:
            delivery.error ||
            'Failed to deliver verification email. Please check your email configuration.',
        },
      })
    }

    return response.ok({
      message: 'OTP sent successfully',
      requiresOtp: true,
      userId: user.id,
      ...(process.env.NODE_ENV !== 'production' ? { debugOtp: otp } : {}),
    })
  }

  async login(ctx: HttpContext) {
    const { request, response } = ctx
    const { email, password, rememberMe } = await request.validateUsing(loginValidator)

    let user: User
    try {
      user = await User.verifyCredentials(email, password)
    } catch {
      return response.badRequest({
        error: { message: 'Invalid email or password' },
      })
    }

    if (user.role === 'WHOLESALE') {
      return response.forbidden({
        error: { message: 'Wholesale accounts must log in through the Wholesale portal.' },
      })
    }

    // If user has a pending OTP verification, guide them to verify OTP
    if (user.otp) {
      if (user.otpExpiresAt && user.otpExpiresAt < DateTime.now()) {
        const newOtp = generateOtp()
        user.otp = newOtp
        user.otpExpiresAt = DateTime.now().plus({ minutes: 10 })
        await user.save()
        sendOtpEmail(user.email, newOtp).catch((err) => {
          console.error('❌ [AUTH] Background OTP email error:', err)
        })
      }
      return response.ok({
        message: 'Please verify your email to complete registration.',
        requiresOtp: true,
        userId: user.id,
        ...(process.env.NODE_ENV !== 'production' ? { debugOtp: user.otp } : {}),
      })
    }

    // Revoke any existing active session from the request to prevent session fixation
    const existingToken = SessionService.extractSessionToken(ctx)
    if (existingToken) {
      await SessionService.revokeSession(existingToken, 'ROTATED_ON_LOGIN').catch(() => {})
    }

    // Create server-side session in PostgreSQL & set secure HTTP-only cookie
    const { rawToken } = await SessionService.createSession(user, {
      isRememberMe: Boolean(rememberMe),
      ctx,
    })

    return response.ok({
      message: 'Logged in successfully',
      token: rawToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }

  async verifyOtp(ctx: HttpContext) {
    const { request, response } = ctx
    const schema = vine.object({
      userId: vine.number(),
      otp: vine.string().fixedLength(6),
    })
    const { userId, otp } = await request.validateUsing(vine.compile(schema))

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({ error: { message: 'User not found' } })
    }

    // Check failed attempts for brute-force protection (max 5 attempts allowed)
    const attempts = otpFailedAttempts.get(userId) || { count: 0, lastAttempt: Date.now() }

    if (attempts.count >= 5) {
      // Invalidate OTP on brute force detection
      user.otp = null
      user.otpExpiresAt = null
      await user.save()
      otpFailedAttempts.delete(userId)
      return response.badRequest({
        error: {
          message:
            'Too many incorrect attempts. For security, your code was invalidated. Please request a new code.',
        },
      })
    }

    if (user.otpExpiresAt && user.otpExpiresAt < DateTime.now()) {
      user.otp = null
      user.otpExpiresAt = null
      await user.save()
      otpFailedAttempts.delete(userId)
      return response.badRequest({
        error: { message: 'OTP has expired. Please click "Resend Code" to get a fresh code.' },
      })
    }

    if (!user.otp || user.otp !== otp) {
      attempts.count += 1
      attempts.lastAttempt = Date.now()
      otpFailedAttempts.set(userId, attempts)
      const remaining = 5 - attempts.count
      return response.badRequest({
        error: {
          message: `Invalid verification code. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`,
        },
      })
    }

    // Successfully verified — clear OTP, expiration, and failed attempts
    user.otp = null
    user.otpExpiresAt = null
    await user.save()
    otpFailedAttempts.delete(userId)

    // Create new server-side session in PostgreSQL & set secure HTTP-only cookie
    await SessionService.createSession(user, {
      isRememberMe: false,
      ctx,
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

  async resendOtp(ctx: HttpContext) {
    const { request, response } = ctx
    const schema = vine.object({
      userId: vine.number(),
    })
    const { userId } = await request.validateUsing(vine.compile(schema))

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({ error: { message: 'User not found' } })
    }

    // Resend cooldown: check if last OTP was generated less than 60 seconds ago
    if (user.otpExpiresAt) {
      const secondsRemaining = user.otpExpiresAt.diff(DateTime.now(), 'seconds').seconds
      // Initial expiry is 600s (10 min). If remaining > 540s, less than 60s has passed.
      if (secondsRemaining > 540) {
        const waitSecs = Math.ceil(secondsRemaining - 540)
        return response.tooManyRequests({
          error: { message: `Please wait ${waitSecs} seconds before requesting a new code.` },
        })
      }
    }

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiresAt = DateTime.now().plus({ minutes: 10 })
    await user.save()

    // Reset failed attempts upon re-issuing fresh OTP
    otpFailedAttempts.delete(userId)

    const delivery = await sendOtpEmail(user.email, otp)
    if (!delivery.success) {
      return response.internalServerError({
        error: {
          message:
            delivery.error ||
            'Failed to deliver OTP email. Please verify your email configuration.',
        },
      })
    }

    return response.ok({
      message: 'Verification code sent successfully',
      requiresOtp: true,
      userId: user.id,
      ...(process.env.NODE_ENV !== 'production' ? { debugOtp: otp } : {}),
    })
  }

  async logout(ctx: HttpContext) {
    if (ctx.userSession) {
      await SessionService.revokeSessionById(ctx.userSession.id, 'LOGOUT').catch(() => {})
    } else {
      const rawToken = SessionService.extractSessionToken(ctx)
      if (rawToken) {
        await SessionService.revokeSession(rawToken, 'LOGOUT').catch(() => {})
      }
    }

    SessionService.clearSessionCookie(ctx)
    return ctx.response.ok({ message: 'Logged out successfully' })
  }

  async me(ctx: HttpContext) {
    const user = ctx.user!
    return ctx.response.ok({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      session: ctx.userSession
        ? {
            id: ctx.userSession.id,
            lastActivityAt: ctx.userSession.lastActivityAt,
            expiresAt: ctx.userSession.expiresAt,
            isRememberMe: ctx.userSession.isRememberMe,
          }
        : undefined,
    })
  }

  async updateProfile(ctx: HttpContext) {
    const user = ctx.user!
    const schema = vine.object({
      name: vine.string().trim().minLength(2).optional(),
      phone: vine.string().trim().optional(),
    })
    const payload = await ctx.request.validateUsing(vine.compile(schema))
    if (payload.name) user.name = payload.name
    if (payload.phone !== undefined) user.phone = payload.phone
    await user.save()

    return ctx.response.ok({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  }

  async updatePassword(ctx: HttpContext) {
    const user = ctx.user!
    const schema = vine.object({
      currentPassword: vine.string(),
      newPassword: vine.string().minLength(8),
    })
    const { currentPassword, newPassword } = await ctx.request.validateUsing(vine.compile(schema))

    if (!user.password) {
      return ctx.response.badRequest({ error: { message: 'Password is not set for this account' } })
    }

    const isValid = await hash.verify(user.password, currentPassword)
    if (!isValid) {
      return ctx.response.badRequest({ error: { message: 'Current password is incorrect' } })
    }

    user.password = newPassword
    await user.save()

    // Revoke all other active sessions across devices
    await SessionService.revokeAllUserSessions(user.id, 'PASSWORD_CHANGED', ctx.userSession?.id)

    // Rotate current session ID to prevent fixation
    if (ctx.userSession) {
      await SessionService.rotateSession(ctx.userSession, user, { ctx })
    }

    return ctx.response.ok({ message: 'Password updated successfully' })
  }

  /**
   * List all active sessions for the current user
   */
  async sessions(ctx: HttpContext) {
    const user = ctx.user!

    const activeSessions = await UserSession.query()
      .where('userId', user.id)
      .where('isRevoked', false)
      .where('expiresAt', '>', DateTime.now().toSQL()!)
      .orderBy('lastActivityAt', 'desc')

    return ctx.response.ok({
      sessions: activeSessions.map((s) => ({
        id: s.id,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        isRememberMe: s.isRememberMe,
        lastActivityAt: s.lastActivityAt,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: ctx.userSession ? s.id === ctx.userSession.id : false,
      })),
    })
  }

  /**
   * Revoke a specific session of the current user
   */
  async revokeSession(ctx: HttpContext) {
    const user = ctx.user!
    const sessionId = Number(ctx.params.id)

    const session = await UserSession.query()
      .where('id', sessionId)
      .where('userId', user.id)
      .first()

    if (!session) {
      return ctx.response.notFound({ error: { message: 'Session not found' } })
    }

    session.isRevoked = true
    session.revokedReason = 'USER_REVOKED'
    await session.save()

    // If revoking the current session, clear the cookie too
    if (ctx.userSession && ctx.userSession.id === sessionId) {
      SessionService.clearSessionCookie(ctx)
    }

    return ctx.response.ok({ message: 'Session revoked successfully' })
  }

  /**
   * Revoke all other active sessions except the current one
   */
  async revokeAllOtherSessions(ctx: HttpContext) {
    const user = ctx.user!

    const count = await SessionService.revokeAllUserSessions(
      user.id,
      'USER_REVOKED_ALL',
      ctx.userSession?.id
    )

    return ctx.response.ok({
      message: 'All other sessions have been revoked',
      revokedCount: count,
    })
  }

  /**
   * Request password recovery reset link
   */
  async forgotPassword(ctx: HttpContext) {
    const { request, response } = ctx
    const { email } = await request.validateUsing(forgotPasswordValidator)
    const normalizedEmail = email.toLowerCase().trim()

    // Generic response to prevent account enumeration
    const genericResponse = {
      message:
        'If an account exists for this email address, you will receive password reset instructions shortly.',
    }

    try {
      const user = await User.findBy('email', normalizedEmail)

      if (!user) {
        // Return identical generic response immediately (protection against enumeration)
        return response.ok(genericResponse)
      }

      // Check if user has an active reset token created within the last 60 seconds (anti-spam rate limit)
      const recentToken = await PasswordResetToken.query()
        .where('userId', user.id)
        .where('isUsed', false)
        .where('createdAt', '>', DateTime.now().minus({ seconds: 60 }).toSQL()!)
        .first()

      if (recentToken) {
        return response.ok(genericResponse)
      }

      // Invalidate any existing unused reset tokens for this user
      await PasswordResetToken.query()
        .where('userId', user.id)
        .where('isUsed', false)
        .update({ isUsed: true, updatedAt: DateTime.now().toSQL()! })

      // Generate cryptographically secure random token (64 hex characters / 256 bits of entropy)
      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

      // Save token with 15-minute expiration
      await PasswordResetToken.create({
        userId: user.id,
        tokenHash,
        expiresAt: DateTime.now().plus({ minutes: 15 }),
        isUsed: false,
        ipAddress: request.ip(),
        userAgent: request.header('user-agent') || null,
      })

      const resetUrl = `${getFrontendUrl()}/reset-password?token=${rawToken}`

      // Send password reset email via SMTP
      sendPasswordResetEmail(user.email, resetUrl, user.name).catch((mailErr) => {
        console.error('❌ [AUTH] Background reset email delivery error:', mailErr)
      })

      return response.ok({
        ...genericResponse,
        ...(process.env.NODE_ENV !== 'production' ? { debugToken: rawToken } : {}),
      })
    } catch (error) {
      console.error('❌ [AUTH] Error in forgotPassword:', error)
      return response.ok(genericResponse)
    }
  }

  /**
   * Verify password reset token validity before rendering reset form
   */
  async verifyResetToken(ctx: HttpContext) {
    const { request, response } = ctx
    const token = String(request.input('token') || request.qs().token || '').trim()

    if (!token) {
      return response.badRequest({
        valid: false,
        reason: 'MISSING',
        error: { message: 'Reset token is required.' },
      })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const resetToken = await PasswordResetToken.query()
      .where('tokenHash', tokenHash)
      .preload('user')
      .first()

    if (!resetToken) {
      return response.badRequest({
        valid: false,
        reason: 'INVALID',
        error: { message: 'This password reset link is invalid or unknown.' },
      })
    }

    if (resetToken.isUsed) {
      return response.badRequest({
        valid: false,
        reason: 'USED',
        error: { message: 'This password reset link has already been used. Please request a new one.' },
      })
    }

    if (resetToken.expiresAt < DateTime.now()) {
      return response.badRequest({
        valid: false,
        reason: 'EXPIRED',
        error: { message: 'This password reset link has expired. Please request a new one.' },
      })
    }

    return response.ok({
      valid: true,
      email: maskEmail(resetToken.user.email),
    })
  }

  /**
   * Reset user password using verified single-use token
   */
  async resetPassword(ctx: HttpContext) {
    const { request, response } = ctx
    const payload = await request.validateUsing(resetPasswordValidator)
    const token = payload.token.trim()
    const newPassword = payload.password

    // Verify password policy: min 8 characters, at least 1 uppercase, 1 lowercase, 1 digit
    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      newPassword.length < 8
    ) {
      return response.badRequest({
        error: {
          message:
            'Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number.',
        },
      })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const trx = await db.transaction()

    try {
      const resetToken = await PasswordResetToken.query({ client: trx })
        .where('tokenHash', tokenHash)
        .forUpdate()
        .first()

      if (!resetToken) {
        await trx.rollback()
        return response.badRequest({
          error: { message: 'This password reset link is invalid or has expired.' },
        })
      }

      if (resetToken.isUsed) {
        await trx.rollback()
        return response.badRequest({
          error: {
            message:
              'This password reset link has already been used. Please request a new reset link.',
          },
        })
      }

      if (resetToken.expiresAt < DateTime.now()) {
        await trx.rollback()
        return response.badRequest({
          error: {
            message:
              'This password reset link has expired. Please request a new reset link.',
          },
        })
      }

      const user = await User.query({ client: trx }).where('id', resetToken.userId).first()
      if (!user) {
        await trx.rollback()
        return response.badRequest({
          error: { message: 'User account associated with this token was not found.' },
        })
      }

      // Update password — Lucid's @beforeSave will hash it securely with Argon2id
      user.useTransaction(trx)
      user.password = newPassword
      await user.save()

      // Mark the token as used
      resetToken.useTransaction(trx)
      resetToken.isUsed = true
      resetToken.usedAt = DateTime.now()
      await resetToken.save()

      // Invalidate any other outstanding reset tokens for this user
      await PasswordResetToken.query({ client: trx })
        .where('userId', user.id)
        .where('isUsed', false)
        .update({ isUsed: true })

      await trx.commit()

      // Revoke all existing sessions across devices for security
      await SessionService.revokeAllUserSessions(user.id, 'PASSWORD_RESET').catch(() => {})

      return response.ok({
        message: 'Your password has been successfully reset. Please log in with your new password.',
      })
    } catch (err: any) {
      await trx.rollback()
      console.error('❌ [AUTH] Error in resetPassword:', err)
      return response.internalServerError({
        error: { message: 'An unexpected error occurred while resetting your password.' },
      })
    }
  }
}

