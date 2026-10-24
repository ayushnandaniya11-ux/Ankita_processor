'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'
import { Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const MOCK_REVIEWS = [
  { id: 1, product: 'Pure Cotton Printed Saree', customer: 'Pooja Sharma', rating: 5, comment: 'Excellent quality and fast shipping!', date: '2026-10-10', status: 'Published' },
  { id: 2, product: 'Bandhani Print Straight Kurti', customer: 'Neha Patel', rating: 4, comment: 'Nice fabric and fitting.', date: '2026-10-11', status: 'Published' },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS)

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setReviews((prev) => prev.filter((r) => r.id !== id))
    toast.success('Review deleted successfully')
  }

  const handleToggleStatus = (id: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'Published' ? 'Hidden' : 'Published' } : r))
    )
    toast.success('Review status updated')
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-muted-foreground">Moderate customer reviews and feedback.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-1/3">Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.product}</TableCell>
                <TableCell>{review.customer}</TableCell>
                <TableCell>
                  <div className="flex items-center text-amber-500">
                    {review.rating} <Star className="h-3.5 w-3.5 ml-1 fill-current" />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground italic">&quot;{review.comment}&quot;</TableCell>
                <TableCell>{review.date}</TableCell>
                <TableCell>
                  <Badge variant={review.status === 'Published' ? 'default' : 'secondary'}>
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(review.id)}>
                    {review.status === 'Published' ? 'Hide' : 'Publish'}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(review.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
