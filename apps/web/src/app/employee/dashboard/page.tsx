'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@ankita/ui'
import { CheckCircle2, Clock, ListTodo, Activity } from 'lucide-react'

export default function EmployeeDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h2>
          <p className="text-muted-foreground mt-1">Here is a summary of your workspace for today.</p>
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="mb-1">{user?.role}</Badge>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1 text-orange-500">2 overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-500">+3 since yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38.5h</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground mt-1">Actions recorded today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock Tasks */}
              <div className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Process Wholesale Order #ORD-882</p>
                  <p className="text-xs text-muted-foreground">Due in 2 hours</p>
                </div>
                <Badge>In Progress</Badge>
              </div>
              <div className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Update Inventory for Category A</p>
                  <p className="text-xs text-muted-foreground">Due yesterday</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Review customer tickets</p>
                  <p className="text-xs text-muted-foreground">No due date</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Clock In / Clock Out</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <div className="text-4xl font-light tracking-tighter">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors shadow-lg">
                Clock In
              </button>
              <button disabled className="px-8 py-3 bg-muted text-muted-foreground rounded-full font-semibold cursor-not-allowed">
                Clock Out
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
