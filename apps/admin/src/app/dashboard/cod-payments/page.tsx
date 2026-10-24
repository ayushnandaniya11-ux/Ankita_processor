'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Banknote,
  Search,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileText,
  DollarSign,
  ArrowRight,
  Info,
  SlidersHorizontal,
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
import { toast } from 'sonner'

interface CodOrder {
  id: number
  orderNo: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  status: string
  awbNumber: string | null
  codPaymentStatus:
    | 'COD_PENDING'
    | 'COD_COLLECTED'
    | 'COD_REMITTED'
    | 'COD_SETTLED'
    | 'COD_FAILED'
    | 'COD_CANCELLED'
    | 'COD_DISPUTED'
  codExpectedAmount: number | null
  codCollectedAmount: number
  codRemittedAmount: number
  codSettledAmount: number
  codRemittanceRef: string | null
  codRemittedAt: string | null
  codSettledAt: string | null
  codReconciliationNotes: string | null
  codHistory: any[]
  createdAt: string
  expectedCodAmount: number
  actualCollectedAmount: number
  remittedAmount: number
  settledAmount: number
  discrepancyAmount: number
  user?: {
    name: string
    email: string
    phone?: string
  }
  latestShipment?: {
    awbNumber: string
    status: string
    carrier: string
  }
}

interface CodMetrics {
  totalOrders: number
  totalExpectedAmount: number
  pendingAmount: number
  collectedAmount: number
  awaitingRemittanceAmount: number
  remittedAmount: number
  settledAmount: number
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

export default function CodPaymentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<CodOrder | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Reconciliation form state
  const [formStatus, setFormStatus] = useState<string>('COD_COLLECTED')
  const [formCollectedAmount, setFormCollectedAmount] = useState<string>('')
  const [formRemittedAmount, setFormRemittedAmount] = useState<string>('')
  const [formSettledAmount, setFormSettledAmount] = useState<string>('')
  const [formRemittanceRef, setFormRemittanceRef] = useState<string>('')
  const [formSettledDate, setFormSettledDate] = useState<string>('')
  const [formNotes, setFormNotes] = useState<string>('')

  const queryParams = new URLSearchParams()
  if (statusFilter !== 'ALL') queryParams.append('status', statusFilter)
  if (search.trim()) queryParams.append('search', search.trim())

  const fetcher = (url: string) => api.get(url).then((res) => res.data)
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/admin/cod-payments?${queryParams.toString()}`,
    fetcher,
    { refreshInterval: 15000 }
  )

  const orders: CodOrder[] = data?.orders || []
  const metrics: CodMetrics = data?.metrics || {
    totalOrders: 0,
    totalExpectedAmount: 0,
    pendingAmount: 0,
    collectedAmount: 0,
    awaitingRemittanceAmount: 0,
    remittedAmount: 0,
    settledAmount: 0,
    failedAmount: 0,
    cancelledAmount: 0,
    discrepancyAmount: 0,
    counts: { all: 0, pending: 0, collected: 0, remitted: 0, settled: 0, failed: 0, cancelled: 0, disputed: 0 },
  }

  const openReconcileModal = (order: CodOrder) => {
    setSelectedOrder(order)
    setFormStatus(order.codPaymentStatus || 'COD_COLLECTED')
    const exp = Number(order.codExpectedAmount ?? order.totalAmount)
    setFormCollectedAmount(String(order.codCollectedAmount || exp))
    setFormRemittedAmount(String(order.codRemittedAmount || order.codCollectedAmount || exp))
    setFormSettledAmount(String(order.codSettledAmount || order.codRemittedAmount || exp))
    setFormRemittanceRef(order.codRemittanceRef || '')
    setFormSettledDate(order.codSettledAt ? order.codSettledAt.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setFormNotes(order.codReconciliationNotes || '')
  }

  const handleUpdateSubmit = async () => {
    if (!selectedOrder) return
    setIsUpdating(true)
    try {
      await api.post(`/api/v1/admin/cod-payments/${selectedOrder.id}/status`, {
        status: formStatus,
        collectedAmount: formCollectedAmount ? Number(formCollectedAmount) : undefined,
        remittedAmount: formRemittedAmount ? Number(formRemittedAmount) : undefined,
        settledAmount: formSettledAmount ? Number(formSettledAmount) : undefined,
        remittanceRef: formRemittanceRef.trim() || undefined,
        settledAt: formSettledDate || undefined,
        notes: formNotes.trim() || undefined,
      })
      toast.success(`Order #${selectedOrder.orderNo} COD status updated successfully`)
      setSelectedOrder(null)
      mutate()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update COD status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getCodStatusBadge = (status: string) => {
    switch (status) {
      case 'COD_PENDING':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" /> COD Pending
          </Badge>
        )
      case 'COD_COLLECTED':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1">
            <Truck className="w-3 h-3" /> Cash Collected
          </Badge>
        )
      case 'COD_REMITTED':
        return (
          <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 gap-1">
            <ArrowRight className="w-3 h-3" /> Remitted by Courier
          </Badge>
        )
      case 'COD_SETTLED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" /> In Bank (Settled)
          </Badge>
        )
      case 'COD_FAILED':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1">
            <XCircle className="w-3 h-3" /> Collection Failed
          </Badge>
        )
      case 'COD_CANCELLED':
        return (
          <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30 gap-1">
            Cancelled
          </Badge>
        )
      case 'COD_DISPUTED':
        return (
          <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 gap-1">
            <AlertTriangle className="w-3 h-3" /> Disputed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Banknote className="w-7 h-7 text-[#00313B]" />
            Cash on Delivery (COD) Reconciliation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track Delhivery cash collections, courier remittance cycles, and bank reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-1.5">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Link href="/dashboard/shipping">
            <Button size="sm" variant="outline" className="gap-1.5 text-[#00313B]">
              <Truck className="w-4 h-4" /> Delhivery Shipping
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Total COD Orders</p>
          <p className="text-base font-bold text-foreground mt-1">{metrics.totalOrders}</p>
          <p className="text-[10px] text-muted-foreground">{formatCurrency(metrics.totalExpectedAmount)}</p>
        </Card>

        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Collection Pending</p>
          <p className="text-base font-bold text-amber-600 mt-1">{formatCurrency(metrics.pendingAmount)}</p>
          <p className="text-[10px] text-muted-foreground">{metrics.counts.pending} orders</p>
        </Card>

        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Cash Collected</p>
          <p className="text-base font-bold text-blue-600 mt-1">{formatCurrency(metrics.collectedAmount)}</p>
          <p className="text-[10px] text-muted-foreground">{metrics.counts.collected} by Delhivery</p>
        </Card>

        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Awaiting Remit</p>
          <p className="text-base font-bold text-orange-600 mt-1">{formatCurrency(metrics.awaitingRemittanceAmount)}</p>
          <p className="text-[10px] text-muted-foreground">Held by courier</p>
        </Card>

        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Remitted by Courier</p>
          <p className="text-base font-bold text-purple-600 mt-1">{formatCurrency(metrics.remittedAmount)}</p>
          <p className="text-[10px] text-muted-foreground">{metrics.counts.remitted} in transit</p>
        </Card>

        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Received in Bank</p>
          <p className="text-base font-bold text-emerald-600 mt-1">{formatCurrency(metrics.settledAmount)}</p>
          <p className="text-[10px] text-muted-foreground">{metrics.counts.settled} reconciled</p>
        </Card>

        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Failed / Refused</p>
          <p className="text-base font-bold text-rose-600 mt-1">{formatCurrency(metrics.failedAmount)}</p>
          <p className="text-[10px] text-muted-foreground">{metrics.counts.failed} failed</p>
        </Card>

        <Card className="p-3 border-slate-200">
          <p className="text-[11px] text-muted-foreground font-medium truncate">Discrepancy</p>
          <p className="text-base font-bold text-red-600 mt-1">{formatCurrency(metrics.discrepancyAmount)}</p>
          <p className="text-[10px] text-muted-foreground">Variance</p>
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
              placeholder="Search Order No, AWB, UTR Ref, Customer..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'ALL', label: 'All COD' },
              { id: 'COD_PENDING', label: 'Pending' },
              { id: 'COD_COLLECTED', label: 'Collected' },
              { id: 'COD_REMITTED', label: 'Remitted' },
              { id: 'COD_SETTLED', label: 'Settled' },
              { id: 'COD_FAILED', label: 'Failed' },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={statusFilter === f.id ? 'default' : 'outline'}
                onClick={() => setStatusFilter(f.id)}
                className={`h-8 text-xs ${
                  statusFilter === f.id ? 'bg-[#00313B] text-white' : ''
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* COD Orders Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Carrier &amp; AWB</th>
                <th className="py-3 px-3">COD Status</th>
                <th className="py-3 px-3 text-right">Expected (₹)</th>
                <th className="py-3 px-3 text-right">Collected (₹)</th>
                <th className="py-3 px-3 text-right">Remitted (₹)</th>
                <th className="py-3 px-3 text-right">In Bank (₹)</th>
                <th className="py-3 px-3">Remittance Ref</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00313B]" />
                    Loading COD transactions...
                  </td>
                </tr>
              )}

              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    No Cash on Delivery orders found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                orders.map((o) => {
                  const awb = o.awbNumber || o.latestShipment?.awbNumber
                  const shipmentStatus = o.latestShipment?.status || o.status
                  const hasDiscrepancy = o.discrepancyAmount > 0 && o.codPaymentStatus === 'COD_SETTLED'

                  return (
                    <tr
                      key={o.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        #{o.orderNo}
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{o.user?.name || 'Customer'}</p>
                        <p className="text-[11px] text-muted-foreground">{o.user?.phone || '-'}</p>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        {awb ? (
                          <div>
                            <span className="font-mono text-[11px] font-bold text-[#00313B]">
                              {awb}
                            </span>
                            <Badge variant="outline" className="ml-1.5 text-[9px]">
                              {shipmentStatus}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Waybill Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-3">{getCodStatusBadge(o.codPaymentStatus)}</td>

                      <td className="py-3 px-3 text-right font-medium text-slate-900">
                        {formatCurrency(o.expectedCodAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-blue-700">
                        {o.actualCollectedAmount > 0 ? formatCurrency(o.actualCollectedAmount) : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-purple-700">
                        {o.remittedAmount > 0 ? formatCurrency(o.remittedAmount) : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {o.settledAmount > 0 ? formatCurrency(o.settledAmount) : '-'}
                      </td>

                      <td className="py-3 px-3">
                        {o.codRemittanceRef ? (
                          <span className="font-mono text-[11px] font-semibold text-slate-800">
                            {o.codRemittanceRef}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                        {o.codSettledAt && (
                          <p className="text-[10px] text-slate-500">
                            {new Date(o.codSettledAt).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReconcileModal(o)}
                          className="h-7 text-xs border-[#00313B]/30 hover:bg-[#00313B]/5 text-[#00313B]"
                        >
                          Reconcile
                        </Button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Reconciliation Modal */}
      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#00313B]" />
              COD Reconciliation - Order #{selectedOrder?.orderNo}
            </DialogTitle>
            <DialogDescription>
              Record verified courier collection, remittance UTR, and bank receipt confirmation.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Customer:</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Expected COD Total:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(selectedOrder.expectedCodAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Delhivery / Carrier AWB:</span>
                  <span className="font-mono font-semibold text-[#00313B]">
                    {selectedOrder.awbNumber || 'Not Generated'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current COD Status:</span>
                  <div className="mt-0.5">{getCodStatusBadge(selectedOrder.codPaymentStatus)}</div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800">Update COD Payment Status:</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="COD_PENDING">COD Pending (Not Yet Collected)</option>
                  <option value="COD_COLLECTED">COD Collected (Confirmed by Courier Agent)</option>
                  <option value="COD_REMITTED">COD Remitted (Delhivery Remittance Issued)</option>
                  <option value="COD_SETTLED">COD Settled (Funds Received in Bank Account)</option>
                  <option value="COD_FAILED">COD Failed (Customer Refused / Delivery Failed)</option>
                  <option value="COD_DISPUTED">COD Disputed (Investigation Needed)</option>
                </select>
              </div>

              {/* Financial Inputs Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Collected (₹):</label>
                  <Input
                    type="number"
                    value={formCollectedAmount}
                    onChange={(e) => setFormCollectedAmount(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Amount"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Remitted (₹):</label>
                  <Input
                    type="number"
                    value={formRemittedAmount}
                    onChange={(e) => setFormRemittedAmount(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Amount"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">In Bank (₹):</label>
                  <Input
                    type="number"
                    value={formSettledAmount}
                    onChange={(e) => setFormSettledAmount(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Amount"
                  />
                </div>
              </div>

              {/* Remittance Reference and Date */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Courier Remittance UTR / Ref:</label>
                  <Input
                    value={formRemittanceRef}
                    onChange={(e) => setFormRemittanceRef(e.target.value)}
                    placeholder="e.g. UTR24098292831"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Bank Settlement Date:</label>
                  <Input
                    type="date"
                    value={formSettledDate}
                    onChange={(e) => setFormSettledDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Reconciliation Notes:</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Supporting bank statement reference, courier report details, or reason for discrepancy..."
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating}
                  className="bg-[#00313B] hover:bg-[#00252D] text-white text-xs gap-1.5"
                >
                  {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Confirm Reconciliation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
