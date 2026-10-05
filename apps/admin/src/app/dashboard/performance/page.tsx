'use client'

import { PageHeader, Card, CardContent } from '@ankita/ui'
import { FileText } from 'lucide-react'

export default function PerformancePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Performance Reports" 
        description="Review task completions and efficiency metrics."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-96 text-muted-foreground space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No performance data generated</p>
          <p className="text-sm">Reports are generated automatically at the end of each month.</p>
        </CardContent>
      </Card>
    </div>
  )
}
