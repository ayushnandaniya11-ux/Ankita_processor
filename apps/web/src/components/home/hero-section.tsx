import Link from 'next/link'
import { Button } from '@ankita/ui'
import { ArrowRight } from 'lucide-react'
import { StatsPanel } from './stats-panel'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Dynamic Animated Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-accent/30 blur-[100px]" />
      </div>

      <div className="container-wide relative z-10 flex min-h-[600px] flex-col items-center justify-center py-24 text-center md:min-h-[700px]">


        {/* Heading with Premium Font & Gradient Text */}
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-[5rem] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Elegance Woven
          <br />
          <span className="italic font-light gradient-text">into Every Thread</span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Discover our curated collection of premium women&apos;s fashion — from handcrafted sarees to contemporary co-ord sets, celebrating the modern Indian woman.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link href="/new-arrivals">
            <Button size="lg" className="group px-8 h-14 rounded-full text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
              Shop New Arrivals
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
            </Button>
          </Link>
          <Link href="/categories">
            <Button size="lg" variant="outline" className="px-8 h-14 rounded-full text-base bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all">
              Explore Categories
            </Button>
          </Link>
        </div>

        {/* Stats Glass Panel */}
        <StatsPanel />
      </div>
    </section>
  )
}
