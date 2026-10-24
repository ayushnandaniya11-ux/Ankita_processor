import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Lock, FileText, CheckCircle2, AlertCircle, Mail, Phone, MapPin, Printer } from 'lucide-react'
import { APP_NAME } from '@ankita/config'
import { Button, Separator } from '@ankita/ui'

export const metadata: Metadata = {
  title: 'Privacy Policy — Ankita Processors',
  description: 'Comprehensive Privacy Policy of Ankita Processors. Learn how we collect, handle, protect, and process your personal and transactional information under Indian data protection laws.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container-wide py-12 max-w-4xl space-y-10">
      {/* Page Header */}
      <div className="border-b pb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <ShieldCheck className="h-4 w-4" />
          <span>Legal & Data Protection</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective Date: October 1, 2026 · Last Updated: October 13, 2026 · Version: 2.1
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed pt-2">
          This Privacy Policy governs the manner in which <strong>{APP_NAME}</strong> collects, uses, maintains, protects, and discloses information gathered from retail customers, wholesale partners, and visitors of our website, web applications, and services.
        </p>
      </div>

      {/* Trust Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Lock className="h-4 w-4" />
            <span>Bank-Grade Encryption</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All user sessions and data transmissions are secured using 256-bit TLS/HTTPS encryption.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Zero Data Monetization</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We never sell, rent, trade, or monetize your contact details to third-party advertisers.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <FileText className="h-4 w-4" />
            <span>Indian IT Act Compliant</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Adheres strictly to the Information Technology Act, 2000 and Consumer Protection Rules, 2020.
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="rounded-2xl border bg-muted/30 p-6 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Table of Contents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href="#sec-1" className="text-muted-foreground hover:text-primary transition-colors">1. Scope & Definitions</a>
          <a href="#sec-2" className="text-muted-foreground hover:text-primary transition-colors">2. Information We Collect</a>
          <a href="#sec-3" className="text-muted-foreground hover:text-primary transition-colors">3. How We Use Collected Data</a>
          <a href="#sec-4" className="text-muted-foreground hover:text-primary transition-colors">4. Payment & Financial Security (Razorpay)</a>
          <a href="#sec-5" className="text-muted-foreground hover:text-primary transition-colors">5. Cookies & Tracking Technologies</a>
          <a href="#sec-6" className="text-muted-foreground hover:text-primary transition-colors">6. Data Sharing & Third Parties</a>
          <a href="#sec-7" className="text-muted-foreground hover:text-primary transition-colors">7. Data Storage & Retention Period</a>
          <a href="#sec-8" className="text-muted-foreground hover:text-primary transition-colors">8. Security Architecture & Safeguards</a>
          <a href="#sec-9" className="text-muted-foreground hover:text-primary transition-colors">9. Your Privacy Rights & Choices</a>
          <a href="#sec-10" className="text-muted-foreground hover:text-primary transition-colors">10. Children&apos;s Privacy</a>
          <a href="#sec-11" className="text-muted-foreground hover:text-primary transition-colors">11. Wholesale B2B Commercial Data</a>
          <a href="#sec-12" className="text-muted-foreground hover:text-primary transition-colors">12. Grievance Officer & Redressal</a>
        </div>
      </div>

      {/* Main Legal Content */}
      <div className="prose dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-foreground/90">
        {/* Section 1 */}
        <section id="sec-1" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>1. Scope & Definitions</span>
          </h2>
          <p>
            This Privacy Policy applies to all services provided by <strong>{APP_NAME}</strong>, including our retail consumer e-commerce storefront, our wholesale B2B order portal, our employee and administration management portals, and any affiliated digital services operating under <code>ankitaprocessors.com</code>.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>&quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;:</strong> Refers to Ankita Processors, a registered textile processing and manufacturing enterprise based in Surat, Gujarat, India.</li>
            <li><strong>&quot;User&quot;, &quot;You&quot;:</strong> Refers to any natural or legal person who accesses the website, registers an account, places an order, submits wholesale inquiries, or browses our catalog.</li>
            <li><strong>&quot;Personal Data&quot;:</strong> Any information that relates to an identified or identifiable natural person, including name, phone number, address, and email.</li>
          </ul>
        </section>

        <Separator />

        {/* Section 2 */}
        <section id="sec-2" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
          <p>
            We collect personal and commercial information through various interactions on our platform to fulfill transactions, satisfy statutory requirements, and enhance customer experience:
          </p>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-semibold text-foreground">A. Information You Voluntarily Provide</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Contact & Identity Details:</strong> Full name, billing address, delivery/shipping address with PIN code, mobile telephone number, and email address.</li>
              <li><strong>Wholesale / Corporate Information:</strong> Business legal name, trade name, GSTIN (Goods and Services Tax Identification Number), PAN, business registration address, and contact person credentials.</li>
              <li><strong>Account Credentials:</strong> Securely salted and hashed password digests (using the Argon2 algorithm), session tokens, and temporary One-Time Passwords (OTPs) used for phone/email verification.</li>
              <li><strong>Order & Purchase Details:</strong> Specific clothing products (sarees, dupattas, scarves, dress material), variant selections, fabric choices, quantities, and order customization requests.</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground pt-2">B. Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Technical Identifiers:</strong> Internet Protocol (IP) address, operating system, browser type and version, language settings, and device hardware model.</li>
              <li><strong>Browsing & Interaction Records:</strong> Time stamps, pages visited, product catalog views, referrers, search queries, and duration of visits.</li>
            </ul>
          </div>
        </section>

        <Separator />

        {/* Section 3 */}
        <section id="sec-3" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">3. Purpose & Legal Basis for Processing</h2>
          <p>
            {APP_NAME} processes your information strictly for lawful purposes under applicable Indian jurisprudence:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
            <li><strong>Order Fulfillment & Logistics:</strong> Generating commercial tax invoices, printing waybills, packing consignments, and dispatching shipments through partner courier networks (e.g., Delhivery Express).</li>
            <li><strong>Transactional Communications:</strong> Sending order confirmations, live delivery tracking links, dispatch notices, and account verification OTPs via SMS and Email.</li>
            <li><strong>Statutory & Tax Compliance:</strong> Generating GST-compliant electronic invoices (E-Invoices/E-Way bills) as mandated by the Central Board of Indirect Taxes and Customs (CBIC) and state tax authorities.</li>
            <li><strong>Customer Care & Returns:</strong> Handling reverse pickup logistics, product size/fabric exchanges, defect inspections, and processing approved refunds.</li>
            <li><strong>Platform Security & Fraud Detection:</strong> Preventing bot attacks, denial-of-service attempts, fraudulent Cash-on-Delivery bookings, and unauthorized employee access attempts.</li>
          </ul>
        </section>

        <Separator />

        {/* Section 4 */}
        <section id="sec-4" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">4. Payment & Financial Security (Razorpay / UPI / Cards)</h2>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>PCI-DSS Level 1 Banking Compliance</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>{APP_NAME} does NOT store, handle, or log your credit/debit card numbers, CVVs, expiry dates, net banking passwords, or UPI MPINs.</strong>
            </p>
          </div>
          <p>
            When you choose to pay online, payment is processed directly through <strong>Razorpay Software Private Limited</strong>, an RBI-licensed payment aggregator certified to Payment Card Industry Data Security Standard (PCI-DSS) Level 1 standards.
          </p>
          <p>
            Our backend servers only receive an encrypted payment authorization token and transaction reference identifier (`razorpay_payment_id`) to verify the financial settlement status of your order.
          </p>
        </section>

        <Separator />

        {/* Section 5 */}
        <section id="sec-5" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">5. Cookies & Tracking Technologies</h2>
          <p>
            We use essential and functional cookies to provide seamless e-commerce navigation:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Strictly Necessary Cookies:</strong> Required to keep you authenticated, maintain items in your shopping cart across browser tabs, and ensure CSRF security protection.</li>
            <li><strong>Preference Cookies:</strong> Used to remember your selected theme (dark or light mode) and recently viewed product preferences.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            You can configure your browser to decline or delete cookies at any time. However, declining essential session cookies may impair the checkout and cart operations of our website.
          </p>
        </section>

        <Separator />

        {/* Section 6 */}
        <section id="sec-6" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">6. Data Sharing & Third-Party Disclosure</h2>
          <p>
            We adhere to a strict policy: <strong>We do not sell, trade, or monetize your personal data to data brokers or third-party marketing companies.</strong>
          </p>
          <p>Information is shared strictly with operational vendors necessary to complete your order:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Courier & Logistics Partners:</strong> We share recipient name, destination address, and phone number with our courier logistics partner (Delhivery Express) to coordinate doorstep delivery and COD collection.</li>
            <li><strong>Transactional Messaging Providers:</strong> Used to dispatch automated SMS and Email order confirmations and password resets.</li>
            <li><strong>Statutory Legal Authorities:</strong> Disclosed only where strictly mandated by applicable law, search warrant, subpoena, court order, or official request by Indian law enforcement agencies.</li>
          </ul>
        </section>

        <Separator />

        {/* Section 7 */}
        <section id="sec-7" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">7. Data Storage & Retention Period</h2>
          <p>
            All user data is stored on secure cloud and localized database servers hosted in Indian data center regions in accordance with data localization guidelines.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Account Data:</strong> Retained for as long as your customer account remains active.</li>
            <li><strong>Invoices & Order Ledgers:</strong> Mandatorily retained for a minimum of <strong>8 years</strong> to comply with Section 36 of the Central Goods and Services Tax (CGST) Act, 2017 and Section 128 of the Companies Act, 2013.</li>
            <li><strong>Session Logs:</strong> Deleted or anonymized within 90 days after generation.</li>
          </ul>
        </section>

        <Separator />

        {/* Section 8 */}
        <section id="sec-8" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">8. Security Architecture & Safeguards</h2>
          <p>
            We implement comprehensive technical and organizational safeguards:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Argon2id Password Hashing:</strong> Passwords are never saved in human-readable plain text.</li>
            <li><strong>Strict Role-Based Access Control (RBAC):</strong> Employee access to customer records is partitioned strictly on a need-to-know basis (e.g. shipping personnel only see delivery addresses, not financial histories).</li>
            <li><strong>Automated Rate Limiting:</strong> Prevents credential stuffing, OTP guessing, and distributed denial-of-service (DDoS) attempts.</li>
          </ul>
        </section>

        <Separator />

        {/* Section 9 */}
        <section id="sec-9" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">9. Your Privacy Rights & Choices</h2>
          <p>As a valued user, you have the following rights regarding your data:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Right to Review & Rectify:</strong> You can edit your profile details, contact numbers, and saved addresses directly in <Link href="/profile" className="text-primary hover:underline">My Account</Link>.</li>
            <li><strong>Right to Withdraw Consent / Account Deletion:</strong> You may request the deactivation and deletion of your account by writing to our privacy desk. Note that tax invoice records for completed orders cannot be erased due to statutory laws.</li>
            <li><strong>Right to Opt-Out:</strong> You can opt out of promotional newsletters at any time by clicking the unsubscribe link or contacting our support team.</li>
          </ul>
        </section>

        <Separator />

        {/* Section 10 */}
        <section id="sec-10" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">10. Children&apos;s Privacy</h2>
          <p>
            Our website is designed for adult consumers and authorized business representatives capable of entering into legally binding contracts under the Indian Contract Act, 1872. We do not knowingly solicit or collect personal information from individuals under 18 years of age without parental oversight.
          </p>
        </section>

        <Separator />

        {/* Section 11 */}
        <section id="sec-11" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">11. Wholesale B2B Commercial Data</h2>
          <p>
            Information submitted through our <Link href="/wholesale" className="text-primary hover:underline">Wholesale Partnership Portal</Link>—such as commercial purchase requirements, fabric inquiries, proforma invoices, and credit terms—is treated as strictly confidential commercial information and is never disclosed to competitor retailers or unauthorized personnel.
          </p>
        </section>

        <Separator />

        {/* Section 12 */}
        <section id="sec-12" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-bold text-foreground">12. Grievance Officer & Contact Information</h2>
          <p>
            In accordance with the <strong>Information Technology Act, 2000</strong>, the rules made thereunder, and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, the contact details of our designated Grievance Officer are provided below:
          </p>

          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">{APP_NAME} Grievance & Compliance Cell</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Registered Office:</strong><br />
                  {APP_NAME} Textiles Hub<br />
                  Ring Road, Textile Market<br />
                  Surat, Gujarat, India - 395002
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Grievance Email:</strong><br />
                  <a href="mailto:grievance@ankitaprocessors.com" className="text-primary hover:underline">grievance@ankitaprocessors.com</a><br />
                  <span className="text-[11px]">CC: <a href="mailto:privacy@ankitaprocessors.com" className="hover:underline">privacy@ankitaprocessors.com</a></span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Direct Tele-Helpdesk:</strong><br />
                  +91 (0261) 234-5678<br />
                  (Mon–Sat: 10:00 AM – 6:00 PM IST)
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Redressal Timelines:</strong><br />
                  Acknowledgement within <strong>48 hours</strong>.<br />
                  Grievance resolution within <strong>1 month</strong>.
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Section 13 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">13. Changes to this Privacy Policy</h2>
          <p>
            We may update or revise this Privacy Policy periodically to reflect technological advancements, operational changes, or new regulatory requirements. When amendments are posted, the &quot;Last Updated&quot; date at the top of this document will be updated. We encourage you to review this policy periodically.
          </p>
        </section>
      </div>

      {/* Footer Navigation Bar */}
      <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/terms">Terms & Conditions</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/">Back to Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
