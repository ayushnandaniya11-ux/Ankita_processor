import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const customOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const corsConfig = defineConfig({
  enabled: true,
  origin: [
    ...customOrigins,
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000',
    process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:4001',
    'http://localhost:4000',
    'http://localhost:4001',
    'http://127.0.0.1:4000',
    'http://127.0.0.1:4001',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
