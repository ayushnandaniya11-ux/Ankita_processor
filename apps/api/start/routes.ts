/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.get('/health', async () => {
      return { status: 'ok' }
    })

    router
      .group(() => {
        router.post('/register', '#controllers/auth_controller.register')
        router.post('/login', '#controllers/auth_controller.login')
        router.post('/logout', '#controllers/auth_controller.logout').use(middleware.auth())
        router.get('/me', '#controllers/auth_controller.me').use(middleware.auth())
      })
      .prefix('auth')

    router
      .group(() => {
        router.resource('categories', '#controllers/categories_controller').apiOnly()
        router.resource('products', '#controllers/products_controller').apiOnly()
        router.resource('users', () => import('#controllers/users_controller')).apiOnly()
        router.resource('coupons', () => import('#controllers/coupons_controller')).apiOnly()
      })
      .prefix('admin') // Should ideally be protected by admin middleware
  })
  .prefix('api/v1')
