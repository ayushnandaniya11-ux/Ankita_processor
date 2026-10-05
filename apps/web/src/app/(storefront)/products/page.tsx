'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Filter, Star, ChevronDown, Check } from 'lucide-react'
import { Button, Input, Card, CardContent, Checkbox, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ankita/ui'
import { APP_NAME } from '@ankita/config'
import useSWR from 'swr'
import apiClient from '@/lib/api/client'
const fetcher = (url: string) => apiClient.get(url).then(res => res.data)

// Mock data for filter options
const CATEGORIES = [
  'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Beauty', 'Sports'
]

const MOCK_PRODUCTS = [
  { id: 1, name: 'Premium Wireless Headphones', price: 299.99, mrp: 399.99, rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Electronics' },
  { id: 2, name: 'Minimalist Cotton T-Shirt', price: 29.99, mrp: 49.99, rating: 4.5, reviews: 89, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', category: 'Clothing' },
  { id: 3, name: 'Smart Home Security Camera', price: 149.99, mrp: 199.99, rating: 4.2, reviews: 56, image: 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=500&q=80', category: 'Electronics' },
  { id: 4, name: 'Ceramic Coffee Mug Set', price: 34.99, mrp: 45.00, rating: 4.9, reviews: 210, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80', category: 'Home & Kitchen' },
  { id: 5, name: 'Yoga Mat with Alignment Lines', price: 45.00, mrp: 60.00, rating: 4.6, reviews: 34, image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&q=80', category: 'Sports' },
  { id: 6, name: 'Hydrating Face Serum', price: 55.00, mrp: 75.00, rating: 4.7, reviews: 423, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80', category: 'Beauty' },
]

export default function CatalogPage() {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Attempt to fetch from API, fallback to mock data
  const { data: apiProducts } = useSWR('/products', fetcher)
  
  // Transform API data if available, otherwise use mock
  const products = apiProducts?.data?.length > 0 
    ? apiProducts.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.sellingPrice,
        mrp: p.mrp,
        rating: 4.5, // Mock rating for now
        reviews: Math.floor(Math.random() * 200) + 10,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', // Fallback image
        category: 'Uncategorized'
      }))
    : MOCK_PRODUCTS

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Catalogues</h1>
          <p className="text-muted-foreground mt-1">Discover our latest collection of premium products</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select defaultValue="popular">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg pb-4 border-b">
              <Filter className="w-5 h-5" />
              Filters
            </div>
            
            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-medium">Categories</h3>
              <div className="space-y-3">
                {CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${category}`} 
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label 
                      htmlFor={`cat-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
              <h3 className="font-medium">Price Range</h3>
              <div className="flex flex-col gap-2 my-6">
                <input 
                  type="range" 
                  min="0" max="1000" step="10" 
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-primary" 
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input value={`$${priceRange[0]}`} readOnly className="h-8 text-sm" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input value={`$${priceRange[1]}`} readOnly className="h-8 text-sm" />
                </div>
              </div>
            </div>

            <div className="border-t pt-4"></div>

            {/* Ratings */}
            <div className="space-y-4">
              <h3 className="font-medium">Customer Ratings</h3>
              {[4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating}`} />
                  <label htmlFor={`rating-${rating}`} className="flex items-center text-sm cursor-pointer">
                    <div className="flex mr-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    & Up
                  </label>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4">Apply Filters</Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group">
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-muted">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.mrp > product.price && (
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                      Sale {Math.round((1 - product.price / product.mrp) * 100)}%
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{product.category}</div>
                  <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Reviews & Ratings */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="font-medium text-sm">{product.rating}</span>
                    <span className="text-muted-foreground text-xs">({product.reviews} reviews)</span>
                  </div>

                  <div className="flex items-end gap-2 pt-2">
                    <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                    {product.mrp > product.price && (
                      <span className="text-sm text-muted-foreground line-through mb-0.5">
                        ${product.mrp.toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
