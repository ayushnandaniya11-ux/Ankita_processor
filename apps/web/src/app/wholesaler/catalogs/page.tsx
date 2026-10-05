'use client'

import { useState } from 'react'
import useSWR from 'swr'
import apiClient from '@/lib/api/client'
import { Card, Button, Badge } from '@ankita/ui'
import { useAuth } from '@/hooks/use-auth'
import { InquiryDialog } from '../components/inquiry-dialog'
import { ImageOff, MessageSquarePlus } from 'lucide-react'

const fetcher = (url: string) => apiClient.get(url).then(res => res.data)

export default function WholesalerCatalogsPage() {
  const { user } = useAuth()
  const { data: catalogs, isLoading: loadingCatalogs } = useSWR('/wholesale/catalogs', fetcher)
  const { data: fabricQualities, isLoading: loadingQualities } = useSWR('/wholesale/fabric-qualities', fetcher)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCatalog, setSelectedCatalog] = useState<any>(null)

  const handleInquiryClick = (catalog: any) => {
    setSelectedCatalog(catalog)
    setDialogOpen(true)
  }

  if (loadingCatalogs || loadingQualities) {
    return <div className="flex h-64 items-center justify-center">Loading catalogs...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wholesale Catalogs</h1>
        <p className="text-muted-foreground mt-2">Browse our exclusive collections available for wholesale orders.</p>
      </div>

      {catalogs?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No catalogs are currently available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {catalogs?.map((catalog: any) => (
            <Card key={catalog.id} className="overflow-hidden flex flex-col">
              <div className="aspect-[3/4] relative bg-muted flex items-center justify-center overflow-hidden">
                {catalog.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={catalog.imageUrl} alt={catalog.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                ) : (
                  <ImageOff className="h-10 w-10 text-muted-foreground/30" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">{catalog.title}</h3>
                  <div className="mt-2 space-y-1">
                    {catalog.availableColors && (
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Colors:</span> {catalog.availableColors}</p>
                    )}
                    {catalog.dimensions && (
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Dimensions:</span> {catalog.dimensions}</p>
                    )}
                  </div>
                  {catalog.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{catalog.description}</p>
                  )}
                </div>
                <Button 
                  className="w-full mt-6" 
                  onClick={() => handleInquiryClick(catalog)}
                >
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Send Inquiry
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <InquiryDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        selectedCatalog={selectedCatalog}
        fabricQualities={fabricQualities || []}
        user={user}
      />
    </div>
  )
}
