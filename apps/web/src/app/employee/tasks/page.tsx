'use client'

import { PageHeader, Card, CardContent } from '@ankita/ui'

export default function EmployeeTasksPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader 
        title="My Tasks" 
        description="View and manage your assigned tasks."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>No tasks currently assigned to you.</p>
        </CardContent>
      </Card>
    </div>
  )
}
