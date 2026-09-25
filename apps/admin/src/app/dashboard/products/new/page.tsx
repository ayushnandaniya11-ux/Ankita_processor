'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ankita/ui'
import Link from 'next/link'
import { X, UploadCloud } from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()
  const { data: categories } = useSWR<any[]>('/admin/categories', fetcher)
  
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
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
  
  const [sareeFields, setSareeFields] = useState({
    size: '', gstRate: '', hsnCode: '', weight: '', blouse: '', border: '', 
    color: '', genericName: '', netQuantity: '', pattern: '', fabric: '', 
    transparency: '', type: '', blouseFabric: '', blouseColor: '', 
    blousePattern: '', palluDetail: '', occasion: '', borderWidth: '', loomType: ''
  })

  const selectedCategory = categories?.find(c => String(c.id) === formData.categoryId)
  const isSareeCategory = selectedCategory?.name.toLowerCase().includes('saree')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages((prev) => [...prev, ...files])
      
      const newUrls = files.map(f => URL.createObjectURL(f))
      setPreviewUrls((prev) => [...prev, ...newUrls])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const payload = new FormData()
    payload.append('name', formData.name)
    payload.append('slug', formData.slug)
    payload.append('sku', formData.sku)
    payload.append('description', formData.description)
    payload.append('mrp', String(formData.mrp))
    payload.append('sellingPrice', String(formData.sellingPrice))
    payload.append('stock', String(formData.stock))
    if (formData.categoryId) payload.append('categoryId', String(formData.categoryId))
    
    images.forEach(img => {
      payload.append('images[]', img)
    })

    if (isSareeCategory) {
      payload.append('sareeData', JSON.stringify(sareeFields))
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

        <div className="p-6 border rounded-lg bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-base font-medium">Product Images</label>
              <p className="text-sm text-muted-foreground">Upload multiple photos for this product</p>
            </div>
            <div>
              <Input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange} 
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent text-sm font-medium transition-colors">
                  <UploadCloud className="h-4 w-4" />
                  Add Photos
                </div>
              </label>
            </div>
          </div>
          
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {previewUrls.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-muted-foreground">
              <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
              <p>No images selected</p>
            </div>
          )}
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

        {isSareeCategory && (
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <div>
              <label className="text-base font-medium">Saree Attributes</label>
              <p className="text-sm text-muted-foreground">Specific details required for Saree products</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.keys(sareeFields).map(key => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <Input 
                    value={(sareeFields as any)[key]} 
                    onChange={(e) => setSareeFields({ ...sareeFields, [key]: e.target.value })} 
                    placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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
