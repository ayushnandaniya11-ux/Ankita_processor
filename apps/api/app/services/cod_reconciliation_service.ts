import { DateTime } from 'luxon'
import Order from '#models/order'
import ActivityLog from '#models/activity_log'
import User from '#models/user'

export type CodStatus =
  | 'COD_PENDING'
  | 'COD_COLLECTED'
  | 'COD_REMITTED'
  | 'COD_SETTLED'
  | 'COD_FAILED'
  | 'COD_CANCELLED'
  | 'COD_DISPUTED'

export interface UpdateCodStatusInput {
  orderId: number
  status: CodStatus
  collectedAmount?: number
  remittedAmount?: number
  settledAmount?: number
  remittanceRef?: string
  remittedAt?: string
  settledAt?: string
  notes?: string
  actor?: User
}

export interface CodMetrics {
  totalOrders: number
  totalCodOrders?: number
  totalExpectedAmount: number
  pendingAmount: number
  codPending?: number
  collectedAmount: number
  codCollected?: number
  awaitingRemittanceAmount: number
  remittedAmount: number
  settledAmount: number
  codSettled?: number
  failedAmount: number
  cancelledAmount: number
  discrepancyAmount: number
  counts: {
    all: number
    pending: number
    collected: number
    remitted: number
    settled: number
    failed: number
    cancelled: number
    disputed: number
  }
}

export class CodReconciliationService {
  /**
   * Calculate COD financial totals and reconciliation metrics across all COD orders
   */
  public static async getMetrics(filters?: {
    startDate?: string
    endDate?: string
  }): Promise<CodMetrics> {
    let query = Order.query().where('payment_method', 'COD')

    if (filters?.startDate && filters?.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate])
    }

    const codOrders = await query

    let totalExpected = 0
    let totalPending = 0
    let totalCollected = 0
    let totalRemitted = 0
    let totalSettled = 0
    let totalFailed = 0
    let totalCancelled = 0

    let pendingCount = 0
    let collectedCount = 0
    let remittedCount = 0
    let settledCount = 0
    let failedCount = 0
    let cancelledCount = 0
    let disputedCount = 0

    for (const order of codOrders) {
      const expected = Number(order.codExpectedAmount ?? order.totalAmount) || 0
      const collected = Number(order.codCollectedAmount) || 0
      const remitted = Number(order.codRemittedAmount) || 0
      const settled = Number(order.codSettledAmount) || 0

      totalExpected += expected
      totalCollected += collected
      totalRemitted += remitted
      totalSettled += settled

      const st = order.codPaymentStatus || 'COD_PENDING'
      switch (st) {
        case 'COD_PENDING':
          totalPending += expected
          pendingCount++
          break
        case 'COD_COLLECTED':
          collectedCount++
          break
        case 'COD_REMITTED':
          remittedCount++
          break
        case 'COD_SETTLED':
          settledCount++
          break
        case 'COD_FAILED':
          totalFailed += expected
          failedCount++
          break
        case 'COD_CANCELLED':
          totalCancelled += expected
          cancelledCount++
          break
        case 'COD_DISPUTED':
          disputedCount++
          break
      }
    }

    // Awaiting remittance: what courier collected minus what courier remitted
    const awaitingRemittance = Math.max(0, totalCollected - totalRemitted)
    // Discrepancy: Expected minus (Settled + Pending + Cancelled/Failed)
    const discrepancy = Math.max(0, totalCollected - totalSettled)

    return {
      totalOrders: codOrders.length,
      totalCodOrders: codOrders.length,
      totalExpectedAmount: totalExpected,
      pendingAmount: totalPending,
      codPending: totalPending,
      collectedAmount: totalCollected,
      codCollected: totalCollected,
      awaitingRemittanceAmount: awaitingRemittance,
      remittedAmount: totalRemitted,
      settledAmount: totalSettled,
      codSettled: totalSettled,
      failedAmount: totalFailed,
      cancelledAmount: totalCancelled,
      discrepancyAmount: discrepancy,
      counts: {
        all: codOrders.length,
        pending: pendingCount,
        collected: collectedCount,
        remitted: remittedCount,
        settled: settledCount,
        failed: failedCount,
        cancelled: cancelledCount,
        disputed: disputedCount,
      },
    }
  }

  /**
   * Update COD status with audit history and reconciliation calculation
   */
  public static async updateStatus(input: UpdateCodStatusInput): Promise<Order> {
    const order = await Order.find(input.orderId)
    if (!order) {
      throw new Error(`Order #${input.orderId} not found`)
    }

    if (order.paymentMethod !== 'COD') {
      throw new Error('Cannot update COD status on an online payment order')
    }

    const previousStatus = order.codPaymentStatus || 'COD_PENDING'
    const expected = Number(order.codExpectedAmount ?? order.totalAmount) || 0
    order.codExpectedAmount = expected

    // Update amounts and references based on action
    if (input.collectedAmount !== undefined) {
      order.codCollectedAmount = Number(input.collectedAmount)
    } else if (input.status === 'COD_COLLECTED' && Number(order.codCollectedAmount) === 0) {
      order.codCollectedAmount = expected
    }

    if (input.remittedAmount !== undefined) {
      order.codRemittedAmount = Number(input.remittedAmount)
    } else if (input.status === 'COD_REMITTED' && Number(order.codRemittedAmount) === 0) {
      order.codRemittedAmount = Number(order.codCollectedAmount) || expected
    }

    if (input.settledAmount !== undefined) {
      order.codSettledAmount = Number(input.settledAmount)
    } else if (input.status === 'COD_SETTLED' && Number(order.codSettledAmount) === 0) {
      order.codSettledAmount = Number(order.codRemittedAmount) || Number(order.codCollectedAmount) || expected
    }

    if (input.remittanceRef) {
      order.codRemittanceRef = input.remittanceRef
    }

    if (input.remittedAt) {
      order.codRemittedAt = DateTime.fromISO(input.remittedAt)
    } else if (input.status === 'COD_REMITTED' && !order.codRemittedAt) {
      order.codRemittedAt = DateTime.now()
    }

    if (input.settledAt) {
      order.codSettledAt = DateTime.fromISO(input.settledAt)
    } else if (input.status === 'COD_SETTLED' && !order.codSettledAt) {
      order.codSettledAt = DateTime.now()
    }

    if (input.notes) {
      order.codReconciliationNotes = input.notes
    }

    order.codPaymentStatus = input.status

    // When money is verified received in bank, update overall order.paymentStatus to PAID
    if (input.status === 'COD_SETTLED') {
      order.paymentStatus = 'PAID'
    } else if (input.status === 'COD_FAILED') {
      order.paymentStatus = 'FAILED'
    }

    // Append to COD history audit trail
    const history = order.codHistory || []
    history.push({
      fromStatus: previousStatus,
      toStatus: input.status,
      timestamp: DateTime.now().toISO(),
      actorId: input.actor?.id || null,
      actorName: input.actor?.name || 'Administrator',
      remittanceRef: order.codRemittanceRef,
      collectedAmount: order.codCollectedAmount,
      remittedAmount: order.codRemittedAmount,
      settledAmount: order.codSettledAmount,
      notes: input.notes || null,
    })
    order.codHistory = history

    await order.save()

    // Log in administrative ActivityLog
    if (input.actor) {
      try {
        await ActivityLog.create({
          userId: input.actor.id,
          action: 'UPDATE_COD_STATUS',
          module: 'COD_PAYMENTS',
          description: `Updated Order #${order.orderNo} COD status from ${previousStatus} to ${input.status}`,
          metadata: {
            orderId: order.id,
            orderNo: order.orderNo,
            fromStatus: previousStatus,
            toStatus: input.status,
            collectedAmount: order.codCollectedAmount,
            remittedAmount: order.codRemittedAmount,
            settledAmount: order.codSettledAmount,
            remittanceRef: order.codRemittanceRef,
            notes: input.notes,
          },
        })
      } catch (logErr) {
        console.warn('[ActivityLog Error]', logErr)
      }
    }

    return order
  }

  /**
   * Helper alias for updateStatus
   */
  public static async updateCodStatus(input: {
    orderId: number
    status: CodStatus
    collectedAmount?: number
    remittedAmount?: number
    settledAmount?: number
    remittanceRef?: string
    remittedAt?: Date | string
    settledAt?: Date | string
    updatedBy?: string
    notes?: string
  }): Promise<Order> {
    return this.updateStatus({
      orderId: input.orderId,
      status: input.status,
      collectedAmount: input.collectedAmount,
      remittedAmount: input.remittedAmount,
      settledAmount: input.settledAmount,
      remittanceRef: input.remittanceRef,
      remittedAt: input.remittedAt instanceof Date ? input.remittedAt.toISOString() : input.remittedAt,
      settledAt: input.settledAt instanceof Date ? input.settledAt.toISOString() : input.settledAt,
      notes: input.notes,
    })
  }

  /**
   * Calculate reconciliation amounts and discrepancy flag for a COD order
   */
  public static calculateReconciliation(order: Order) {
    const expected = Number(order.codExpectedAmount ?? order.totalAmount) || 0
    const collected = Number(order.codCollectedAmount) || 0
    const remitted = Number(order.codRemittedAmount) || 0
    const settled = Number(order.codSettledAmount) || 0
    const outstanding = Math.max(0, expected - settled)
    const hasDiscrepancy = Math.abs(expected - settled) > 0.01

    return {
      expectedAmount: expected,
      collectedAmount: collected,
      remittedAmount: remitted,
      settledAmount: settled,
      outstandingAmount: outstanding,
      hasDiscrepancy,
    }
  }
}

export default CodReconciliationService
