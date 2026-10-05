'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Shield } from 'lucide-react'
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Checkbox } from '@ankita/ui'
import { PageHeader } from '@ankita/ui'
import { fetcher, api } from '@/lib/api'
import { useRouter } from 'next/navigation'

const MOCK_ROLES = [
  { id: 1, name: 'Product Manager', description: 'Manages product listings, images, and categories.', permissions: [1, 2, 3] },
  { id: 2, name: 'Inventory Manager', description: 'Handles stock tracking and adjustments.', permissions: [1, 2] },
  { id: 3, name: 'Customer Support Executive', description: 'Handles customer queries and tickets.', permissions: [1, 2] },
  { id: 4, name: 'Wholesale Manager', description: 'Manages wholesale accounts and pricing.', permissions: [1] },
  { id: 5, name: 'Order Processing Executive', description: 'Processes and packs orders.', permissions: [1, 2, 3] },
  { id: 6, name: 'Shipping Manager', description: 'Manages shipping details and tracking.', permissions: [1, 2] },
  { id: 7, name: 'Returns & Exchange Manager', description: 'Handles returns and refunds.', permissions: [1] },
]

export default function RolesPage() {
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR('/admin/roles', fetcher)
  const { data: permissionsData } = useSWR('/admin/roles/permissions', fetcher)
  
  const roles = data?.data?.length > 0 ? data.data : MOCK_ROLES
  const permissions = permissionsData?.data || []

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roleName, setRoleName] = useState('')
  const [roleDesc, setRoleDesc] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<number[]>([])

  const togglePerm = (id: number) => {
    setSelectedPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/roles', {
        name: roleName,
        description: roleDesc,
        permissionIds: selectedPerms
      })
      await mutate()
      setOpen(false)
      setRoleName('')
      setRoleDesc('')
      setSelectedPerms([])
    } catch (err) {
      console.error(err)
      alert('Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Roles & Permissions" 
        description="Manage access levels and permissions for your team."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Custom Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input required value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. Marketing Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={roleDesc} onChange={e => setRoleDesc(e.target.value)} placeholder="Brief description of this role" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Permissions</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-4 border rounded-md bg-muted/20">
                      {permissions.map((perm: any) => (
                        <div key={perm.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={`perm-${perm.id}`} 
                            checked={selectedPerms.includes(perm.id)}
                            onCheckedChange={() => togglePerm(perm.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={`perm-${perm.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {perm.action}
                            </label>
                            <p className="text-[11px] text-muted-foreground line-clamp-1" title={perm.description}>
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Role'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No roles found.</TableCell>
              </TableRow>
            ) : (
              roles.map((role: any) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissions?.length || 0} permissions</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
