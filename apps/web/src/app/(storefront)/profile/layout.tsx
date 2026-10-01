import type { Metadata } from 'next'
import { ProfileSidebar } from './profile-sidebar'

export const metadata: Metadata = { title: 'My Profile' }

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-wide py-8 max-w-5xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">My Account</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ProfileSidebar />
        {/* Content */}
        <div className="md:col-span-2">
          {children}
        </div>
      </div>
    </div>
  )
}
