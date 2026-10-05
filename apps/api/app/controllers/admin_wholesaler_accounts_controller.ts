import type { HttpContext } from '@adonisjs/core/http'
import WholesalerProfile from '#models/wholesaler_profile'
import vine from '@vinejs/vine'

export default class AdminWholesalerAccountsController {
  public async index({ response }: HttpContext) {
    const profiles = await WholesalerProfile.query().preload('user').orderBy('createdAt', 'desc')
    return response.ok(profiles)
  }

  public async updateStatus({ params, request, response }: HttpContext) {
    const profile = await WholesalerProfile.findOrFail(params.id)
    
    const schema = vine.object({
      approvalStatus: vine.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
    })
    
    const { approvalStatus } = await request.validateUsing(vine.compile(schema))
    
    profile.approvalStatus = approvalStatus
    await profile.save()
    
    return response.ok({ message: `Account status updated to ${approvalStatus}`, profile })
  }
}
