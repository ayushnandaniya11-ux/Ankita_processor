'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Input } from '@ankita/ui'

const MOCK_INVENTORY = [
  { sku: 'DRS-001-SM', product: 'Floral Summer Dress', variant: 'Small', stock: 12, reorderLevel: 5 },
  { sku: 'DRS-001-MD', product: 'Floral Summer Dress', variant: 'Medium', stock: 4, reorderLevel: 10 },
  { sku: 'DRS-001-LG', product: 'Floral Summer Dress', variant: 'Large', stock: 0, reorderLevel: 5 },
  { sku: 'TOP-042-OS', product: 'Silk Blouse', variant: 'One Size', stock: 45, reorderLevel: 15 },
]

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels and manage variants.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Quick Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_INVENTORY.map((item) => (
              <TableRow key={item.sku}>
                <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                <TableCell className="font-medium">{item.product}</TableCell>
                <TableCell>{item.variant}</TableCell>
                <TableCell>
                  <span className={item.stock <= item.reorderLevel ? 'text-destructive font-bold' : ''}>
                    {item.stock}
                  </span>
                </TableCell>
                <TableCell>
                  {item.stock === 0 ? <span className="text-destructive font-medium">Out of Stock</span> :
                   item.stock <= item.reorderLevel ? <span className="text-orange-500 font-medium">Low Stock</span> :
                   <span className="text-green-600 font-medium">In Stock</span>}
                </TableCell>
                <TableCell className="text-right flex justify-end items-center gap-2">
                  <Input type="number" defaultValue={item.stock} className="w-20 h-8 text-right" />
                  <Button size="sm">Save</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
