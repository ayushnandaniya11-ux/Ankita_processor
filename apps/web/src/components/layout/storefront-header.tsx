'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronDown } from 'lucide-react'
import { Button, Sheet, SheetContent, SheetTrigger, Separator } from '@ankita/ui'
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
      { label: 'Kurtis', href: '/categories/kurtis' },
      { label: 'Dresses', href: '/categories/dresses' },
      { label: 'Tops', href: '/categories/tops' },
      { label: 'Bottom Wear', href: '/categories/bottom-wear' },
      { label: 'Co-ord Sets', href: '/categories/co-ord-sets' },
      { label: 'Ethnic Wear', href: '/categories/ethnic-wear' },
    ],
  },
]

export function StorefrontHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()
  const { user } = useAuth()

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container-wide flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
            <span className="text-xl font-bold tracking-widest uppercase">{APP_NAME}</span>
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
                  <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-md border bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
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

            <Link href={user ? '/profile' : '/login'}>
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </Link>

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

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col gap-6 pt-4">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="text-xl font-bold tracking-widest uppercase"
                  >
                    {APP_NAME}
                  </Link>
                  <Separator />
                  <nav className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                      <div key={link.label}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
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
                                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
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
                    <Link href={user ? '/profile' : '/login'} onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {user ? 'My Account' : 'Login / Register'}
                      </Button>
                    </Link>
                    <Link href="/orders" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        My Orders
                      </Button>
                    </Link>
                    <Link href="/wholesale" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Wholesale
                      </Button>
                    </Link>
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
