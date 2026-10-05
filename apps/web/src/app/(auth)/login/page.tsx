import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@ankita/ui'
import { Store, Building2, Briefcase } from 'lucide-react'

export default function AuthSelectionPage() {
  return (
    <div className="container max-w-6xl py-12 px-4 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Ankita Processors</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Please select your account type to proceed. We offer tailored experiences for retail customers, wholesale partners, and our internal team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Customer */}
        <Card className="flex flex-col h-full border-t-4 border-t-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Customer</CardTitle>
            <CardDescription className="text-base mt-2">
              Shop our collection and place orders online.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end mt-4 space-y-3">
            <Link href="/login/customer" className="w-full">
              <Button className="w-full text-base h-11" variant="default">Customer Login</Button>
            </Link>
            <Link href="/register/customer" className="w-full">
              <Button className="w-full text-base h-11" variant="outline">Customer Registration</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Wholesaler */}
        <Card className="flex flex-col h-full border-t-4 border-t-orange-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
            <CardTitle className="text-2xl">Wholesaler</CardTitle>
            <CardDescription className="text-base mt-2">
              Explore wholesale catalogs and submit bulk purchase inquiries.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end mt-4 space-y-3">
            <Link href="/login/wholesaler" className="w-full">
              <Button className="w-full text-base h-11 bg-orange-500 hover:bg-orange-600">Wholesaler Login</Button>
            </Link>
            <Link href="/register/wholesaler" className="w-full">
              <Button className="w-full text-base h-11 border-orange-500 text-orange-600 hover:bg-orange-50" variant="outline">Wholesaler Registration</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Employee */}
        <Card className="flex flex-col h-full border-t-4 border-t-slate-700 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-700" />
            </div>
            <CardTitle className="text-2xl">Employee</CardTitle>
            <CardDescription className="text-base mt-2">
              Access your assigned work, tasks, and employee dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end mt-4 space-y-3">
            <Link href="/employee/login" className="w-full">
              <Button className="w-full text-base h-11 bg-slate-800 hover:bg-slate-900">Employee Login</Button>
            </Link>
            <div className="text-center text-xs text-muted-foreground pt-2">
              * Employee registration is via invitation only.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
