import type { Metadata } from 'next'
import { APP_NAME } from '@ankita/config'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Ankita Processors',
  description: 'Terms and conditions governing the use of the Ankita Processors website and purchase of goods.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="container-wide py-12 max-w-4xl space-y-8">
      <div className="border-b pb-6 space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground">Effective Date: October 2026 · Governing Law: Republic of India</p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">1. Agreement to Terms</h2>
          <p>
            By accessing or using the {APP_NAME} website, placing an order, or registering an account, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you should not access or use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">2. Products, Pricing & Accuracy</h2>
          <p>
            All products displayed on our storefront are subject to availability. We strive to display fabric colors, weaves, and patterns as accurately as possible; however, variations may occur due to display monitor calibrations and natural characteristics of handcrafted textiles.
          </p>
          <p>
            All prices are quoted in Indian Rupees (INR) and are inclusive of applicable GST unless explicitly stated otherwise. We reserve the right to revise prices or cancel orders resulting from inadvertent typographical pricing errors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">3. Orders, Payments & Cancellation</h2>
          <p>
            An order is considered confirmed once payment authorization is successful (for online transactions) or upon system validation (for Cash on Delivery orders).
          </p>
          <p>
            Orders can be cancelled prior to dispatch by reaching out to our support desk. Once dispatched, orders are governed by our Return & Refund Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">4. Wholesale & Bulk Purchase Terms</h2>
          <p>
            Wholesale partners are subject to minimum order quantities (MOQ), commercial invoice terms, and business verification (GSTIN verification). Wholesale quotes and inquiries are non-binding until confirmed in writing with an official proforma invoice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">5. Intellectual Property</h2>
          <p>
            All content, including product photography, logos, branding, descriptions, and site design, is the exclusive intellectual property of {APP_NAME} and is protected under applicable copyright and trademark laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">6. Dispute Resolution & Jurisdiction</h2>
          <p>
            Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in Surat, Gujarat, India.
          </p>
        </section>
      </div>
    </div>
  )
}
