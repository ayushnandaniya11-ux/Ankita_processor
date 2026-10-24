import type { Metadata } from 'next'
import Link from 'next/link'


export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Ankita Processors account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 dark:bg-background px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="site-logo-link inline-flex flex-col items-center gap-2 group" aria-label="Ankita Processors Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Ankita Processors Logo"
            width={80}
            height={80}
            className="h-20 w-20 object-contain select-none transition-transform group-hover:scale-105"
          />
          <span className="text-2xl font-bold tracking-widest uppercase text-foreground group-hover:text-primary transition-colors">
            Ankita Processors
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Heritage Textiles &amp; Sarees
          </span>
        </Link>
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}

