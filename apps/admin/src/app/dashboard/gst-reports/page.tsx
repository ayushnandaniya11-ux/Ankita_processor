'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ankita/ui'
import {
  FileSpreadsheet,
  Download,
  FileArchive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  ArrowDownToLine,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@ankita/utils'
import { format } from 'date-fns'

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const FINANCIAL_YEARS = [
  { year: 2026, label: 'FY 2026-2027' },
  { year: 2025, label: 'FY 2025-2026' },
  { year: 2024, label: 'FY 2024-2025' },
]

export default function GstReportsPage() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
  const [generatingType, setGeneratingType] = useState<string | null>(null)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)

  // Fetch live calculated monthly GST summary
  const summaryKey = `/admin/gst/summary?year=${selectedYear}&month=${selectedMonth}`
  const { data: summaryData, error: summaryError, isLoading: summaryLoading, mutate: mutateSummary } = useSWR(
    summaryKey,
    fetcher
  )

  // Fetch exports history
  const exportsKey = `/admin/gst/exports?year=${selectedYear}&month=${selectedMonth}`
  const { data: exportsData, mutate: mutateExports } = useSWR(exportsKey, fetcher)

  const summary = summaryData?.summary
  const exportsList = exportsData?.exports || []

  const periodLabel = `${MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`

  const handleGenerateZip = async (reportType: string) => {
    try {
      setGeneratingType(reportType)
      const res = await api.post('/admin/gst/export', {
        year: selectedYear,
        month: selectedMonth,
        reportType,
      })
      toast.success(res.data?.message || 'ZIP archive generated successfully!')
      mutateExports()

      // Prompt automatic download
      if (res.data?.export?.id) {
        handleDownloadZip(res.data.export.id, res.data.export.fileName)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Failed to generate ${reportType}`)
    } finally {
      setGeneratingType(null)
    }
  }

  const handleGenerateAll = async () => {
    try {
      setIsGeneratingAll(true)
      const res = await api.post('/admin/gst/export-all', {
        year: selectedYear,
        month: selectedMonth,
      })
      toast.success('All 4 separate monthly ZIP archives generated successfully!')
      mutateExports()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate all archives')
    } finally {
      setIsGeneratingAll(false)
    }
  }

  const handleDownloadZip = (exportId: number, fileName: string) => {
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/admin/gst/download/${exportId}`
    window.open(downloadUrl, '_blank')
    toast.info(`Downloading ${fileName}...`)
    setTimeout(() => mutateExports(), 2000)
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight">GST & Tax Compliance Center</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono">
              GSTIN: 24ANCPN9292N2ZB
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Statutory tax ledger reconciliation, GSTR working papers, and separate monthly ZIP report archives.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-lg border">
            <Calendar className="h-4 w-4 text-muted-foreground ml-1" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select reporting month"
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select financial year"
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer pl-1 border-l"
            >
              {FINANCIAL_YEARS.map((fy) => (
                <option key={fy.year} value={fy.year}>
                  {fy.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              mutateSummary()
              mutateExports()
            }}
            title="Refresh Ledger"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || summaryLoading}
            className="bg-primary text-primary-foreground shadow-sm"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating 4 ZIPs...
              </>
            ) : (
              <>
                <Layers className="mr-2 h-4 w-4" /> Generate All 4 Archives
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-28 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summaryError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-6 text-center text-destructive">
            Failed to calculate monthly GST figures. Please verify server connectivity.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Gross Turnover</CardDescription>
              <CardTitle className="text-2xl font-black font-mono">
                {formatCurrency(summary?.grossTurnover || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Taxable Value: <strong className="text-foreground">{formatCurrency(summary?.taxableTurnover || 0)}</strong>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-200/50 dark:border-blue-900/40">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Total GST Liability
              </CardDescription>
              <CardTitle className="text-2xl font-black font-mono text-blue-700 dark:text-blue-300">
                {formatCurrency(summary?.totalTax || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>CGST: {formatCurrency(summary?.cgstTotal || 0)}</span>
              <span>SGST: {formatCurrency(summary?.sgstTotal || 0)}</span>
              <span>IGST: {formatCurrency(summary?.igstTotal || 0)}</span>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Invoices Issued</CardDescription>
              <CardTitle className="text-2xl font-black font-mono">
                {summary?.totalInvoices || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground flex items-center gap-3">
              <span>B2B: <strong className="text-foreground">{summary?.b2bInvoices || 0}</strong></span>
              <span>&bull;</span>
              <span>B2C: <strong className="text-foreground">{summary?.b2cInvoices || 0}</strong></span>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Supply Distribution</CardDescription>
              <CardTitle className="text-xl font-bold font-mono">
                {summary?.interStateTurnover > 0 ? 'Inter + Intra' : 'Intra-State'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-muted-foreground">
              Gujarat (Intra): {formatCurrency(summary?.intraStateTurnover || 0)}
              <br />
              Other States (Inter): {formatCurrency(summary?.interStateTurnover || 0)}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reconciliation & Integrity Banner */}
      {summary && (
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              {summary.reconciliationAudit.taxCalculationDiscrepancies === 0 &&
              summary.reconciliationAudit.duplicateInvoiceNumbers === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              )}
              <div>
                <strong className="text-foreground">Tax Reconciliation Status for {periodLabel}:</strong>{' '}
                <span className="text-muted-foreground">
                  {summary.reconciliationAudit.ordersWithInvoices} of {summary.reconciliationAudit.totalOrdersInPeriod} orders invoiced.
                  {summary.reconciliationAudit.missingBuyerGstinOnB2b > 0 && (
                    <span className="text-amber-600 ml-1 font-semibold">
                      ({summary.reconciliationAudit.missingBuyerGstinOnB2b} B2B buyer GSTIN pending verification)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-background">
                Invoices: {summary.totalInvoices}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-background">
                Duplicates: {summary.reconciliationAudit.duplicateInvoiceNumbers}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-background">
                Discrepancies: {summary.reconciliationAudit.taxCalculationDiscrepancies}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* The 4 Separate Monthly ZIP Downloads Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Monthly Report ZIP Archives</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Four strictly separated statutory download archives for <strong>{periodLabel}</strong>. Each archive contains deterministic files, manifests, and verifiable ledgers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ZIP 1: GST Report */}
          <Card className="flex flex-col justify-between border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
                  <FileSpreadsheet className="h-4 w-4" /> Archive 1
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  GST_Report_{selectedYear}-{String(selectedMonth).padStart(2, '0')}.zip
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-1">Monthly GST Report</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Includes executive GST summary (CSV & JSON), tax-rate-wise breakdown table, itemized sales register, and reconciliation audit report.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/40 rounded p-2.5 text-[11px] text-muted-foreground mb-4 space-y-1">
                <div>&bull; <code>monthly_gst_summary.csv / .json</code></div>
                <div>&bull; <code>tax_rate_breakdown.csv</code></div>
                <div>&bull; <code>sales_register.csv</code></div>
                <div>&bull; <code>reconciliation_audit.csv</code></div>
              </div>
              <Button
                onClick={() => handleGenerateZip('GST_REPORT')}
                disabled={generatingType === 'GST_REPORT' || isGeneratingAll}
                className="w-full"
                variant="outline"
              >
                {generatingType === 'GST_REPORT' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Packaging ZIP 1...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" /> Download GST Report (ZIP 1)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ZIP 2: GST Return Report */}
          <Card className="flex flex-col justify-between border-l-4 border-l-emerald-600 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
                  <FileCheck className="h-4 w-4" /> Archive 2
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  GST_Return_Report_{selectedYear}-{String(selectedMonth).padStart(2, '0')}.zip
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-1">GST Return Preparation Report</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Prescribed government schema working papers for GSTR-1 (B2B, B2CS, HSN Summary, Docs Issued) and GSTR-3B Table 3.1.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/40 rounded p-2.5 text-[11px] text-muted-foreground mb-4 space-y-1">
                <div>&bull; <code>gstr1_b2b.csv / .json (Govt Schema)</code></div>
                <div>&bull; <code>gstr1_b2cs.csv (B2C Small)</code></div>
                <div>&bull; <code>gstr1_hsn_summary.csv</code></div>
                <div>&bull; <code>gstr3b_table3_1.csv & working paper</code></div>
              </div>
              <Button
                onClick={() => handleGenerateZip('GST_RETURN_REPORT')}
                disabled={generatingType === 'GST_RETURN_REPORT' || isGeneratingAll}
                className="w-full"
                variant="outline"
              >
                {generatingType === 'GST_RETURN_REPORT' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Packaging ZIP 2...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" /> Download Return Report (ZIP 2)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ZIP 3: Tax Invoice Archive */}
          <Card className="flex flex-col justify-between border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs tracking-wider uppercase">
                  <Receipt className="h-4 w-4" /> Archive 3
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Tax_Invoices_{selectedYear}-{String(selectedMonth).padStart(2, '0')}.zip
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-1">Tax Invoice Archive</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Contains complete bundle of all issued PDF tax invoices for the selected month, alongside the comprehensive invoice register.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/40 rounded p-2.5 text-[11px] text-muted-foreground mb-4 space-y-1">
                <div>&bull; <code>invoice_register.csv</code></div>
                <div>&bull; <code>invoices/INV_AP-2026-*.pdf</code></div>
                <div>&bull; <code>credit_notes/ (if applicable)</code></div>
                <div>&bull; <code>README.txt (Manifest)</code></div>
              </div>
              <Button
                onClick={() => handleGenerateZip('TAX_INVOICES')}
                disabled={generatingType === 'TAX_INVOICES' || isGeneratingAll}
                className="w-full"
                variant="outline"
              >
                {generatingType === 'TAX_INVOICES' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Packaging Invoices ZIP...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" /> Download Invoices Archive (ZIP 3)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ZIP 4: Tax Return and Tax Reconciliation Report */}
          <Card className="flex flex-col justify-between border-l-4 border-l-amber-600 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs tracking-wider uppercase">
                  <ShieldAlert className="h-4 w-4" /> Archive 4
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Tax_Return_Reconciliation_{selectedYear}-{String(selectedMonth).padStart(2, '0')}.zip
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-1">Tax Return & Reconciliation</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Turnover reconciliations, tax liability verification, sales return adjustments, and audit anomaly exception registers.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/40 rounded p-2.5 text-[11px] text-muted-foreground mb-4 space-y-1">
                <div>&bull; <code>tax_reconciliation_summary.csv</code></div>
                <div>&bull; <code>turnover_reconciliation.csv</code></div>
                <div>&bull; <code>tax_liability_reconciliation.csv</code></div>
                <div>&bull; <code>reconciliation_exceptions.csv</code></div>
              </div>
              <Button
                onClick={() => handleGenerateZip('TAX_RETURN_RECONCILIATION')}
                disabled={generatingType === 'TAX_RETURN_RECONCILIATION' || isGeneratingAll}
                className="w-full"
                variant="outline"
              >
                {generatingType === 'TAX_RETURN_RECONCILIATION' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Packaging Reconciliation...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" /> Download Reconciliation (ZIP 4)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rate-Wise Breakdown Table */}
      {summary?.rateWiseBreakdown && summary.rateWiseBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Tax Rate-Wise Turnover Breakdown</CardTitle>
            <CardDescription className="text-xs">
              Itemized taxable amounts and tax distribution segregated by applicable GST slab rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GST Rate</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Taxable Value</TableHead>
                  <TableHead>CGST Amount</TableHead>
                  <TableHead>SGST Amount</TableHead>
                  <TableHead>IGST Amount</TableHead>
                  <TableHead>Total GST</TableHead>
                  <TableHead className="text-right">Total Invoice Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.rateWiseBreakdown.map((r: any) => (
                  <TableRow key={r.rate}>
                    <TableCell className="font-bold font-mono">{r.rate}%</TableCell>
                    <TableCell>{r.count}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(r.taxableAmount)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(r.cgstAmount)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(r.sgstAmount)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(r.igstAmount)}</TableCell>
                    <TableCell className="font-mono font-semibold text-blue-600">{formatCurrency(r.totalTax)}</TableCell>
                    <TableCell className="font-mono text-right font-bold">{formatCurrency(r.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Generated Archives History & Audit Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Generated Archives & Audit History</CardTitle>
            <CardDescription className="text-xs">
              Audit log of previously compiled ZIP files for {periodLabel} with checksums, file sizes, and download metrics.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {exportsList.length} Archives Available
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archive Type</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Invoices Count</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-xs">
                    No ZIP reports generated yet for {periodLabel}. Use the buttons above to generate and download.
                  </TableCell>
                </TableRow>
              ) : (
                exportsList.map((exp: any) => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {exp.reportType.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">{exp.fileName}</TableCell>
                    <TableCell className="text-xs">{formatBytes(exp.fileSizeBytes)}</TableCell>
                    <TableCell className="text-xs font-mono">{exp.recordCount || 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {exp.createdAt ? format(new Date(exp.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{exp.downloadCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadZip(exp.id, exp.fileName)}
                        className="h-8 gap-1 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
