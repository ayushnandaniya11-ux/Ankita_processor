import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@ankita/ui'
import { CheckCircle2, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'Order Placed!' }

interface Props { searchParams: { order?: string } }

export default function CheckoutSuccessPage({ searchParams }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] py-20 text-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-xl w-full mx-4 animate-fade-in-up shadow-2xl shadow-primary/5 border border-primary/10 relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="flex flex-col items-center justify-center mb-8 gap-6 relative">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-white border border-primary/20 shadow-xl z-20 p-4 text-primary font-heading font-bold text-6xl tracking-tight">
             AP
          </div>
          
          <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-4 z-30">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-lg animate-pulse" />
            <div className="bg-white rounded-full p-1 relative z-10 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-heading font-bold mb-4">Order Confirmed!</h1>
        
        {searchParams.order && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full text-sm mb-6 border border-border/50">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-semibold text-foreground">{searchParams.order}</span>
          </div>
        )}
        
        <p className="text-muted-foreground mb-8 text-lg font-light leading-relaxed">
          Thank you for shopping with Ankita Processors! Your premium selection is being prepared. You will receive a confirmation email shortly.
        </p>
        
        <div className="bg-background/40 p-6 rounded-2xl mb-10 text-sm text-left flex gap-4 items-start border border-border/50">
          <div className="p-3 bg-primary/10 rounded-xl text-primary mt-0.5">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-base mb-1">Shipping Partner</p>
            <p className="text-muted-foreground leading-relaxed">Your order will be shipped securely via <span className="font-medium text-foreground">Delhivery Direct</span>.</p>
            <p className="text-muted-foreground mt-1">You will receive an AWB tracking number once dispatched.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8 h-12 shadow-md hover:shadow-lg transition-all">
            <Link href="/orders">View My Orders</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="rounded-full px-8 h-12 bg-transparent">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
