'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ankita/ui'
import { Plus, Trash2 } from 'lucide-react'

type Coupon = {
  id: number
  code: string
  discount: string
  type: string
  usage: number
  maxUsage: string
  status: string
}

export default function CouponsPage() {
  const { data: coupons, error, mutate } = useSWR<Coupon[]>('/admin/coupons', fetcher)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ code: '', discount: '', type: 'Percentage', maxUsage: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/coupons', formData)
      toast.success('Coupon created successfully')
      setFormData({ code: '', discount: '', type: 'Percentage', maxUsage: '' })
      setShowForm(false)
      mutate()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      await api.delete(`/admin/coupons/${id}`)
      toast.success('Coupon deleted successfully')
      mutate()
    } catch (err: any) {
      toast.error('Failed to delete coupon')
    }
  }

  if (error) return <div>Failed to load coupons</div>
  if (!coupons) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons & Discounts</h1>
          <p className="text-muted-foreground">Create and manage promotional discount codes.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Create Coupon'}
        </Button>
      </div>

      {showForm && (
        <div className="p-4 border rounded-lg bg-card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required placeholder="e.g. SUMMER10" />
              </div>
              <div>
                <label className="text-sm font-medium">Discount</label>
                <Input value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} required placeholder="e.g. 10%" />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount</SelectItem>
                    <SelectItem value="Shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Limit (optional)</label>
                <Input value={formData.maxUsage} onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })} placeholder="e.g. 100" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>Save Coupon</Button>
            </div>
          </form>
        </div>
      )}

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                <TableCell>{coupon.discount}</TableCell>
                <TableCell>{coupon.type}</TableCell>
                <TableCell>{coupon.usage}</TableCell>
                <TableCell>{coupon.maxUsage}</TableCell>
                <TableCell>
                  <Badge variant={coupon.status === 'Active' ? 'default' : 'secondary'}>
                    {coupon.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
