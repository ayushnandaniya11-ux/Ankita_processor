import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { existsSync, mkdirSync } from 'node:fs'

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export default class ProductsController {
  async index({ request, response }: HttpContext) {
    const isAdmin = request.url().includes('/admin')
    const query = Product.query().preload('category').orderBy('created_at', 'desc')

    // If it's customer storefront, only show published products
    if (!isAdmin && request.input('all') !== 'true') {
      query.where('is_published', true)
    } else if (request.input('isPublished') !== undefined) {
      const isPublished = request.input('isPublished') === 'true' || request.input('isPublished') === true
      query.where('is_published', isPublished)
    }

    // Category filter
    const categoryParam = request.input('category') || request.input('categoryId')
    if (categoryParam) {
      if (/^\d+$/.test(String(categoryParam))) {
        query.where('category_id', Number(categoryParam))
      } else {
        query.whereHas('category', (catQuery) => {
          catQuery.where('slug', categoryParam).orWhereRaw('LOWER(name) = ?', [String(categoryParam).toLowerCase()])
        })
      }
    }

    // Search query
    const search = request.input('q') || request.input('search')
    if (search) {
      const searchStr = `%${String(search).toLowerCase()}%`
      query.where((q) => {
        q.whereRaw('LOWER(name) LIKE ?', [searchStr])
          .orWhereRaw('LOWER(description) LIKE ?', [searchStr])
          .orWhereRaw('LOWER(sku) LIKE ?', [searchStr])
      })
    }

    // Limit
    const limit = request.input('limit')
    if (limit && Number(limit) > 0) {
      query.limit(Number(limit))
    }

    const products = await query
    return response.ok(products)
  }

  async store({ request, response }: HttpContext) {
    const rawData = request.all()
    const name = String(rawData.name || '').trim()
    if (!name) {
      return response.badRequest({ message: 'Product name is required' })
    }

    let slug = String(rawData.slug || '').trim()
    if (!slug) {
      slug = slugify(name)
    } else {
      slug = slugify(slug) || slugify(name)
    }

    // Ensure unique slug
    let uniqueSlug = slug
    let counter = 1
    while (await Product.query().where('slug', uniqueSlug).first()) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const sku = String(rawData.sku || `SKU-${Date.now()}`).trim()
    const description = rawData.description ? String(rawData.description).trim() : null
    const mrp = Number(rawData.mrp) || 0
    const sellingPrice = Number(rawData.sellingPrice) || 0
    const stock = Number(rawData.stock) || 0
    const categoryId = rawData.categoryId ? Number(rawData.categoryId) : null

    // Parse isPublished boolean (defaults to true if admin submits creation)
    let isPublished = true
    if (rawData.isPublished !== undefined) {
      isPublished =
        rawData.isPublished === true ||
        rawData.isPublished === 'true' ||
        rawData.isPublished === 1 ||
        rawData.isPublished === '1'
    }

    // Handle attributes / sareeData
    let attributes: Record<string, any> | null = null
    if (rawData.sareeData) {
      try {
        attributes = typeof rawData.sareeData === 'string' ? JSON.parse(rawData.sareeData) : rawData.sareeData
      } catch {}
    } else if (rawData.attributes) {
      try {
        attributes = typeof rawData.attributes === 'string' ? JSON.parse(rawData.attributes) : rawData.attributes
      } catch {}
    }

    // Handle uploaded images
    const imagesList: Array<{ id: string; url: string; sortOrder?: number; isPrimary?: boolean }> = []
    const uploadDir = app.makePath('public/uploads/products')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Check multipart uploaded files (support both images and images[])
    const uploadedFiles = request.files('images') || []
    const uploadedFilesBrackets = request.files('images[]') || []
    const singleFile = request.file('image')
    const singleFileBrackets = request.file('image[]')
    const allFiles = [
      ...(Array.isArray(uploadedFiles) ? uploadedFiles : uploadedFiles ? [uploadedFiles] : []),
      ...(Array.isArray(uploadedFilesBrackets) ? uploadedFilesBrackets : uploadedFilesBrackets ? [uploadedFilesBrackets] : []),
      ...(singleFile ? [singleFile] : []),
      ...(singleFileBrackets ? [singleFileBrackets] : []),
    ]

    const baseUrl = `${request.protocol()}://${request.host()}`

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i]
      if (file && file.isValid) {
        const fileName = `${cuid()}.${file.extname || 'jpg'}`
        await file.move(uploadDir, {
          name: fileName,
          overwrite: true,
        })
        const fileUrl = `${baseUrl}/uploads/products/${fileName}`
        imagesList.push({
          id: String(i + 1),
          url: fileUrl,
          sortOrder: i,
          isPrimary: i === 0,
        })
      }
    }

    // Support JSON or array images passed in payload
    if (rawData.images) {
      try {
        const parsedImages = typeof rawData.images === 'string' ? JSON.parse(rawData.images) : rawData.images
        if (Array.isArray(parsedImages)) {
          parsedImages.forEach((img: any, idx: number) => {
            const url = typeof img === 'string' ? img : img.url
            if (url && !imagesList.some(item => item.url === url)) {
              imagesList.push({
                id: String(imagesList.length + idx + 1),
                url,
                sortOrder: img.sortOrder ?? (imagesList.length + idx),
                isPrimary: img.isPrimary ?? (imagesList.length === 0),
              })
            }
          })
        }
      } catch {}
    }

    // Also support image URL passed as text
    if (rawData.imageUrl && typeof rawData.imageUrl === 'string' && rawData.imageUrl.trim()) {
      const singleUrl = rawData.imageUrl.trim()
      if (!imagesList.some(item => item.url === singleUrl)) {
        imagesList.unshift({
          id: String(imagesList.length + 1),
          url: singleUrl,
          sortOrder: 0,
          isPrimary: true,
        })
      }
    }

    // Determine primary image URL
    let primaryImageUrl: string | null = null
    if (rawData.imageUrl && typeof rawData.imageUrl === 'string' && rawData.imageUrl.trim()) {
      primaryImageUrl = rawData.imageUrl.trim()
    } else {
      const primaryItem = imagesList.find((img) => img.isPrimary) || imagesList[0]
      primaryImageUrl = primaryItem?.url || null
    }

    if (primaryImageUrl) {
      imagesList.forEach((img) => {
        img.isPrimary = img.url === primaryImageUrl
      })
    }

    const product = await Product.create({
      name,
      slug: uniqueSlug,
      sku,
      description,
      mrp,
      sellingPrice,
      stock,
      categoryId,
      isPublished,
      images: imagesList,
      imageUrl: primaryImageUrl,
      attributes,
      isNewArrival: true,
      isFeatured: rawData.isFeatured === true || rawData.isFeatured === 'true',
      isBestSeller: rawData.isBestSeller === true || rawData.isBestSeller === 'true',
    })

    await product.load('category')
    return response.created(product)
  }

  async show({ params, request, response }: HttpContext) {
    const rawId = String(params.id)
    const decodedId = decodeURIComponent(rawId).trim()
    const isNumeric = /^\d+$/.test(decodedId)
    const isAdmin = request.url().includes('/admin')

    const query = Product.query().preload('category')

    if (isNumeric) {
      query.where((q) => {
        q.where('id', Number(decodedId))
          .orWhere('slug', decodedId)
          .orWhere('slug', rawId)
      })
    } else {
      query.where((q) => {
        q.where('slug', decodedId)
          .orWhere('slug', rawId)
          .orWhereRaw('LOWER(slug) = ?', [decodedId.toLowerCase()])
          .orWhereRaw('LOWER(slug) = ?', [rawId.toLowerCase()])
      })
    }

    if (!isAdmin) {
      query.where('is_published', true)
    }

    const product = await query.first()

    if (!product) {
      return response.notFound({ error: { message: 'Product not found' } })
    }

    return response.ok(product)
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const rawData = request.all()

    const updatePayload: Record<string, any> = {}

    if (rawData.name !== undefined) updatePayload.name = String(rawData.name).trim()
    if (rawData.slug !== undefined) updatePayload.slug = slugify(String(rawData.slug).trim())
    if (rawData.sku !== undefined) updatePayload.sku = String(rawData.sku).trim()
    if (rawData.description !== undefined) updatePayload.description = String(rawData.description).trim()
    if (rawData.mrp !== undefined) updatePayload.mrp = Number(rawData.mrp)
    if (rawData.sellingPrice !== undefined) updatePayload.sellingPrice = Number(rawData.sellingPrice)
    if (rawData.stock !== undefined) updatePayload.stock = Number(rawData.stock)
    if (rawData.categoryId !== undefined) {
      updatePayload.categoryId = rawData.categoryId ? Number(rawData.categoryId) : null
    }

    if (rawData.isPublished !== undefined) {
      updatePayload.isPublished =
        rawData.isPublished === true ||
        rawData.isPublished === 'true' ||
        rawData.isPublished === 1 ||
        rawData.isPublished === '1'
    }

    if (rawData.isFeatured !== undefined) {
      updatePayload.isFeatured = rawData.isFeatured === true || rawData.isFeatured === 'true'
    }
    if (rawData.isNewArrival !== undefined) {
      updatePayload.isNewArrival = rawData.isNewArrival === true || rawData.isNewArrival === 'true'
    }
    if (rawData.isBestSeller !== undefined) {
      updatePayload.isBestSeller = rawData.isBestSeller === true || rawData.isBestSeller === 'true'
    }

    if (rawData.sareeData || rawData.attributes) {
      try {
        const attr = rawData.sareeData || rawData.attributes
        updatePayload.attributes = typeof attr === 'string' ? JSON.parse(attr) : attr
      } catch {}
    }

    // Handle new uploaded files if any
    const uploadedFiles = request.files('images') || []
    const uploadedFilesBrackets = request.files('images[]') || []
    const singleFile = request.file('image')
    const singleFileBrackets = request.file('image[]')
    const allFiles = [
      ...(Array.isArray(uploadedFiles) ? uploadedFiles : uploadedFiles ? [uploadedFiles] : []),
      ...(Array.isArray(uploadedFilesBrackets) ? uploadedFilesBrackets : uploadedFilesBrackets ? [uploadedFilesBrackets] : []),
      ...(singleFile ? [singleFile] : []),
      ...(singleFileBrackets ? [singleFileBrackets] : []),
    ]

    if (allFiles.length > 0) {
      const uploadDir = app.makePath('public/uploads/products')
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
      }

      const baseUrl = `${request.protocol()}://${request.host()}`
      const newImages: Array<{ id: string; url: string; sortOrder?: number; isPrimary?: boolean }> = []

      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i]
        if (file && file.isValid) {
          const fileName = `${cuid()}.${file.extname || 'jpg'}`
          await file.move(uploadDir, { name: fileName, overwrite: true })
          newImages.push({
            id: String(i + 1),
            url: `${baseUrl}/uploads/products/${fileName}`,
            sortOrder: i,
            isPrimary: i === 0,
          })
        }
      }

      if (newImages.length > 0) {
        updatePayload.images = newImages
        updatePayload.imageUrl = newImages[0].url
      }
    } else if (rawData.images !== undefined) {
      try {
        const parsed = typeof rawData.images === 'string' ? JSON.parse(rawData.images) : rawData.images
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((img: any, idx: number) => {
            const url = typeof img === 'string' ? img : img.url
            return {
              id: String(img.id || idx + 1),
              url,
              sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
              isPrimary: Boolean(img.isPrimary ?? (idx === 0)),
            }
          })
          const primaryFromRaw = typeof rawData.imageUrl === 'string' && rawData.imageUrl.trim() ? rawData.imageUrl.trim() : null
          const primaryUrl = primaryFromRaw || formatted.find(img => img.isPrimary)?.url || formatted[0]?.url || product.imageUrl
          if (primaryUrl) {
            formatted.forEach(img => {
              img.isPrimary = img.url === primaryUrl
            })
          }
          updatePayload.images = formatted
          updatePayload.imageUrl = primaryUrl
        }
      } catch {}
    } else if (rawData.imageUrl) {
      const newPrimaryUrl = String(rawData.imageUrl).trim()
      updatePayload.imageUrl = newPrimaryUrl
      const existing = Array.isArray(product.images) ? [...product.images] : []
      if (existing.length > 0) {
        let found = false
        existing.forEach(img => {
          if (img.url === newPrimaryUrl) {
            img.isPrimary = true
            found = true
          } else {
            img.isPrimary = false
          }
        })
        if (!found) {
          existing.unshift({
            id: String(existing.length + 1),
            url: newPrimaryUrl,
            sortOrder: -1,
            isPrimary: true,
          })
        }
        updatePayload.images = existing
      } else {
        updatePayload.images = [{ id: '1', url: newPrimaryUrl, sortOrder: 0, isPrimary: true }]
      }
    }

    product.merge(updatePayload)
    await product.save()
    await product.load('category')

    return response.ok(product)
  }

  async togglePublish({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    product.isPublished = !product.isPublished
    await product.save()
    await product.load('category')

    return response.ok({
      message: `Product ${product.isPublished ? 'published' : 'unpublished'} successfully`,
      product,
    })
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await product.delete()
    return response.ok({ message: 'Product deleted successfully' })
  }
}
