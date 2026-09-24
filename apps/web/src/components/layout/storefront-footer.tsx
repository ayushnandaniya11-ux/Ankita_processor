import Link from 'next/link'
import { Separator } from '@ankita/ui'
import { APP_NAME } from '@ankita/config'
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'Contact Us', href: '/contact' },
  ],
  'Customer Service': [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Returns & Exchange', href: '/returns' },
    { label: 'Customer Support', href: '/support' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
}

export function StorefrontFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="container-wide py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-widest uppercase text-foreground">
              {APP_NAME}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Premium women's clothing crafted with care. Celebrating Indian craftsmanship and modern style.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="YouTube" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  )
}
