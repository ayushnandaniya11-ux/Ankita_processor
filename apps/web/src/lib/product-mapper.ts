import type { Product, ProductImage, ProductVariant } from '@ankita/types'
import { resolveImageUrl } from '@ankita/utils'

export function formatApiProduct(p: any): Product & { attributes?: Record<string, any>; stock?: number } {
  // 1. Process Images rigorously
  const rawImages: any[] = Array.isArray(p.images) ? p.images : []
  let formattedImages: ProductImage[] = []

  const resolvedPrimaryUrl = resolveImageUrl(p.imageUrl)

  if (rawImages.length > 0) {
    formattedImages = rawImages.map((img: any, idx: number) => {
      const rawUrl = typeof img === 'string' ? img : img.url || ''
      const url = resolveImageUrl(rawUrl)
      const isPrimary = resolvedPrimaryUrl
        ? url === resolvedPrimaryUrl
        : (typeof img.isPrimary === 'boolean' ? img.isPrimary : idx === 0)
      return {
        id: String(img.id || idx + 1),
        productId: String(p.id),
        url,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
        isPrimary,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      }
    })
  }

  // If primary image_url exists and not in images array, prepend it
  if (resolvedPrimaryUrl && !formattedImages.some((img) => img.url === resolvedPrimaryUrl)) {
    formattedImages.unshift({
      id: 'primary-img',
      productId: String(p.id),
      url: resolvedPrimaryUrl,
      sortOrder: -1,
      isPrimary: true,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    })
  }

  // Ensure whichever image is marked isPrimary is at the top
  formattedImages.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  // 2. Parse attributes / sareeData safely
  let attr: Record<string, any> = {}
  if (p.attributes) {
    try {
      attr = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes
    } catch {
      attr = {}
    }
  } else if (p.sareeData) {
    try {
      attr = typeof p.sareeData === 'string' ? JSON.parse(p.sareeData) : p.sareeData
    } catch {
      attr = {}
    }
  }

  const stock = typeof p.stock === 'number' ? p.stock : Number(p.stock) || 0

  // 3. Generate or preserve product variants
  let variants: ProductVariant[] = []
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    variants = p.variants
  } else {
    // Generate variant using attributes
    const color = attr.color || p.color || 'Multicolor'
    const size = attr.size || p.size || 'Free Size'

    variants = [
      {
        id: `var-${p.id}`,
        productId: String(p.id),
        sku: p.sku || `SKU-${p.id}`,
        color,
        colorHex: attr.colorHex,
        size,
        mrp: Number(p.mrp) || Number(p.sellingPrice) || 0,
        sellingPrice: Number(p.sellingPrice) || 0,
        stock: stock,
        lowStockThreshold: 5,
        isActive: true,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      },
    ]
  }

  return {
    id: String(p.id),
    name: p.name || 'Ethnic Attire',
    slug: p.slug || String(p.id),
    sku: p.sku || `SKU-${p.id}`,
    description: p.description || '',
    shortDescription: p.shortDescription || p.description?.slice(0, 160) || '',
    categoryId: String(p.categoryId || p.category_id || '1'),
    category: p.category || {
      id: String(p.categoryId || '1'),
      name: attr.genericName || 'Ethnic Wear',
      slug: 'ethnic-wear',
      productCount: 1,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: p.brand || 'Ankita Processors',
    fabric: attr.fabric || p.fabric || 'Pure Cotton',
    gender: p.gender || 'FEMALE',
    variants,
    mrp: Number(p.mrp) || Number(p.sellingPrice) || 0,
    sellingPrice: Number(p.sellingPrice) || 0,
    gstRate: Number(attr.gstRate) || Number(p.gstRate) || 5,
    hsnCode: attr.hsnCode || p.hsnCode || '5208',
    isReturnable: true,
    isExchangeable: true,
    returnWindow: 7,
    isFeatured: Boolean(p.isFeatured),
    isNewArrival: Boolean(p.isNewArrival ?? true),
    isBestSeller: Boolean(p.isBestSeller),
    isPublished: Boolean(p.isPublished ?? true),
    avgRating: 4.8,
    totalReviews: 24,
    totalSold: 0,
    images: formattedImages,
    stock,
    attributes: attr,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  }
}
