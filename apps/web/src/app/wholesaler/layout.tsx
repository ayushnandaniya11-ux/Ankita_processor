import { WholesalerHeader } from '@/components/layout/wholesaler-header'

export default function WholesalerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <WholesalerHeader />
      <main className="flex-1 container-wide py-8">
        {children}
      </main>
    </div>
  )
}
