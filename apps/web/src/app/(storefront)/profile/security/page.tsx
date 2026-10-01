import type { Metadata } from 'next'
import { Button, Input, Label } from '@ankita/ui'

export const metadata: Metadata = { title: 'Password & Security | Profile' }

export default function SecurityPage() {
  return (
    <div className="rounded-xl border bg-card p-6 h-full">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold">Password & Security</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your password and security preferences.</p>
      </div>
      
      <form className="space-y-6 max-w-lg">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Change Password</h3>
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
            <p className="text-xs text-muted-foreground">Minimum 8 characters long.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button type="button">Update Password</Button>
        </div>
      </form>
    </div>
  )
}
