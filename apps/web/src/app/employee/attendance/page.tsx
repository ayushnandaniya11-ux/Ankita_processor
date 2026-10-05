'use client'

import { PageHeader, Card, CardContent } from '@ankita/ui'

export default function EmployeeAttendancePage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader 
        title="Attendance & Timesheets" 
        description="Review your clock-in history and timesheets."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>No attendance records found for this month.</p>
        </CardContent>
      </Card>
    </div>
  )
}
