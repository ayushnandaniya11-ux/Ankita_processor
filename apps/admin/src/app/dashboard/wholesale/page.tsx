'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ankita/ui'
import { AccountsTab } from './components/accounts-tab'
import { CatalogsTab } from './components/catalogs-tab'
import { InquiriesTab } from './components/inquiries-tab'
import { QualitiesTab } from './components/qualities-tab'

export default function WholesaleManagerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wholesale Manager</h1>
          <p className="text-muted-foreground">Manage B2B accounts, catalogs, inquiries, and settings.</p>
        </div>
      </div>

      <Tabs defaultValue="inquiries" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="catalogs">Catalogs</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="qualities">Fabric Qualities</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="inquiries">
            <InquiriesTab />
          </TabsContent>
          <TabsContent value="catalogs">
            <CatalogsTab />
          </TabsContent>
          <TabsContent value="accounts">
            <AccountsTab />
          </TabsContent>
          <TabsContent value="qualities">
            <QualitiesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
