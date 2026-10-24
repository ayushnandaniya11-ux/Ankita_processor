/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Optional payment and mail variables
  |----------------------------------------------------------
  */
  RAZORPAY_KEY_ID: Env.schema.string.optional(),
  RAZORPAY_KEY_SECRET: Env.schema.string.optional(),
  RAZORPAY_WEBHOOK_SECRET: Env.schema.string.optional(),
  RAZORPAY_DASHBOARD_URL: Env.schema.string.optional(),
  PAYMENT_PROVIDER_KEY: Env.schema.string.optional(),
  PAYMENT_PROVIDER_SECRET: Env.schema.string.optional(),
  SMTP_HOST: Env.schema.string.optional(),
  SMTP_PORT: Env.schema.number.optional(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  SMTP_SECURE: Env.schema.boolean.optional(),
  MAIL_FROM: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Persistent session and cookie store configuration
  |----------------------------------------------------------
  */
  SESSION_COOKIE_NAME: Env.schema.string.optional(),
  SESSION_IDLE_TIMEOUT_MINUTES: Env.schema.number.optional(),
  SESSION_ABSOLUTE_TIMEOUT_HOURS: Env.schema.number.optional(),
  REMEMBER_ME_DURATION_DAYS: Env.schema.number.optional(),
  SESSION_COOKIE_SECURE: Env.schema.boolean.optional(),
  SESSION_COOKIE_SAME_SITE: Env.schema.enum.optional(['lax', 'strict', 'none'] as const),

  /*
  |----------------------------------------------------------
  | Delhivery Shipping Logistics Provider Integration
  |----------------------------------------------------------
  */
  LOGISTICS_PROVIDER: Env.schema.string.optional(),
  DELHIVERY_API_TOKEN: Env.schema.string.optional(),
  DELHIVERY_CLIENT_ID: Env.schema.string.optional(),
  DELHIVERY_MODE: Env.schema.string.optional(),
  DELHIVERY_SANDBOX_URL: Env.schema.string.optional(),
  DELHIVERY_PRODUCTION_URL: Env.schema.string.optional(),
  DELHIVERY_PICKUP_LOCATION: Env.schema.string.optional(),
  DELHIVERY_WEBHOOK_SECRET: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | E-Invoicing & GST Compliance
  |----------------------------------------------------------
  */
  E_INVOICE_ENABLED: Env.schema.boolean.optional(),
  E_INVOICE_GSP_CLIENT_ID: Env.schema.string.optional(),
  E_INVOICE_GSP_CLIENT_SECRET: Env.schema.string.optional(),
})

