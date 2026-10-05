'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ankita/ui'
import { PageHeader } from '@ankita/ui'
import { api, fetcher } from '@/lib/api'

const MOCK_ROLES = [
  { id: 1, name: 'Product Manager' },
  { id: 2, name: 'Inventory Manager' },
  { id: 3, name: 'Customer Support Executive' },
  { id: 4, name: 'Wholesale Manager' },
  { id: 5, name: 'Order Processing Executive' },
  { id: 6, name: 'Shipping Manager' },
  { id: 7, name: 'Returns & Exchange Manager' },
]

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  
  const { data: rolesData } = useSWR('/admin/roles', fetcher)
  const roles = rolesData?.data?.length > 0 ? rolesData.data : MOCK_ROLES

  const toggleRole = (id: number) => {
    setSelectedRoles(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await api.post('/admin/employees', {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        jobTitle: formData.get('jobTitle'),
        joiningDate: formData.get('joiningDate'),
        salary: Number(formData.get('salary')),
        status: formData.get('status') || 'ACTIVE',
        roleIds: selectedRoles
      })
      router.push('/dashboard/employees')
    } catch (error) {
      console.error(error)
      alert('Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Add New Employee" 
        description="Register a new team member."
      />

      <div className="rounded-md border bg-card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Initial Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input id="joiningDate" name="joiningDate" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary (Optional)</Label>
              <Input id="salary" name="salary" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue="ACTIVE">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign Roles</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal text-left">
                  {selectedRoles.length > 0 
                    ? roles.filter((r: any) => selectedRoles.includes(r.id)).map((r: any) => r.name).join(', ')
                    : 'Select roles...'
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[300px]">
                {roles.map((role: any) => (
                  <DropdownMenuItem 
                    key={role.id} 
                    onSelect={(e) => {
                      e.preventDefault()
                      toggleRole(role.id)
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox 
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <span>{role.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
