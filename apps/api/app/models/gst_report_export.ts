import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class GstReportExport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare financialYear: string

  @column()
  declare month: number

  @column()
  declare reportType: 'GST_REPORT' | 'GST_RETURN_REPORT' | 'TAX_INVOICES' | 'TAX_RETURN_RECONCILIATION'

  @column()
  declare fileName: string

  @column()
  declare filePath: string

  @column()
  declare fileSizeBytes: number

  @column()
  declare generatedBy: number | null

  @column()
  declare recordCount: number

  @column()
  declare totalTurnover: number

  @column()
  declare totalTax: number

  @column()
  declare status: string

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return null
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare metadata: any

  @column()
  declare downloadCount: number

  @column.dateTime()
  declare lastDownloadedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'generatedBy' })
  declare generatedByUser: BelongsTo<typeof User>
}
