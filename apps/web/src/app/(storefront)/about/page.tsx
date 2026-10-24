import type { Metadata } from 'next'
import { Sparkles, Heart, ShieldCheck, Factory } from 'lucide-react'
import { APP_NAME } from '@ankita/config'

export const metadata: Metadata = {
  title: 'About Us — Ankita Processors',
  description: 'Learn about Ankita Processors, our heritage in textile processing and our passion for modern ethnic wear.',
}

export default function AboutPage() {
  return (
    <div className="container-wide py-12 max-w-4xl space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Our Story</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Crafting Elegance with Tradition & Precision</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Welcome to {APP_NAME}. We are dedicated to delivering premium women&apos;s ethnic wear, blending timeless Indian artisan traditions with modern textile processing excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Factory className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Heritage in Textile Craft</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From handpicked yarns and intricate weaves to contemporary dyeing and finishing, our processing techniques ensure every saree, dupatta, scarf, and dress material meets the highest standards of longevity, softness, and drape.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Uncompromising Quality</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every fabric undergoes strict quality control checks for colorfastness, shrink resistance, and finish. We believe authentic style begins with materials you can trust.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Heart className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Artisanal Empowerment</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We work closely with local weavers, dye masters, and craftsmen across major textile clusters in India, ensuring ethical practices and fair wages while honoring ancestral techniques.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Direct to Retail & Wholesale</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Whether you are shopping for your personal wardrobe or looking for bulk wholesale supply for your boutique or retail store, our transparent pricing and dedicated support make partnering with us seamless.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-muted/40 p-8 text-center space-y-3">
        <h3 className="text-2xl font-bold">Rooted in India, Loved Everywhere</h3>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Based in the textile heartland of India, Ankita Processors serves discerning customers and boutique owners nationwide with pride.
        </p>
      </div>
    </div>
  )
}
