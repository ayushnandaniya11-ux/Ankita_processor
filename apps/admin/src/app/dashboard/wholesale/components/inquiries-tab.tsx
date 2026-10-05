'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@ankita/ui'

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'New': 'default',
    'Under Review': 'secondary',
    'Contacted': 'secondary',
    'Quotation Sent': 'outline',
    'In Negotiation': 'outline',
    'Approved': 'default',
    'Rejected': 'destructive',
    'Completed': 'default',
  }
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
}

export function InquiriesTab() {
  const { data, mutate } = useSWR('/admin/wholesale/inquiries?limit=50', fetcher)
  const inquiries = data?.data || []
  
  const [selected, setSelected] = useState<any>(null)
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' })

  const handleOpen = (inquiry: any) => {
    setSelected(inquiry)
    setStatusForm({ status: inquiry.status, notes: '' })
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.patch(`/admin/wholesale/inquiries/${selected.id}/status`, statusForm)
      toast.success('Inquiry updated')
      mutate()
      setSelected(null)
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inquiry ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries?.map((i: any) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono">{i.inquiryId}</TableCell>
                <TableCell>
                  <div className="font-medium">{i.businessName || i.user?.name}</div>
                  <div className="text-xs text-muted-foreground">{i.email}</div>
                </TableCell>
                <TableCell>{new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</TableCell>
                <TableCell>{i.requiredQuantity}</TableCell>
                <TableCell><StatusBadge status={i.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpen(i)}>Manage</Button>
                </TableCell>
              </TableRow>
            ))}
            {inquiries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No inquiries found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selected && (
            <form onSubmit={handleUpdateStatus}>
              <DialogHeader>
                <DialogTitle>Manage Inquiry: {selected.inquiryId}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contact details</p>
                  <p className="font-medium">{selected.businessName || selected.user?.name}</p>
                  <p>{selected.email}</p>
                  <p>{selected.contactNumber}</p>
                  <p>{selected.cityState}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Requirements</p>
                  <p>Quality: {selected.fabricQuality?.name || '-'}</p>
                  <p>Quantity: {selected.requiredQuantity} Pcs</p>
                  <p>Message: {selected.additionalMessage || '-'}</p>
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Update Status</h4>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusForm.status} onValueChange={v => setStatusForm({...statusForm, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['New', 'Under Review', 'Contacted', 'Quotation Sent', 'In Negotiation', 'Approved', 'Rejected', 'Completed'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Internal Note (Optional)</Label>
                  <Textarea value={statusForm.notes} onChange={e => setStatusForm({...statusForm, notes: e.target.value})} placeholder="Add a note to the history..." />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
