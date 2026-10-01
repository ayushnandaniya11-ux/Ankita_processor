'use client'

import { useEffect, useState } from 'react'
import { Counter } from './counter'

export function StatsPanel() {
  const [stats, setStats] = useState({ products: 0, customers: 0, quality: 100 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'
        const res = await fetch(`${API_URL}/stats`)
        if (res.ok) {
          const data = await res.json()
          setStats({
            products: data.products || 0,
            customers: data.customers || 0,
            quality: 100
          })
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    
    fetchStats()
  }, [])

  return (
    <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 glass-panel rounded-2xl px-10 py-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      {[
        { value: <Counter end={stats.products} suffix="+" />, label: 'Premium Products' },
        { value: <Counter end={stats.customers} suffix="+" />, label: 'Happy Customers' },
        { value: <Counter end={stats.quality} suffix="%" />, label: 'Authentic Quality' },
      ].map((stat, idx) => (
        <div key={stat.label} className="text-center relative group">
          <p className="text-3xl font-bold font-heading text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mt-2 font-medium">{stat.label}</p>
          {idx !== 2 && (
            <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 h-8 w-px bg-border" />
          )}
        </div>
      ))}
    </div>
  )
}
