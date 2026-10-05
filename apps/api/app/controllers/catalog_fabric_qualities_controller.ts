import type { HttpContext } from '@adonisjs/core/http'
import CatalogFabricQuality from '#models/catalog_fabric_quality'

export default class CatalogFabricQualitiesController {
  async index({ response }: HttpContext) {
    const qualities = await CatalogFabricQuality.query()
      .where('isActive', true)
      .orderBy('name', 'asc')
    return response.ok(qualities)
  }

  async adminIndex({ response }: HttpContext) {
    const qualities = await CatalogFabricQuality.query().orderBy('name', 'asc')
    return response.ok(qualities)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'description', 'isActive'])
    const quality = await CatalogFabricQuality.create(data)
    return response.created(quality)
  }

  async update({ params, request, response }: HttpContext) {
    const quality = await CatalogFabricQuality.findOrFail(params.id)
    const data = request.only(['name', 'description', 'isActive'])
    quality.merge(data)
    await quality.save()
    return response.ok(quality)
  }

  async destroy({ params, response }: HttpContext) {
    const quality = await CatalogFabricQuality.findOrFail(params.id)
    await quality.delete()
    return response.noContent()
  }
}
