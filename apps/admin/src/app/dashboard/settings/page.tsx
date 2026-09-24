'use client'

import { Button, Input, Label, Separator } from '@ankita/ui'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store preferences and system configuration.</p>
      </div>

      <div className="border rounded-lg bg-card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Store Information</h2>
          <p className="text-sm text-muted-foreground mb-4">Update your business details and contact info.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input defaultValue="Ankita Processors" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@ankitaprocessors.com" />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-lg font-semibold">Payment Gateways</h2>
          <p className="text-sm text-muted-foreground mb-4">Configure your API keys for Razorpay and other providers.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Razorpay Key ID</Label>
              <Input type="password" defaultValue="rzp_test_xxxxxx" />
            </div>
            <div className="space-y-2">
              <Label>Razorpay Key Secret</Label>
              <Input type="password" defaultValue="xxxxxxxxxxxxxxxxxxxx" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
