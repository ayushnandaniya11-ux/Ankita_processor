'use client'

import useSWR from 'swr'
import apiClient from '@/lib/api/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ankita/ui'
import { useState } from 'react'

const fetcher = (url: string) => apiClient.get(url).then(res => res.data)

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
  
  const variant = variants[status] || 'secondary'
  return <Badge variant={variant as any}>{status}</Badge>
}

export default function MyInquiriesPage() {
  const { data: inquiries, isLoading } = useSWR('/wholesale/inquiries', fetcher)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading inquiries...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Inquiries</h1>
        <p className="text-muted-foreground mt-2">Track the status of your submitted catalog inquiries.</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inquiry ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Catalogs</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  You haven&apos;t submitted any inquiries yet.
                </TableCell>
              </TableRow>
            ) : (
              inquiries?.map((inquiry: any) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-mono text-muted-foreground">{inquiry.inquiryId}</TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</TableCell>
                  <TableCell>
                    {inquiry.catalogItems?.map((ci: any) => ci.catalog?.title).join(', ') || 'General Inquiry'}
                  </TableCell>
                  <TableCell>{inquiry.fabricQuality?.name || '-'}</TableCell>
                  <TableCell>{inquiry.requiredQuantity} Pcs</TableCell>
                  <TableCell>
                    <StatusBadge status={inquiry.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle>Inquiry Details: {selectedInquiry.inquiryId}</DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedInquiry.createdAt).toLocaleString(undefined, { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Status</span>
                    <StatusBadge status={selectedInquiry.status} />
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Quantity Requested</span>
                    <span className="text-lg">{selectedInquiry.requiredQuantity} Pcs</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-sm">Requirements</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Selected Catalogs:</span>
                      <p className="font-medium mt-1">
                        {selectedInquiry.catalogItems?.length > 0 
                          ? selectedInquiry.catalogItems.map((ci: any) => ci.catalog?.title).join(', ') 
                          : 'None selected'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fabric Quality:</span>
                      <p className="font-medium mt-1">{selectedInquiry.fabricQuality?.name || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {selectedInquiry.additionalMessage && (
                    <div>
                      <span className="text-muted-foreground text-sm">Additional Message:</span>
                      <p className="mt-1 text-sm bg-background p-3 rounded border">{selectedInquiry.additionalMessage}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Contact Information Provided</h4>
                  <div className="text-sm grid grid-cols-2 gap-2 text-muted-foreground">
                    <p>Name: <span className="text-foreground">{selectedInquiry.businessName || '-'}</span></p>
                    <p>Phone: <span className="text-foreground">{selectedInquiry.contactNumber}</span></p>
                    <p>Email: <span className="text-foreground">{selectedInquiry.email}</span></p>
                    <p>Location: <span className="text-foreground">{selectedInquiry.cityState || '-'}</span></p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
