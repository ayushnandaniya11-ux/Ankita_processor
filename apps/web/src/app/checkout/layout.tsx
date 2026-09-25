export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background py-4">
        <div className="container-wide flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-widest uppercase">Ankita Processors</a>
          <p className="text-sm text-muted-foreground">Secure Checkout 🔒</p>
        </div>
      </div>
      <div className="container-wide py-8 max-w-5xl">{children}</div>
    </div>
  )
}
