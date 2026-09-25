import type { Metadata } from 'next'
import { User, MapPin, Package, RotateCcw, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button, Separator } from '@ankita/ui'

export const metadata: Metadata = { title: 'My Profile' }

const PROFILE_NAV = [
  { href: '/profile/personal-information', icon: User, label: 'Personal Information' },
  { href: '/profile/addresses', icon: MapPin, label: 'My Addresses' },
  { href: '/profile/orders', icon: Package, label: 'My Orders' },
  { href: '/profile/returns', icon: RotateCcw, label: 'Returns & Exchanges' },
  { href: '/profile/security', icon: Shield, label: 'Password & Security' },
]

export default function ProfilePage() {
  return (
    <div className="container-wide py-8 max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold">My Account</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Sidebar */}
        <nav className="md:col-span-1">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-5 border-b">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background text-lg font-bold mb-3">A</div>
              <p className="font-semibold">Your Name</p>
              <p className="text-sm text-muted-foreground">your@email.com</p>
            </div>
            <div className="p-2">
              {PROFILE_NAV.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent transition-colors">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        {/* Content */}
        <div className="md:col-span-2">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Welcome to your account</h2>
            <p className="text-sm text-muted-foreground">Select an option from the menu to manage your account.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
