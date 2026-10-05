import Link from 'next/link'
import { Button } from '@ankita/ui'
import { ArrowRight } from 'lucide-react'
import { StatsPanel } from './stats-panel'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Dynamic Animated Background Gradients (No Images) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-accent/30 blur-[80px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container-wide relative z-10 flex min-h-[70vh] flex-col items-center justify-center py-20 md:py-32 text-center">

        {/* Heading with Premium Font & Gradient Text */}
        <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Elegance Woven
          <br className="hidden sm:block" />
          <span className="italic font-light gradient-text"> into Every Thread</span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed animate-fade-in-up px-4" style={{ animationDelay: '0.2s' }}>
          Discover our curated collection of premium women&apos;s fashion. From handcrafted sarees to contemporary co-ord sets, celebrating the modern Indian woman without compromise.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-stretch sm:flex-row sm:items-center justify-center gap-4 w-full px-6 sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/new-arrivals" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto group px-8 h-12 md:h-14 rounded-full text-sm md:text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-1">
              Shop New Arrivals
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1.5" />
            </Button>
          </Link>
          <Link href="/categories" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 md:h-14 rounded-full text-sm md:text-base bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 hover:-translate-y-1 transition-all">
              Explore Categories
            </Button>
          </Link>
        </div>

        {/* Stats Glass Panel */}
        <div className="mt-16 w-full max-w-4xl px-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <StatsPanel />
        </div>
      </div>
    </section>
  )
}
