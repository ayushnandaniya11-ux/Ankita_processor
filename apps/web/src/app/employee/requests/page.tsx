'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@ankita/ui'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'

const fetcher = (url: string) => apiClient.get(url).then(res => res.data.data)

export default function MyRequestsPage() {
  const { data: requests, isLoading, mutate } = useSWR('/admin/approval-requests', fetcher)
  
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [actionType, setActionType] = useState('UPDATE')
  const [entityType, setEntityType] = useState('PRODUCT')
  const [entityId, setEntityId] = useState('')
  const [reason, setReason] = useState('')
  const [proposedData, setProposedData] = useState('{\n  "price": 19.99\n}')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiClient.post('/admin/approval-requests', {
        actionType,
        entityType,
        entityId: entityId || undefined,
        reason,
        proposedData: JSON.parse(proposedData)
      })
      toast.success('Approval request submitted successfully!')
      setOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit request. Check JSON format.')
    } finally {
      setSubmitting(false)
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Approval Requests</h2>
          <p className="text-muted-foreground mt-1">Submit and track database change requests pending admin approval.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Change Request</DialogTitle>
              <DialogDescription>
                Propose a change to the production database. An admin must approve it before it takes effect.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select value={actionType} onValueChange={setActionType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CREATE">CREATE</SelectItem>
                      <SelectItem value="UPDATE">UPDATE</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Entity</Label>
                  <Select value={entityType} onValueChange={setEntityType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCT">PRODUCT</SelectItem>
                      <SelectItem value="INVENTORY">INVENTORY</SelectItem>
                      <SelectItem value="ORDER">ORDER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Entity ID (Target ID)</Label>
                <Input placeholder="e.g. 1" value={entityId} onChange={e => setEntityId(e.target.value)} required={actionType !== 'CREATE'} />
              </div>

              <div className="space-y-2">
                <Label>Proposed Data (JSON Format)</Label>
                <Textarea 
                  className="font-mono text-sm h-32" 
                  value={proposedData} 
                  onChange={e => setProposedData(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Reason for Change</Label>
                <Input placeholder="Why is this change necessary?" value={reason} onChange={e => setReason(e.target.value)} required />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading requests...</TableCell>
              </TableRow>
            ) : !requests || requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No approval requests submitted yet.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">#{req.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{req.actionType}</Badge>
                  </TableCell>
                  <TableCell>
                    {req.entityType} {req.entityId && <span className="text-muted-foreground">({req.entityId})</span>}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(req.status)}
                    {req.status === 'REJECTED' && req.rejectionReason && (
                      <p className="text-xs text-destructive mt-1 truncate max-w-[200px]">Reason: {req.rejectionReason}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleString()}
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
