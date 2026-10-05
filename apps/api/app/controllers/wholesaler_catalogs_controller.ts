import type { HttpContext } from '@adonisjs/core/http'
import WholesalerCatalog from '#models/wholesaler_catalog'

export default class WholesalerCatalogsController {
  async index({ response }: HttpContext) {
    const catalogs = await WholesalerCatalog.query()
      .where('isPublished', true)
      .orderBy('createdAt', 'desc')
    return response.ok(catalogs)
  }

  async adminIndex({ response }: HttpContext) {
    const catalogs = await WholesalerCatalog.query()
      .orderBy('createdAt', 'desc')
      .preload('publisher')
    return response.ok(catalogs)
  }

  async store({ request, auth, response }: HttpContext) {
    const data = request.only([
      'title',
      'description',
      'imageUrl',
      'availableColors',
      'dimensions',
      'isPublished',
    ])
    const user = auth.user!

    const catalog = await WholesalerCatalog.create({
      ...data,
      publishedBy: user.id,
    })

    return response.created(catalog)
  }

  async show({ params, response }: HttpContext) {
    const catalog = await WholesalerCatalog.findOrFail(params.id)
    return response.ok(catalog)
  }

  async update({ params, request, response }: HttpContext) {
    const catalog = await WholesalerCatalog.findOrFail(params.id)
    const data = request.only([
      'title',
      'description',
      'imageUrl',
      'availableColors',
      'dimensions',
      'isPublished',
    ])

    catalog.merge(data)
    await catalog.save()

    return response.ok(catalog)
  }

  async destroy({ params, response }: HttpContext) {
    const catalog = await WholesalerCatalog.findOrFail(params.id)
    await catalog.delete()

    return response.noContent()
  }
}
