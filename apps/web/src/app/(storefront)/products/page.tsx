'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Filter, Star } from 'lucide-react'
import { Button, Input, Card, CardContent, Checkbox, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ankita/ui'
import useSWR from 'swr'
import apiClient from '@/lib/api/client'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'

const fetcher = (url: string) => apiClient.get(url).then(res => res.data)

const ETHNIC_CATEGORIES = [
  'Sarees', 'Dupattas', 'Scarves', 'Dress Material'
]

type CatalogItem = {
  id: string
  name: string
  slug: string
  price: number
  mrp: number
  rating: number
  reviews: number
  image: string
  category: string
}

export default function CatalogPage() {
  const [maxPrice, setMaxPrice] = useState(10000)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('popular')

  // Fetch live products and categories from API
  const { data: apiProducts } = useSWR('/products', fetcher, { revalidateOnFocus: true })
  const { data: apiCategories } = useSWR('/categories', fetcher)

  const dynamicCategories: string[] = Array.isArray(apiCategories) && apiCategories.length > 0
    ? Array.from(new Set([...apiCategories.map((c: any) => c.name), ...ETHNIC_CATEGORIES]))
    : ETHNIC_CATEGORIES

  const rawList = Array.isArray(apiProducts)
    ? apiProducts
    : Array.isArray(apiProducts?.data)
    ? apiProducts.data
    : []

  const formattedApiProducts: CatalogItem[] = rawList
    .filter((p: any) => p.isPublished !== false)
    .map((p: any) => {
      const primaryImg = p.imageUrl || (Array.isArray(p.images) ? (p.images.find((img: any) => img.isPrimary)?.url || p.images[0]?.url) : null)
      return {
        id: String(p.id),
        name: p.name,
        slug: p.slug || String(p.id),
        price: Number(p.sellingPrice) || 0,
        mrp: Number(p.mrp) || Number(p.sellingPrice) || 0,
        rating: 4.8,
        reviews: 24,
        image: resolveImageUrl(primaryImg),
        category: p.category?.name || 'Sarees',
      }
    })

  const baseProducts: CatalogItem[] = formattedApiProducts.length > 0
    ? formattedApiProducts
    : (apiProducts === undefined
        ? MOCK_PRODUCTS.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.sellingPrice,
            mrp: p.mrp,
            rating: p.avgRating,
            reviews: p.totalReviews,
            image: p.images[0]?.url || '',
            category: p.category?.name || 'Sarees',
          }))
        : [])

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  // Filter products
  const filteredProducts = baseProducts.filter((product: CatalogItem) => {
    if (selectedCategories.length > 0) {
      const match = selectedCategories.some(
        c => c.toLowerCase() === product.category.toLowerCase()
      )
      if (!match) return false
    }
    if (product.price > maxPrice) {
      return false
    }
    return true
  })

  // Sort
  if (sortBy === 'price_low') {
    filteredProducts.sort((a: CatalogItem, b: CatalogItem) => a.price - b.price)
  } else if (sortBy === 'price_high') {
    filteredProducts.sort((a: CatalogItem, b: CatalogItem) => b.price - a.price)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Women&apos;s Ethnic Collection</h1>
          <p className="text-muted-foreground mt-1">Discover handcrafted sarees, dupattas, scarves, and dress materials.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select defaultValue="popular" onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg pb-4 border-b">
              <Filter className="w-5 h-5 text-primary" />
              Filters
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Categories</h3>
              <div className="space-y-3">
                {dynamicCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${category}`} 
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label 
                      htmlFor={`cat-${category}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4"></div>

            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">Max Price</h3>
                <span className="text-xs font-bold text-primary">{formatCurrency(maxPrice)}</span>
              </div>
              <input 
                type="range" 
                min="400" max="8000" step="100" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-primary" 
              />
              <div className="flex items-center justify-between gap-4">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input value="₹0" readOnly className="h-8 text-xs" />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input value={formatCurrency(maxPrice)} readOnly className="h-8 text-xs font-semibold" />
                </div>
              </div>
            </div>

            {selectedCategories.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setSelectedCategories([])}
              >
                Clear Category Filters
              </Button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center border rounded-2xl border-dashed">
              <p className="text-muted-foreground text-sm">No products found matching your filter criteria.</p>
              <Button variant="link" onClick={() => { setSelectedCategories([]); setMaxPrice(6000) }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.id} className="group">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-muted">
                    <div className="aspect-[3/4] overflow-hidden bg-muted relative flex items-center justify-center">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl">🛍️</div>
                      )}
                      {product.mrp > product.price && (
                        <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded">
                          {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% Off
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="text-xs text-primary font-medium uppercase tracking-wider">{product.category}</div>
                      <h3 className="font-semibold text-base line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Reviews & Ratings */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-medium text-xs">{product.rating}</span>
                        <span className="text-muted-foreground text-xs">({product.reviews})</span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.mrp)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
