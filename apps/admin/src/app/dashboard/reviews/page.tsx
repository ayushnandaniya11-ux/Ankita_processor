'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'
import { Star, Trash2 } from 'lucide-react'

const MOCK_REVIEWS = [
  { id: 1, product: 'Floral Summer Dress', customer: 'Priya Patel', rating: 5, comment: 'Absolutely love the fabric! Perfect for summer.', status: 'Published', date: '2026-09-23' },
  { id: 2, product: 'Silk Blouse', customer: 'Kavita Iyer', rating: 4, comment: 'Great quality, but the sleeves are a bit long.', status: 'Published', date: '2026-09-22' },
  { id: 3, product: 'Denim Jacket', customer: 'Anonymous', rating: 1, comment: 'Very bad delivery experience.', status: 'Hidden', date: '2026-09-20' },
]

export default function ReviewsPage() {
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
            {MOCK_REVIEWS.map((review) => (
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
                  <Button variant="outline" size="sm">
                    {review.status === 'Published' ? 'Hide' : 'Publish'}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
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
