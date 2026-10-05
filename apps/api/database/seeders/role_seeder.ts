import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'

export default class extends BaseSeeder {
  async run() {
    // 1. Define all permissions
    const permissionsData = [
      // Product Manager Permissions
      { action: 'manage:products', description: 'Add, edit, update, and manage product listings' },
      { action: 'upload:product_images', description: 'Upload product images' },
      { action: 'manage:categories', description: 'Manage product categories and descriptions' },

      // Inventory Manager Permissions
      { action: 'manage:stock', description: 'Manage stock quantities' },
      {
        action: 'track:inventory',
        description: 'Track available, low-stock, and out-of-stock products',
      },
      {
        action: 'record:stock_adjustments',
        description: 'Record stock adjustments and inventory history',
      },

      // Customer Support Executive Permissions
      { action: 'view:customers', description: 'View customer information' },
      { action: 'manage:support_queries', description: 'Handle customer queries and complaints' },
      { action: 'update:support_status', description: 'Update customer support status' },

      // Wholesale Manager Permissions
      { action: 'manage:wholesale_customers', description: 'Manage wholesale customers' },
      { action: 'manage:bulk_enquiries', description: 'Handle bulk enquiries and quotations' },
      {
        action: 'manage:wholesale_pricing',
        description: 'Manage wholesale pricing and customer accounts',
      },

      // Order Processing Executive Permissions
      { action: 'view:assigned_orders', description: 'View assigned orders' },
      { action: 'process:orders', description: 'Process, pack, and update order statuses' },
      { action: 'generate:invoices', description: 'Generate invoices and packing slips' },

      // Shipping Manager Permissions
      { action: 'manage:shipping', description: 'Manage shipping details' },
      { action: 'assign:tracking', description: 'Assign tracking numbers' },
      {
        action: 'update:shipment_status',
        description: 'Update shipment status and delivery information',
      },

      // Returns & Exchange Manager Permissions
      { action: 'manage:returns', description: 'Handle return and exchange requests' },
      { action: 'review:return_reasons', description: 'Review return reasons' },
      { action: 'update:refunds', description: 'Update refund and replacement statuses' },
      { action: 'view:return_history', description: 'Maintain return history' },

      // Admin Approval Permissions
      { action: 'manage:approvals', description: 'Approve or reject employee requests' },
    ]

    // Create or update permissions
    const createdPermissions: Record<string, Permission> = {}
    for (const p of permissionsData) {
      const permission = await Permission.updateOrCreate({ action: p.action }, p)
      createdPermissions[p.action] = permission
    }

    // 2. Define roles and their associated permissions
    const rolesData = [
      {
        name: 'Product Manager',
        description: 'Manages product listings, images, and categories.',
        permissions: ['manage:products', 'upload:product_images', 'manage:categories'],
      },
      {
        name: 'Inventory Manager',
        description: 'Handles stock tracking and adjustments.',
        permissions: ['manage:stock', 'track:inventory', 'record:stock_adjustments'],
      },
      {
        name: 'Customer Support Executive',
        description: 'Handles customer queries and support tickets.',
        permissions: ['view:customers', 'manage:support_queries', 'update:support_status'],
      },
      {
        name: 'Wholesale Manager',
        description: 'Manages wholesale accounts, pricing, and bulk enquiries.',
        permissions: [
          'manage:wholesale_customers',
          'manage:bulk_enquiries',
          'manage:wholesale_pricing',
        ],
      },
      {
        name: 'Order Processing Executive',
        description: 'Processes, packs, and updates orders.',
        permissions: ['view:assigned_orders', 'process:orders', 'generate:invoices'],
      },
      {
        name: 'Shipping Manager',
        description: 'Manages shipping details and tracking numbers.',
        permissions: ['manage:shipping', 'assign:tracking', 'update:shipment_status'],
      },
      {
        name: 'Returns & Exchange Manager',
        description: 'Handles returns, refunds, and replacements.',
        permissions: [
          'manage:returns',
          'review:return_reasons',
          'update:refunds',
          'view:return_history',
        ],
      },
    ]

    // Create or update roles and sync permissions
    for (const r of rolesData) {
      const role = await Role.updateOrCreate(
        { name: r.name },
        { name: r.name, description: r.description }
      )

      // Map permission string names to their respective IDs
      const permissionIds = r.permissions.map((action) => createdPermissions[action].id)

      // Sync permissions to the role
      await role.related('permissions').sync(permissionIds)
    }

    console.log('Roles and Permissions seeded successfully!')
  }
}
