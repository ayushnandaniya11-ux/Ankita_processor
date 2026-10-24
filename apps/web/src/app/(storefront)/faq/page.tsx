import type { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import { APP_NAME } from '@ankita/config'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) — Ankita Processors',
  description: 'Answers to frequently asked questions about orders, payments, sizing, and wholesale at Ankita Processors.',
}

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Browse our catalog of sarees, dupattas, scarves, and dress material. Select your desired color or fabric, click "Add to Cart", and proceed to checkout by specifying your delivery address and payment method.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking via Razorpay, as well as Cash on Delivery (COD) for eligible pin codes.',
  },
  {
    q: 'Are your saree fabrics authentic and tested?',
    a: 'Yes! At Ankita Processors, all our fabrics undergo rigorous textile quality testing for thread count, colorfastness, and weave durability before being finished and packaged.',
  },
  {
    q: 'How can I track my order?',
    a: 'Once your order is processed and dispatched, you will receive an SMS and email notification with your courier tracking number. You can also view real-time status in your Account under "My Orders".',
  },
  {
    q: 'Can I cancel or modify my order after placing it?',
    a: 'You can cancel your order before it gets dispatched from our warehouse by reaching out to our support team or using the profile orders interface. Once dispatched, orders can be returned within 7 days after delivery.',
  },
  {
    q: 'Do you offer wholesale and bulk discounts for boutiques?',
    a: 'Yes, we provide dedicated wholesale pricing and catalog access for retailers and boutique owners. You can apply for a wholesale account through our Wholesale Portal.',
  },
]

export default function FAQPage() {
  return (
    <div className="container-wide py-12 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Find fast answers to common questions about shopping, shipping, sizing, and wholesale partnerships at {APP_NAME}.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <div key={index} className="rounded-xl border bg-card p-6 space-y-2">
            <h2 className="text-base font-bold text-foreground">{faq.q}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-muted/40 p-8 text-center space-y-3">
        <h3 className="text-lg font-bold">Still have questions?</h3>
        <p className="text-sm text-muted-foreground">
          Our friendly customer support team is available Monday through Friday.
        </p>
        <div>
          <Link href="/contact" className="inline-flex text-sm font-semibold text-primary hover:underline">
            Contact Support &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
