import Link from 'next/link'
import { Button } from '@ankita/ui'
import { ArrowRight } from 'lucide-react'

export function PromoSection() {
  return (
    <section className="py-20 md:py-32 bg-zinc-950 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      
      {/* Abstract geometric shapes */}
      <div className="absolute -left-20 top-20 w-64 h-64 rounded-full border border-white/5 opacity-50"></div>
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full border border-primary/20 opacity-30"></div>

      <div className="container-wide relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            Exclusively Crafted
          </p>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 max-w-4xl">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">New Season</span> Collection
        </h2>
        
        <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed mb-10">
          Step into the season with our most anticipated collection yet. Premium fabrics, exclusive prints, and silhouettes that celebrate you. No compromises, just pure elegance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/new-arrivals" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-zinc-950 hover:bg-white/90 hover:-translate-y-1 transition-all text-base font-semibold shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              Shop the Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/wholesale" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all text-base"
            >
              Partner with Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
