'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Input, Badge } from '@ankita/ui'
import { Search } from 'lucide-react'

type InventoryItem = {
  id: number
  name: string
  sku: string
  stock: number
  category?: { name: string }
}

export default function InventoryPage() {
  const { data: products, error, isLoading, mutate } = useSWR<InventoryItem[]>('/admin/products', fetcher)
  const [stockChanges, setStockChanges] = useState<Record<number, number>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const handleStockChange = (id: number, val: string) => {
    const num = parseInt(val, 10)
    setStockChanges((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num,
    }))
  }

  const handleSave = async (item: InventoryItem) => {
    const newStock = stockChanges[item.id] !== undefined ? stockChanges[item.id] : item.stock
    setSavingId(item.id)
    try {
      await api.put(`/admin/products/${item.id}`, { stock: newStock })
      toast.success(`Stock updated for ${item.name} (${newStock})`)
      mutate()
    } catch {
      toast.error('Failed to update stock')
    } finally {
      setSavingId(null)
    }
  }

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels and perform quick stock adjustments.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Quick Stock Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading inventory...
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-destructive">
                  Failed to load inventory data.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No inventory items found.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              !error &&
              filtered.map((item) => {
                const currentVal = stockChanges[item.id] !== undefined ? stockChanges[item.id] : item.stock
                const isDirty = stockChanges[item.id] !== undefined && stockChanges[item.id] !== item.stock

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-semibold">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <span className={item.stock <= 5 ? 'text-destructive font-bold' : 'font-medium'}>
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : item.stock <= 10 ? (
                        <Badge variant="secondary" className="text-amber-600 border-amber-300">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={currentVal}
                          onChange={(e) => handleStockChange(item.id, e.target.value)}
                          className="w-24 h-8 text-right"
                        />
                        <Button
                          size="sm"
                          disabled={savingId === item.id || !isDirty}
                          onClick={() => handleSave(item)}
                        >
                          {savingId === item.id ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

