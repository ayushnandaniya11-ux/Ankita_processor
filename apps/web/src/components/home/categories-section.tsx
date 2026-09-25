import Link from 'next/link'

const CATEGORIES = [
  { name: 'Sarees', slug: 'sarees', emoji: '🥻', description: 'Handcrafted silk, cotton & designer sarees' },
  { name: 'Dupattas', slug: 'dupattas', emoji: '🧣', description: 'Beautifully woven and embroidered dupattas' },
  { name: 'Scarves', slug: 'scarves', emoji: '🧶', description: 'Lightweight & stylish scarves for every occasion' },
  { name: 'Dress Material', slug: 'dress-material', emoji: '🧵', description: 'Unstitched fabrics and premium dress materials' },
]

export function CategoriesSection() {
  return (
    <section className="section-py">
      <div className="container-wide">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Browse by Category
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Shop All Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
            >
              <div className="mb-3 text-3xl">{cat.emoji}</div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">{cat.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
              <div className="mt-3 text-xs font-medium text-foreground/60 group-hover:text-foreground transition-colors">
                Explore →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
