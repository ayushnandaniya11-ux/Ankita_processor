import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs'
import GstReportService from '#services/gst_report_service'
import GstReportExport from '#models/gst_report_export'
import ActivityLog from '#models/activity_log'
import { DateTime } from 'luxon'

export default class GstReportsController {
  /**
   * Get calculated & reconciled monthly GST summary
   */
  public async getSummary({ request, response }: HttpContext) {
    const year = Number(request.input('year')) || DateTime.now().year
    const month = Number(request.input('month')) || DateTime.now().month

    if (month < 1 || month > 12) {
      return response.badRequest({ error: 'Invalid month. Must be between 1 and 12.' })
    }

    try {
      const { summary } = await GstReportService.calculateMonthlyGstSummary(year, month)
      return response.ok({ summary })
    } catch (err: any) {
      return response.internalServerError({
        error: 'Failed to calculate monthly GST summary: ' + err.message,
      })
    }
  }

  /**
   * Generate one of the four separate monthly ZIP archives
   */
  public async exportZip(ctx: HttpContext) {
    const { request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Unauthorized: Session required' })
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return response.forbidden({ error: 'Access denied: Admin permissions required for GST exports' })
    }

    const year = Number(request.input('year')) || DateTime.now().year
    const month = Number(request.input('month')) || DateTime.now().month
    const reportType = request.input('reportType') // 'GST_REPORT' | 'GST_RETURN_REPORT' | 'TAX_INVOICES' | 'TAX_RETURN_RECONCILIATION'

    if (month < 1 || month > 12) {
      return response.badRequest({ error: 'Invalid month' })
    }

    try {
      let exportRecord: GstReportExport

      switch (reportType) {
        case 'GST_REPORT':
          exportRecord = await GstReportService.generateGstReportZip(year, month, user.id)
          break
        case 'GST_RETURN_REPORT':
          exportRecord = await GstReportService.generateGstReturnReportZip(year, month, user.id)
          break
        case 'TAX_INVOICES':
          exportRecord = await GstReportService.generateTaxInvoiceArchiveZip(year, month, user.id)
          break
        case 'TAX_RETURN_RECONCILIATION':
          exportRecord = await GstReportService.generateTaxReconciliationZip(year, month, user.id)
          break
        default:
          return response.badRequest({
            error: 'Invalid reportType. Must be one of: GST_REPORT, GST_RETURN_REPORT, TAX_INVOICES, TAX_RETURN_RECONCILIATION',
          })
      }

      // Log in ActivityLog
      try {
        await ActivityLog.create({
          userId: user.id,
          action: 'GENERATE_GST_REPORT_ZIP',
          module: 'GST_REPORTS',
          description: `Generated ${reportType} archive for ${year}-${month}`,
          metadata: {
            reportType,
            year,
            month,
            fileName: exportRecord.fileName,
            fileSize: exportRecord.fileSizeBytes,
          },
        })
      } catch {}

      return response.ok({
        message: `${reportType} ZIP archive generated successfully`,
        export: exportRecord,
        downloadUrl: `/api/v1/admin/gst/download/${exportRecord.id}`,
      })
    } catch (err: any) {
      console.error('[GST Export Error]', err)
      return response.internalServerError({
        error: `Failed to generate ${reportType} ZIP archive: ` + err.message,
      })
    }
  }

  /**
   * Generate all 4 separate ZIP files for the month in one request
   */
  public async generateAll(ctx: HttpContext) {
    const { request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Unauthorized: Session required' })
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return response.forbidden({ error: 'Access denied: Admin permissions required for GST exports' })
    }

    const year = Number(request.input('year')) || DateTime.now().year
    const month = Number(request.input('month')) || DateTime.now().month

    try {
      const export1 = await GstReportService.generateGstReportZip(year, month, user.id)
      const export2 = await GstReportService.generateGstReturnReportZip(year, month, user.id)
      const export3 = await GstReportService.generateTaxInvoiceArchiveZip(year, month, user.id)
      const export4 = await GstReportService.generateTaxReconciliationZip(year, month, user.id)

      return response.ok({
        message: 'All 4 separate monthly ZIP archives generated successfully',
        archives: [
          { type: 'GST_REPORT', export: export1, downloadUrl: `/api/v1/admin/gst/download/${export1.id}` },
          { type: 'GST_RETURN_REPORT', export: export2, downloadUrl: `/api/v1/admin/gst/download/${export2.id}` },
          { type: 'TAX_INVOICES', export: export3, downloadUrl: `/api/v1/admin/gst/download/${export3.id}` },
          { type: 'TAX_RETURN_RECONCILIATION', export: export4, downloadUrl: `/api/v1/admin/gst/download/${export4.id}` },
        ],
      })
    } catch (err: any) {
      return response.internalServerError({ error: 'Failed to generate all archives: ' + err.message })
    }
  }

  /**
   * List generated report exports
   */
  public async listExports({ request, response }: HttpContext) {
    const year = request.input('year')
    const month = request.input('month')

    let query = GstReportExport.query().orderBy('created_at', 'desc')

    if (year) query = query.where('financial_year', 'like', `%${year}%`)
    if (month) query = query.where('month', Number(month))

    const exportsList = await query
    return response.ok({ exports: exportsList })
  }

  /**
   * Download a specific ZIP archive (Admin Only with Audit Logging)
   */
  public async downloadZip(ctx: HttpContext) {
    const { params, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Unauthorized: Session required' })
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return response.forbidden({ error: 'Forbidden: Access to GST archives is restricted to administrators' })
    }

    const exportRecord = await GstReportExport.find(params.id)
    if (!exportRecord) {
      return response.notFound({ error: 'Report archive not found' })
    }

    if (!fs.existsSync(exportRecord.filePath)) {
      return response.notFound({ error: 'ZIP file missing from archive storage' })
    }

    // Increment download count and audit log
    exportRecord.downloadCount += 1
    exportRecord.lastDownloadedAt = DateTime.now()
    await exportRecord.save()

    try {
      await ActivityLog.create({
        userId: user.id,
        action: 'DOWNLOAD_GST_ZIP',
        module: 'GST_REPORTS',
        description: `Downloaded GST report archive: ${exportRecord.fileName}`,
        metadata: {
          fileName: exportRecord.fileName,
          reportType: exportRecord.reportType,
          downloadCount: exportRecord.downloadCount,
        },
      })
    } catch {}

    response.header('Content-Type', 'application/zip')
    response.header('Content-Disposition', `attachment; filename="${exportRecord.fileName}"`)
    return response.download(exportRecord.filePath)
  }
}
