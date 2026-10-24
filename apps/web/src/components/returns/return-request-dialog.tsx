'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@ankita/ui'
import {
  SUPPORTED_LANGUAGES,
  RETURN_DICTIONARIES,
  detectLanguageFromState,
  type SupportedLanguage,
} from '@/lib/i18n/return-i18n'
import apiClient from '@/lib/api/client'
import { resolveImageUrl } from '@ankita/utils'
import {
  RotateCcw,
  Sparkles,
  Camera,
  Video,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  Truck,
  ShieldCheck,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

export interface ReturnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: number
    orderNo: string
    shippingAddress?: string
    status: string
    deliveredAt?: string
    createdAt: string
  }
  item: {
    id: number
    productId: number
    productName?: string
    productImage?: string
    quantity: number
    rate: number
    product?: {
      id: number
      name: string
      imageUrl?: string
    }
  }
  onSuccess?: (returnRecord: any) => void
}

export function ReturnRequestDialog({
  open,
  onOpenChange,
  order,
  item,
  onSuccess,
}: ReturnDialogProps) {
  // 1. Language state initialized from shipping address
  const [lang, setLang] = useState<SupportedLanguage>('en')
  const [isStateDetected, setIsStateDetected] = useState(false)

  // 2. Wizard step state
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // 3. Form inputs
  const [reason, setReason] = useState<string>('')
  const [customerNotes, setCustomerNotes] = useState<string>('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  // 4. Eligibility & Submission states
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [eligibility, setEligibility] = useState<{
    eligible: boolean
    reason?: string
    message?: string
    existingReturn?: any
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Auto-detect language once order is loaded
  useEffect(() => {
    if (order?.shippingAddress) {
      const detected = detectLanguageFromState(order.shippingAddress)
      setLang(detected)
      setIsStateDetected(true)
    }
  }, [order?.shippingAddress])

  const checkItemEligibility = useCallback(async () => {
    if (!order?.id || !item?.id) return
    try {
      setCheckingEligibility(true)
      const res = await apiClient.get('/returns/check-eligibility', {
        params: {
          orderId: order.id,
          orderItemId: item.id,
        },
      })
      setEligibility(res.data)
      if (res.data.existingReturn) {
        setVerificationResult(res.data.existingReturn)
        setStep(3)
      }
    } catch (err: any) {
      console.error('Eligibility check error:', err)
      setEligibility({
        eligible: false,
        message: err?.response?.data?.message || 'Could not verify return eligibility.',
      })
    } finally {
      setCheckingEligibility(false)
    }
  }, [order?.id, item?.id])

  // Check eligibility on open
  useEffect(() => {
    if (open && order?.id && item?.id) {
      checkItemEligibility()
    } else {
      // Reset state on close
      setStep(1)
      setReason('')
      setCustomerNotes('')
      setPhotos([])
      setPhotoPreviews([])
      setVideo(null)
      setVideoPreview(null)
      setVerificationResult(null)
    }
  }, [open, order?.id, item?.id, checkItemEligibility])

  const dict = RETURN_DICTIONARIES[lang] || RETURN_DICTIONARIES.en

  // Handle photo additions
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const selectedList = Array.from(files)
    const validFiles: File[] = []
    const newPreviews: string[] = []

    for (const f of selectedList) {
      if (photos.length + validFiles.length >= 5) {
        toast.warning('Maximum 5 photos allowed.')
        break
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(dict.errors.invalidFileType)
        continue
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name}: ${dict.errors.fileTooLarge}`)
        continue
      }
      validFiles.push(f)
      newPreviews.push(URL.createObjectURL(f))
    }

    setPhotos((prev) => [...prev, ...validFiles])
    setPhotoPreviews((prev) => [...prev, ...newPreviews])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photoPreviews[idx])
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  // Handle video addition
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      toast.error('Only MP4, WebM or MOV video clips are accepted.')
      return
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error('Video size must be within 30MB.')
      return
    }

    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideo(null)
    setVideoPreview(null)
  }

  // Submit Return Request with AI Verification
  const handleSubmitReturn = async () => {
    if (!reason) {
      toast.error(dict.errors.selectReason)
      setStep(1)
      return
    }
    if (photos.length === 0) {
      toast.error(dict.errors.uploadAtLeastOnePhoto)
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append('orderId', String(order.id))
      formData.append('orderItemId', String(item.id))
      formData.append('reason', reason)
      formData.append('customerNotes', customerNotes)
      formData.append('language', lang)

      photos.forEach((photo) => {
        formData.append('photos', photo)
      })

      if (video) {
        formData.append('video', video)
      }

      const res = await apiClient.post('/returns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setVerificationResult(res.data.returnRequest)
      setStep(3)
      toast.success(
        res.data.returnRequest.verificationStatus === 'MATCH_CONFIRMED'
          ? 'Return verified and approved!'
          : 'Return submitted for manual quality review.'
      )
      if (onSuccess) {
        onSuccess(res.data.returnRequest)
      }
    } catch (err: any) {
      console.error('Failed to submit return request:', err)
      const msg = err?.response?.data?.message || 'Failed to submit return request.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const productName = item.productName || item.product?.name || 'Saree'
  const itemImage = resolveImageUrl(item.productImage || item.product?.imageUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl shadow-2xl border bg-background">
        {/* Header with Language Selector */}
        <div className="p-6 pb-4 border-b bg-gradient-to-r from-emerald-900/10 via-background to-teal-900/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">{dict.title}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {dict.subtitle}
                </DialogDescription>
              </div>
            </div>

            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {dict.languageSelectorLabel}:
              </span>
              <Select value={lang} onValueChange={(val: SupportedLanguage) => setLang(val)}>
                <SelectTrigger className="h-8 text-xs w-[140px] bg-background/80 backdrop-blur rounded-lg border">
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

          {/* Product Banner */}
          <div className="mt-4 p-3 rounded-xl bg-card border flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
              {itemImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={itemImage} alt={productName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-base">🛍️</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{productName}</p>
              <p className="text-[11px] text-muted-foreground">
                Order #{order.orderNo} · Qty: {item.quantity} · Price: ₹{item.rate}
              </p>
            </div>
            {isStateDetected && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 shrink-0">
                {dict.suggestedBadge}
              </Badge>
            )}
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-2 border-t">
            <div
              className={`text-center pb-1 text-xs border-b-2 font-medium transition-colors ${
                step === 1 ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              1. {dict.step1Title}
            </div>
            <div
              className={`text-center pb-1 text-xs border-b-2 font-medium transition-colors ${
                step === 2 ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              2. {dict.step2Title}
            </div>
            <div
              className={`text-center pb-1 text-xs border-b-2 font-medium transition-colors ${
                step === 3 ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              3. {dict.step3Title}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {checkingEligibility ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Checking return window & eligibility...</p>
            </div>
          ) : eligibility && !eligibility.eligible && step !== 3 ? (
            /* Ineligible Alert */
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
              <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-foreground">Return Request Not Available</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {eligibility.message || dict.errors.windowExpired}
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Reason and Visual Saree Guidelines */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Visual Guidelines for Saree Returns */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {dict.guidelinesHeader}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dict.guidelines.map((g, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-xs font-semibold text-foreground">{g.title}</p>
                          </div>
                          <p className="text-[11px] text-muted-foreground pl-7 leading-relaxed">{g.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 flex items-start gap-2.5">
                      <Video className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                          {dict.videoGuideline.title}
                        </p>
                        <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                          {dict.videoGuideline.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Return Reason Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {dict.selectReasonPlaceholder} <span className="text-rose-500">*</span>
                    </label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger className="h-10 text-xs rounded-xl">
                        <SelectValue placeholder={dict.selectReasonPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(dict.reasons).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Customer Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {dict.detailedNotesLabel}
                    </label>
                    <Textarea
                      rows={3}
                      placeholder={dict.detailedNotesPlaceholder}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="text-xs rounded-xl"
                    />
                  </div>

                  {/* AI Explanation Notice */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                        {dict.aiNoticeHeader}
                      </p>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                        {dict.aiNoticeText}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Photo and Video Media Upload */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Photo Upload Zone */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" /> {dict.uploadPhotosTitle}
                      </label>
                      <span className="text-[11px] text-muted-foreground">{photos.length}/5 photos uploaded</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />

                    {/* Previews Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {photoPreviews.map((preview, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-xl border overflow-hidden bg-muted shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/50 text-[10px] text-white px-1.5 py-0.5 rounded">
                            Photo #{idx + 1}
                          </span>
                        </div>
                      ))}

                      {photos.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary flex flex-col items-center justify-center p-3 text-center transition-colors bg-muted/10 hover:bg-primary/5"
                        >
                          <Upload className="w-5 h-5 text-muted-foreground mb-1 group-hover:text-primary" />
                          <span className="text-[11px] font-semibold text-foreground">Add Photo</span>
                          <span className="text-[9px] text-muted-foreground">JPG, PNG, WebP</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{dict.fileLimitNotice}</p>
                  </div>

                  {/* Video Upload Zone */}
                  <div className="space-y-3 pt-2 border-t">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" /> {dict.uploadVideoTitle}
                    </label>

                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleVideoSelect}
                    />

                    {videoPreview ? (
                      <div className="p-3 rounded-xl border bg-card flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground truncate max-w-xs">{video?.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {video?.size ? (video.size / (1024 * 1024)).toFixed(1) + ' MB' : ''} · Video attached
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeVideo} className="text-rose-600 h-8 px-2">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary flex items-center justify-center gap-3 transition-colors bg-muted/10 hover:bg-primary/5"
                      >
                        <Video className="w-5 h-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-foreground">Click to upload 5–15s saree video</p>
                          <p className="text-[10px] text-muted-foreground">MP4 or WebM (Max 30MB)</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Real-Time AI Verification Result & Instructions */}
              {step === 3 && verificationResult && (
                <div className="space-y-6">
                  {/* Outcome Banner */}
                  {verificationResult.verificationStatus === 'MATCH_CONFIRMED' ||
                  verificationResult.status === 'APPROVED' ? (
                    /* MATCH CONFIRMED / APPROVED */
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-foreground">
                              {dict.outcomes.matchConfirmedTitle}
                            </h3>
                            <Badge className="bg-emerald-600 text-white border-0 text-[10px]">
                              {verificationResult.confidenceScore}% Visual Match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {dict.outcomes.matchConfirmedDesc}
                          </p>
                        </div>
                      </div>

                      {/* Pickup Waybill Info */}
                      {verificationResult.pickupTrackingNumber && (
                        <div className="p-3.5 rounded-xl bg-background/80 border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] text-muted-foreground block">{dict.waybillLabel}</span>
                            <span className="font-mono font-extrabold text-sm text-primary">
                              {verificationResult.pickupTrackingNumber}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">
                            <Truck className="w-3.5 h-3.5 mr-1" /> Delhivery Reverse Pickup
                          </Badge>
                        </div>
                      )}

                      {/* Packing Instructions */}
                      <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-primary" /> {dict.outcomes.pickupScheduleTitle}
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
                          {dict.outcomes.pickupInstructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* MANUAL REVIEW REQUIRED / UNDER REVIEW */
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-foreground">
                              {dict.outcomes.reviewRequiredTitle}
                            </h3>
                            <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-400">
                              Return #{verificationResult.returnNo}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {dict.outcomes.reviewRequiredDesc}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-background/80 border text-xs text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground">What happens next?</p>
                        <p>{dict.outcomes.reviewTimeline}</p>
                      </div>

                      <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/50">
                        {dict.outcomes.appealNotice}
                      </p>
                    </div>
                  )}

                  {/* Summary Details */}
                  <div className="rounded-xl border bg-muted/20 p-4 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return Tracking No:</span>
                      <span className="font-mono font-bold text-foreground">{verificationResult.returnNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return Reason:</span>
                      <span className="font-semibold text-foreground">
                        {dict.reasons[verificationResult.reason] || verificationResult.reason}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Photos Submitted:</span>
                      <span className="font-medium text-foreground">
                        {Array.isArray(verificationResult.customerPhotos)
                          ? verificationResult.customerPhotos.length
                          : 0}{' '}
                        photos
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 px-6 border-t bg-muted/30 flex items-center justify-between gap-3">
          {step === 1 ? (
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {dict.cancelText}
            </Button>
          ) : step === 2 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(1)} disabled={isSubmitting}>
              {dict.backText}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}

          {step === 1 && eligibility?.eligible && (
            <Button
              size="sm"
              onClick={() => {
                if (!reason) {
                  toast.error(dict.errors.selectReason)
                  return
                }
                setStep(2)
              }}
              className="gap-1.5"
            >
              {dict.nextText} <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {step === 2 && (
            <Button
              size="sm"
              onClick={handleSubmitReturn}
              disabled={isSubmitting || photos.length === 0}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {dict.verifyingAiText}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {dict.submitButtonText}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
