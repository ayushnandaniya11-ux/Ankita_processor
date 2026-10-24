'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  RotateCcw,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
  Camera,
  Info,
} from 'lucide-react'
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ankita/ui'
import apiClient from '@/lib/api/client'
import { resolveImageUrl } from '@ankita/utils'
import {
  SUPPORTED_LANGUAGES,
  RETURN_DICTIONARIES,
  type SupportedLanguage,
} from '@/lib/i18n/return-i18n'

export default function CustomerReturnsPage() {
  const [lang, setLang] = useState<SupportedLanguage>('en')
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inspection modal for customer to review their uploaded photos
  const [inspectReturn, setInspectReturn] = useState<any | null>(null)

  const dict = RETURN_DICTIONARIES[lang] || RETURN_DICTIONARIES.en

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/returns/my-returns')
      setReturns(res.data.returns || [])
      setError(null)
    } catch (err: any) {
      console.error('Failed to load returns:', err)
      setError(err?.response?.data?.message || 'Could not load your return requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturns()
  }, [])

  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-8 shadow-sm">
      {/* Top Banner with Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{dict.title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{dict.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-medium text-muted-foreground">{dict.languageSelectorLabel}:</span>
          <Select value={lang} onValueChange={(val: SupportedLanguage) => setLang(val)}>
            <SelectTrigger className="h-9 text-xs w-[140px] bg-background rounded-lg border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((opt) => (
                <SelectItem key={opt.code} value={opt.code} className="text-xs">
                  <span className="mr-1.5">{opt.flag}</span> {opt.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading your return requests...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchReturns}>
            Retry
          </Button>
        </div>
      ) : returns.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <RotateCcw className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">No Active Returns</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              You haven&apos;t requested any returns or exchanges yet. You can request returns for eligible delivered
              sarees within 7 days.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="sm">
              <Link href="/profile/orders">View Delivered Orders</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Returns List */
        <div className="space-y-4">
          {returns.map((ret) => {
            const productImg = resolveImageUrl(ret.product?.imageUrl || ret.referenceImages?.[0])
            const isApproved = ret.status === 'APPROVED' || ret.verificationStatus === 'MATCH_CONFIRMED'
            const isUnderReview = ret.status === 'UNDER_REVIEW' || ret.verificationStatus === 'MANUAL_REVIEW_REQUIRED'
            const isRejected = ret.status === 'REJECTED'

            return (
              <Card key={ret.id} className="rounded-2xl shadow-sm border overflow-hidden hover:border-primary/40 transition-colors">
                <CardContent className="p-5 space-y-4">
                  {/* Top Bar: Return # and Status Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-foreground">
                        Return #{ret.returnNo}
                      </span>
                      <span className="text-xs text-muted-foreground">· Order #{ret.order?.orderNo}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* AI Verification Badge */}
                      {ret.verificationStatus === 'MATCH_CONFIRMED' ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> AI Match Confirmed ({ret.confidenceScore}%)
                        </Badge>
                      ) : ret.verificationStatus === 'MANUAL_REVIEW_REQUIRED' ? (
                        <Badge variant="outline" className="text-amber-700 border-amber-400 text-[10px] gap-1">
                          <Clock className="w-3 h-3" /> Under Quality Review
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-blue-700 border-blue-400 text-[10px]">
                          {ret.verificationStatus}
                        </Badge>
                      )}

                      {/* Overall Return Status */}
                      <Badge
                        variant={isApproved ? 'default' : isRejected ? 'destructive' : 'secondary'}
                        className="text-[10px] uppercase font-semibold"
                      >
                        {dict.statusLabels[ret.status] || ret.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Body: Product details & Uploaded media */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-14 rounded-xl border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {productImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={productImg}
                            alt={ret.product?.name || 'Saree'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">🛍️</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {ret.product?.name || 'Handcrafted Saree'}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Reason: <span className="font-medium text-foreground">{dict.reasons[ret.reason] || ret.reason}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Requested on {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectReturn(ret)}
                        className="text-xs h-8 gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Uploaded Evidence
                      </Button>
                    </div>
                  </div>

                  {/* Reverse Pickup Courier AWB */}
                  {ret.pickupTrackingNumber && (
                    <div className="p-3 rounded-xl bg-muted/40 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <span className="text-muted-foreground">{dict.waybillLabel}: </span>
                          <span className="font-mono font-bold text-foreground">{ret.pickupTrackingNumber}</span>
                          <span className="text-[11px] text-muted-foreground ml-2">
                            ({ret.pickupStatus || 'Pickup Scheduled'})
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary gap-1">
                        <Link
                          href={`https://www.delhivery.com/track/package/${ret.pickupTrackingNumber}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Track Pickup <ExternalLink className="w-3 h-3 ml-0.5" />
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Localized Instructions Accordion / Guidance */}
                  {isApproved && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground space-y-1.5">
                      <p className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {dict.outcomes.pickupScheduleTitle}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-emerald-900/90 dark:text-emerald-300">
                        {dict.outcomes.pickupInstructions.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isUnderReview && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-semibold">{dict.outcomes.reviewRequiredTitle}</p>
                      <p className="text-[11px] text-muted-foreground">{dict.outcomes.reviewTimeline}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Customer Media Inspection Modal */}
      {inspectReturn && (
        <Dialog open={!!inspectReturn} onOpenChange={(open) => !open && setInspectReturn(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-base font-bold">
                Return Evidence — #{inspectReturn.returnNo}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Submitted Saree Photos
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.isArray(inspectReturn.customerPhotos) && inspectReturn.customerPhotos.length > 0 ? (
                    inspectReturn.customerPhotos.map((url: string, i: number) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border bg-muted group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveImageUrl(url)}
                          alt={`Evidence ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground col-span-3">No photos attached.</p>
                  )}
                </div>
              </div>

              {inspectReturn.customerVideoUrl && (
                <div className="pt-2 border-t">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Submitted Product Video
                  </h4>
                  <video
                    src={resolveImageUrl(inspectReturn.customerVideoUrl)}
                    controls
                    className="w-full rounded-xl border max-h-60 bg-black"
                  />
                </div>
              )}

              {inspectReturn.customerNotes && (
                <div className="pt-2 border-t text-xs">
                  <span className="font-bold text-muted-foreground block mb-1">Customer Notes:</span>
                  <p className="p-3 rounded-xl bg-muted/40 border text-foreground">
                    {inspectReturn.customerNotes}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
