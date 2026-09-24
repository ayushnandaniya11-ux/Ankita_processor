'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, Input } from '@ankita/ui'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      onOpenChange(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSearch} className="flex items-center gap-3 px-1 py-2">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            id="search-input"
            autoFocus
            placeholder="Search for sarees, kurtis, dresses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-base px-0"
          />
        </form>
        <div className="px-4 pb-4 text-sm text-muted-foreground">
          <p className="mb-2 font-medium">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {['Banarasi Saree', 'Kurti', 'Co-ord Set', 'Anarkali', 'Dresses'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term)
                  onOpenChange(false)
                  router.push(`/search?q=${encodeURIComponent(term)}`)
                }}
                className="rounded-full border px-3 py-1 text-xs hover:bg-accent hover:text-foreground transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
