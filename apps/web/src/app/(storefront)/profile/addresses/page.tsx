import type { Metadata } from 'next'
import { AddressList } from './address-list'
import { AddAddressDialog } from './add-address-dialog'

export const metadata: Metadata = { title: 'My Addresses | Profile' }

export default function AddressesPage() {
  return (
    <div className="rounded-xl border bg-card p-6 h-full">
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold">My Addresses</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your shipping and billing addresses.</p>
        </div>
        <AddAddressDialog />
      </div>
      
      <AddressList />
    </div>
  )
}
