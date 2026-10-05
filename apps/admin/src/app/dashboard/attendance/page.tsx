'use client'

import { PageHeader, Card, CardContent } from '@ankita/ui'
import { Clock } from 'lucide-react'

export default function AttendancePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Employee Attendance" 
        description="Monitor staff working hours, clock-ins, and leaves."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-96 text-muted-foreground space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <Clock className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No attendance records found</p>
          <p className="text-sm">Employees haven&apos;t clocked in for this period yet.</p>
        </CardContent>
      </Card>
    </div>
  )
}
