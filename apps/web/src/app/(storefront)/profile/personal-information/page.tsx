import type { Metadata } from 'next'
import { PersonalInfoForm } from './personal-info-form'

export const metadata: Metadata = { title: 'Personal Information | Profile' }

export default function PersonalInformationPage() {
  return (
    <div className="rounded-xl border bg-card p-6 h-full">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your personal details and contact information.</p>
      </div>
      
      <PersonalInfoForm />
    </div>
  )
}
