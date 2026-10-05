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
import { authThrottle } from '#start/limiter'

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
        customers: customersCount,
      }
    })

    router
      .group(() => {
        router.post('/register', '#controllers/auth_controller.register').use(authThrottle)
        router.post('/login', '#controllers/auth_controller.login').use(authThrottle)
        router.post('/verify-otp', '#controllers/auth_controller.verifyOtp').use(authThrottle)
        router.post('/logout', '#controllers/auth_controller.logout').use(middleware.auth())
        router.get('/me', '#controllers/auth_controller.me').use(middleware.auth())
        router.post('/wholesale/register', '#controllers/wholesaler_auth_controller.register').use(authThrottle)
        router.post('/wholesale/login', '#controllers/wholesaler_auth_controller.login').use(authThrottle)
      })
      .prefix('auth')

    router.resource('categories', '#controllers/categories_controller').apiOnly()
    router.resource('products', '#controllers/products_controller').apiOnly()
    router.resource('users', () => import('#controllers/users_controller')).apiOnly()
    router.resource('coupons', () => import('#controllers/coupons_controller')).apiOnly()

    // Wholesaler routes
    router
      .group(() => {
        router.get('catalogs', '#controllers/wholesaler_catalogs_controller.index')
        router.get('fabric-qualities', '#controllers/catalog_fabric_qualities_controller.index')

        router
          .group(() => {
            router.post('inquiries', '#controllers/wholesaler_inquiries_controller.store')
            router.get('inquiries', '#controllers/wholesaler_inquiries_controller.index')
            router.get('inquiries/:id', '#controllers/wholesaler_inquiries_controller.show')
          })
          .use(middleware.auth())
      })
      .prefix('wholesale')

    // Orders & Checkout
    router.post('checkout', '#controllers/orders_controller.checkout').use(middleware.auth())
    router.post('orders/verify-payment', '#controllers/orders_controller.verifyPayment').use(middleware.auth())

    router
      .group(() => {
        // Employee Management Routes
        router
          .resource('employees', () => import('#controllers/employees_controller'))
          .apiOnly()
          .use('*', [middleware.auth(), middleware.rbac(['manage:employees'])])
        router
          .get('roles/permissions', () =>
            import('#controllers/roles_controller').then((m) => m.default.prototype.permissions)
          )
          .use([middleware.auth(), middleware.rbac(['manage:roles'])])
        router
          .resource('roles', () => import('#controllers/roles_controller'))
          .apiOnly()
          .use('*', [middleware.auth(), middleware.rbac(['manage:roles'])])
        router
          .get('activity-logs', () =>
            import('#controllers/activity_logs_controller').then((m) => m.default.prototype.index)
          )
          .use([middleware.auth(), middleware.rbac(['manage:employees'])])

        // Wholesale Management
        router
          .group(() => {
            router.get('catalogs', '#controllers/wholesaler_catalogs_controller.adminIndex')
            router.post('catalogs', '#controllers/wholesaler_catalogs_controller.store')
            router.get('catalogs/:id', '#controllers/wholesaler_catalogs_controller.show')
            router.put('catalogs/:id', '#controllers/wholesaler_catalogs_controller.update')
            router.delete('catalogs/:id', '#controllers/wholesaler_catalogs_controller.destroy')

            router.get(
              'fabric-qualities',
              '#controllers/catalog_fabric_qualities_controller.adminIndex'
            )
            router.post(
              'fabric-qualities',
              '#controllers/catalog_fabric_qualities_controller.store'
            )
            router.put(
              'fabric-qualities/:id',
              '#controllers/catalog_fabric_qualities_controller.update'
            )
            router.delete(
              'fabric-qualities/:id',
              '#controllers/catalog_fabric_qualities_controller.destroy'
            )

            router.get('inquiries', '#controllers/wholesaler_inquiries_controller.adminIndex')
            router.get('inquiries/:id', '#controllers/wholesaler_inquiries_controller.adminShow')
            router.patch(
              'inquiries/:id/status',
              '#controllers/wholesaler_inquiries_controller.adminUpdateStatus'
            )

            // Wholesaler Accounts Management
            router.get('accounts', '#controllers/admin_wholesaler_accounts_controller.index')
            router.patch('accounts/:id/status', '#controllers/admin_wholesaler_accounts_controller.updateStatus')
          })
          .prefix('wholesale')
          .use([middleware.auth(), middleware.rbac([])])

        // Admin Approval Workflow Routes
        router
          .get('approval-requests', () =>
            import('#controllers/approval_requests_controller').then(
              (m) => m.default.prototype.index
            )
          )
          .use([middleware.auth(), middleware.rbac([])]) // Empty rbac allows any employee
        router
          .post('approval-requests', () =>
            import('#controllers/approval_requests_controller').then(
              (m) => m.default.prototype.store
            )
          )
          .use([middleware.auth(), middleware.rbac([])])
        router
          .post('approval-requests/:id/approve', () =>
            import('#controllers/approval_requests_controller').then(
              (m) => m.default.prototype.approve
            )
          )
          .use([middleware.auth(), middleware.rbac(['manage:approvals'])])
        router
          .post('approval-requests/:id/reject', () =>
            import('#controllers/approval_requests_controller').then(
              (m) => m.default.prototype.reject
            )
          )
          .use([middleware.auth(), middleware.rbac(['manage:approvals'])])
      })
      .prefix('admin') // Protected by admin middleware
  })
  .prefix('api/v1')
