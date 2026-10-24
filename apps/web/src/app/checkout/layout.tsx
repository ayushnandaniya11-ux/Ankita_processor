import Link from 'next/link'

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background py-3.5">
        <div className="container-wide flex items-center justify-between">
          <Link href="/" className="site-logo-link flex items-center gap-2.5 group" aria-label="Ankita Processors Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Ankita Processors Logo"
              width={140}
              height={44}
              className="site-logo h-10 w-auto object-contain select-none shrink-0"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight uppercase group-hover:text-primary transition-colors">
              Ankita Processors
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span>🔒</span>
            <span>256-bit Secure Checkout</span>
          </div>
        </div>
      </div>
      <div className="container-wide py-8 max-w-5xl">{children}</div>
    </div>
  )
}

