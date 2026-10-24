'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button, Input, Label, Badge } from '@ankita/ui'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { ShieldCheck, Laptop, Globe, LogOut } from 'lucide-react'

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data)

export default function SecurityPage() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRevokingAll, setIsRevokingAll] = useState(false)

  const { data: sessionData, mutate: mutateSessions } = useSWR(user ? '/auth/sessions' : null, fetcher)
  const sessions = sessionData?.sessions || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword) {
      toast.error('Please enter all required fields')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.put('/auth/password', {
        currentPassword,
        newPassword,
      })
      toast.success('Password updated successfully! Other sessions have been signed out.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      mutateSessions()
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await apiClient.post(`/auth/sessions/${sessionId}/revoke`)
      toast.success('Session signed out successfully')
      mutateSessions()
    } catch {
      toast.error('Failed to sign out session')
    }
  }

  const handleRevokeAllOther = async () => {
    setIsRevokingAll(true)
    try {
      const res = await apiClient.post('/auth/revoke-all-sessions')
      toast.success(res.data?.message || 'All other devices signed out')
      mutateSessions()
    } catch {
      toast.error('Failed to sign out other devices')
    } finally {
      setIsRevokingAll(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 h-full space-y-8">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Password & Security</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your password, login credentials, and active browser sessions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Change Password</h3>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password *</Label>
            <Input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters long.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>

      {/* Active Sessions Management */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Active Login Sessions
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Devices and browsers currently signed in to your account.
            </p>
          </div>

          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAllOther}
              disabled={isRevokingAll}
              className="text-xs text-destructive hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out Other Devices
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.map((session: any) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 text-sm gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Laptop className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground truncate">
                      {session.userAgent ? session.userAgent.slice(0, 45) + '...' : 'Browser Session'}
                    </span>
                    {session.isCurrent && (
                      <Badge variant="default" className="text-[10px] py-0 px-1.5">
                        Current Device
                      </Badge>
                    )}
                    {session.isRememberMe && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        Remember Me (30d)
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {session.ipAddress || 'IP Protected'}
                    </span>
                    <span>·</span>
                    <span>
                      Active {new Date(session.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-xs text-destructive hover:text-destructive shrink-0"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
