import type { Metadata } from 'next'
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react'
import { APP_NAME } from '@ankita/config'
import Link from 'next/link'
import { Button } from '@ankita/ui'

export const metadata: Metadata = {
  title: 'Returns & Exchange Policy — Ankita Processors',
  description: 'Easy 7-day returns and exchanges for eligible ethnic wear orders at Ankita Processors.',
}

export default function ReturnsPolicyPage() {
  return (
    <div className="container-wide py-12 max-w-4xl space-y-10">
      <div className="border-b pb-6 space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Returns & Exchange Policy</h1>
        <p className="text-sm text-muted-foreground">Hassle-Free 7-Day Doorstep Reverse Pickup</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <RotateCcw className="h-6 w-6" />
          <h2 className="text-xl font-bold text-foreground">7-Day Easy Returns Window</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          At {APP_NAME}, we want you to love your purchase. If you receive an item with size mismatch, color variation, or manufacturing defect, you can request an exchange or return within <strong>7 days</strong> from the delivery date.
        </p>
        <div className="pt-2">
          <Button asChild>
            <Link href="/profile/returns">Initiate Return in My Account</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            <h3>Eligible for Return / Exchange</h3>
          </div>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5">
            <li>Item is unworn, unwashed, and undamaged.</li>
            <li>Original product tags, barcode stickers, and packaging are intact.</li>
            <li>Reported within 7 days of delivery confirmation.</li>
            <li>Damaged in transit or manufacturing defect present.</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <AlertCircle className="h-5 w-5" />
            <h3>Non-Returnable Items</h3>
          </div>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5">
            <li>Customized, stitched, or altered items (e.g. customized blouses).</li>
            <li>Items purchased during clearance or flash sales marked &apos;Final Sale&apos;.</li>
            <li>Items returned without original brand tags and polybag.</li>
            <li>Wholesale bulk orders (covered under separate B2B inspection agreements).</li>
          </ul>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Refund Process & Timeline</h2>
          <p>
            Once our warehouse receives the returned item, it undergoes a mandatory quality check (usually within 48 hours).
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Prepaid Orders (Cards/UPI/Netbanking):</strong> Refunds are credited directly back to the original source payment method within 5–7 business days.</li>
            <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are credited via direct NEFT bank transfer or store credit based on your preference.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
