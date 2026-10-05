'use client'

import useSWR from 'swr'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@ankita/ui'
import { PageHeader } from '@ankita/ui'
import { fetcher } from '@/lib/api'

export default function ActivityLogsPage() {
  const { data, isLoading } = useSWR('/admin/activity-logs', fetcher)
  const logs = data?.data?.data || [] // Assuming pagination format

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Activity Logs" 
        description="Monitor system-wide employee actions and audit trails."
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">No activity logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.user?.email || `User ID: ${log.userId}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.module}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={log.description}>
                    {log.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.ipAddress || 'Unknown'}
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
