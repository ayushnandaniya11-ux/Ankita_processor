'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  ShoppingBag, Heart, Search, User, Menu, X, ChevronDown, 
  Package, Clock, Settings, Shield, LogOut, LogIn, UserPlus, Building2, Store 
} from 'lucide-react'
import { 
  Button, 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  Separator, 
  ThemeToggle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ankita/ui'
import { APP_NAME } from '@ankita/config'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { SearchDialog } from '@/components/search/search-dialog'
import { CartDrawer } from '@/components/cart/cart-drawer'

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Best Sellers', href: '/best-sellers' },
  {
    label: 'Categories',
    href: '/categories',
    children: [
      { label: 'Sarees', href: '/categories/sarees' },
      { label: 'Dupattas', href: '/categories/dupattas' },
      { label: 'Scarves', href: '/categories/scarves' },
      { label: 'Dress Material', href: '/categories/dress-material' },
    ],
  },
]

export function StorefrontHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()
  const { user, logout } = useAuth()

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="site-logo-link flex items-center gap-2.5 sm:gap-3 group" aria-label="Ankita Processors Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Ankita Processors Logo"
              width={180}
              height={56}
              className="site-logo select-none shrink-0"
            />
            <span className="font-heading font-bold text-lg sm:text-xl lg:text-2xl tracking-tight text-foreground transition-colors group-hover:text-primary hidden sm:inline-block">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="group relative">
                  <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  {/* Mega dropdown */}
                  <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-md border bg-popover p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 transition-colors" aria-label="Account">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-2 shadow-xl border rounded-xl">
                  <DropdownMenuLabel className="p-3 bg-muted/40 rounded-lg mb-1">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {user.phone && (
                        <p className="text-[11px] text-muted-foreground/80 font-mono">{user.phone}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent text-sm">
                      <User className="h-4 w-4 text-primary" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent text-sm">
                      <Package className="h-4 w-4 text-primary" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Order Tracking</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile/personal-information" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent text-sm">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/security" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Security Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-medium" 
                    onSelect={async (e) => {
                      e.preventDefault()
                      await logout()
                      window.location.href = '/'
                    }}
                  >
                    <LogOut className="h-4 w-4 text-red-600" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-2 shadow-xl border rounded-xl">
                  <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/login/customer" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent font-medium text-sm">
                      <LogIn className="h-4 w-4 text-primary" />
                      <span>Customer Sign in</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register/customer" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent font-medium text-sm">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <span>Register as Customer</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem asChild>
                    <Link href="/login/wholesaler" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 text-orange-600" />
                      <span>Wholesale Portal</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs text-muted-foreground">
                      <Store className="h-3.5 w-3.5" />
                      <span>All Account Types</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Button>

            <ThemeToggle />

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col gap-5 pt-4">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="site-logo-link flex items-center justify-center gap-3 py-2 group"
                    aria-label="Ankita Processors Home"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="Ankita Processors Logo"
                      width={120}
                      height={44}
                      className="site-logo h-11 w-auto object-contain select-none"
                    />
                    <span className="font-heading font-bold text-xl tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {APP_NAME}
                    </span>
                  </Link>


                  {user ? (
                    <div className="p-3 bg-muted/50 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  ) : null}

                  <Separator />
                  <nav className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                      <div key={link.label}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                        >
                          {link.label}
                        </Link>
                        {link.children && (
                          <div className="ml-4 mt-1 flex flex-col gap-0.5">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    {user ? (
                      <>
                        <Link href="/profile" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <User className="h-4 w-4" /> My Account
                          </Button>
                        </Link>
                        <Link href="/orders" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <Package className="h-4 w-4" /> My Orders
                          </Button>
                        </Link>
                        <Link href="/orders" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" /> Order Tracking
                          </Button>
                        </Link>
                        <Link href="/profile/personal-information" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                            <Settings className="h-4 w-4" /> Profile Settings
                          </Button>
                        </Link>
                        <Link href="/profile/security" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" /> Security Settings
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={async () => {
                            await logout()
                            setMobileOpen(false)
                            window.location.href = '/'
                          }}
                        >
                          <LogOut className="h-4 w-4" /> Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login/customer" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full justify-start gap-2">
                            <LogIn className="h-4 w-4" /> Customer Sign in
                          </Button>
                        </Link>
                        <Link href="/register/customer" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <UserPlus className="h-4 w-4" /> Customer Registration
                          </Button>
                        </Link>
                        <Link href="/login/wholesaler" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700">
                            <Building2 className="h-4 w-4" /> Wholesale Portal
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
