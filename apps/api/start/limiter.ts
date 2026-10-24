/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import app from '@adonisjs/core/services/app'

export const throttle = limiter.define('global', () => {
  if (app.inTest) return limiter.noLimit()
  return limiter.allowRequests(100).every('1 minute')
})

export const authThrottle = limiter.define('auth', () => {
  if (app.inTest) return limiter.noLimit()
  return limiter.allowRequests(20).every('1 minute')
})

export const passwordResetThrottle = limiter.define('passwordReset', () => {
  if (app.inTest) return limiter.noLimit()
  return limiter.allowRequests(10).every('1 minute')
})
