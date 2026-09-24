'use client'

import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from '@ankita/ui'
import { Trash2 } from 'lucide-react'

type User = {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  createdAt: string
}

export default function CustomersPage() {
  const { data: users, error, mutate } = useSWR<User[]>('/admin/users', fetcher)

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('Customer deleted successfully')
      mutate()
    } catch (err: any) {
      toast.error('Failed to delete customer')
    }
  }

  if (error) return <div>Failed to load customers</div>
  if (!users) return <div>Loading...</div>

  // Filter only customers
  const customers = users.filter((u) => u.role === 'CUSTOMER')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your retail customers and view their history.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-mono text-muted-foreground">#{customer.id}</TableCell>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || '-'}</TableCell>
                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(customer.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
