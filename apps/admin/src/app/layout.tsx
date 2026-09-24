import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@ankita/ui'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Admin — Ankita Processors', template: '%s | Admin — Ankita Processors' },
  description: 'Ankita Processors Administration Panel',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
