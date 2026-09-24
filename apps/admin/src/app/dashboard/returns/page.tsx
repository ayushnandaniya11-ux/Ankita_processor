'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'
import { FileText, CheckCircle2, XCircle } from 'lucide-react'

const MOCK_RETURNS = [
  { id: 'RET-091', orderId: 'ORD-7390', customer: 'Priya Patel', reason: 'Size too small', status: 'Pending', requestedOn: '2026-09-24' },
  { id: 'RET-090', orderId: 'ORD-7388', customer: 'Samantha Smith', reason: 'Defective item', status: 'Approved', requestedOn: '2026-09-23' },
  { id: 'RET-089', orderId: 'ORD-7350', customer: 'Neha Gupta', reason: 'Changed mind', status: 'Rejected', requestedOn: '2026-09-20' },
]

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Returns & Refunds</h1>
          <p className="text-muted-foreground">Manage customer return requests and issue refunds.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Return ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_RETURNS.map((ret) => (
              <TableRow key={ret.id}>
                <TableCell className="font-mono">{ret.id}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{ret.orderId}</TableCell>
                <TableCell className="font-medium">{ret.customer}</TableCell>
                <TableCell>{ret.reason}</TableCell>
                <TableCell>{ret.requestedOn}</TableCell>
                <TableCell>
                  <Badge variant={ret.status === 'Approved' ? 'default' : ret.status === 'Rejected' ? 'destructive' : 'secondary'}>
                    {ret.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {ret.status === 'Pending' && (
                    <>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
