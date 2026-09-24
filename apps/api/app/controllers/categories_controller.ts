import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const categoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    slug: vine.string().trim(),
    description: vine.string().trim().optional(),
  })
)

export default class CategoriesController {
  async index({ response }: HttpContext) {
    const categories = await Category.query().orderBy('created_at', 'desc')
    return response.ok(categories)
  }

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(categoryValidator)
    const category = await Category.create(data)
    return response.created(category)
  }

  async show({ params, response }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    return response.ok(category)
  }

  async update({ params, request, response }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    const data = await request.validateUsing(categoryValidator)
    
    category.merge(data)
    await category.save()

    return response.ok(category)
  }

  async destroy({ params, response }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    await category.delete()
    return response.ok({ message: 'Category deleted successfully' })
  }
}
