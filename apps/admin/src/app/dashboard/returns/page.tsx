'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Eye,
  Camera,
  Video,
  Truck,
  FileText,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight,
  Info,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@ankita/ui'
import { api } from '@/lib/api'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'
import { toast } from 'sonner'

interface ReturnRequestItem {
  id: number
  returnNo: string
  orderId: number
  orderItemId: number
  userId: number
  productId: number
  reason: string
  customerNotes: string | null
  language: 'en' | 'hi' | 'gu'
  customerPhotos: Array<{
    id: string
    url: string
    filename?: string
    size?: number
    mimeType?: string
    clarityScore?: number
  }>
  customerVideoUrl: string | null
  extractedFrames: Array<{
    id: string
    url: string
    timeOffsetSeconds: number
  }>
  referenceImages: Array<{
    source: 'CATALOGUE' | 'ORDER_SNAPSHOT'
    url: string
    label?: string
  }>
  verificationStatus: 'PENDING' | 'MATCH_CONFIRMED' | 'POSSIBLE_MISMATCH' | 'INSUFFICIENT_EVIDENCE' | 'MANUAL_REVIEW_REQUIRED'
  confidenceScore: number
  verificationBreakdown: {
    colorSimilarity: number
    patternSimilarity: number
    borderSimilarity: number
    clarityScore: number
    isDifferentProduct: boolean
    analysisSummary: string
    discrepancyReasons: string[]
    aiModel?: string
  }
  status: 'REQUESTED' | 'AUTO_APPROVED' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'PENDING_EVIDENCE' | 'PICKUP_SCHEDULED' | 'RECEIVED' | 'REFUNDED' | 'CANCELLED'
  adminNotes: string | null
  rejectionReason: string | null
  pickupTrackingNumber: string | null
  pickupStatus: string
  auditTrail: Array<{
    status: string
    timestamp: string
    actorId?: number
    actorName: string
    notes?: string
  }>
  createdAt: string
  updatedAt: string
  order?: {
    id: number
    orderNo: string
    totalAmount: number
    status: string
    shippingAddress: string
  }
  orderItem?: {
    id: number
    productName: string
    rate: number
    quantity: number
    total: number
    productImage: string | null
  }
  user?: {
    id: number
    name: string
    email: string
    phone?: string
  }
  product?: {
    id: number
    name: string
    imageUrl: string | null
    attributes?: Record<string, any>
  }
}

interface ReturnMetrics {
  total: number
  autoApproved: number
  underReview: number
  approved: number
  rejected: number
  pendingEvidence: number
  matchConfirmed: number
  possibleMismatch: number
}

export default function AdminReturnsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [verificationFilter, setVerificationFilter] = useState('ALL')
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestItem | null>(null)
  const [activeCustomerPhotoIdx, setActiveCustomerPhotoIdx] = useState(0)
  const [activeRefPhotoIdx, setActiveRefPhotoIdx] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)

  // Review Form
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'SCHEDULE_PICKUP'>('APPROVE')
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const queryParams = new URLSearchParams()
  if (statusFilter !== 'ALL') queryParams.append('status', statusFilter)
  if (verificationFilter !== 'ALL') queryParams.append('verificationStatus', verificationFilter)
  if (search.trim()) queryParams.append('search', search.trim())

  const fetcher = (url: string) => api.get(url).then((res) => res.data)
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/admin/returns?${queryParams.toString()}`,
    fetcher,
    { refreshInterval: 15000 }
  )

  const returns: ReturnRequestItem[] = data?.returns || []
  const metrics: ReturnMetrics = data?.metrics || {
    total: 0,
    autoApproved: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    pendingEvidence: 0,
    matchConfirmed: 0,
    possibleMismatch: 0,
  }

  const openInspectionModal = (item: ReturnRequestItem) => {
    setSelectedReturn(item)
    setActiveCustomerPhotoIdx(0)
    setActiveRefPhotoIdx(0)
    setReviewAction('APPROVE')
    setReviewNotes('')
    setRejectionReason('')
  }

  const handleReviewSubmit = async () => {
    if (!selectedReturn) return

    if (reviewAction === 'REJECT' && !rejectionReason.trim()) {
      toast.error('Rejection reason is mandatory when rejecting a return request.')
      return
    }

    try {
      setIsReviewing(true)
      await api.post(`/api/v1/admin/returns/${selectedReturn.id}/review`, {
        action: reviewAction,
        notes: reviewNotes.trim() || undefined,
        rejectionReason: reviewAction === 'REJECT' ? rejectionReason.trim() : undefined,
      })

      toast.success(`Return request #${selectedReturn.returnNo} updated successfully!`)
      setSelectedReturn(null)
      mutate()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update return review.')
    } finally {
      setIsReviewing(false)
    }
  }

  const getVerificationBadge = (ret: ReturnRequestItem) => {
    switch (ret.verificationStatus) {
      case 'MATCH_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Match Confirmed ({ret.confidenceScore}%)
          </span>
        )
      case 'POSSIBLE_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Possible Mismatch ({ret.confidenceScore}%)
          </span>
        )
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
            <Camera className="w-3 h-3 text-amber-600" /> Low Clarity ({ret.confidenceScore}%)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
            <Clock className="w-3 h-3 text-blue-600" /> Review Required ({ret.confidenceScore}%)
          </span>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AUTO_APPROVED':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
            <Sparkles className="w-3 h-3" /> Auto-Approved
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        )
      case 'UNDER_REVIEW':
        return (
          <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 gap-1">
            <Clock className="w-3 h-3" /> Under Review
          </Badge>
        )
      case 'PENDING_EVIDENCE':
        return (
          <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 gap-1">
            <Camera className="w-3 h-3" /> Evidence Needed
          </Badge>
        )
      case 'PICKUP_SCHEDULED':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
            <Truck className="w-3 h-3" /> Pickup Scheduled
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getLangBadge = (lang: string) => {
    switch (lang) {
      case 'gu':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">ગુજરાતી</span>
      case 'hi':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">हिन्दी</span>
      default:
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">English</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Returns & Product Verification</h1>
            <Badge variant="secondary" className="gap-1 font-mono text-xs">
              <Sparkles className="w-3 h-3 text-primary" /> AI Vision Inspection
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Automated textile photo & video matching against catalogue references with multilingual support (Gujarati, Hindi, English).
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 space-y-1 bg-card">
          <p className="text-xs text-muted-foreground font-medium">Total Returns</p>
          <p className="text-2xl font-bold">{metrics.total}</p>
          <span className="text-[11px] text-muted-foreground">All customer requests</span>
        </Card>

        <Card className="p-3.5 space-y-1 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Auto-Approved
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.autoApproved}</p>
          <span className="text-[11px] text-muted-foreground">Verified by AI Vision</span>
        </Card>

        <Card className="p-3.5 space-y-1 bg-amber-500/5 border-amber-500/20">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Under Review
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{metrics.underReview}</p>
          <span className="text-[11px] text-muted-foreground">Awaiting inspection</span>
        </Card>

        <Card className="p-3.5 space-y-1 bg-rose-500/5 border-rose-500/20">
          <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Possible Mismatch
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{metrics.possibleMismatch}</p>
          <span className="text-[11px] text-muted-foreground">Suspicious product flag</span>
        </Card>

        <Card className="p-3.5 space-y-1 bg-orange-500/5 border-orange-500/20">
          <p className="text-xs text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1">
            <Camera className="w-3 h-3" /> Low Clarity
          </p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.pendingEvidence}</p>
          <span className="text-[11px] text-muted-foreground">Blurry / dark photos</span>
        </Card>

        <Card className="p-3.5 space-y-1 bg-blue-500/5 border-blue-500/20">
          <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Total Approved
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.approved + metrics.autoApproved}</p>
          <span className="text-[11px] text-muted-foreground">Reverse pickups active</span>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Return #, Order #, customer name, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border text-xs gap-1">
            {['ALL', 'AUTO_APPROVED', 'UNDER_REVIEW', 'PENDING_EVIDENCE', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  statusFilter === st ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Verification Status Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-lg border bg-background text-foreground focus:outline-none"
          >
            <option value="ALL">All Verification AI Outcomes</option>
            <option value="MATCH_CONFIRMED">Match Confirmed (AI &gt; 75%)</option>
            <option value="POSSIBLE_MISMATCH">Possible Mismatch (Flagged)</option>
            <option value="INSUFFICIENT_EVIDENCE">Low Clarity / Blurry</option>
            <option value="MANUAL_REVIEW_REQUIRED">Manual Review Required</option>
          </select>
        </div>
      </div>

      {/* Main Returns Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs">Return ID & Date</TableHead>
              <TableHead className="text-xs">Order & Customer</TableHead>
              <TableHead className="text-xs">Returned Saree Item</TableHead>
              <TableHead className="text-xs">Return Reason</TableHead>
              <TableHead className="text-xs">AI Verification Result</TableHead>
              <TableHead className="text-xs">Return Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading return requests and AI verification outcomes...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && returns.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm text-foreground">No return requests found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {search || statusFilter !== 'ALL' || verificationFilter !== 'ALL'
                      ? 'No requests match the selected search and filters.'
                      : 'Customer return requests will appear here with automatic computer vision matching.'}
                  </p>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              returns.map((ret) => {
                const itemImg = resolveImageUrl(
                  ret.orderItem?.productImage || ret.product?.imageUrl || ret.referenceImages?.[0]?.url
                )
                const customerPhoto = ret.customerPhotos?.[0]?.url ? resolveImageUrl(ret.customerPhotos[0].url) : null

                return (
                  <TableRow key={ret.id} className="hover:bg-muted/10 transition-colors">
                    {/* Return ID & Date */}
                    <TableCell className="align-middle">
                      <div className="font-mono font-bold text-xs text-foreground flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-primary" />
                        {ret.returnNo}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(ret.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </TableCell>

                    {/* Order & Customer */}
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-xs text-foreground">#{ret.order?.orderNo || `ORD-${ret.orderId}`}</span>
                        {getLangBadge(ret.language)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{ret.user?.name || 'Customer'}</p>
                    </TableCell>

                    {/* Product */}
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-12 shrink-0 rounded border bg-muted overflow-hidden flex items-center justify-center">
                          {itemImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={itemImg} alt="Saree" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">🛍️</span>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[180px]">
                          <p className="font-semibold text-xs text-foreground truncate">{ret.orderItem?.productName || ret.product?.name || 'Saree'}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {ret.orderItem?.quantity || 1} · {formatCurrency(ret.orderItem?.total || 0)}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Return Reason */}
                    <TableCell className="align-middle text-xs">
                      <span className="font-medium text-foreground block">{ret.reason.replace(/_/g, ' ')}</span>
                      {ret.customerNotes && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-[160px] italic">
                          &quot;{ret.customerNotes}&quot;
                        </p>
                      )}
                    </TableCell>

                    {/* AI Verification */}
                    <TableCell className="align-middle">
                      <div className="space-y-1">
                        {getVerificationBadge(ret)}
                        {ret.customerPhotos && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Camera className="w-3 h-3 text-muted-foreground" />
                            <span>{ret.customerPhotos.length} photos</span>
                            {ret.customerVideoUrl && (
                              <span className="flex items-center gap-0.5 text-primary font-medium">
                                · <Video className="w-3 h-3" /> video
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-middle">
                      {getStatusBadge(ret.status)}
                      {ret.pickupTrackingNumber && (
                        <p className="text-[10px] font-mono text-muted-foreground mt-1">
                          AWB: {ret.pickupTrackingNumber}
                        </p>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-middle text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openInspectionModal(ret)}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {/* Side-by-Side Visual Comparison & Decision Modal */}
      {selectedReturn && (
        <Dialog open={Boolean(selectedReturn)} onOpenChange={(open) => !open && setSelectedReturn(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <DialogHeader className="pb-3 border-b">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-primary" /> Return Inspection #{selectedReturn.returnNo}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Order #{selectedReturn.order?.orderNo} · Customer: {selectedReturn.user?.name} ({selectedReturn.user?.email}) · Preferred Language: {getLangBadge(selectedReturn.language)}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getVerificationBadge(selectedReturn)}
                  {getStatusBadge(selectedReturn.status)}
                </div>
              </div>
            </DialogHeader>

            {/* Side-by-Side Photo Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Customer Uploaded Photos & Video */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-primary" /> Customer Uploaded Media ({selectedReturn.customerPhotos?.length || 0})
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    Clarity: {selectedReturn.verificationBreakdown?.clarityScore || 85}%
                  </Badge>
                </div>

                {/* Main Preview */}
                <div className="w-full h-64 rounded-lg border bg-black/5 dark:bg-black/40 overflow-hidden relative flex items-center justify-center">
                  {selectedReturn.customerPhotos?.[activeCustomerPhotoIdx]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(selectedReturn.customerPhotos[activeCustomerPhotoIdx].url)}
                      alt="Customer Return Photo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-xs text-muted-foreground">No photos uploaded</div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {selectedReturn.customerPhotos && selectedReturn.customerPhotos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedReturn.customerPhotos.map((photo, idx) => (
                      <button
                        key={photo.id || idx}
                        onClick={() => setActiveCustomerPhotoIdx(idx)}
                        className={`w-14 h-14 rounded-md border overflow-hidden shrink-0 transition-all ${
                          activeCustomerPhotoIdx === idx ? 'ring-2 ring-primary border-primary' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveImageUrl(photo.url)} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Video Preview if available */}
                {selectedReturn.customerVideoUrl && (
                  <div className="pt-2 border-t space-y-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-primary" /> Customer Video Evidence
                    </span>
                    <video
                      controls
                      src={resolveImageUrl(selectedReturn.customerVideoUrl)}
                      className="w-full max-h-40 rounded-lg border bg-black"
                    />
                  </div>
                )}

                {/* Customer Notes */}
                <div className="p-3 bg-background rounded-lg border text-xs space-y-1">
                  <span className="font-semibold text-foreground">Customer Stated Reason:</span>
                  <p className="text-muted-foreground">{selectedReturn.reason.replace(/_/g, ' ')}</p>
                  {selectedReturn.customerNotes && (
                    <p className="text-foreground/90 italic pt-1">&quot;{selectedReturn.customerNotes}&quot;</p>
                  )}
                </div>
              </div>

              {/* Right Column: Catalogue & Order Snapshot Reference Images */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authentic Catalogue Reference
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                    Ground Truth Reference
                  </Badge>
                </div>

                {/* Reference Main Preview */}
                <div className="w-full h-64 rounded-lg border bg-black/5 dark:bg-black/40 overflow-hidden relative flex items-center justify-center">
                  {selectedReturn.referenceImages?.[activeRefPhotoIdx]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(selectedReturn.referenceImages[activeRefPhotoIdx].url)}
                      alt="Catalogue Reference Photo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-xs text-muted-foreground">No reference photo available</div>
                  )}
                </div>

                {/* Reference Thumbnail strip */}
                {selectedReturn.referenceImages && selectedReturn.referenceImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedReturn.referenceImages.map((ref, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveRefPhotoIdx(idx)}
                        className={`w-14 h-14 rounded-md border overflow-hidden shrink-0 transition-all ${
                          activeRefPhotoIdx === idx ? 'ring-2 ring-primary border-primary' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveImageUrl(ref.url)} alt="Reference" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Saree Specifications */}
                <div className="p-3 bg-background rounded-lg border text-xs space-y-1.5">
                  <span className="font-semibold text-foreground">Catalogue Product Details:</span>
                  <p className="font-medium text-foreground">{selectedReturn.orderItem?.productName || selectedReturn.product?.name}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-muted-foreground">
                    <div>
                      <span>Rate: </span>
                      <strong className="text-foreground">{formatCurrency(selectedReturn.orderItem?.rate || 0)}</strong>
                    </div>
                    <div>
                      <span>Delivery Date: </span>
                      <strong className="text-foreground">
                        {new Date(selectedReturn.order?.status === 'DELIVERED' ? selectedReturn.createdAt : selectedReturn.createdAt).toLocaleDateString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Verification Breakdown Card */}
            <Card className="rounded-xl border bg-muted/10 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">Computer Vision & AI Matching Analysis</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Overall Confidence:</span>
                  <span
                    className={`text-base font-extrabold font-mono ${
                      selectedReturn.confidenceScore >= 75
                        ? 'text-emerald-600'
                        : selectedReturn.confidenceScore < 45
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {selectedReturn.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Similarity Metrics Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-background border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Color Palette Match</span>
                  <span className="text-lg font-bold text-foreground">
                    {selectedReturn.verificationBreakdown?.colorSimilarity || 0}%
                  </span>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${selectedReturn.verificationBreakdown?.colorSimilarity || 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Pattern / Weave Match</span>
                  <span className="text-lg font-bold text-foreground">
                    {selectedReturn.verificationBreakdown?.patternSimilarity || 0}%
                  </span>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${selectedReturn.verificationBreakdown?.patternSimilarity || 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Border / Zari Match</span>
                  <span className="text-lg font-bold text-foreground">
                    {selectedReturn.verificationBreakdown?.borderSimilarity || 0}%
                  </span>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${selectedReturn.verificationBreakdown?.borderSimilarity || 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Photo Clarity Score</span>
                  <span className="text-lg font-bold text-foreground">
                    {selectedReturn.verificationBreakdown?.clarityScore || 0}%
                  </span>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${selectedReturn.verificationBreakdown?.clarityScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Summary and Discrepancies */}
              <div className="p-3.5 rounded-lg bg-background border space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Info className="w-4 h-4 text-primary" /> Visual Inspection Findings:
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedReturn.verificationBreakdown?.analysisSummary || 'Computer vision analysis completed.'}
                </p>

                {selectedReturn.verificationBreakdown?.discrepancyReasons &&
                  selectedReturn.verificationBreakdown.discrepancyReasons.length > 0 && (
                    <div className="pt-2 border-t mt-2 space-y-1">
                      <span className="font-semibold text-rose-600 block">Identified Discrepancies:</span>
                      <ul className="list-disc pl-5 text-[11px] text-muted-foreground space-y-0.5">
                        {selectedReturn.verificationBreakdown.discrepancyReasons.map((disc, i) => (
                          <li key={i}>{disc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
            </div>
            </Card>

            {/* Reverse Pickup Status (if scheduled) */}
            {selectedReturn.pickupTrackingNumber && (
              <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Delhivery Reverse Pickup Scheduled</span>
                    <span className="text-muted-foreground">AWB: {selectedReturn.pickupTrackingNumber} · Status: {selectedReturn.pickupStatus}</span>
                  </div>
                </div>
                <Link
                  href={`https://www.delhivery.com/track/package/${selectedReturn.pickupTrackingNumber}`}
                  target="_blank"
                  className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  Track Reverse Pickup <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Review Decision Form */}
            <div className="p-5 rounded-xl border bg-card space-y-4">
              <h3 className="font-bold text-sm text-foreground">Manual Inspector Decision Console</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={reviewAction === 'APPROVE' ? 'default' : 'outline'}
                  onClick={() => setReviewAction('APPROVE')}
                  className="justify-start gap-2 h-10 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Approve Return
                </Button>

                <Button
                  type="button"
                  variant={reviewAction === 'REQUEST_EVIDENCE' ? 'default' : 'outline'}
                  onClick={() => setReviewAction('REQUEST_EVIDENCE')}
                  className="justify-start gap-2 h-10 text-xs"
                >
                  <Camera className="w-4 h-4 text-amber-500" /> Request Clearer Evidence
                </Button>

                <Button
                  type="button"
                  variant={reviewAction === 'REJECT' ? 'destructive' : 'outline'}
                  onClick={() => setReviewAction('REJECT')}
                  className="justify-start gap-2 h-10 text-xs"
                >
                  <XCircle className="w-4 h-4 text-rose-500" /> Reject Return
                </Button>
              </div>

              {reviewAction === 'REJECT' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-destructive block">Rejection Reason (Mandatory):</label>
                  <Input
                    placeholder="e.g. Uploaded saree shows worn condition, missing brand tags, or completely different piece..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">Internal Audit / Decision Notes:</label>
                <Input
                  placeholder="Optional internal inspector notes for record..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setSelectedReturn(null)}>
                  Close
                </Button>
                <Button size="sm" onClick={handleReviewSubmit} disabled={isReviewing} className="gap-1.5">
                  {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Confirm Decision
                </Button>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            {selectedReturn.auditTrail && selectedReturn.auditTrail.length > 0 && (
              <div className="pt-2 border-t space-y-2 text-xs">
                <span className="font-semibold text-muted-foreground block">Verification History & Audit Trail:</span>
                <div className="space-y-2 divide-y">
                  {selectedReturn.auditTrail.map((entry, i) => (
                    <div key={i} className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-foreground">{entry.actorName}</span>
                        <p className="text-muted-foreground text-[11px] mt-0.5">{entry.notes}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        {new Date(entry.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
