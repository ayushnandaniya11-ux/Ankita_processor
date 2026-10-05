'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, MoreHorizontal, Edit, Trash, Shield } from 'lucide-react'
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Badge } from '@ankita/ui'
import { PageHeader } from '@ankita/ui'
import { fetcher, api } from '@/lib/api'
import Link from 'next/link'

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading, mutate } = useSWR('/admin/employees', fetcher)

  const employees = data?.data?.data || [] // Assuming pagination format

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'
      case 'INACTIVE': return 'secondary'
      case 'SUSPENDED': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Employees" 
        description="Manage your team members and their roles."
        actions={
          <Button asChild>
            <Link href="/dashboard/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[150px] lg:w-[250px]"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">No employees found.</TableCell>
              </TableRow>
            ) : (
              employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{employee.user?.name}</span>
                      <span className="text-xs text-muted-foreground">{employee.user?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.employeeIdCode}</TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(employee.status)}>{employee.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {employee.roles?.map((role: any) => (
                        <Badge key={role.id} variant="outline" className="text-[10px]">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/employees/${employee.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
