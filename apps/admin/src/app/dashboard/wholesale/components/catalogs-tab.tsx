'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label, Textarea, Checkbox } from '@ankita/ui'

export function CatalogsTab() {
  const { data: catalogs, mutate } = useSWR('/admin/wholesale/catalogs', fetcher)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', availableColors: '', dimensions: '', isPublished: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/wholesale/catalogs', form)
      toast.success('Catalog added')
      mutate()
      setOpen(false)
      setForm({ title: '', description: '', imageUrl: '', availableColors: '', dimensions: '', isPublished: false })
    } catch (err) {
      toast.error('Failed to add catalog')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete catalog?')) return
    await api.delete(`/admin/wholesale/catalogs/${id}`)
    mutate()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>Add Catalog</Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogs?.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.availableColors || '-'}</TableCell>
                <TableCell>{c.dimensions || '-'}</TableCell>
                <TableCell>
                  <Badge variant={c.isPublished ? 'default' : 'secondary'}>{c.isPublished ? 'Published' : 'Draft'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {catalogs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No catalogs found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Catalog</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Available Colors</Label>
                  <Input value={form.availableColors} onChange={e => setForm({...form, availableColors: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Dimensions</Label>
                  <Input value={form.dimensions} onChange={e => setForm({...form, dimensions: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox id="publish" checked={form.isPublished} onCheckedChange={(c: boolean) => setForm({...form, isPublished: c})} />
                <Label htmlFor="publish">Publish immediately</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>Save Catalog</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
