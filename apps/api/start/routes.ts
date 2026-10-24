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
import { authThrottle, throttle } from '#start/limiter'
import app from '@adonisjs/core/services/app'
import { existsSync } from 'node:fs'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Serve uploaded files directly
router.get('/uploads/*', async ({ request, response }) => {
  const wildcard = request.param('*')
  const relativePath = Array.isArray(wildcard) ? wildcard.join('/') : String(wildcard)
  const filePath = app.makePath('public/uploads', relativePath)
  if (!existsSync(filePath)) {
    return response.notFound({ error: 'File not found' })
  }
  return response.download(filePath)
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
        router.post('/resend-otp', '#controllers/auth_controller.resendOtp').use(authThrottle)
        router
          .post('/forgot-password', '#controllers/auth_controller.forgotPassword')
          .use(authThrottle)
        router
          .get('/verify-reset-token', '#controllers/auth_controller.verifyResetToken')
          .use(authThrottle)
        router
          .post('/reset-password', '#controllers/auth_controller.resetPassword')
          .use(authThrottle)
        router.post('/logout', '#controllers/auth_controller.logout').use(middleware.auth())
        router.get('/me', '#controllers/auth_controller.me').use(middleware.auth())
        router.put('/profile', '#controllers/auth_controller.updateProfile').use(middleware.auth())
        router
          .put('/password', '#controllers/auth_controller.updatePassword')
          .use(middleware.auth())
        router.get('/sessions', '#controllers/auth_controller.sessions').use(middleware.auth())
        router
          .post('/sessions/:id/revoke', '#controllers/auth_controller.revokeSession')
          .use(middleware.auth())
        router
          .post('/revoke-all-sessions', '#controllers/auth_controller.revokeAllOtherSessions')
          .use(middleware.auth())
        router
          .post('/wholesale/register', '#controllers/wholesaler_auth_controller.register')
          .use(authThrottle)
        router
          .post('/wholesale/login', '#controllers/wholesaler_auth_controller.login')
          .use(authThrottle)
      })
      .prefix('auth')

    // Public catalog (Read only)
    router.resource('categories', '#controllers/categories_controller').only(['index', 'show'])
    router.resource('products', '#controllers/products_controller').only(['index', 'show'])
    router.resource('coupons', '#controllers/coupons_controller').only(['index', 'show'])

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

    // Orders & Checkout (Customer & Guest)
    router.get('orders', '#controllers/orders_controller.myOrders').use(middleware.auth())
    router.get('orders/lookup/:orderNo', '#controllers/orders_controller.lookupByOrderNo')
    router.get('orders/:id', '#controllers/orders_controller.showOrder').use(middleware.auth())
    router
      .get('orders/:id/invoice/download', '#controllers/orders_controller.downloadCustomerInvoice')
      .use(middleware.auth())
    router.post('checkout', '#controllers/orders_controller.checkout')
    router.post('orders/verify-payment', '#controllers/orders_controller.verifyPayment')
    router.post('payments/verify', '#controllers/payments_controller.verifyPayment')
    router.post('payments/webhook', '#controllers/payments_controller.handleWebhook')
    router.post('orders/:id/retry-payment', '#controllers/payments_controller.retryPayment').use(middleware.auth())

    // Product Return & Exchange (AI Verification & Regional Language Instructions)
    router.get('returns/policy-and-instructions', '#controllers/returns_controller.policyAndInstructions')
    router.get('returns/policy', '#controllers/returns_controller.policyAndInstructions')
    router.get('returns/check-eligibility', '#controllers/returns_controller.checkEligibility').use(middleware.auth())
    router.get('orders/:orderId/return-eligibility', '#controllers/returns_controller.checkEligibility').use(middleware.auth())
    router.post('returns', '#controllers/returns_controller.store').use(middleware.auth())
    router.post('orders/:orderId/returns', '#controllers/returns_controller.store').use(middleware.auth())
    router.get('returns/my-returns', '#controllers/returns_controller.myReturns').use(middleware.auth())
    router.get('returns', '#controllers/returns_controller.myReturns').use(middleware.auth())
    router.get('returns/:id', '#controllers/returns_controller.show').use(middleware.auth())

    router
      .group(() => {
        // Admin Catalog & Resources
        router
          .resource('categories', '#controllers/categories_controller')
          .as('admin.categories')
          .apiOnly()
        router
          .resource('products', '#controllers/products_controller')
          .as('admin.products')
          .apiOnly()
        router.patch('products/:id/toggle-publish', '#controllers/products_controller.togglePublish')
        router.resource('users', '#controllers/users_controller').as('admin.users').apiOnly()
        router
          .get('users/:id/sessions', '#controllers/users_controller.userSessions')
          .use([middleware.auth(), middleware.rbac(['manage:employees'])])
        router
          .post('users/:id/revoke-sessions', '#controllers/users_controller.revokeUserSessions')
          .use([middleware.auth(), middleware.rbac(['manage:employees'])])
        router
          .post('sessions/:sessionId/revoke', '#controllers/users_controller.revokeSessionById')
          .use([middleware.auth(), middleware.rbac(['manage:employees'])])
        router
          .post('sessions/cleanup', '#controllers/users_controller.cleanupExpiredSessions')
          .use([middleware.auth(), middleware.rbac(['manage:employees'])])
        router.resource('coupons', '#controllers/coupons_controller').as('admin.coupons').apiOnly()

        // Employee Management Routes
        router
          .resource('employees', '#controllers/employees_controller')
          .apiOnly()
          .use('*', [middleware.auth(), middleware.rbac(['manage:employees'])])
        router
          .get('roles/permissions', '#controllers/roles_controller.permissions')
          .use([middleware.auth(), middleware.rbac(['manage:roles'])])
        router
          .resource('roles', '#controllers/roles_controller')
          .apiOnly()
          .use('*', [middleware.auth(), middleware.rbac(['manage:roles'])])
        router
          .get('activity-logs', '#controllers/activity_logs_controller.index')
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
            router.patch(
              'accounts/:id/status',
              '#controllers/admin_wholesaler_accounts_controller.updateStatus'
            )
          })
          .prefix('wholesale')
          .use([middleware.auth(), middleware.rbac([])])

        // Admin Orders & Logistics Management
        router
          .group(() => {
            router.get('orders', '#controllers/admin_orders_controller.index')
            router.get('orders/:id', '#controllers/admin_orders_controller.show')
            router.post('orders/:id/accept', '#controllers/admin_orders_controller.accept')
            router.post('orders/:id/reject', '#controllers/admin_orders_controller.reject')
            router.post(
              'orders/:id/invoice',
              '#controllers/admin_orders_controller.generateInvoice'
            )
            router.get(
              'orders/:id/invoice/download',
              '#controllers/admin_orders_controller.downloadInvoice'
            )
            router.get(
              'orders/:id/waybill',
              '#controllers/admin_orders_controller.getWaybill'
            )
            router.post(
              'orders/:id/waybill',
              '#controllers/admin_orders_controller.generateWaybill'
            )
            router.post(
              'orders/:id/retry-waybill',
              '#controllers/admin_orders_controller.retryWaybill'
            )
            router.get(
              'orders/:id/waybill/download',
              '#controllers/admin_orders_controller.downloadWaybill'
            )
            router.get('shipping', '#controllers/admin_orders_controller.getShipping')
            router.post(
              'logistics/webhook',
              '#controllers/admin_orders_controller.logisticsWebhook'
            )

            // Monthly GST Reporting & 4-ZIP Archives (Admin Only)
            router.get('gst/summary', '#controllers/gst_reports_controller.getSummary')
            router.post('gst/export', '#controllers/gst_reports_controller.exportZip')
            router.post('gst/export-all', '#controllers/gst_reports_controller.generateAll')
            router.post('gst/generate-all', '#controllers/gst_reports_controller.generateAll')
            router.get('gst/exports', '#controllers/gst_reports_controller.listExports')
            router.get('gst/download/:id', '#controllers/gst_reports_controller.downloadZip')

            // Payment Management & Gateway Tracking (Admin Only)
            router.get('payments', '#controllers/payments_controller.adminIndex')
            router.get('payments/:id', '#controllers/payments_controller.adminShow')
            router.post('payments/:id/sync', '#controllers/payments_controller.adminSync')

            // Cash on Delivery (COD) Payment Tracking & Reconciliation (Admin Only)
            router.get('cod-payments', '#controllers/cod_payments_controller.index')
            router.get('cod-payments/:id', '#controllers/cod_payments_controller.show')
            router.post('cod-payments/:id/status', '#controllers/cod_payments_controller.updateStatus')
            router.patch('cod-payments/:id/status', '#controllers/cod_payments_controller.updateStatus')

            // Product Return Verification & Reverse Logistics Management (Admin Only)
            router.get('returns', '#controllers/returns_controller.adminIndex')
            router.get('returns/:id', '#controllers/returns_controller.adminShow')
            router.post('returns/:id/review', '#controllers/returns_controller.adminReview')
            router.patch('returns/:id/review', '#controllers/returns_controller.adminReview')
          })
          .use([middleware.auth(), middleware.rbac([])])

        // Admin Approval Workflow Routes
        router
          .get('approval-requests', '#controllers/approval_requests_controller.index')
          .use([middleware.auth(), middleware.rbac([])]) // Empty rbac allows any employee
        router
          .post('approval-requests', '#controllers/approval_requests_controller.store')
          .use([middleware.auth(), middleware.rbac([])])
        router
          .post(
            'approval-requests/:id/approve',
            '#controllers/approval_requests_controller.approve'
          )
          .use([middleware.auth(), middleware.rbac(['manage:approvals'])])
        router
          .post('approval-requests/:id/reject', '#controllers/approval_requests_controller.reject')
          .use([middleware.auth(), middleware.rbac(['manage:approvals'])])
      })
      .prefix('admin') // Protected by admin middleware
    router.get('/uploads/*', async ({ request, response }) => {
      const wildcard = request.param('*')
      const relativePath = Array.isArray(wildcard) ? wildcard.join('/') : String(wildcard)
      const filePath = app.makePath('public/uploads', relativePath)
      if (!existsSync(filePath)) {
        return response.notFound({ error: 'File not found' })
      }
      return response.download(filePath)
    })
  })
  .prefix('api/v1')
  .use(throttle)
