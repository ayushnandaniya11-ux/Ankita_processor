import type { HttpContext } from '@adonisjs/core/http'
import WholesalerInquiry from '#models/wholesaler_inquiry'
import InquiryCatalogItem from '#models/inquiry_catalog_item'
import InquiryStatusHistory from '#models/inquiry_status_history'
import db from '@adonisjs/lucid/services/db'

export default class WholesalerInquiriesController {
  async store({ request, auth, response }: HttpContext) {
    const data = request.only([
      'businessName',
      'contactNumber',
      'email',
      'cityState',
      'fabricQualityId',
      'requiredQuantity',
      'additionalMessage',
    ])
    const catalogIds = request.input('catalogIds', [])

    const user = auth.user!

    const trx = await db.transaction()
    try {
      const inquiryIdString = `INQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

      const inquiry = await WholesalerInquiry.create(
        {
          ...data,
          userId: user.id,
          inquiryId: inquiryIdString,
          status: 'New',
        },
        { client: trx }
      )

      if (catalogIds && catalogIds.length > 0) {
        for (const catalogId of catalogIds) {
          await InquiryCatalogItem.create(
            {
              inquiryId: inquiry.id,
              wholesalerCatalogId: catalogId,
            },
            { client: trx }
          )
        }
      }

      await InquiryStatusHistory.create(
        {
          inquiryId: inquiry.id,
          status: 'New',
          notes: 'Inquiry submitted',
          updatedBy: user.id,
        },
        { client: trx }
      )

      await trx.commit()

      await inquiry.load('catalogItems', (query) => {
        query.preload('catalog')
      })
      await inquiry.load('fabricQuality')

      return response.created(inquiry)
    } catch (error: any) {
      await trx.rollback()
      return response.internalServerError({
        message: 'Failed to submit inquiry',
        error: error.message,
      })
    }
  }

  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    const inquiries = await WholesalerInquiry.query()
      .where('userId', user.id)
      .preload('fabricQuality')
      .preload('catalogItems', (query) => {
        query.preload('catalog')
      })
      .orderBy('createdAt', 'desc')

    return response.ok(inquiries)
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const inquiry = await WholesalerInquiry.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('fabricQuality')
      .preload('catalogItems', (query) => {
        query.preload('catalog')
      })
      .preload('statusHistories')
      .firstOrFail()

    return response.ok(inquiry)
  }

  async adminIndex({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const inquiries = await WholesalerInquiry.query()
      .preload('user')
      .preload('assignee')
      .preload('fabricQuality')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(inquiries)
  }

  async adminShow({ params, response }: HttpContext) {
    const inquiry = await WholesalerInquiry.query()
      .where('id', params.id)
      .preload('user')
      .preload('assignee')
      .preload('fabricQuality')
      .preload('catalogItems', (query) => {
        query.preload('catalog')
      })
      .preload('statusHistories')
      .firstOrFail()

    return response.ok(inquiry)
  }

  async adminUpdateStatus({ params, request, auth, response }: HttpContext) {
    const data = request.only(['status', 'notes', 'assignedTo'])
    const user = auth.user!

    const inquiry = await WholesalerInquiry.findOrFail(params.id)

    if (data.status && data.status !== inquiry.status) {
      inquiry.status = data.status
      await InquiryStatusHistory.create({
        inquiryId: inquiry.id,
        status: data.status,
        notes: data.notes || null,
        updatedBy: user.id,
      })
    }

    if (data.assignedTo !== undefined) {
      inquiry.assignedTo = data.assignedTo
    }

    await inquiry.save()

    return response.ok(inquiry)
  }
}
