'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, LayoutDashboard, ShoppingBag, MessageSquare, LogOut } from 'lucide-react'
import { Button } from '@ankita/ui'
import { useAuth } from '@/hooks/use-auth'

const navigation = [
  { name: 'Dashboard', href: '/wholesaler', icon: LayoutDashboard },
  { name: 'Catalogs', href: '/wholesaler/catalogs', icon: ShoppingBag },
  { name: 'My Inquiries', href: '/wholesaler/inquiries', icon: MessageSquare },
]

export function WholesalerHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide flex h-16 items-center">
        <div className="mr-8 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <Link href="/wholesaler" className="hidden md:block">
            <span className="font-bold text-lg tracking-tight">Ankita Processors B2B</span>
          </Link>
        </div>
        
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 transition-colors hover:text-foreground/80 ${
                pathname === item.href ? 'text-foreground font-semibold' : 'text-foreground/60'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline-block">{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.name || 'Partner'}</span>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
