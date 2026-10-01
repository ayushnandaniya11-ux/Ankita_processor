'use client'

import { Button, Input, Label } from '@ankita/ui'
import { useAuth } from '@/hooks/use-auth'
import { useState, useEffect } from 'react'

export function PersonalInfoForm() {
  const { user, isLoading } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

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

  if (isLoading) {
    return <div className="animate-pulse flex space-x-4">Loading...</div>
  }

  return (
    <form className="space-y-6 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName" 
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
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
      </div>
      
      <div className="pt-4">
        <Button type="button">Save Changes</Button>
      </div>
    </form>
  )
}
