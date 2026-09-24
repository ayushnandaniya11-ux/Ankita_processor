import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const productValidator = vine.compile(
  vine.object({
    categoryId: vine.number().optional(),
    name: vine.string().trim(),
    slug: vine.string().trim(),
    sku: vine.string().trim(),
    description: vine.string().trim().optional(),
    mrp: vine.number().min(0),
    sellingPrice: vine.number().min(0),
    stock: vine.number().min(0),
    isPublished: vine.boolean().optional(),
  })
)

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.query().preload('category').orderBy('created_at', 'desc')
    return response.ok(products)
  }

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(productValidator)
    const product = await Product.create(data)
    return response.created(product)
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.query().where('id', params.id).preload('category').firstOrFail()
    return response.ok(product)
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const data = await request.validateUsing(productValidator)
    
    product.merge(data)
    await product.save()

    return response.ok(product)
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await product.delete()
    return response.ok({ message: 'Product deleted successfully' })
  }
}
