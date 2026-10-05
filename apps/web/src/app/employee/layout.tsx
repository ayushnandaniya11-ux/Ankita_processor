'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user && !pathname.includes('/login')) {
      router.push('/employee/login')
    } else if (!isLoading && user) {
      if (user.role !== 'EMPLOYEE' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        router.push('/employee/login')
      }
    }
  }, [user, isLoading, router, pathname])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading Workspace...</div>
  }

  // If on login page, just render children without sidebar
  if (pathname.includes('/login')) {
    return <>{children}</>
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Basic Sidebar for Employee */}
      <aside className="w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6 border-b">
          <h1 className="font-bold tracking-widest text-lg uppercase">Workspace</h1>
          <p className="text-xs text-muted-foreground mt-1">Hello, {user.name}</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/employee/dashboard" className={`block px-4 py-2 rounded-md font-medium text-sm ${pathname === '/employee/dashboard' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}>
            My Dashboard
          </a>
          <a href="/employee/tasks" className={`block px-4 py-2 rounded-md font-medium text-sm ${pathname === '/employee/tasks' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}>
            My Tasks
          </a>
          <a href="/employee/requests" className={`block px-4 py-2 rounded-md font-medium text-sm ${pathname === '/employee/requests' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}>
            My Requests
          </a>
          <a href="/employee/attendance" className={`block px-4 py-2 rounded-md font-medium text-sm ${pathname === '/employee/attendance' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}>
            Attendance
          </a>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <h2 className="font-semibold">Dashboard</h2>
          <button 
            onClick={() => {
              // Note: Use proper auth logout in production
              window.location.href = '/employee/login'
            }}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Log Out
          </button>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
