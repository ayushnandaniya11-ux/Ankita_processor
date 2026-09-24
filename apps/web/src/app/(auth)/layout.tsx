import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Ankita Processors account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 py-12">
      <div className="mb-8 text-center">
        <a href="/" className="text-2xl font-bold tracking-widest uppercase text-foreground">
          Ankita Processors
        </a>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
