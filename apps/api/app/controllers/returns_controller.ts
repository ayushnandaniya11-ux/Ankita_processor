import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import fs from 'node:fs'
import Order from '#models/order'
import ReturnRequest, { type CustomerPhoto, type ReturnAuditEntry } from '#models/return_request'
import ActivityLog from '#models/activity_log'
import VisionVerificationService from '#services/vision_verification_service'
import ReturnI18nService, { type SupportedLanguage } from '#services/return_i18n_service'

export default class ReturnsController {
  /**
   * Public: Get localized return policy, guidelines, and instructions
   */
  public async policyAndInstructions({ request, response }: HttpContext) {
    const langParam = request.input('lang') as SupportedLanguage
    const stateParam = request.input('state') as string

    let language: SupportedLanguage = 'en'
    if (['en', 'hi', 'gu'].includes(langParam)) {
      language = langParam
    } else if (stateParam) {
      language = ReturnI18nService.detectLanguageFromState(stateParam)
    }

    const instructions = ReturnI18nService.getInstructions(language)

    return response.ok({
      language,
      detectedLanguage: language,
      instructions,
      translations: {
        language,
        ...instructions,
      },
      supportedLanguages: [
        { code: 'en', label: 'English', nativeName: 'English' },
        { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
      ],
      returnWindowDays: VisionVerificationService.RETURN_WINDOW_DAYS,
    })
  }

  /**
   * Customer: Check if an order and its items are eligible for return
   */
  public async checkEligibility(ctx: HttpContext) {
    const { params, request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to check return eligibility' })
    }

    const orderId = params.orderId || request.input('orderId')
    const orderItemId = request.input('orderItemId')

    const order = await Order.query()
      .where('id', orderId)
      .where('userId', user.id)
      .preload('items', (iq) => iq.preload('product'))
      .first()

    if (!order) {
      return response.notFound({ error: 'Order not found or access denied' })
    }

    // Check return window
    const eligibility = VisionVerificationService.isOrderWithinReturnWindow(order)

    // Detect suggested language from customer shipping address
    const defaultLanguage = ReturnI18nService.detectLanguageFromState(order.shippingAddress)

    // Check existing returns on items of this order
    const existingReturns = await ReturnRequest.query().where('orderId', order.id)

    let selectedItemReturn: any = null
    if (orderItemId) {
      selectedItemReturn = existingReturns.find(
        (r) => String(r.orderItemId) === String(orderItemId) && !['CANCELLED', 'REJECTED'].includes(r.status)
      )
    }

    const itemsWithStatus = order.items.map((item) => {
      const activeReturn = existingReturns.find(
        (r) => r.orderItemId === item.id && !['CANCELLED', 'REJECTED'].includes(r.status)
      )
      return {
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage || item.product?.imageUrl,
        quantity: item.quantity,
        rate: item.rate,
        total: item.total,
        hasActiveReturn: Boolean(activeReturn),
        activeReturnNo: activeReturn?.returnNo || null,
        activeReturnStatus: activeReturn?.status || null,
      }
    })

    const isItemEligible = eligibility.isEligible && !selectedItemReturn
    const reasonCode = !eligibility.isEligible
      ? (order.status !== 'DELIVERED' ? 'NOT_DELIVERED' : 'WINDOW_EXPIRED')
      : (selectedItemReturn ? 'ALREADY_SUBMITTED' : undefined)

    return response.ok({
      eligible: isItemEligible,
      isEligible: isItemEligible,
      reason: reasonCode,
      message: selectedItemReturn
        ? 'A return request already exists for this item.'
        : (eligibility.reason || null),
      orderId: order.id,
      orderNo: order.orderNo,
      orderStatus: order.status,
      deliveredDate: order.deliveredDate || order.updatedAt,
      daysRemaining: eligibility.daysRemaining,
      ineligibleReason: eligibility.reason || null,
      defaultLanguage,
      existingReturn: selectedItemReturn || null,
      items: itemsWithStatus,
    })
  }

  /**
   * Customer: Submit a new return request with photo and video verification
   */
  public async store(ctx: HttpContext) {
    const { params, request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to submit a return request' })
    }

    const rawData = request.all()
    const orderId = params.orderId || rawData.orderId

    const order = await Order.query()
      .where('id', orderId)
      .where('userId', user.id)
      .preload('items')
      .first()

    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    // 1. Eligibility Check
    const eligibility = VisionVerificationService.isOrderWithinReturnWindow(order)
    if (!eligibility.isEligible) {
      return response.badRequest({ error: eligibility.reason })
    }

    const orderItemId = Number(rawData.orderItemId)
    const reason = String(rawData.reason || '').trim()
    const customerNotes = rawData.customerNotes ? String(rawData.customerNotes).trim() : null
    const preferredLang = (['en', 'hi', 'gu'].includes(rawData.language)
      ? rawData.language
      : ReturnI18nService.detectLanguageFromState(order.shippingAddress)) as SupportedLanguage

    if (!orderItemId || !reason) {
      return response.badRequest({ error: 'Missing required fields: orderItemId and reason are required' })
    }

    const orderItem = order.items.find((item) => item.id === orderItemId)
    if (!orderItem) {
      return response.badRequest({ error: 'Invalid orderItemId: item does not belong to this order' })
    }

    // 2. Prevent duplicate active return on the same item
    const existing = await ReturnRequest.query()
      .where('orderItemId', orderItemId)
      .whereNotIn('status', ['CANCELLED', 'REJECTED'])
      .first()

    if (existing) {
      return response.badRequest({
        message: 'A return request already exists for this item.',
        error: `A return request (${existing.returnNo}) has already been submitted for this item.`,
        existingReturnNo: existing.returnNo,
      })
    }

    // 3. Process Uploaded Photos (Multipart and/or JSON URLs)
    const customerPhotos: CustomerPhoto[] = []
    const uploadDir = app.makePath('public/uploads/returns')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Handle multipart files
    const uploadedPhotos = request.files('photos') || []
    const uploadedPhotosArray = Array.isArray(uploadedPhotos) ? uploadedPhotos : uploadedPhotos ? [uploadedPhotos] : []
    const singlePhoto = request.file('photo')
    if (singlePhoto) uploadedPhotosArray.push(singlePhoto)

    const baseUrl = `${request.protocol()}://${request.host()}`

    for (let i = 0; i < uploadedPhotosArray.length; i++) {
      const file = uploadedPhotosArray[i]
      if (file && file.isValid) {
        const fileName = `${cuid()}.${file.extname || 'jpg'}`
        await file.move(uploadDir, { name: fileName, overwrite: true })
        customerPhotos.push({
          id: `photo_${i + 1}`,
          url: `${baseUrl}/uploads/returns/${fileName}`,
          filename: fileName,
          size: file.size,
          mimeType: `${file.type}/${file.subtype}`,
        })
      }
    }

    // Handle JSON or array photos passed in payload (photos or photoUrls)
    const incomingPhotos = rawData.photos || rawData.photoUrls
    if (incomingPhotos) {
      try {
        const parsed = typeof incomingPhotos === 'string' ? JSON.parse(incomingPhotos) : incomingPhotos
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any, idx: number) => {
            const url = typeof p === 'string' ? p : p.url
            if (url && !customerPhotos.some((cp) => cp.url === url)) {
              customerPhotos.push({
                id: `photo_json_${idx + 1}`,
                url,
                filename: p.filename || `upload_${idx + 1}.jpg`,
                size: p.size,
                mimeType: p.mimeType || 'image/jpeg',
              })
            }
          })
        }
      } catch {}
    }

    if (customerPhotos.length === 0) {
      return response.badRequest({
        error: 'Please upload at least 2 clear photos of the saree showing the overall product and the issue.',
      })
    }

    // Process Video upload
    let customerVideoUrl = rawData.videoUrl ? String(rawData.videoUrl).trim() : null
    const uploadedVideo = request.file('video')
    if (uploadedVideo && uploadedVideo.isValid) {
      const videoName = `${cuid()}.${uploadedVideo.extname || 'mp4'}`
      await uploadedVideo.move(uploadDir, { name: videoName, overwrite: true })
      customerVideoUrl = `${baseUrl}/uploads/returns/${videoName}`
    }

    // 4. Source Authentic Reference Images from Catalogue & Order Snapshot
    const referenceImages = await VisionVerificationService.getReferenceImages(orderItem)

    // 5. Run Automatic Computer Vision Verification
    const verification = await VisionVerificationService.verifyReturnMedia({
      customerPhotos,
      customerVideoUrl,
      referenceImages,
      productName: orderItem.productName,
      reason,
    })

    // 6. Determine Return Status based on Verification and Eligibility
    let finalStatus:
      | 'REQUESTED'
      | 'AUTO_APPROVED'
      | 'APPROVED'
      | 'REJECTED'
      | 'UNDER_REVIEW'
      | 'PENDING_EVIDENCE'
      | 'PICKUP_SCHEDULED' = 'UNDER_REVIEW'

    let pickupTrackingNumber: string | null = null
    let pickupStatus = 'PENDING'

    if (verification.verificationStatus === 'MATCH_CONFIRMED' && eligibility.isEligible) {
      finalStatus = 'AUTO_APPROVED'
      pickupTrackingNumber = `BD-REV-${Math.floor(10000000 + Math.random() * 90000000)}`
      pickupStatus = 'SCHEDULED'
    } else if (verification.verificationStatus === 'INSUFFICIENT_EVIDENCE') {
      finalStatus = 'PENDING_EVIDENCE'
    } else {
      finalStatus = 'UNDER_REVIEW'
    }

    const returnNo = `RET-${Math.floor(100000 + Math.random() * 900000)}`

    // Initial audit log entry
    const auditTrail: ReturnAuditEntry[] = [
      {
        status: finalStatus,
        timestamp: DateTime.now().toISO(),
        actorId: user.id,
        actorName: user.name || 'Customer',
        notes: `Return requested for item "${orderItem.productName}". AI Visual Outcome: ${verification.verificationStatus} (Confidence: ${verification.confidenceScore}%).`,
      },
    ]

    const returnRequest = new ReturnRequest()
    returnRequest.returnNo = returnNo
    returnRequest.orderId = order.id
    returnRequest.orderItemId = orderItem.id
    returnRequest.userId = user.id
    returnRequest.productId = orderItem.productId
    returnRequest.reason = reason
    returnRequest.customerNotes = customerNotes
    returnRequest.language = preferredLang
    returnRequest.customerPhotos = customerPhotos
    returnRequest.customerVideoUrl = customerVideoUrl
    returnRequest.extractedFrames = verification.extractedFrames || []
    returnRequest.referenceImages = referenceImages
    returnRequest.verificationStatus = verification.verificationStatus
    returnRequest.confidenceScore = verification.confidenceScore
    returnRequest.verificationBreakdown = verification.breakdown
    returnRequest.status = finalStatus
    returnRequest.pickupTrackingNumber = pickupTrackingNumber
    returnRequest.pickupStatus = pickupStatus
    returnRequest.auditTrail = auditTrail
    await returnRequest.save()

    // Retrieve localized customer response message
    const instructions = ReturnI18nService.getInstructions(preferredLang)
    let userMessage = instructions.messages.underReview
    let userSubtitle = instructions.messages.underReviewSubtitle

    if (finalStatus === 'AUTO_APPROVED') {
      userMessage = instructions.messages.autoApproved
      userSubtitle = instructions.messages.autoApprovedSubtitle
    } else if (finalStatus === 'PENDING_EVIDENCE') {
      userMessage = instructions.messages.insufficientEvidence
      userSubtitle = instructions.messages.insufficientEvidenceSubtitle
    } else if (verification.verificationStatus === 'POSSIBLE_MISMATCH') {
      userMessage = instructions.messages.possibleMismatch
      userSubtitle = instructions.messages.possibleMismatchSubtitle
    }

    return response.created({
      message: userMessage,
      subtitle: userSubtitle,
      returnRequest: {
        id: returnRequest.id,
        returnNo: returnRequest.returnNo,
        language: returnRequest.language,
        status: returnRequest.status,
        statusLabel: ReturnI18nService.getStatusLabel(returnRequest.status, preferredLang),
        verificationStatus: returnRequest.verificationStatus,
        confidenceScore: returnRequest.confidenceScore,
        pickupTrackingNumber: returnRequest.pickupTrackingNumber,
        pickupStatus: returnRequest.pickupStatus,
        pickupInstructions: instructions.messages.pickupInstructions,
        pickupNote: instructions.messages.pickupNote,
      },
    })
  }

  /**
   * Customer: View my active and past return requests
   */
  public async myReturns(ctx: HttpContext) {
    const { response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to view returns' })
    }

    const returns = await ReturnRequest.query()
      .where('userId', user.id)
      .preload('order')
      .preload('orderItem')
      .preload('product')
      .orderBy('createdAt', 'desc')

    return response.ok({ returns })
  }

  /**
   * Customer: View details of a specific return request
   */
  public async show(ctx: HttpContext) {
    const { params, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to view return details' })
    }

    const returnReq = await ReturnRequest.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('order')
      .preload('orderItem')
      .preload('product')
      .first()

    if (!returnReq) {
      return response.notFound({ error: 'Return request not found' })
    }

    const localizedInstructions = ReturnI18nService.getInstructions(returnReq.language)

    return response.ok({
      returnRequest: returnReq,
      instructions: localizedInstructions,
    })
  }

  /**
   * Admin: List all return requests with filters and summary KPI metrics
   */
  public async adminIndex(ctx: HttpContext) {
    const { request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const { status, verificationStatus, search } = request.qs()

    let query = ReturnRequest.query()
      .preload('order')
      .preload('orderItem')
      .preload('user')
      .preload('product')
      .orderBy('createdAt', 'desc')

    if (status && status !== 'ALL') {
      query = query.where('status', status)
    }

    if (verificationStatus && verificationStatus !== 'ALL') {
      query = query.where('verification_status', verificationStatus)
    }

    if (search) {
      query = query.where((builder) => {
        builder
          .where('return_no', 'like', `%${search}%`)
          .orWhere('pickup_tracking_number', 'like', `%${search}%`)
          .orWhereHas('order', (oq) => oq.where('order_no', 'like', `%${search}%`))
          .orWhereHas('user', (uq) => uq.where('name', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`))
          .orWhereHas('product', (pq) => pq.where('name', 'like', `%${search}%`))
      })
    }

    const returns = await query

    // Calculate metrics
    const allReturns = await ReturnRequest.all()
    let autoApprovedCount = 0
    let underReviewCount = 0
    let approvedCount = 0
    let rejectedCount = 0
    let pendingEvidenceCount = 0
    let matchConfirmedCount = 0
    let possibleMismatchCount = 0

    for (const r of allReturns) {
      if (r.status === 'AUTO_APPROVED') autoApprovedCount++
      if (r.status === 'UNDER_REVIEW') underReviewCount++
      if (r.status === 'APPROVED') approvedCount++
      if (r.status === 'REJECTED') rejectedCount++
      if (r.status === 'PENDING_EVIDENCE') pendingEvidenceCount++
      if (r.verificationStatus === 'MATCH_CONFIRMED') matchConfirmedCount++
      if (r.verificationStatus === 'POSSIBLE_MISMATCH') possibleMismatchCount++
    }

    return response.ok({
      returns,
      metrics: {
        total: allReturns.length,
        autoApproved: autoApprovedCount,
        underReview: underReviewCount,
        approved: approvedCount,
        rejected: rejectedCount,
        pendingEvidence: pendingEvidenceCount,
        matchConfirmed: matchConfirmedCount,
        possibleMismatch: possibleMismatchCount,
      },
    })
  }

  /**
   * Admin: Get single return request with side-by-side comparison data
   */
  public async adminShow(ctx: HttpContext) {
    const { params, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const returnReq = await ReturnRequest.query()
      .where('id', params.id)
      .preload('order', (oq) => oq.preload('user'))
      .preload('orderItem')
      .preload('user')
      .preload('product')
      .first()

    if (!returnReq) {
      return response.notFound({ error: 'Return request not found' })
    }

    return response.ok({ returnRequest: returnReq })
  }

  /**
   * Admin: Review and decide on a return request (Approve, Reject, or Request Evidence)
   */
  public async adminReview(ctx: HttpContext) {
    const { params, request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const returnReq = await ReturnRequest.find(params.id)
    if (!returnReq) {
      return response.notFound({ error: 'Return request not found' })
    }

    const { action, notes, rejectionReason } = request.only(['action', 'notes', 'rejectionReason'])

    if (!['APPROVE', 'REJECT', 'REQUEST_EVIDENCE', 'SCHEDULE_PICKUP'].includes(action)) {
      return response.badRequest({ error: 'Invalid action. Must be APPROVE, REJECT, REQUEST_EVIDENCE, or SCHEDULE_PICKUP' })
    }

    const previousStatus = returnReq.status

    if (action === 'APPROVE') {
      returnReq.status = 'APPROVED'
      if (!returnReq.pickupTrackingNumber) {
        returnReq.pickupTrackingNumber = `BD-REV-${Math.floor(10000000 + Math.random() * 90000000)}`
        returnReq.pickupStatus = 'SCHEDULED'
      }
      returnReq.adminNotes = notes || returnReq.adminNotes
    } else if (action === 'REJECT') {
      if (!rejectionReason) {
        return response.badRequest({
          message: 'A rejection reason is required when rejecting a return request.',
          error: 'Rejection reason is required when rejecting a return request.',
        })
      }
      returnReq.status = 'REJECTED'
      returnReq.rejectionReason = rejectionReason
      returnReq.adminNotes = notes || returnReq.adminNotes
    } else if (action === 'REQUEST_EVIDENCE') {
      returnReq.status = 'PENDING_EVIDENCE'
      returnReq.adminNotes = notes || 'Additional clear photos requested by inspector.'
    } else if (action === 'SCHEDULE_PICKUP') {
      returnReq.status = 'PICKUP_SCHEDULED'
      returnReq.pickupStatus = 'DISPATCHED'
      returnReq.adminNotes = notes || returnReq.adminNotes
    }

    // Append to audit trail
    const auditTrail = returnReq.auditTrail || []
    auditTrail.push({
      status: returnReq.status,
      timestamp: DateTime.now().toISO(),
      actorId: user.id,
      actorName: user.name || 'Administrator',
      notes: notes || (action === 'REJECT' ? `Rejected: ${rejectionReason}` : `Status updated to ${returnReq.status}`),
    })
    returnReq.auditTrail = auditTrail

    await returnReq.save()

    // Activity log entry
    try {
      await ActivityLog.create({
        userId: user.id,
        action: `RETURN_${action}`,
        module: 'RETURNS',
        description: `Admin updated return request #${returnReq.returnNo} from ${previousStatus} to ${returnReq.status}`,
        metadata: {
          returnId: returnReq.id,
          returnNo: returnReq.returnNo,
          action,
          notes,
          rejectionReason,
        },
      })
    } catch (logErr) {
      console.warn('[ActivityLog Error]', logErr)
    }

    return response.ok({
      message: `Return request #${returnReq.returnNo} updated successfully`,
      returnRequest: returnReq,
    })
  }
}
