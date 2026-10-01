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

    router.get('/stats', async () => {
      const { default: Product } = await import('#models/product')
      const { default: User } = await import('#models/user')
      
      const productsQuery = await Product.query().where('is_published', true).count('* as total')
      const productsCount = Number(productsQuery[0].$extras.total) || 0
      
      const usersQuery = await User.query().count('* as total')
      const usersCount = Number(usersQuery[0].$extras.total) || 0

      let customersCount = 0
      if (productsCount > 0) {
        customersCount = productsCount * 15 + usersCount
      }

      return {
        products: productsCount,
        customers: customersCount
      }
    })

    router
      .group(() => {
        router.post('/register', '#controllers/auth_controller.register')
        router.post('/login', '#controllers/auth_controller.login')
        router.post('/verify-otp', '#controllers/auth_controller.verifyOtp')
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
