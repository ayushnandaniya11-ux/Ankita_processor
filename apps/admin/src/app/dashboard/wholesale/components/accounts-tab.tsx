'use client'

import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'

export function AccountsTab() {
  const { data: profiles, error, mutate } = useSWR('/admin/wholesale/accounts', fetcher)

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/wholesale/accounts/${id}/status`, { approvalStatus: status })
      toast.success(`Account marked as ${status}`)
      mutate()
    } catch (err: any) {
      toast.error('Failed to update account status')
    }
  }

  if (error) return <div>Failed to load accounts</div>
  if (!profiles) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile: any) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.companyName}</TableCell>
                <TableCell>{profile.user?.name}</TableCell>
                <TableCell className="font-mono text-xs">{profile.gstin}</TableCell>
                <TableCell>{profile.user?.email}</TableCell>
                <TableCell>{new Date(profile.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={
                    profile.approvalStatus === 'APPROVED' ? 'default' :
                    profile.approvalStatus === 'PENDING' ? 'outline' :
                    'destructive'
                  }>
                    {profile.approvalStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  {profile.approvalStatus === 'PENDING' && (
                    <>
                      <Button variant="default" size="sm" onClick={() => handleUpdateStatus(profile.id, 'APPROVED')}>Approve</Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive" onClick={() => handleUpdateStatus(profile.id, 'REJECTED')}>Reject</Button>
                    </>
                  )}
                  {profile.approvalStatus === 'APPROVED' && (
                    <Button variant="outline" size="sm" className="text-destructive border-destructive" onClick={() => handleUpdateStatus(profile.id, 'SUSPENDED')}>Suspend</Button>
                  )}
                  {(profile.approvalStatus === 'REJECTED' || profile.approvalStatus === 'SUSPENDED') && (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(profile.id, 'APPROVED')}>Re-Approve</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {profiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No wholesale applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
