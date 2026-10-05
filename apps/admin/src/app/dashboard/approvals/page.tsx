'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { PageHeader, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Textarea } from '@ankita/ui'
import { CheckCircle2, Clock, XCircle, Eye } from 'lucide-react'
import { fetcher, api } from '@/lib/api'
import { toast } from 'sonner'

export default function ApprovalsPage() {
  const { data: response, isLoading, mutate } = useSWR('/admin/approval-requests', fetcher)
  const requests = response?.data || []

  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleApprove = async (id: number) => {
    setProcessing(true)
    try {
      await api.post(`/admin/approval-requests/${id}/approve`)
      toast.success('Request approved successfully. Changes applied to database.')
      setSelectedRequest(null)
      mutate()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to approve request')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (id: number) => {
    if (!rejectReason) {
      toast.error('You must provide a rejection reason.')
      return
    }
    setProcessing(true)
    try {
      await api.post(`/admin/approval-requests/${id}/reject`, { rejectionReason: rejectReason })
      toast.success('Request rejected.')
      setSelectedRequest(null)
      setIsRejecting(false)
      setRejectReason('')
      mutate()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to reject request')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>
      case 'REJECTED': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
      default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Approvals"
        description="Review and authorize changes proposed by employees before they affect the live database."
      />

      <div className="bg-card rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Req ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Loading requests...</TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No approval requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">#{req.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{req.employee?.user?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">{req.employee?.jobTitle || 'Employee'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{req.actionType}</Badge>
                  </TableCell>
                  <TableCell>
                    {req.entityType} {req.entityId && <span className="text-muted-foreground">({req.entityId})</span>}
                  </TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>
                      <Eye className="w-4 h-4 mr-2" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => {
        if (!open) {
          setSelectedRequest(null)
          setIsRejecting(false)
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Change Request #{selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              Requested by {selectedRequest?.employee?.user?.name} on {selectedRequest && new Date(selectedRequest.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 my-4">
              <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Action</p>
                  <p className="font-medium">{selectedRequest.actionType}</p>
                </div>
                <div className="border-l pl-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Entity</p>
                  <p className="font-medium">{selectedRequest.entityType} {selectedRequest.entityId ? `#${selectedRequest.entityId}` : ''}</p>
                </div>
                <div className="border-l pl-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reason</p>
                  <p className="font-medium text-sm">{selectedRequest.reason || 'No reason provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Original Data (Current)</h4>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px] border border-destructive/20 font-mono">
                    {Object.keys(selectedRequest.originalData || {}).length > 0
                      ? JSON.stringify(selectedRequest.originalData, null, 2)
                      : 'N/A (New Record)'}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Proposed Data (New)</h4>
                  <pre className="bg-primary/5 p-4 rounded-md text-xs overflow-auto max-h-[300px] border border-green-500/20 font-mono">
                    {JSON.stringify(selectedRequest.proposedData, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedRequest.status !== 'PENDING' && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="font-semibold text-sm">Decision: {getStatusBadge(selectedRequest.status)}</p>
                  {selectedRequest.rejectionReason && (
                    <p className="text-sm mt-2 text-destructive">Reason: {selectedRequest.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between border-t pt-4">
            <Button variant="outline" onClick={() => {
              setSelectedRequest(null)
              setIsRejecting(false)
            }}>Close</Button>

            {selectedRequest?.status === 'PENDING' && (
              <div className="flex gap-2 w-full justify-end">
                {isRejecting ? (
                  <div className="flex gap-2 items-center w-full max-w-sm">
                    <Textarea
                      placeholder="Reason for rejection..."
                      className="h-10 min-h-10 resize-none"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => handleReject(selectedRequest.id)} disabled={processing || !rejectReason}>
                      Confirm Reject
                    </Button>
                    <Button variant="ghost" onClick={() => setIsRejecting(false)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <Button variant="destructive" onClick={() => setIsRejecting(true)} disabled={processing}>Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(selectedRequest.id)} disabled={processing}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Apply
                    </Button>
                  </>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
