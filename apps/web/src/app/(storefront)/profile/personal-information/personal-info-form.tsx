'use client'

import { Button, Input, Label } from '@ankita/ui'
import { useAuth } from '@/hooks/use-auth'
import { useState, useEffect } from 'react'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'

export function PersonalInfoForm() {
  const { user, isLoading, mutate } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
    if (user?.phone) {
      setPhone(user.phone)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    try {
      const res = await apiClient.put('/auth/profile', {
        name: fullName,
        phone: phone.trim(),
      })
      toast.success('Personal information updated successfully!')
      if (res.data?.user) {
        mutate(res.data.user)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update personal information')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4 max-w-lg">
      <div className="h-10 bg-muted rounded"></div>
      <div className="h-10 bg-muted rounded"></div>
    </div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input 
            id="firstName" 
            required
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={user?.email || ''} disabled />
        <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          type="tel" 
          placeholder="+91 9876543210"
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
      </div>
      
      <div className="pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
