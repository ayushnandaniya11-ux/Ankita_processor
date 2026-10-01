'use client'

import { User, MapPin, Package, RotateCcw, Shield, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const PROFILE_NAV = [
  { href: '/profile/personal-information', icon: User, label: 'Personal Information' },
  { href: '/profile/addresses', icon: MapPin, label: 'My Addresses' },
  { href: '/profile/orders', icon: Package, label: 'My Orders' },
  { href: '/profile/returns', icon: RotateCcw, label: 'Returns & Exchanges' },
  { href: '/profile/security', icon: Shield, label: 'Password & Security' },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Extract first letter of name for avatar, fallback to 'U'
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <nav className="md:col-span-1">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background text-lg font-bold mb-3">
            {initial}
          </div>
          <p className="font-semibold">{user?.name || 'Loading...'}</p>
          <p className="text-sm text-muted-foreground">{user?.email || 'Loading...'}</p>
        </div>
        <div className="p-2 flex flex-col gap-1">
          {PROFILE_NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/')
            return (
              <Link 
                key={href} 
                href={href} 
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Link>
            )
          })}
          
          <div className="my-1 border-t"></div>
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}
