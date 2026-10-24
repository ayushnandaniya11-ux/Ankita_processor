import type { Metadata } from 'next'
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react'
import { APP_NAME } from '@ankita/config'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy — Ankita Processors',
  description: 'Understand dispatch timelines, shipping partners, delivery estimates, and tracking for Ankita Processors orders.',
}

export default function ShippingPolicyPage() {
  return (
    <div className="container-wide py-12 max-w-4xl space-y-10">
      <div className="border-b pb-6 space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Shipping & Delivery Policy</h1>
        <p className="text-sm text-muted-foreground">Pan-India Courier & Logistics Fulfillment</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 text-center space-y-2">
          <Truck className="h-6 w-6 text-primary mx-auto" />
          <h3 className="font-semibold text-sm">Free Delivery</h3>
          <p className="text-xs text-muted-foreground">On all retail prepaid & COD orders above ₹999</p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center space-y-2">
          <Clock className="h-6 w-6 text-primary mx-auto" />
          <h3 className="font-semibold text-sm">Dispatch within 24–48h</h3>
          <p className="text-xs text-muted-foreground">Fast order packing and dispatch from warehouse</p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center space-y-2">
          <MapPin className="h-6 w-6 text-primary mx-auto" />
          <h3 className="font-semibold text-sm">Pan-India Reach</h3>
          <p className="text-xs text-muted-foreground">Covering 25,000+ pin codes across India</p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center space-y-2">
          <ShieldCheck className="h-6 w-6 text-primary mx-auto" />
          <h3 className="font-semibold text-sm">Tamper-Proof Packing</h3>
          <p className="text-xs text-muted-foreground">Secure packaging ensuring fabric protection</p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">1. Order Dispatch & Delivery Timelines</h2>
          <p>
            Orders placed on {APP_NAME} are dispatched within 1 to 2 business days from our central Surat warehouse.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Metro Cities (Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Ahmedabad):</strong> 2 to 4 business days.</li>
            <li><strong>Tier 2 & Tier 3 Cities:</strong> 4 to 6 business days.</li>
            <li><strong>North-East & Remote Regions:</strong> 5 to 8 business days.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">2. Shipping Charges</h2>
          <p>
            We offer <strong>Free Standard Shipping</strong> on all domestic orders across India. For orders below ₹999, a nominal shipping charge of ₹70 is applicable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">3. Tracking Your Consignment</h2>
          <p>
            Once your package is handed over to our official logistics partner (Delhivery Express), you will receive an SMS and email notification containing your AWB tracking number and live tracking link.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">4. Damaged or Tampered Shipments</h2>
          <p>
            Please inspect the exterior package upon delivery. If the courier outer bag is visibly damaged or tampered with, please do not accept delivery and immediately contact our care team at <a href="mailto:support@ankitaprocessors.com" className="text-primary hover:underline">support@ankitaprocessors.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
