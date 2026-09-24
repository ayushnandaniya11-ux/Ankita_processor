'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ankita/ui'
import Link from 'next/link'

export default function AddProductPage() {
  const router = useRouter()
  const { data: categories } = useSWR<any[]>('/admin/categories', fetcher)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    sku: '', 
    description: '',
    mrp: '', 
    sellingPrice: '', 
    stock: '', 
    categoryId: '' 
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const payload = {
      ...formData,
      mrp: Number(formData.mrp),
      sellingPrice: Number(formData.sellingPrice),
      stock: Number(formData.stock),
      categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
    }

    try {
      await api.post('/admin/products', payload)
      toast.success('Product created successfully')
      router.push('/dashboard/products')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product in your catalog.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/products">Cancel</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-card">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name *</label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              required 
              placeholder="e.g. Floral Summer Dress"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug *</label>
            <Input 
              value={formData.slug} 
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
              required 
              placeholder="e.g. floral-summer-dress"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">SKU *</label>
            <Input 
              value={formData.sku} 
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
              required 
              placeholder="e.g. DRESS-001"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows={4}
              placeholder="Describe the product..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-lg bg-card">
          <div className="space-y-2">
            <label className="text-sm font-medium">MRP (₹) *</label>
            <Input 
              type="number" min="0" step="0.01" 
              value={formData.mrp} 
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Selling Price (₹) *</label>
            <Input 
              type="number" min="0" step="0.01" 
              value={formData.sellingPrice} 
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Stock *</label>
            <Input 
              type="number" min="0" 
              value={formData.stock} 
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
              required 
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
             <Link href="/dashboard/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
