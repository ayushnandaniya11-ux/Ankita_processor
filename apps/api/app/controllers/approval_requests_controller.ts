import type { HttpContext } from '@adonisjs/core/http'
import ApprovalRequest from '#models/approval_request'
import Notification from '#models/notification'
import ActivityLogService from '#services/activity_log_service'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export default class ApprovalRequestsController {
  public async index({ response, auth, ctx }: HttpContext | any) {
    const user = auth.user!

    // Admin sees all, employee sees own
    const query = ApprovalRequest.query()
      .preload('employee', (q) => q.preload('user'))
      .orderBy('createdAt', 'desc')

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      const employee = ctx.employee
      if (!employee) return response.forbidden({ error: 'Not an employee' })
      query.where('employee_id', employee.id)
    }

    const requests = await query
    return response.ok({ data: requests })
  }

  public async store({ request, response, auth, ctx }: HttpContext | any) {
    const user = auth.user!
    const employee = ctx.employee

    if (!employee) {
      return response.forbidden({ error: 'Only employees can submit approval requests.' })
    }

    const schema = vine.object({
      actionType: vine.enum(['CREATE', 'UPDATE', 'DELETE']),
      entityType: vine.string(),
      entityId: vine.string().optional(),
      originalData: vine.any().optional(),
      proposedData: vine.any(),
      reason: vine.string().optional(),
    })

    const payload = await request.validateUsing(vine.compile(schema))

    const approvalRequest = new ApprovalRequest()
    approvalRequest.employeeId = employee.id
    approvalRequest.actionType = payload.actionType as 'CREATE' | 'UPDATE' | 'DELETE'
    approvalRequest.entityType = payload.entityType
    approvalRequest.entityId = payload.entityId || null
    approvalRequest.originalData = payload.originalData || {}
    approvalRequest.proposedData = payload.proposedData
    approvalRequest.reason = payload.reason || null
    approvalRequest.status = 'PENDING'

    await approvalRequest.save()

    // Notify admins
    // In a real app, query all ADMIN / SUPER_ADMIN users and create notifications

    ActivityLogService.log(
      user.id,
      'SUBMIT_APPROVAL_REQUEST',
      'APPROVAL_WORKFLOW',
      `Submitted request to ${payload.actionType} ${payload.entityType}`,
      request.ip()
    )

    return response.created({ data: approvalRequest })
  }

  public async approve({ params, response, auth, request }: HttpContext) {
    const admin = auth.user!
    if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN') {
      return response.forbidden({ error: 'Only admins can approve requests.' })
    }

    const req = await ApprovalRequest.find(params.id)
    if (!req) return response.notFound({ error: 'Request not found' })
    if (req.status !== 'PENDING') return response.badRequest({ error: 'Request is not pending' })

    const trx = await db.transaction()

    try {
      // 1. Apply changes dynamically based on entityType
      await this.applyChanges(req.actionType, req.entityType, req.entityId, req.proposedData, trx)

      // 2. Update Request Status
      req.status = 'APPROVED'
      req.approvedBy = admin.id
      req.approvedAt = DateTime.now()
      req.useTransaction(trx)
      await req.save()

      // 3. Notify Employee
      const employee = await req.related('employee').query().first()
      if (employee) {
        await Notification.create(
          {
            userId: employee.userId,
            title: 'Request Approved',
            message: `Your request to ${req.actionType} ${req.entityType} was approved.`,
            relatedEntityType: 'APPROVAL_REQUEST',
            relatedEntityId: req.id.toString(),
          },
          { client: trx }
        )
      }

      await trx.commit()

      ActivityLogService.log(
        admin.id,
        'APPROVE_REQUEST',
        'APPROVAL_WORKFLOW',
        `Approved request #${req.id} for ${req.entityType}`,
        request.ip()
      )

      return response.ok({ data: req })
    } catch (error: any) {
      await trx.rollback()
      console.error(error)
      return response.internalServerError({ error: 'Failed to apply changes: ' + error.message })
    }
  }

  public async reject({ params, request, response, auth }: HttpContext) {
    const admin = auth.user!
    if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN') {
      return response.forbidden({ error: 'Only admins can reject requests.' })
    }

    const req = await ApprovalRequest.find(params.id)
    if (!req) return response.notFound({ error: 'Request not found' })
    if (req.status !== 'PENDING') return response.badRequest({ error: 'Request is not pending' })

    const schema = vine.object({
      rejectionReason: vine.string(),
    })
    const payload = await request.validateUsing(vine.compile(schema))

    req.status = 'REJECTED'
    req.rejectionReason = payload.rejectionReason
    req.approvedBy = admin.id
    req.approvedAt = DateTime.now()

    await req.save()

    const employee = await req.related('employee').query().first()
    if (employee) {
      await Notification.create({
        userId: employee.userId,
        title: 'Request Rejected',
        message: `Your request to ${req.actionType} ${req.entityType} was rejected. Reason: ${payload.rejectionReason}`,
        relatedEntityType: 'APPROVAL_REQUEST',
        relatedEntityId: req.id.toString(),
      })
    }

    ActivityLogService.log(
      admin.id,
      'REJECT_REQUEST',
      'APPROVAL_WORKFLOW',
      `Rejected request #${req.id} for ${req.entityType}`,
      request.ip()
    )

    return response.ok({ data: req })
  }

  private async applyChanges(
    action: string,
    entityType: string,
    entityId: string | null,
    data: any,
    trx: any
  ) {
    // Dynamically apply changes based on entity type.
    // Example for 'PRODUCT'
    if (entityType === 'PRODUCT') {
      const { default: Product } = await import('#models/product')
      if (action === 'CREATE') {
        await Product.create(data, { client: trx })
      } else if (action === 'UPDATE' && entityId) {
        const product = await Product.findOrFail(entityId, { client: trx })
        product.merge(data)
        await product.save()
      } else if (action === 'DELETE' && entityId) {
        const product = await Product.findOrFail(entityId, { client: trx })
        await product.delete()
      }
    } else if (entityType === 'INVENTORY') {
      // Add logic for other entities...
      const { default: Product } = await import('#models/product')
      if (action === 'UPDATE' && entityId) {
        const product = await Product.findOrFail(entityId, { client: trx })
        product.stock = data.stock
        await product.save()
      }
    } else {
      throw new Error(`Unsupported entity type: ${entityType}`)
    }
  }
}
