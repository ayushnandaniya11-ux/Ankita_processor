'use client'

import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ankita/ui'
import Link from 'next/link'

type Product = {
  id: number
  categoryId: number | null
  name: string
  slug: string
  sku: string
  mrp: number
  sellingPrice: number
  stock: number
  isPublished: boolean
  category?: { name: string }
}

export default function ProductsPage() {
  const { data: products, error, mutate } = useSWR<Product[]>('/admin/products', fetcher)

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

  if (error) return <div>Failed to load products</div>
  if (!products) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your inventory and product catalog here.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">Add Product</Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell className="font-mono text-xs">{prod.sku}</TableCell>
                <TableCell className="font-medium">{prod.name}</TableCell>
                <TableCell>{prod.category?.name || '-'}</TableCell>
                <TableCell>₹{prod.sellingPrice}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/products/${prod.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(prod.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No products found in inventory.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
