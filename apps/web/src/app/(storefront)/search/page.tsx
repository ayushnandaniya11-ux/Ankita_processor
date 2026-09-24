import type { Metadata } from 'next'
import { Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Search' }

interface Props { searchParams: { q?: string } }

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || ''

  return (
    <div className="container-wide py-8 max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>
      {query ? (
        <p className="mb-8 text-muted-foreground">Searching for products... Connect to API to see results.</p>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Enter a search term to find products</p>
        </div>
      )}
    </div>
  )
}
