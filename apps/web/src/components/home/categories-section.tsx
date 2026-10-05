import Link from 'next/link'

import { Shirt, Scissors, Layers, Sparkles } from 'lucide-react'

const CATEGORIES = [
  { name: 'Sarees', slug: 'sarees', icon: Sparkles, description: 'Handcrafted silk, cotton & designer sarees', color: 'from-pink-500/20 to-rose-500/5' },
  { name: 'Dupattas', slug: 'dupattas', icon: Layers, description: 'Beautifully woven and embroidered dupattas', color: 'from-violet-500/20 to-purple-500/5' },
  { name: 'Scarves', slug: 'scarves', icon: Shirt, description: 'Lightweight & stylish scarves for every occasion', color: 'from-blue-500/20 to-cyan-500/5' },
  { name: 'Dress Material', slug: 'dress-material', icon: Scissors, description: 'Unstitched fabrics and premium dress materials', color: 'from-amber-500/20 to-orange-500/5' },
]

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30 relative">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
      <div className="container-wide relative">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Browse by Category
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Shop All Categories
            </h2>
          </div>
          <Link href="/categories" className="hidden md:inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View All Categories <span className="ml-1 text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${cat.color} p-6 md:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                <cat.icon className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-background shadow-sm border text-primary group-hover:scale-110 transition-transform duration-300">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-xl md:text-2xl mb-2">{cat.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[90%]">{cat.description}</p>
                
                <div className="mt-6 flex items-center text-sm font-bold text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  Explore Collection <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/categories">
            <button className="w-full py-3 rounded-full border border-border font-medium hover:bg-secondary transition-colors">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
