// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'Ankita Processors'
export const APP_TAGLINE = 'Premium Women\'s Clothing'
export const APP_DESCRIPTION = 'Discover exquisite women\'s fashion — sarees, kurtis, dresses, and more from Ankita Processors.'

export const CURRENCY = 'INR'
export const CURRENCY_SYMBOL = '₹'
export const CURRENCY_LOCALE = 'en-IN'
export const COUNTRY = 'India'
export const COUNTRY_CODE = 'IN'

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const MAX_CART_QUANTITY = 10
export const MAX_PRODUCT_IMAGES = 10
export const MAX_FILE_SIZE_MB = 5
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const ORDER_NUMBER_PREFIX = 'AP'
export const INVOICE_NUMBER_PREFIX = 'INV'
export const RETURN_NUMBER_PREFIX = 'RET'

export const FREE_SHIPPING_THRESHOLD = 999
export const DEFAULT_SHIPPING_COST = 79
export const COD_EXTRA_CHARGE = 49

export const DEFAULT_RETURN_WINDOW = 7 // days
export const DEFAULT_EXCHANGE_WINDOW = 15 // days

export const GST_RATES = [0, 5, 12, 18, 28] as const
export const DEFAULT_GST_RATE = 5

export const PRODUCT_SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Price: Low to High', value: 'sellingPrice:asc' },
  { label: 'Price: High to Low', value: 'sellingPrice:desc' },
  { label: 'Popular', value: 'totalSold:desc' },
  { label: 'Best Selling', value: 'totalSold:desc' },
] as const

export const ADMIN_SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard', permission: null }],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: 'ShoppingBag', permission: 'orders.read' },
      { label: 'Returns', href: '/admin/returns', icon: 'RotateCcw', permission: 'returns.read' },
      { label: 'Payments', href: '/admin/payments', icon: 'CreditCard', permission: 'payments.read' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: 'Package', permission: 'products.read' },
      { label: 'Categories', href: '/admin/categories', icon: 'FolderTree', permission: 'products.read' },
      { label: 'Pricing', href: '/admin/pricing', icon: 'Tags', permission: 'products.read' },
      { label: 'Inventory', href: '/admin/inventory', icon: 'Warehouse', permission: 'inventory.read' },
    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: 'Users', permission: 'customers.read' },
      { label: 'Wholesalers', href: '/admin/wholesalers', icon: 'Building', permission: 'customers.read' },
    ],
  },
  {
    title: 'Shipping',
    items: [
      { label: 'Logistics', href: '/admin/logistics', icon: 'Truck', permission: 'logistics.read' },
      { label: 'Waybills', href: '/admin/waybills', icon: 'FileBarChart', permission: 'logistics.read' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Invoices', href: '/admin/invoices', icon: 'Receipt', permission: 'invoices.read' },
      { label: 'GST', href: '/admin/gst', icon: 'Calculator', permission: 'gst.read' },
    ],
  },
  {
    title: 'Team',
    items: [
      { label: 'Employees', href: '/admin/employees', icon: 'UserCog', permission: 'employees.read' },
      { label: 'Roles', href: '/admin/roles', icon: 'Shield', permission: 'employees.read' },
      { label: 'Permissions', href: '/admin/permissions', icon: 'Lock', permission: 'employees.read' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: 'Settings', permission: 'settings.read' },
    ],
  },
] as const
