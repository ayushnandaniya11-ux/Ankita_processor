'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ankita/ui'

type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
}

export default function CategoriesPage() {
  const { data: categories, error, mutate } = useSWR<Category[]>('/admin/categories', fetcher)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, formData)
        toast.success('Category updated successfully')
      } else {
        await api.post('/admin/categories', formData)
        toast.success('Category created successfully')
      }
      setFormData({ name: '', slug: '', description: '' })
      setEditingId(null)
      mutate()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      toast.success('Category deleted successfully')
      mutate()
    } catch (err: any) {
      toast.error('Failed to delete category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
  }

  if (error) return <div>Failed to load categories</div>
  if (!categories) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage your product categories here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg p-4 bg-card">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData({ name: '', slug: '', description: '' }) }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="md:col-span-2 border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.id}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(cat)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No categories found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
