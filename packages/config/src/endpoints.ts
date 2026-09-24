// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    refreshToken: '/auth/refresh',
    adminLogin: '/auth/admin/login',
  },

  // Products
  products: {
    list: '/products',
    detail: (slug: string) => `/products/${slug}`,
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    newArrivals: '/products/new-arrivals',
    bestSellers: '/products/best-sellers',
    search: '/products/search',
  },

  // Categories
  categories: {
    list: '/categories',
    detail: (slug: string) => `/categories/${slug}`,
    create: '/categories',
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
    tree: '/categories/tree',
  },

  // Cart
  cart: {
    get: '/cart',
    addItem: '/cart/items',
    updateItem: (itemId: string) => `/cart/items/${itemId}`,
    removeItem: (itemId: string) => `/cart/items/${itemId}`,
    clear: '/cart/clear',
    applyCoupon: '/cart/coupon',
    removeCoupon: '/cart/coupon',
  },

  // Wishlist
  wishlist: {
    list: '/wishlist',
    add: '/wishlist',
    remove: (productId: string) => `/wishlist/${productId}`,
  },

  // Orders
  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
    create: '/orders',
    cancel: (id: string) => `/orders/${id}/cancel`,
    track: (id: string) => `/orders/${id}/track`,
    updateStatus: (id: string) => `/orders/${id}/status`,
    invoice: (id: string) => `/orders/${id}/invoice`,
  },

  // Payments
  payments: {
    list: '/payments',
    detail: (id: string) => `/payments/${id}`,
    create: '/payments/create',
    verify: '/payments/verify',
    refund: (id: string) => `/payments/${id}/refund`,
  },

  // Returns
  returns: {
    list: '/returns',
    detail: (id: string) => `/returns/${id}`,
    create: '/returns',
    updateStatus: (id: string) => `/returns/${id}/status`,
  },

  // Addresses
  addresses: {
    list: '/addresses',
    create: '/addresses',
    update: (id: string) => `/addresses/${id}`,
    delete: (id: string) => `/addresses/${id}`,
  },

  // Customers
  customers: {
    list: '/customers',
    detail: (id: string) => `/customers/${id}`,
    profile: '/customers/profile',
  },

  // Inventory
  inventory: {
    list: '/inventory',
    detail: (id: string) => `/inventory/${id}`,
    adjust: '/inventory/adjust',
    movements: '/inventory/movements',
  },

  // Invoices
  invoices: {
    list: '/invoices',
    detail: (id: string) => `/invoices/${id}`,
    generate: '/invoices/generate',
    download: (id: string) => `/invoices/${id}/download`,
  },

  // GST
  gst: {
    config: '/gst/config',
    hsnCodes: '/gst/hsn-codes',
    documents: '/gst/documents',
    uploadDocument: '/gst/documents/upload',
  },

  // Logistics
  logistics: {
    partners: '/logistics/partners',
    partnerDetail: (id: string) => `/logistics/partners/${id}`,
    shipments: '/logistics/shipments',
    shipmentDetail: (id: string) => `/logistics/shipments/${id}`,
    createShipment: '/logistics/shipments',
    waybills: '/logistics/waybills',
    generateWaybill: (id: string) => `/logistics/waybills/${id}/generate`,
  },

  // Wholesale
  wholesale: {
    register: '/wholesale/register',
    login: '/wholesale/login',
    dashboard: '/wholesale/dashboard',
    list: '/wholesale',
    detail: (id: string) => `/wholesale/${id}`,
    approve: (id: string) => `/wholesale/${id}/approve`,
    reject: (id: string) => `/wholesale/${id}/reject`,
  },

  // Employees
  employees: {
    list: '/employees',
    detail: (id: string) => `/employees/${id}`,
    create: '/employees',
    update: (id: string) => `/employees/${id}`,
    delete: (id: string) => `/employees/${id}`,
  },

  // Roles & Permissions
  roles: {
    list: '/roles',
    detail: (id: string) => `/roles/${id}`,
    create: '/roles',
    update: (id: string) => `/roles/${id}`,
    delete: (id: string) => `/roles/${id}`,
  },
  permissions: {
    list: '/permissions',
  },

  // Audit Logs
  auditLogs: {
    list: '/audit-logs',
  },

  // File uploads
  uploads: {
    image: '/uploads/image',
    document: '/uploads/document',
  },

  // Newsletter
  newsletter: {
    subscribe: '/newsletter/subscribe',
  },
} as const
