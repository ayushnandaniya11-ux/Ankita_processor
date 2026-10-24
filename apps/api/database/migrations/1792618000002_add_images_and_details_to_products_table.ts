import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('images').nullable().defaultTo('[]')
      table.text('image_url').nullable()
      table.jsonb('attributes').nullable()
      table.boolean('is_featured').notNullable().defaultTo(false)
      table.boolean('is_new_arrival').notNullable().defaultTo(true)
      table.boolean('is_best_seller').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('images')
      table.dropColumn('image_url')
      table.dropColumn('attributes')
      table.dropColumn('is_featured')
      table.dropColumn('is_new_arrival')
      table.dropColumn('is_best_seller')
    })
  }
}
