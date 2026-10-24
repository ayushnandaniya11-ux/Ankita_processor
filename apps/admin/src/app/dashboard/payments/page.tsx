'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  CreditCard,
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Building2,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  Info,
} from 'lucide-react'
import {
  Button,
  Input,
  Badge,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@ankita/ui'
import { api } from '@/lib/api'
import { formatCurrency } from '@ankita/utils'

interface PaymentItem {
  id: number
  orderId: number
  userId: number | null
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  amount: number
  currency: string
  paymentMethod: string
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  refundStatus: 'FULL' | 'PARTIAL' | null
  amountRefunded: number
  settlementStatus: 'PENDING' | 'SETTLED'
  settlementId: string | null
  settlementAmount: number | null
  settledAt: string | null
  capturedAt: string | null
  cardNetwork: string | null
  cardType: string | null
  cardLast4: string | null
  bank: string | null
  wallet: string | null
  vpa: string | null
  errorCode: string | null
  errorDescription: string | null
  errorReason: string | null
  verificationSource: string
  createdAt: string
  razorpayDashboardUrl: string | null
  orderDashboardUrl: string | null
  order?: {
    id: number
    orderNo: string
    totalAmount: number
    paymentStatus: string
    status: string
    user?: {
      name: string
      email: string
    }
  }
}

interface PaymentMetrics {
  totalGrossCaptured: number
  totalRefunded: number
  netCaptured: number
  totalPendingAmount: number
  totalFailedAmount: number
  totalSettledAmount: number
  totalSettlementPendingAmount: number
  counts: {
    all: number
    captured: number
    pending: number
    failed: number
    refunded: number
    settled: number
    settlementPending: number
  }
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [settlementFilter, setSettlementFilter] = useState('ALL')
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)
  const [isSyncing, setIsSyncing] = useState<number | null>(null)

  const queryParams = new URLSearchParams()
  if (statusFilter !== 'ALL') queryParams.append('status', statusFilter)
  if (settlementFilter !== 'ALL') queryParams.append('settlementStatus', settlementFilter)
  if (search.trim()) queryParams.append('search', search.trim())

  const fetcher = (url: string) => api.get(url).then((res) => res.data)
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/admin/payments?${queryParams.toString()}`,
    fetcher,
    { refreshInterval: 15000 }
  )

  const payments: PaymentItem[] = data?.payments || []
  const metrics: PaymentMetrics = data?.metrics || {
    totalGrossCaptured: 0,
    totalRefunded: 0,
    netCaptured: 0,
    totalPendingAmount: 0,
    totalFailedAmount: 0,
    totalSettledAmount: 0,
    totalSettlementPendingAmount: 0,
    counts: { all: 0, captured: 0, pending: 0, failed: 0, refunded: 0, settled: 0, settlementPending: 0 },
  }

  const handleSync = async (paymentId: number) => {
    setIsSyncing(paymentId)
    try {
      await api.post(`/api/v1/admin/payments/${paymentId}/sync`, {})
      mutate()
    } catch (err) {
      console.error('Failed to sync payment status:', err)
    } finally {
      setIsSyncing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CAPTURED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Captured
          </Badge>
        )
      case 'AUTHORIZED':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1">
            <Clock className="w-3 h-3" /> Authorized
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1">
            <XCircle className="w-3 h-3" /> Failed
          </Badge>
        )
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return (
          <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 gap-1">
            <RotateCcw className="w-3 h-3" /> {status === 'PARTIALLY_REFUNDED' ? 'Partial Refund' : 'Refunded'}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getMethodDisplay = (p: PaymentItem) => {
    if (p.paymentMethod === 'card') {
      return (
        <span className="font-mono text-xs">
          Card ({p.cardNetwork || 'Debit/Credit'} {p.cardLast4 ? `••${p.cardLast4}` : ''})
        </span>
      )
    }
    if (p.paymentMethod === 'upi') {
      return <span className="font-mono text-xs">UPI {p.vpa ? `(${p.vpa})` : ''}</span>
    }
    if (p.paymentMethod === 'netbanking') {
      return <span className="font-mono text-xs">NetBanking {p.bank ? `(${p.bank})` : ''}</span>
    }
    if (p.paymentMethod === 'wallet') {
      return <span className="font-mono text-xs">Wallet {p.wallet ? `(${p.wallet})` : ''}</span>
    }
    if (p.paymentMethod === 'cod') {
      return <span className="text-xs font-semibold text-amber-600">Cash on Delivery</span>
    }
    return <span className="text-xs text-muted-foreground">{p.paymentMethod || 'Online'}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-[#00313B]" />
            Payment Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live Razorpay gateway transaction tracking, signature verification, refunds, and settlement reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-1.5">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <a
            href="https://dashboard.razorpay.com/app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="bg-[#00313B] hover:bg-[#00252D] text-white gap-1.5">
              <ExternalLink className="w-4 h-4" /> Razorpay Dashboard
            </Button>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-muted-foreground font-medium">Gross Captured</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(metrics.totalGrossCaptured)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{metrics.counts.captured} transactions</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <p className="text-xs text-muted-foreground font-medium">Net Revenue</p>
          <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(metrics.netCaptured)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Post-refunds</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <p className="text-xs text-muted-foreground font-medium">Pending / Auth</p>
          <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(metrics.totalPendingAmount)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{metrics.counts.pending} pending</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <p className="text-xs text-muted-foreground font-medium">Failed Attempts</p>
          <p className="text-lg font-bold text-rose-600 mt-1">{formatCurrency(metrics.totalFailedAmount)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{metrics.counts.failed} failed</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <p className="text-xs text-muted-foreground font-medium">Refunded</p>
          <p className="text-lg font-bold text-purple-600 mt-1">{formatCurrency(metrics.totalRefunded)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{metrics.counts.refunded} refunds</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <p className="text-xs text-muted-foreground font-medium">Settled to Bank</p>
          <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(metrics.totalSettledAmount)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{metrics.counts.settled} settled</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order No, Payment ID, Customer..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Status:
            </span>
            {['ALL', 'CAPTURED', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'default' : 'outline'}
                onClick={() => setStatusFilter(st)}
                className={`h-8 text-xs ${
                  statusFilter === st ? 'bg-[#00313B] text-white' : ''
                }`}
              >
                {st === 'ALL' ? 'All Payments' : st}
              </Button>
            ))}

            <select
              value={settlementFilter}
              onChange={(e) => setSettlementFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All Settlements</option>
              <option value="SETTLED">Settled Only</option>
              <option value="PENDING">Settlement Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Gateway IDs</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Settlement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00313B]" />
                    Loading payment records...
                  </td>
                </tr>
              )}

              {!isLoading && payments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    No payments found matching your criteria.
                  </td>
                </tr>
              )}

              {!isLoading &&
                payments.map((p) => {
                  const customerName = p.order?.user?.name || 'Customer'
                  const customerEmail = p.order?.user?.email || '-'
                  const dateStr = p.capturedAt || p.createdAt

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium">
                        <Link
                          href={`/dashboard/orders`}
                          className="text-[#00313B] hover:underline flex items-center gap-1"
                        >
                          #{p.order?.orderNo || p.orderId}
                        </Link>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{customerName}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                          {customerEmail}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {dateStr ? new Date(dateStr).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '-'}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3 px-4">{getMethodDisplay(p)}</td>

                      <td className="py-3 px-4 space-y-0.5">
                        {p.razorpayPaymentId ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] text-slate-700 font-semibold">
                              {p.razorpayPaymentId}
                            </span>
                            {p.razorpayDashboardUrl && (
                              <a
                                href={p.razorpayDashboardUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open in Razorpay Dashboard"
                                className="text-slate-400 hover:text-[#00313B]"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">N/A</span>
                        )}
                        {p.razorpayOrderId && (
                          <p className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            {p.razorpayOrderId}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>

                      <td className="py-3 px-4">
                        {p.settlementStatus === 'SETTLED' ? (
                          <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 gap-1 text-[10px]">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Settled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPayment(p)}
                          className="h-7 text-xs px-2 text-[#00313B]"
                        >
                          View Details
                        </Button>
                        {p.razorpayPaymentId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(p.id)}
                            disabled={isSyncing === p.id}
                            className="h-7 text-xs px-2"
                            title="Sync live status from Razorpay"
                          >
                            <RefreshCw
                              className={`w-3 h-3 ${isSyncing === p.id ? 'animate-spin' : ''}`}
                            />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={Boolean(selectedPayment)} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#00313B]" />
              Payment Details #{selectedPayment?.id}
            </DialogTitle>
            <DialogDescription>
              Verified gateway transaction record for Order #{selectedPayment?.order?.orderNo || selectedPayment?.orderId}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Payment Status:</span>
                  <div className="mt-0.5">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Amount:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(selectedPayment.amount)} ({selectedPayment.currency})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Razorpay Payment ID:</span>
                  <span className="font-mono font-bold text-slate-800 break-all">
                    {selectedPayment.razorpayPaymentId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Razorpay Order ID:</span>
                  <span className="font-mono text-slate-800 break-all">
                    {selectedPayment.razorpayOrderId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Method:</span>
                  <span className="font-medium text-slate-900">{getMethodDisplay(selectedPayment)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Verification Source:</span>
                  <Badge variant="outline">{selectedPayment.verificationSource}</Badge>
                </div>
              </div>

              {/* Settlement & Refund Section */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Bank Settlement:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedPayment.settlementStatus === 'SETTLED' ? 'Confirmed Settled to Bank' : 'Pending Settlement'}
                  </span>
                  {selectedPayment.settledAt && (
                    <p className="text-[11px] text-slate-500">
                      Settled on: {new Date(selectedPayment.settledAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">Refund Status:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedPayment.refundStatus ? `${selectedPayment.refundStatus} (₹${selectedPayment.amountRefunded})` : 'No Refunds Issued'}
                  </span>
                </div>
              </div>

              {/* Error Details if Failed */}
              {selectedPayment.errorCode && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Gateway Error: {selectedPayment.errorCode}
                  </div>
                  <p>{selectedPayment.errorDescription || 'Transaction was rejected by bank or payment gateway.'}</p>
                  {selectedPayment.errorReason && (
                    <p className="text-[11px] mt-1 text-rose-600 font-mono">Reason: {selectedPayment.errorReason}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                {selectedPayment.razorpayDashboardUrl ? (
                  <a
                    href={selectedPayment.razorpayDashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-[#00313B]">
                      <ExternalLink className="w-3.5 h-3.5" /> View on Razorpay Dashboard
                    </Button>
                  </a>
                ) : (
                  <div />
                )}
                <Button
                  size="sm"
                  onClick={() => setSelectedPayment(null)}
                  className="bg-[#00313B] text-white text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
