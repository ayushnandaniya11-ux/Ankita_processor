'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3,
  Settings, Store, RotateCcw, Star, Truck, LogOut, Building2, ChevronDown,
  Menu, X,
} from 'lucide-react'
import { cn } from '@ankita/utils'
import { Button, Avatar, AvatarFallback, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@ankita/ui'
import { useState } from 'react'
import { APP_NAME } from '@ankita/config'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/dashboard/products', icon: Package, label: 'Products' },
      { href: '/dashboard/categories', icon: Tag, label: 'Categories' },
      { href: '/dashboard/inventory', icon: Store, label: 'Inventory' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
      { href: '/dashboard/returns', icon: RotateCcw, label: 'Returns' },
      { href: '/dashboard/shipping', icon: Truck, label: 'Shipping' },
      { href: '/dashboard/coupons', icon: Tag, label: 'Coupons' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { href: '/dashboard/customers', icon: Users, label: 'Customers' },
      { href: '/dashboard/wholesale', icon: Building2, label: 'Wholesale' },
      { href: '/dashboard/reviews', icon: Star, label: 'Reviews' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

interface AdminSidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function AdminSidebar({ mobile, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      'flex h-full w-60 flex-col border-r bg-white',
      mobile && 'fixed inset-y-0 left-0 z-50 shadow-xl'
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" onClick={onClose} className="text-sm font-bold tracking-widest uppercase">
          {APP_NAME}
          <span className="ml-2 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background">Admin</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            {group.items.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User menu */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-foreground">Admin User</p>
                <p className="text-[11px] text-muted-foreground">admin@ankita.com</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/login" className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const title = pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Dashboard'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Store className="mr-2 h-3.5 w-3.5" />
            View Store
          </Link>
        </Button>
      </div>
    </header>
  )
}
