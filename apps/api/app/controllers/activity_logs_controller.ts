import type { HttpContext } from '@adonisjs/core/http'
import ActivityLog from '#models/activity_log'

export default class ActivityLogsController {
  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Filters
    const userId = request.input('userId')
    const module = request.input('module')

    const query = ActivityLog.query().preload('user').orderBy('created_at', 'desc')

    if (userId) query.where('userId', userId)
    if (module) query.where('module', module)

    const logs = await query.paginate(page, limit)

    return response.ok({ data: logs })
  }
}
