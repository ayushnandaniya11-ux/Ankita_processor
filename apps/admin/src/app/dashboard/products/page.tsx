'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { 
  Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label, Textarea, Checkbox 
} from '@ankita/ui'
import Link from 'next/link'
import { Eye, EyeOff, Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import { resolveImageUrl } from '@ankita/utils'

type Product = {
  id: number
  categoryId: number | null
  name: string
  slug: string
  sku: string
  description?: string
  mrp: number
  sellingPrice: number
  stock: number
  isPublished: boolean
  imageUrl?: string | null
  images?: Array<{ url: string }>
  category?: { id: number; name: string }
}

export default function ProductsPage() {
  const { data: products, error, mutate } = useSWR<Product[]>('/admin/products', fetcher)
  const { data: categories } = useSWR<any[]>('/admin/categories', fetcher)

  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    mrp: '',
    sellingPrice: '',
    stock: '',
    categoryId: '',
    isPublished: false,
    imageUrl: '',
    imagesText: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  const handleTogglePublish = async (prod: Product) => {
    try {
      await api.patch(`/admin/products/${prod.id}/toggle-publish`)
      toast.success(
        prod.isPublished 
          ? `"${prod.name}" moved to Draft (hidden from Main Store)` 
          : `"${prod.name}" Published to Main Store!`
      )
      mutate()
    } catch (err: any) {
      toast.error('Failed to update product visibility')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted successfully')
      mutate()
    } catch (err: any) {
      toast.error('Failed to delete product')
    }
  }

  const openEditDialog = (prod: Product) => {
    setEditProduct(prod)
    const existingUrls = (prod.images && prod.images.length > 0)
      ? prod.images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
      : (prod.imageUrl ? [prod.imageUrl] : [])

    setEditForm({
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      description: prod.description || '',
      mrp: String(prod.mrp),
      sellingPrice: String(prod.sellingPrice),
      stock: String(prod.stock),
      categoryId: prod.categoryId ? String(prod.categoryId) : '',
      isPublished: Boolean(prod.isPublished),
      imageUrl: prod.imageUrl || prod.images?.[0]?.url || '',
      imagesText: existingUrls.join('\n'),
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProduct) return
    setSavingEdit(true)

    const rawUrls = editForm.imagesText
      .split('\n')
      .map(url => url.trim())
      .filter(Boolean)

    if (editForm.imageUrl && editForm.imageUrl.trim() && !rawUrls.includes(editForm.imageUrl.trim())) {
      rawUrls.unshift(editForm.imageUrl.trim())
    }

    const primaryTarget = editForm.imageUrl?.trim() || rawUrls[0] || null

    const parsedImages = rawUrls.map((url, idx) => ({
      id: String(idx + 1),
      url,
      sortOrder: idx,
      isPrimary: primaryTarget ? url === primaryTarget : idx === 0,
    }))

    try {
      await api.put(`/admin/products/${editProduct.id}`, {
        name: editForm.name,
        slug: editForm.slug,
        sku: editForm.sku,
        description: editForm.description,
        mrp: Number(editForm.mrp),
        sellingPrice: Number(editForm.sellingPrice),
        stock: Number(editForm.stock),
        categoryId: editForm.categoryId ? Number(editForm.categoryId) : null,
        isPublished: editForm.isPublished,
        imageUrl: primaryTarget || parsedImages[0]?.url || null,
        images: parsedImages.length > 0 ? parsedImages : undefined,
      })
      toast.success('Product updated successfully')
      mutate()
      setEditProduct(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update product')
    } finally {
      setSavingEdit(false)
    }
  }

  if (error) return <div className="p-8 text-center text-destructive">Failed to load products</div>
  if (!products) return <div className="p-8 text-center text-muted-foreground">Loading products...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-muted-foreground">Manage your product catalog, publishing status, and storefront inventory.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status (Storefront)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod) => {
              const imageSrc = resolveImageUrl(prod.imageUrl || prod.images?.[0]?.url)
              return (
                <TableRow key={prod.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                      {imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageSrc}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{prod.sku}</TableCell>
                  <TableCell className="font-medium max-w-xs truncate" title={prod.name}>
                    {prod.name}
                  </TableCell>
                  <TableCell>{prod.category?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="font-semibold">₹{prod.sellingPrice}</div>
                    {prod.mrp > prod.sellingPrice && (
                      <div className="text-xs text-muted-foreground line-through">₹{prod.mrp}</div>
                    )}
                  </TableCell>
                  <TableCell>{prod.stock}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleTogglePublish(prod)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      title={prod.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                    >
                      {prod.isPublished ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 py-0.5">
                          <Eye className="h-3 w-3" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 py-0.5">
                          <EyeOff className="h-3 w-3" /> Draft
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(prod)}
                      title="Edit Product"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10" 
                      onClick={() => handleDelete(prod.id)}
                      title="Delete Product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No products found in catalog. Click &ldquo;Add Product&rdquo; to create your first product.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={Boolean(editProduct)} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle>Edit Product Catalog Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input 
                  required 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input 
                    required 
                    value={editForm.slug} 
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input 
                    required 
                    value={editForm.sku} 
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Selling Price (₹)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    required 
                    value={editForm.sellingPrice} 
                    onChange={(e) => setEditForm({ ...editForm, sellingPrice: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>MRP (₹)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    required 
                    value={editForm.mrp} 
                    onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    required 
                    value={editForm.stock} 
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editForm.categoryId} 
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Primary Image URL</Label>
                <Input 
                  placeholder="https://... or /uploads/products/..."
                  value={editForm.imageUrl} 
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label>All Product Images (Gallery, one URL per line)</Label>
                <Textarea 
                  rows={3} 
                  placeholder="https://image-1.jpg&#10;https://image-2.jpg&#10;/uploads/products/image-3.jpg"
                  value={editForm.imagesText} 
                  onChange={(e) => setEditForm({ ...editForm, imagesText: e.target.value })} 
                />
                <p className="text-xs text-muted-foreground">
                  The first image in the list will be treated as the primary storefront image.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  rows={3} 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                />
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-publish" 
                    checked={editForm.isPublished} 
                    onCheckedChange={(checked) => setEditForm({ ...editForm, isPublished: Boolean(checked) })} 
                  />
                  <Label htmlFor="edit-publish" className="text-sm font-semibold cursor-pointer">
                    Visible on Live Customer Storefront
                  </Label>
                </div>
                <Badge variant={editForm.isPublished ? 'default' : 'secondary'}>
                  {editForm.isPublished ? 'Live on Store' : 'Draft Only'}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
