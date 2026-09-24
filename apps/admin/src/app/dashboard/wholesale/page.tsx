'use client'

import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'

type User = {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  createdAt: string
}

export default function WholesalePage() {
  const { data: users, error, mutate } = useSWR<User[]>('/admin/users', fetcher)

  const handleApprove = async (id: number) => {
    // Mock approval process (would normally update status or roles)
    toast.success('Wholesale account approved!')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to reject/delete this wholesale account?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('Account rejected successfully')
      mutate()
    } catch (err: any) {
      toast.error('Failed to reject account')
    }
  }

  if (error) return <div>Failed to load accounts</div>
  if (!users) return <div>Loading...</div>

  // Filter only wholesale customers
  const accounts = users.filter((u) => u.role === 'WHOLESALE')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wholesale Accounts</h1>
          <p className="text-muted-foreground">Manage and approve B2B wholesale applications.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono text-muted-foreground">#{account.id}</TableCell>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.phone || '-'}</TableCell>
                <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Pending Approval</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="default" size="sm" onClick={() => handleApprove(account.id)}>Approve</Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive" onClick={() => handleDelete(account.id)}>Reject</Button>
                </TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No wholesale accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
